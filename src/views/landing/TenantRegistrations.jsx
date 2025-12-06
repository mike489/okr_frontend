
import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Divider,
  MenuItem,
  Slider,
  CircularProgress,
} from '@mui/material';
import {
  Business,
  Language,
  Email,
  Phone,
  LocationOn,
  Person,
  CheckCircle,
  CloudDone,
} from '@mui/icons-material';

import {
  fetchPricingPlans,
  registerTenant,
  waitForTenantDeployment,
} from './publicApi';
import PublicLayout from 'context/PublicContext';
import DeployingWorkspace from './DeployingWorkspace';

const sizeOptions = ['1-10', '11-50', '51-100', '101-200', '201-500', '500+'];
const sizeMap = {
  '1-10': 5,
  '11-50': 25,
  '51-100': 75,
  '101-200': 150,
  '201-500': 350,
  '500+': 750,
};

const validationSchema = Yup.object({
  company_name: Yup.string().required('Company name is required'),
  domain_name: Yup.string()
    .matches(
      /^[a-z0-9-]+$/,
      'Only lowercase letters, numbers, and hyphens allowed',
    )
    .required('Subdomain is required'),
  company_email: Yup.string().email('Invalid email').required('Required'),
  company_phone: Yup.string().required('Required'),
  country: Yup.string().required('Required'),
  region: Yup.string().required('Required'),
  contact_person_name: Yup.string().required('Required'),
  contact_person_phone: Yup.string().required('Required'),
  contact_person_email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  industry_type: Yup.string().required('Required'),
  company_size: Yup.string().required('Required'),
  plan_id: Yup.string().required('Please select a plan'),
});

