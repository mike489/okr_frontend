import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  useTheme,
  IconButton,
} from '@mui/material';
import { IconInfoCircle, IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import PropTypes from 'prop-types';

const validationSchema = Yup.object().shape({
  employee_code: Yup.string().required('Employee code is required'),
  name: Yup.string().required('Full name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^251\d{9}$/, 'Phone number must start with 251 and be 12 digits'),

  gender: Yup.string().required('Gender is required'),
  unit_id: Yup.string().required('Unit is required'),
  supervisor_id: Yup.string(),
  job_position_id: Yup.string().required('Job position is required'),
  address: Yup.string().required('Address is required'),
  date_of_birth: Yup.date().required('Date of birth is required').nullable(),
  // start_date: Yup.date().required('Start date is required').nullable(),
});

export const AddEmployee = ({ add, isAdding, onClose, handleSubmission }) => {
  const theme = useTheme();

  const [units, setUnits] = React.useState([]);
  const [jobPositions, setJobPositions] = React.useState([]);
  const [supervisors, setSupervisors] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [selectedRoles, setSelectedRoles] = React.useState([]);
  const [loadingUnits, setLoadingUnits] = React.useState(false);
  const [loadingPositions, setLoadingPositions] = React.useState(false);
  const [loadingSupervisors, setLoadingSupervisors] = React.useState(false);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  // const handleRoleSelection = (event, value) => {
  //   setSelectedRoles(value);
  // };

  const formik = useFormik({
    initialValues: {
      employee_code: '',
      name: '',
      email: '',
      phone: '',
      gender: '',
      unit_id: '',
      supervisor_id: '',
      job_position_id: '',
      address: '',
      date_of_birth: '',
      // start_date: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          // roles: selectedRoles.map((role) => role.uuid || role.id),
        };
        console.log('Submitting employee data:', payload);
        await handleSubmission(payload);
      } catch (error) {
        toast.error(error.message || 'Failed to add employee');
      }
    },
  });

  const handleFetchingUnits = async () => {
    setLoadingUnits(true);
    try {
      const token = await GetToken();
      const apiUrl = Backend.pmsUrl('units?per_page=100');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setUnits(data.data?.data.data || data.data);
      } else {
        toast.error(data.message || 'Failed to fetch units');
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      toast.error(error.message || 'Error fetching units');
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleFetchingJobPositions = async () => {
    setLoadingPositions(true);
    try {
      const token = await GetToken();
      const apiUrl = Backend.pmsUrl('job-positions?per_page=100');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setJobPositions(data.data.data || data.data);
      } else {
        toast.error(data.message || 'Failed to fetch job positions');
      }
    } catch (error) {
      console.error('Error fetching job positions:', error);
      toast.error(error.message || 'Error fetching job positions');
    } finally {
      setLoadingPositions(false);
    }
  };

  const handleFetchingSupervisors = async (unitId) => {
    setLoadingSupervisors(true);
    try {
      const token = await GetToken();
      const apiUrl = Backend.pmsUrl(`employees?unit_id=${unitId}&per_page=100`);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSupervisors(data.data.data || data.data);
      } else {
        toast.error(data.message || 'Failed to fetch supervisors');
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      toast.error(error.message || 'Error fetching supervisors');
    } finally {
      setLoadingSupervisors(false);
    }
  };

  // const handleFetchingRoles = async () => {
  //   try {
  //     const token = await GetToken();
  //     const apiUrl = Backend.authUrl('roles?per_page=100');

  //     const response = await fetch(apiUrl, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         accept: 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     if (data.success) {
  //       setRoles(data.data.data || data.data);
  //     } else {
  //       toast.error(data.message || 'Failed to fetch roles');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching roles:', error);
  //     toast.error(error.message || 'Error fetching roles');
  //   }
  // };

  React.useEffect(() => {
    if (add) {
      handleFetchingUnits();
      handleFetchingJobPositions();
      // handleFetchingRoles();
    }
  }, [add]);

  React.useEffect(() => {
    if (formik.values.unit_id) {
      handleFetchingSupervisors(formik.values.unit_id);
    } else {
      setSupervisors([]);
    }
  }, [formik.values.unit_id]);

  React.useEffect(() => {
    if (!add) {
      formik.resetForm();
      setSelectedRoles([]);
    }
  }, [add]);

  return (
    <Dialog
      open={add}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: 2,
          paddingY: 0.2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <DialogTitle variant="h3" color={theme.palette.text.primary}>
          Add Employee
        </DialogTitle>
        <IconButton onClick={onClose}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <form noValidate onSubmit={formik.handleSubmit}>
        <DialogContent>
          <FormControl
            fullWidth
            error={
              formik.touched.employee_code &&
              Boolean(formik.errors.employee_code)
            }
            sx={{ marginTop: 2 }}
          >
            <InputLabel htmlFor="employee_code">Employee Code</InputLabel>
            <OutlinedInput
              id="employee_code"
              name="employee_code"
              label="Employee Code"
              value={formik.values.employee_code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.employee_code && formik.errors.employee_code && (
              <FormHelperText error>
                {formik.errors.employee_code}
              </FormHelperText>
            )}
          </FormControl>

          <FormControl
            fullWidth
            error={formik.touched.name && Boolean(formik.errors.name)}
            sx={{ marginTop: 2 }}
          >
            <InputLabel htmlFor="name">Full Name</InputLabel>
            <OutlinedInput
              id="name"
              name="name"
              label="Full Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <FormHelperText error>{formik.errors.name}</FormHelperText>
            )}
          </FormControl>

          <FormControl
            fullWidth
            error={formik.touched.email && Boolean(formik.errors.email)}
            sx={{ marginTop: 2 }}
          >
            <InputLabel htmlFor="email">Email</InputLabel>
            <OutlinedInput
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <FormHelperText error>{formik.errors.email}</FormHelperText>
            )}
          </FormControl>

          <FormControl
            fullWidth
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            sx={{ marginTop: 2 }}
          >
            <InputLabel htmlFor="phone">Phone Number</InputLabel>
            <OutlinedInput
              id="phone"
              name="phone"
              label="Phone Number"
              value={formik.values.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                formik.setFieldValue('phone', value);
              }}
              onBlur={formik.handleBlur}
            />

            {formik.touched.phone && formik.errors.phone && (
              <FormHelperText error>{formik.errors.phone}</FormHelperText>
            )}
          </FormControl>

          <FormControl
            fullWidth
            error={formik.touched.gender && Boolean(formik.errors.gender)}
            sx={{ marginTop: 2 }}
          >
            <InputLabel htmlFor="gender">Gender</InputLabel>
            <Select
              id="gender"
              name="gender"
              label="Gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.gender && formik.errors.gender && (
              <FormHelperText error>{formik.errors.gender}</FormHelperText>
            )}
          </FormControl>

          <FormControl
            fullWidth
            error={formik.touched.unit_id && Boolean(formik.errors.unit_id)}
            sx={{ marginTop: 2 }}
          >
            <InputLabel htmlFor="unit_id">Unit</InputLabel>
            <Select
              id="unit_id"
              name="unit_id"
              label="Unit"
              value={formik.values.unit_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={loadingUnits}
            >
              {loadingUnits ? (
                <MenuItem disabled>
                  <ActivityIndicator size={20} />
                </MenuItem>
              ) : units.length === 0 ? (
                <MenuItem disabled>No units found</MenuItem>
              ) : (
                Array.isArray(units) &&
                units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {formik.touched.unit_id && formik.errors.unit_id && (
              <FormHelperText error>{formik.errors.unit_id}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth sx={{ marginTop: 2 }}>
            <InputLabel htmlFor="supervisor_id">
              Supervisor (Optional)
            </InputLabel>
            <Select
              id="supervisor_id"
              name="supervisor_id"
              label="Supervisor (Optional)"
              value={formik.values.supervisor_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={loadingSupervisors || !formik.values.unit_id}
            >
              <MenuItem value="">None</MenuItem>
              {loadingSupervisors ? (
                <MenuItem disabled>
                  <ActivityIndicator size={20} />
                </MenuItem>
              ) : supervisors.length === 0 ? (
                <MenuItem disabled>
                  {formik.values.unit_id
                    ? 'No supervisors found in this unit'
                    : 'Select a unit first'}
                </MenuItem>
              ) : (
                supervisors.map((supervisor) => (
                  <MenuItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            error={
              formik.touched.job_position_id &&
              Boolean(formik.errors.job_position_id)
            }
            sx={{ marginTop: 2 }}
          >
            <InputLabel htmlFor="job_position_id">Job Position</InputLabel>
            <Select
              id="job_position_id"
              name="job_position_id"
              label="Job Position"
              value={formik.values.job_position_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={loadingPositions}
            >
              {loadingPositions ? (
                <MenuItem disabled>
                  <ActivityIndicator size={20} />
                </MenuItem>
              ) : jobPositions.length === 0 ? (
                <MenuItem disabled>No job positions found</MenuItem>
              ) : (
                jobPositions.map((position) => (
                  <MenuItem key={position.id} value={position.id}>
                    {position.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {formik.touched.job_position_id &&
              formik.errors.job_position_id && (
                <FormHelperText error>
                  {formik.errors.job_position_id}
                </FormHelperText>
              )}
          </FormControl>

          <FormControl
            fullWidth
            error={formik.touched.address && Boolean(formik.errors.address)}
            sx={{ marginTop: 2 }}
          >
            <InputLabel htmlFor="address">Address</InputLabel>
            <OutlinedInput
              id="address"
              name="address"
              label="Address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.address && formik.errors.address && (
              <FormHelperText error>{formik.errors.address}</FormHelperText>
            )}
          </FormControl>

          <FormControl
            fullWidth
            error={
              formik.touched.date_of_birth &&
              Boolean(formik.errors.date_of_birth)
            }
            sx={{ marginTop: 2 }}
          >
            <InputLabel htmlFor="date_of_birth" shrink>
              Date of Birth
            </InputLabel>
            <OutlinedInput
              id="date_of_birth"
              name="date_of_birth"
              label="Date of Birth"
              type="date"
              value={formik.values.date_of_birth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              notched
            />
            {formik.touched.date_of_birth && formik.errors.date_of_birth && (
              <FormHelperText error>
                {formik.errors.date_of_birth}
              </FormHelperText>
            )}
          </FormControl>

          {/* <FormControl
            fullWidth
            error={
              formik.touched.start_date && Boolean(formik.errors.start_date)
            }
            sx={{ marginTop: 2 }}
          >
            <InputLabel htmlFor="start_date" shrink>
              Start Date
            </InputLabel>
            <OutlinedInput
              id="start_date"
              name="start_date"
              label="Start Date"
              type="date"
              value={formik.values.start_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              notched
            />
            {formik.touched.start_date && formik.errors.start_date && (
              <FormHelperText error>{formik.errors.start_date}</FormHelperText>
            )}
          </FormControl> */}

          {/* <Autocomplete
            id="roles"
            multiple
            options={roles}
            getOptionLabel={(option) => option.name || ''}
            value={selectedRoles}
            onChange={handleRoleSelection}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={index}
                  label={option.name}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Roles (Optional)"
                variant="outlined"
                sx={{ marginTop: 2 }}
              />
            )}
          /> */}

          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              paddingX: 1,
              marginTop: 0.8,
            }}
          >
            <IconInfoCircle size={14} style={{ paddingRight: 2 }} />
            The default role for employee is{' '}
            <b style={{ paddingLeft: 3 }}>Employee</b>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ paddingX: 2, paddingBottom: 2 }}>
          <Button onClick={onClose} disabled={isAdding}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ paddingX: 6, boxShadow: 0 }}
            disabled={isAdding || !formik.isValid || !formik.dirty}
          >
            {isAdding ? (
              <CircularProgress size={18} sx={{ color: 'white' }} />
            ) : (
              'Add Employee'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

AddEmployee.propTypes = {
  add: PropTypes.bool,
  isAdding: PropTypes.bool,
  onClose: PropTypes.func,
  handleSubmission: PropTypes.func,
};
