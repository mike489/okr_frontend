import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Formik } from 'formik';
import { decodeToken } from '../../../../store/permissionUtils';
import { SET_USER, setUser, SIGN_IN } from '../../../../store/actions/actions';
import { Storage } from 'configration/storage';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';

import * as Yup from 'yup';
import { handleGettingManagerUnits } from 'utils/multiple-unit-manager';
import StoreUserUnit from 'utils/set-user-unit';

const RAW_API_URL = import.meta.env.VITE_AUTH_URL || '';
const API_URL = RAW_API_URL.replace(/\/+$/, '');

const getTenantFromUrl = () => {
  const hostname = window.location.hostname;

  // Localhost override
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'acme';
  }

  // Extract subdomain as tenant
  const parts = hostname.split('.');
  const firstPart = parts[0].toLowerCase();

  return firstPart;
};

// ===============================
// BACKEND URL BUILDER
// Produces: https://backend.wutet.com/{tenant}/api
// ===============================
const getBackendBaseUrl = () => {
  const tenant = localStorage.getItem('current_tenant') || getTenantFromUrl();
  return `${API_URL}/${tenant}/api`;
};

// ===============================
// COMPONENT
// ===============================
const AuthLogin = ({ ...others }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signing, setSigning] = useState(false);

  // Detect tenant on mount
  useEffect(() => {
    const detected = getTenantFromUrl();

    if (!detected) {
      setError('Invalid login link. Please use your company-specific URL');
      setLoading(false);
      return;
    }

    localStorage.setItem('current_tenant', detected);
    setTenant(detected);
    setLoading(false);
  }, []);

  // ===============================
  // HANDLE LOGIN
  // ===============================
  const handleLogin = async (values, { setErrors, setSubmitting }) => {
    try {
      setSigning(true);

      const url = `${getBackendBaseUrl()}/login`;
      console.log('🔵 LOGIN URL:', url);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.email,
          password: values.password,
        }),
      });

      const result = await res.json();

      if (result.success) {
        const { access_token, roles, expires_in } = result.data;
        const decoded = decodeToken(access_token);

        const user = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          roles: roles || [],
          permissions: (roles || []).flatMap((r) => r.permissions || []),
        };

        Storage.setItem('token', access_token);
        Storage.setItem('tokenExpiration', Date.now() + expires_in * 1000);
        Storage.setItem('userRoles', JSON.stringify(roles));
        localStorage.setItem('current_tenant', tenant);

        if (decoded.roles?.some((r) => r.name === 'Manager')) {
          await handleGettingManagerUnits(dispatch);
        }

        dispatch(setUser({ type: SET_USER, user }));
        dispatch(StoreUserUnit());
        dispatch({ type: SIGN_IN, signed: true });

        navigate('/dashboard');
      } else {
        setErrors({
          submit:
            result.data?.message || 'Invalid email or username or password',
        });
      }
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setSigning(false);
      setSubmitting(false);
    }
  };

  // ===============================
  // UI (same as yours)
  // ===============================
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Invalid Company Link
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Invalid Company Link
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error}
          </Typography>
          <Typography variant="body2">
            Example valid links:
            <br />• yourapp.com/<strong>acme</strong>
            <br />• yourapp.com/login?<strong>tenant=droga</strong>
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Left Side - Beautiful SVG */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 700 800">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle cx="120" cy="120" r="100" fill="rgba(255,255,255,0.12)" />
          <circle cx="580" cy="180" r="140" fill="rgba(255,255,255,0.18)" />
          <circle cx="350" cy="550" r="120" fill="url(#grad1)" />
          <path
            d="M150 400 Q350 250 550 400 T550 700"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="40"
            fill="none"
          />
          <text
            x="350"
            y="300"
            textAnchor="middle"
            fill="white"
            fontSize="56"
            fontWeight="800"
          >
            Welcome
          </text>
          <text
            x="350"
            y="380"
            textAnchor="middle"
            fill="rgba(255,255,255,0.95)"
            fontSize="28"
          >
            {tenant?.toUpperCase()} OKR
          </text>
          <text
            x="350"
            y="680"
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize="18"
          >
            Powered by Droga Consulting Service
          </text>
        </svg>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography
            variant="h4"
            align="center"
            sx={{ mb: 1, fontWeight: 700, color: '#1e293b' }}
          >
            Welcome to {tenant?.toUpperCase()}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Sign in to continue
          </Typography>

          <Formik
            initialValues={{ email: '', password: '', submit: null }}
            validationSchema={Yup.object().shape({
              email: Yup.string()
                .required('Email or Username is required')
                .test(
                  'email-or-username',
                  'Invalid email or username',
                  (value) => {
                    if (!value) return false;
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
                    return emailRegex.test(value) || usernameRegex.test(value);
                  },
                ),
              password: Yup.string().required('Password is required'),
            })}
            onSubmit={handleLogin}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              touched,
              values,
              isSubmitting,
            }) => (
              <form noValidate onSubmit={handleSubmit} {...others}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Email or Username</InputLabel>
                  <OutlinedInput
                    name="email"
                    type="text"
                    value={values.email}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    autoFocus
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error>{errors.email}</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error>{errors.password}</FormHelperText>
                  )}
                </FormControl>

                <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                  >
                    Forgot Password?
                  </Link>
                </Stack>

                {errors.submit && (
                  <Box sx={{ mb: 3 }}>
                    <FormHelperText error>{errors.submit}</FormHelperText>
                  </Box>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={signing || isSubmitting}
                  sx={{ py: 1.8, borderRadius: 3 }}
                >
                  {signing ? (
                    <ActivityIndicator size={26} color="#fff" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            )}
          </Formik>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLogin;