export default function TenantRegistration() {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployInfo, setDeployInfo] = useState({
    tenant: '',
    status: { message: 'Creating your company...', progress: 0 },
  });

  useEffect(() => {
    fetchPricingPlans()
      .then(setPlans)
      .catch(() => toast.error('Failed to load pricing plans'))
      .finally(() => setLoadingPlans(false));
  }, []);

  const handleSubmit = async (values) => {
    setIsDeploying(true);
    const tenant = values.domain_name.toLowerCase();
    setDeployInfo({
      tenant,
      status: { message: 'Registering your company...', progress: 15 },
    });

    try {
      const payload = {
        company_name: values.company_name,
        domain_name: tenant,
        company_email: values.company_email,
        company_phone: values.company_phone,
        country: values.country,
        region: values.region,
        company_size: sizeMap[values.company_size],
        industry_type: values.industry_type,
        contact_person_name: values.contact_person_name,
        contact_person_email: values.contact_person_email,
        contact_person_phone: values.contact_person_phone,
        plan_id: values.plan_id,
      };

      // Step 1: Register tenant
      await registerTenant(payload);
      localStorage.setItem('current_tenant', tenant);

      // Step 2: Wait for deployment
          await waitForTenantDeployment(tenant, (progress) => {
        console.log('Progress update:', progress); // ← Add this to see it working!

        setDeployInfo((prev) => ({
          tenant: prev.tenant,
          status: {
            message: progress.message || 'Deploying your workspace...',
            progress: progress.progress ?? 60,
            error: progress.error,
            rawStatus: progress.rawStatus,
          },
        }));
      });

      // Success
      toast.success('Your workspace is ready! Redirecting...');
      setTimeout(() => {
        window.location.href = `https://${tenant}.wutet.com/login`;
      }, 2500);
    } catch (error) {
      toast.error(error.data.message || 'Failed to create workspace');
      setIsDeploying(false);
    }
  };

  if (isDeploying) {
    return (
      <DeployingWorkspace
        tenant={deployInfo.tenant}
        status={deployInfo.status}
        progress={deployInfo.status.progress}
      />
    );
  }

  return (
    <PublicLayout>
      <ToastContainer position="top-center" autoClose={5000} />

      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          pt: 10,
        }}
      >
        <Paper
          sx={{
            maxWidth: 1100,
            width: '100%',
            borderRadius: 0,
            overflow: 'hidden',
          }}
        >
          <Box bgcolor="#4c6ef5" py={3} textAlign="center">
            <Typography variant="h3" fontWeight={900} color="white">
              Create Your Workspace
            </Typography>
          </Box>

          <Box p={{ xs: 4, md: 8 }}>
            <Formik
              initialValues={{
                company_name: '',
                domain_name: '',
                company_email: '',
                company_phone: '',
                country: '',
                region: '',
                contact_person_name: '',
                contact_person_phone: '',
                contact_person_email: '',
                industry_type: '',
                company_size: '11-50',
                plan_id: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                setFieldValue,
                isValid,
                dirty,
              }) => (
                <Form>
                  <Grid container spacing={4}>
                    {/* All your fields */}
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Company Name *"
                        name="company_name"
                        value={values.company_name}
                        onChange={handleChange}
                        error={touched.company_name && !!errors.company_name}
                        helperText={touched.company_name && errors.company_name}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business sx={{ color: '#4c6ef5' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Subdomain *"
                        name="domain_name"
                        value={values.domain_name}
                        onChange={(e) => handleChange(e)}
                        error={touched.domain_name && !!errors.domain_name}
                        helperText={
                          (touched.domain_name && errors.domain_name) ||
                          'e.g. acme → acme.wutet.com'
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Language sx={{ color: '#4c6ef5' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment
                              position="end"
                              sx={{ fontWeight: 700 }}
                            >
                              .wutet.com
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Company Email *"
                        name="company_email"
                        type="email"
                        value={values.company_email}
                        onChange={handleChange}
                        error={touched.company_email && !!errors.company_email}
                        helperText={
                          touched.company_email && errors.company_email
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: '#4c6ef5' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Company Phone *"
                        name="company_phone"
                        value={values.company_phone}
                        onChange={handleChange}
                        error={touched.company_phone && !!errors.company_phone}
                        helperText={
                          touched.company_phone && errors.company_phone
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: '#4c6ef5' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Country *"
                        name="country"
                        value={values.country}
                        onChange={handleChange}
                        error={touched.country && !!errors.country}
                        helperText={touched.country && errors.country}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn sx={{ color: '#4c6ef5' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Region/State *"
                        name="region"
                        value={values.region}
                        onChange={handleChange}
                        error={touched.region && !!errors.region}
                        helperText={touched.region && errors.region}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn sx={{ color: '#4c6ef5' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Contact Person Name *"
                        name="contact_person_name"
                        value={values.contact_person_name}
                        onChange={handleChange}
                        error={
                          touched.contact_person_name &&
                          !!errors.contact_person_name
                        }
                        helperText={
                          touched.contact_person_name &&
                          errors.contact_person_name
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#4c6ef5' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Contact Person Phone *"
                        name="contact_person_phone"
                        value={values.contact_person_phone}
                        onChange={handleChange}
                        error={
                          touched.contact_person_phone &&
                          !!errors.contact_person_phone
                        }
                        helperText={
                          touched.contact_person_phone &&
                          errors.contact_person_phone
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: '#4c6ef5' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Contact Person Email *"
                        name="contact_person_email"
                        type="email"
                        value={values.contact_person_email}
                        onChange={handleChange}
                        error={
                          touched.contact_person_email &&
                          !!errors.contact_person_email
                        }
                        helperText={
                          touched.contact_person_email &&
                          errors.contact_person_email
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: '#4c6ef5' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        select
                        fullWidth
                        label="Industry Type *"
                        name="industry_type"
                        value={values.industry_type}
                        onChange={handleChange}
                        error={touched.industry_type && !!errors.industry_type}
                        helperText={
                          touched.industry_type && errors.industry_type
                        }
                      >
                        {[
                          'Technology',
                          'Marketing',
                          'Finance',
                          'Healthcare',
                          'Education',
                          'Retail',
                          'Manufacturing',
                          'Other',
                        ].map((o) => (
                          <MenuItem key={o} value={o}>
                            {o}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Company Size Slider */}
                    <Grid item xs={12}>
                      <Typography fontWeight="bold" mb={2}>
                        Company Size *
                      </Typography>
                      <Box sx={{ px: 4 }}>
                        <Slider
                          value={sizeOptions.indexOf(values.company_size)}
                          onChange={(_, v) =>
                            setFieldValue('company_size', sizeOptions[v])
                          }
                          step={1}
                          min={0}
                          max={5}
                          marks={sizeOptions.map((l, i) => ({
                            value: i,
                            label: l,
                          }))}
                          sx={{
                            color: '#4c6ef5',
                            height: 10,
                            '& .MuiSlider-thumb': {
                              width: 32,
                              height: 32,
                              bgcolor: 'white',
                              border: '6px solid #4c6ef5',
                            },
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Plans */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 6 }} />
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        textAlign="center"
                        mb={4}
                      >
                        Choose Your Plan
                      </Typography>
                      <Grid container spacing={4} justifyContent="center">
                        {plans.map((plan) => (
                          <Grid item xs={12} md={4} key={plan.id}>
                            <Box
                              onClick={() => setFieldValue('plan_id', plan.id)}
                              sx={{
                                border:
                                  values.plan_id === plan.id
                                    ? '3px solid #4c6ef5'
                                    : '2px solid #e0e0e0',
                                borderRadius: 5,
                                p: 4,
                                cursor: 'pointer',
                                bgcolor:
                                  values.plan_id === plan.id
                                    ? '#f0f4ff'
                                    : 'white',
                                transition: '0.3s',
                                position: 'relative',
                                '&:hover': { borderColor: '#4c6ef5' },
                              }}
                            >
                              {values.plan_id === plan.id && (
                                <CheckCircle
                                  sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    color: '#4c6ef5',
                                  }}
                                />
                              )}
                              <Typography variant="h6" fontWeight="bold">
                                {plan.name}
                              </Typography>
                              <Typography
                                variant="h3"
                                fontWeight={900}
                                color="#4c6ef5"
                              >
                                {plan.currency}   
                                    {plan.price}
                                <Typography component="span" variant="body1">
                                  /month
                                </Typography>
                              </Typography>
                              {plan.trial_days && (
                                <Typography
                                  color="primary"
                                  fontWeight={600}
                                  mt={1}
                                >
                                  {plan.trial_days}-day free trial
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>

                    <Grid item xs={12} textAlign="center" mt={6}>
                      <Button
                        type="submit"
                        disabled={loadingPlans || !isValid || !dirty}
                        sx={{
                          width: 420,
                          py: 2.5,
                          fontSize: '1.5rem',
                          fontWeight: 800,
                          bgcolor: '#4c6ef5',
                          borderRadius: 4,
                          color: 'white',
                          '&:hover': { bgcolor: '#3b5bdb' },
                        }}
                      >
                        {loadingPlans ? <CircularProgress/> : 'Create Workspace'}
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Box>
        </Paper>
      </Box>
    </PublicLayout>
  );
}
