import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Unit name is required'),
  my_unit_type: Yup.string().required('Unit type is required'),
  parent_id: Yup.string().required('Parent Unit is required'),
  type: Yup.string().required('Parent Unit type is required'),
  manager_id: Yup.string().nullable(), // Optional unless required by backend
});

const EditUnit = ({
  edit,
  isEditing,
  selectedUnit,
  types,
  onClose,
  handleSubmission,
}) => {
  const [loadingParents, setLoadingParents] = React.useState(false);
  const [managers, setManagers] = React.useState([]);
  const [units, setUnits] = React.useState({
    loading: false,
    data: [],
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      my_unit_type: '',
      parent_id: '',
      type: '',
      manager_id: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSubmission(values);
    },
  });

  const setFormInitialValues = () => {
    formik.setValues({
      name: selectedUnit?.name || '',
      my_unit_type: selectedUnit?.unit_type?.id || '',
      parent_id: selectedUnit?.parent_id || '',
      type: selectedUnit?.parent?.unit_type_id || '',
      manager_id: selectedUnit?.manager?.user.id || '',
    });
  };

  const handleFetchingManagers = async () => {
    setLoadingParents(true);
    try {
      const token = await GetToken();
      console.log('Token:', token);
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
    setFormInitialValues();
    if (selectedUnit) {
      handleFetchingManagers();
      handleFetchingAll();
    }
  }, [selectedUnit]);

  return (
    <React.Fragment>
      <Dialog
        open={edit}
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
          <DialogTitle variant="h3">Edit Unit</DialogTitle>
          <IconButton onClick={onClose}>
            <IconX size={20} />
          </IconButton>
        </Box>

        <form noValidate onSubmit={formik.handleSubmit}>
          <DialogContent>
            <FormControl
              fullWidth
              error={formik.touched.name && Boolean(formik.errors.name)}
              sx={{ marginTop: 1 }}
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
              error={formik.touched.my_unit_type && Boolean(formik.errors.my_unit_type)}
              sx={{ marginTop: 3 }}
            >
              <InputLabel htmlFor="my_unit_type">This Unit Type</InputLabel>
              <Select
                id="my_unit_type"
                name="my_unit_type"
                label="This Unit Type"
                value={formik.values.my_unit_type || ''}
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
              {formik.touched.my_unit_type && formik.errors.my_unit_type && (
                <FormHelperText error id="standard-weight-helper-text-my_unit_type">
                  {formik.errors.my_unit_type}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={formik.touched.type && Boolean(formik.errors.type)}
              sx={{ marginTop: 3 }}
            >
              <InputLabel htmlFor="type">Parent Unit Type</InputLabel>
              <Select
                id="type"
                name="type"
                label="Parent Unit Type"
                value={formik.values.type || ''}
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
                value={formik.values.parent_id || ''}
                onChange={formik.handleChange}
                disabled={units.loading}
              >
                {units.loading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 2,
                    }}
                  >
                    <ActivityIndicator size={18} />
                  </Box>
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
              <InputLabel htmlFor="manager_id">Select Unit Manager</InputLabel>
              <Select
                id="manager_id"
                name="manager_id"
                label="Select Unit Manager"
                value={formik.values.manager_id || ''}
                onChange={formik.handleChange}
                disabled={loadingParents}
              >
                {loadingParents ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 2,
                    }}
                  >
                    <ActivityIndicator size={18} />
                  </Box>
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
          </DialogContent>
          <DialogActions sx={{ paddingX: 2 }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ paddingX: 6, boxShadow: 0 }}
              disabled={isEditing}
            >
              {isEditing ? (
                <ActivityIndicator size={18} sx={{ color: 'white' }} />
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

export default EditUnit;