import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  TextField,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import GetToken from 'utils/auth-token';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Backend from 'services/backend';
import PropTypes from 'prop-types';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Unit name is required'),
  parent_id: Yup.string().required('Parent Unit is required'),
  type: Yup.string().required('Unit type is required'),
  start_date: Yup.date()
    .required('Start date is required')
    .typeError('Invalid date format'),
  end_date: Yup.date()
    .required('End date is required')
    .typeError('Invalid date format')
    .min(Yup.ref('start_date'), 'End date must be after start date'),
});

const AddUnit = ({ add, isAdding, types, onClose, handleSubmission }) => {
  const [loadingParents, setLoadingParents] = React.useState(false);
  const [managers, setManagers] = React.useState([]);
  const [units, setUnits] = React.useState({
    loading: false,
    data: [],
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      parent_id: '',
      unit: null,
      parent_unit_type: null,
      manager_id: null,
      type: '',
      description: '',
      start_date: '',
      end_date: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSubmission({
        name: values.name,
        unit_type_id: values.type,
        parent_id: values.parent_id,
        manager_id: values.manager_id,
        start_date: values.start_date,
        end_date: values.end_date,
      });
    },
  });

  React.useEffect(() => {
    if (!add) {      
      formik.resetForm();
    }
  }, [add]);

  const handleFetchingManagers = async () => {
    setLoadingParents(true);
    try {
      const token = await GetToken();
      const Api = Backend.api + Backend.getManagers;
      console.log('Fetching managers from:', Api);
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, {
        method: 'GET',
        headers: header,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Managers response:', data);

      if (data.success) {
        setManagers(data.data);
      } else {
        // Handle non-standard response (e.g., array of managers)
        setManagers(Array.isArray(data) ? data : data.data || []);
        if (!data.success) {
          toast.error(data.message || 'Failed to fetch managers');
        }
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error(`Error fetching managers: ${error.message}`);
    } finally {
      setLoadingParents(false);
    }
  };

  const handleFetchingAll = async () => {
    setUnits((prev) => ({ ...prev, loading: true }));
    try {
      const token = await GetToken();
      const Api = Backend.api + Backend.allUnits;
      console.log('Fetching units from:', Api);
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, {
        method: 'GET',
        headers: header,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Units response:', data);
      setUnits((prev) => ({
        ...prev,
        data: Array.isArray(data) ? data : data.data || [],
      }));
    } catch (error) {
      console.error('Error fetching units:', error);
      toast.error(`Error fetching units: ${error.message}`);
    } finally {
      setUnits((prev) => ({ ...prev, loading: false }));
    }
  };

  React.useEffect(() => {
    if (formik.values.type) {
      handleFetchingManagers();
      handleFetchingAll();
    }
  }, [formik.values.type]);

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 2,
          }}
        >
          <DialogTitle variant="h3">Add Unit</DialogTitle>
          <IconButton onClick={onClose}>
            <IconX size={20} />
          </IconButton>
        </Box>

        <form noValidate onSubmit={formik.handleSubmit}>
          <DialogContent>
            <FormControl
              fullWidth
              error={formik.touched.name && Boolean(formik.errors.name)}
              sx={{ marginTop: 3 }}
            >
              <InputLabel htmlFor="name">Name</InputLabel>
              <OutlinedInput
                id="name"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
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
              error={formik.touched.type && Boolean(formik.errors.type)}
              sx={{ marginTop: 3 }}
            >
              <InputLabel htmlFor="type">Unit Type</InputLabel>
              <Select
                id="type"
                name="type"
                label="Unit Type"
                value={formik.values.type}
                onChange={formik.handleChange}
              >
                {types.length === 0 ? (
                  <Typography variant="body2" sx={{ padding: 1 }}>
                    Unit type is not found
                  </Typography>
                ) : (
                  types.map((type) => (
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
              error={formik.touched.parent_id && Boolean(formik.errors.parent_id)}
              sx={{ marginTop: 3 }}
              disabled={!formik.values.type}
            >
              <InputLabel htmlFor="parent_id">Select Parent Unit</InputLabel>
              <Select
                id="parent_id"
                name="parent_id"
                label="Select Parent Unit"
                value={formik.values.parent_id}
                onChange={formik.handleChange}
              >
                {units.loading ? (
                  <ActivityIndicator size={18} />
                ) : units.data.length === 0 ? (
                  <Typography variant="body2" sx={{ padding: 1 }}>
                    No parent units available
                  </Typography>
                ) : (
                  units.data.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {formik.touched.parent_id && formik.errors.parent_id && (
                <FormHelperText error id="standard-weight-helper-text-parent_id">
                  {formik.errors.parent_id}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={formik.touched.manager_id && Boolean(formik.errors.manager_id)}
              sx={{ marginTop: 3 }}
            >
              <InputLabel htmlFor="manager_id">Manager</InputLabel>
              <Select
                id="manager_id"
                name="manager_id"
                label="Manager"
                value={formik.values.manager_id}
                onChange={formik.handleChange}
              >
                {loadingParents ? (
                  <ActivityIndicator size={18} />
                ) : managers.length === 0 ? (
                  <Typography variant="body2" sx={{ padding: 1 }}>
                    No managers available
                  </Typography>
                ) : (
                  managers.map((manager) => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {formik.touched.manager_id && formik.errors.manager_id && (
                <FormHelperText error id="standard-weight-helper-text-manager_id">
                  {formik.errors.manager_id}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={formik.touched.start_date && Boolean(formik.errors.start_date)}
              sx={{ marginTop: 3 }}
            >
              <TextField
                id="start_date"
                name="start_date"
                label="Start Date"
                type="date"
                value={formik.values.start_date}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
                error={formik.touched.start_date && Boolean(formik.errors.start_date)}
                helperText={formik.touched.start_date && formik.errors.start_date}
              />
            </FormControl>

            <FormControl
              fullWidth
              error={formik.touched.end_date && Boolean(formik.errors.end_date)}
              sx={{ marginTop: 3 }}
            >
              <TextField
                id="end_date"
                name="end_date"
                label="End Date"
                type="date"
                value={formik.values.end_date}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
                error={formik.touched.end_date && Boolean(formik.errors.end_date)}
                helperText={formik.touched.end_date && formik.errors.end_date}
              />
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ paddingX: 2 }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ paddingX: 6, boxShadow: 0 }}
              disabled={isAdding}
            >
              {isAdding ? (
                <CircularProgress size={18} sx={{ color: 'white' }} />
              ) : (
                'Done'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </React.Fragment>
  );
};

AddUnit.propTypes = {
  add: PropTypes.bool.isRequired,
  isAdding: PropTypes.bool.isRequired,
  types: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
};

export default AddUnit;