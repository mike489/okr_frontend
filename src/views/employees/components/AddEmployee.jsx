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
import { IconInfoCircle, IconX} from '@tabler/icons-react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import PropTypes from 'prop-types';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Employee ID is required'),
  name: Yup.string().required('Full name is required'),
  phone: Yup.string().required('Phone number is required'),
  type: Yup.string().required('Unit type is required'),
  unit: Yup.string().required('Unit is required'),
  start_date: Yup.date().required('Start date is required').nullable(),
});

export const AddEmployee = ({ add, isAdding, onClose, handleSubmission }) => {
  const theme = useTheme();

  const [unitLoading, setUnitLoading] = React.useState(true);
  const [unitType, setUnitType] = React.useState([]);
  const [units, setUnits] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [selectedRoles, setSelectedRoles] = React.useState([]);
  const [roleIds, setRoleIds] = React.useState([]);

  const handleRoleSelection = (event, value) => {
    setSelectedRoles(value);
    const roleIds = value.map((role) => role.uuid);
    setRoleIds(roleIds);
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      name: '',
      phone: '',
      type: '',
      unit: '',
      start_date: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log('Form values:', values, 'Role IDs:', roleIds); // Debug payload
      try {
        await handleSubmission({ ...values, role_ids: roleIds });
      } catch (error) {
        toast.error(error.message || 'Failed to add employee');
      }
    },
  });

  const handleFetchingTypes = async () => {
    setUnitLoading(true);
    try {
      const token = await GetToken('token');
      const response = await fetch(Backend.api + Backend.types, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setUnitType(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch unit types');
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching unit types');
    } finally {
      setUnitLoading(false);
    }
  };

  const handleFetchingUnits = async () => {
    if (!formik.values.type) return;
    try {
      const token = await GetToken();
      const response = await fetch(
        Backend.api + Backend.allUnits + `?unit_type_id=${formik.values.type}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUnits(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch units');
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching units');
    }
  };

  const handleFetchingRoles = async () => {
    try {
      const token = await GetToken();
      const response = await fetch(Backend.auth + Backend.roles, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch roles');
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching roles');
    }
  };

  React.useEffect(() => {
    if (formik.values.type) {
      handleFetchingUnits();
    } else {
      setUnits([]); // Clear units if type is not selected
    }
  }, [formik.values.type]);

  React.useEffect(() => {
    handleFetchingTypes();
    handleFetchingRoles();
    if (!add) {
      formik.resetForm();
      setSelectedRoles([]);
      setRoleIds([]);
    }
  }, [add]);

  return (
    <React.Fragment>
      <Dialog
        open={add}
        onClose={onClose}
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
          <IconButton onClick= {onClose}>
            <IconX size={20} />
          </IconButton>
        </Box>

        <form noValidate onSubmit={formik.handleSubmit}>
          <DialogContent>
            <FormControl
              fullWidth
              error={formik.touched.username && Boolean(formik.errors.username)}
              sx={{ marginTop: 2.4 }}
            >
              <InputLabel htmlFor="username">Employee ID</InputLabel>
              <OutlinedInput
                id="username"
                name="username"
                label="Employee ID"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
              />
              {formik.touched.username && formik.errors.username && (
                <FormHelperText error id="standard-weight-helper-text-username">
                  {formik.errors.username}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={formik.touched.name && Boolean(formik.errors.name)}
              sx={{ marginTop: 2.4 }}
            >
              <InputLabel htmlFor="name">Full Name</InputLabel>
              <OutlinedInput
                id="name"
                name="name"
                label="Full Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
              />
              {formik.touched.name && formik.errors.name && (
                <FormHelperText error id="standard-weight-helper-text-name">
                  {formik.errors.name}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              sx={{ marginTop: 2.4 }}
            >
              <InputLabel htmlFor="phone">Phone Number</InputLabel>
              <OutlinedInput
                id="phone"
                name="phone"
                label="Phone Number"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
              />
              {formik.touched.phone && formik.errors.phone && (
                <FormHelperText error id="standard-weight-helper-text-phone">
                  {formik.errors.phone}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={formik.touched.type && Boolean(formik.errors.type)}
              sx={{ marginTop: 2.4 }}
            >
              <InputLabel htmlFor="type">Unit Type</InputLabel>
              <Select
                id="type"
                name="type"
                label="Unit Type"
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={unitLoading}
              >
                {unitLoading ? (
                  <MenuItem disabled>
                    <ActivityIndicator size={20} />
                  </MenuItem>
                ) : unitType.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="body2">No unit types found</Typography>
                  </MenuItem>
                ) : (
                  unitType.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {formik.touched.type && formik.errors.type && (
                <FormHelperText error id="standard-weight-helper-text-type">
                  {formik.errors.type}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={formik.touched.unit && Boolean(formik.errors.unit)}
              sx={{ marginTop: 2.4 }}
              disabled={!formik.values.type}
            >
              <InputLabel htmlFor="unit">Unit</InputLabel>
              <Select
                id="unit"
                name="unit"
                label="Unit"
                value={formik.values.unit}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                {units.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="body2">
                      {formik.values.type ? 'No units found' : 'Select a unit type first'}
                    </Typography>
                  </MenuItem>
                ) : (
                  units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {formik.touched.unit && formik.errors.unit && (
                <FormHelperText error id="standard-weight-helper-text-unit">
                  {formik.errors.unit}
                </FormHelperText>
              )}
            </FormControl>

            <Autocomplete
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
                  label="Select Roles"
                  variant="outlined"
                  error={formik.touched.role && Boolean(formik.errors.role)}
                  helperText={formik.touched.role && formik.errors.role}
                />
              )}
              sx={{ marginTop: 2.4 }}
            />

            <Typography
              variant="caption"
              sx={{
                display: 'flex',
                alignItems: 'center',
                paddingX: 1,
                marginTop: 0.8,
              }}
            >
              <IconInfoCircle size={14} style={{ paddingRight: 2 }} /> The
              default role for employee is <b style={{ paddingLeft: 3 }}>Employee</b>
            </Typography>

            <FormControl
              fullWidth
              error={formik.touched.start_date && Boolean(formik.errors.start_date)}
              sx={{ marginTop: 2.4 }}
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
                fullWidth
                notched
              />
              {formik.touched.start_date && formik.errors.start_date && (
                <FormHelperText error id="start_date">
                  {formik.errors.start_date}
                </FormHelperText>
              )}
            </FormControl>
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
              {isAdding ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Done'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </React.Fragment>
  );
};

AddEmployee.propTypes = {
  add: PropTypes.bool,
  isAdding: PropTypes.bool,
  onClose: PropTypes.func,
  handleSubmission: PropTypes.func,
};