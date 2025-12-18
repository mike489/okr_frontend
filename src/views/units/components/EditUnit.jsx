'use client';

import * as React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import GetToken from 'utils/auth-token';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Backend from 'services/backend';

// Validation
const validationSchema = Yup.object({
  name: Yup.string().required('Unit name is required'),
  type: Yup.string().required('Unit type is required'),
  head: Yup.string().required('Head user is required'),
  parent: Yup.string().nullable(),
  description: Yup.string().nullable(),
});

const EditUnit = ({
  edit,
  isEditing,
  selectedUnit,
  types,
  onClose,
  handleSubmission,
}) => {
  const [users, setUsers] = React.useState([]);
  const [units, setUnits] = React.useState({ loading: false, data: [] });

  // Store the parent ID from selectedUnit
  const [initialParentId, setInitialParentId] = React.useState('');

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: selectedUnit?.name || '',
      type: selectedUnit?.unit_type?.id
        ? String(selectedUnit.unit_type.id)
        : '',
      head: selectedUnit?.head?.id ? String(selectedUnit.head.id) : '',
      parent: initialParentId, // Use the properly formatted parent ID
      description: selectedUnit?.description || '',
    },
    validationSchema,
    onSubmit: (values) => {
      const payload = {
        name: values.name.trim(),
        type: values.type.toString(),
        head: values.head.toString(),
        parent: values.parent ? values.parent.toString() : null,
        description: values.description.trim() || null,
      };

      console.log('EDIT PAYLOAD →', payload);
      handleSubmission(payload, selectedUnit?.id);
    },
  });

  // Update formik values when initialParentId changes
  React.useEffect(() => {
    if (initialParentId !== '' && formik.values.parent !== initialParentId) {
      formik.setFieldValue('parent', initialParentId);
    }
  }, [initialParentId]);

  // Fetch data when dialog opens
  React.useEffect(() => {
    if (!edit || !selectedUnit) return;

    const loadData = async () => {
      const token = await GetToken();

      try {
        // Fetch users
        const usersResponse = await fetch(Backend.pmsUrl('users'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersResponse.json();
        setUsers(usersData.success ? usersData.data?.data || [] : []);

        // Fetch units (for parent selection)
        setUnits({ loading: true, data: [] });
        const unitsResponse = await fetch(Backend.pmsUrl('units'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const unitsData = await unitsResponse.json();

        // Check the structure of the response
        const unitsList =
          unitsData?.data?.data?.data ||
          unitsData?.data?.data ||
          unitsData?.data ||
          [];
        console.log('Units data structure:', unitsData);
        console.log('Parsed units list:', unitsList);

        setUnits({
          loading: false,
          data: unitsList,
        });

        // Set the initial parent ID from selectedUnit
        // First check if selectedUnit has a parent object
        if (selectedUnit.parent && selectedUnit.parent.id) {
          setInitialParentId(String(selectedUnit.parent.id));
        }
        // Then check if it has parent_id directly
        else if (selectedUnit.parent_id) {
          setInitialParentId(String(selectedUnit.parent_id));
        } else {
          setInitialParentId(''); // No parent
        }

        console.log('Selected Unit:', selectedUnit);
        console.log('Initial Parent ID to set:', initialParentId);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setUnits({ loading: false, data: [] });
      }
    };

    loadData();
  }, [edit, selectedUnit]);

  // Debug log to see what's happening with the parent value
  React.useEffect(() => {
    console.log('Formik parent value:', formik.values.parent);
    console.log(
      'Available units:',
      units.data.map((u) => ({ id: u.id, name: u.name })),
    );
  }, [formik.values.parent, units.data]);

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!edit) {
      formik.resetForm();
      setUsers([]);
      setUnits({ loading: false, data: [] });
      setInitialParentId('');
    }
  }, [edit]);

  return (
    <Dialog open={edit} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 2 }}>
        <DialogTitle>Edit Unit</DialogTitle>
        <IconButton onClick={onClose}>
          <IconX />
        </IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {/* Name */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Unit Name *</InputLabel>
            <OutlinedInput
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && !!formik.errors.name}
            />
            <FormHelperText error>
              {formik.touched.name && formik.errors.name}
            </FormHelperText>
          </FormControl>

          {/* Type */}
          <FormControl
            fullWidth
            sx={{ mt: 3 }}
            error={formik.touched.type && !!formik.errors.type}
          >
            <InputLabel>Unit Type *</InputLabel>
            <Select
              value={formik.values.type}
              onChange={(e) => formik.setFieldValue('type', e.target.value)}
            >
              <MenuItem value="" disabled>
                Select Type
              </MenuItem>
              {types.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.type && formik.errors.type}
            </FormHelperText>
          </FormControl>

          {/* Parent */}
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Parent Unit</InputLabel>
            <Select
              name="parent"
              value={formik.values.parent}
              onChange={formik.handleChange}
              disabled={units.loading}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {units.loading ? (
                <MenuItem disabled>
                  <ActivityIndicator size={18} /> Loading...
                </MenuItem>
              ) : (
                units.data
                  .filter((u) => u.id !== selectedUnit?.id) // Prevent self-parenting
                  .map((u) => (
                    <MenuItem key={u.id} value={String(u.id)}>
                      {u.name}
                    </MenuItem>
                  ))
              )}
            </Select>
            <FormHelperText>
              {formik.values.parent &&
              !units.data.some((u) => String(u.id) === formik.values.parent)
                ? 'Warning: Current parent unit not found in list'
                : ''}
            </FormHelperText>
          </FormControl>

          {/* Head */}
          <FormControl
            fullWidth
            sx={{ mt: 3 }}
            error={formik.touched.head && !!formik.errors.head}
          >
            <InputLabel>Head User *</InputLabel>
            <Select
              value={formik.values.head}
              onChange={(e) => formik.setFieldValue('head', e.target.value)}
            >
              <MenuItem value="" disabled>
                Select User
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={String(user.id)}>
                  {user.name} {user.email && `(${user.email})`}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.head && formik.errors.head}
            </FormHelperText>
          </FormControl>

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formik.values.description}
            onChange={formik.handleChange}
            sx={{ mt: 3 }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isEditing || !formik.isValid || !formik.dirty}
          >
            {isEditing ? <CircularProgress size={20} /> : 'Update Unit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

EditUnit.propTypes = {
  edit: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  selectedUnit: PropTypes.object,
  types: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
};

export default EditUnit;
