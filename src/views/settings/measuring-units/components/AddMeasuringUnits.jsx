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
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import GetToken from 'utils/auth-token';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Backend from 'services/backend';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Unit name is required'),
});

import PropTypes from 'prop-types';

const AddMeasuringUnit = ({ add, isAdding, onClose, handleSubmission }) => {
  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSubmission(values);
    },
  });

  const handleFetchingUnits = async () => {
    const token = await GetToken();
    const Api = Backend.api + Backend.measuringUnits + formik.values.type;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
    })
      .then((response) => response.json())

      .catch((error) => {
        toast.error(error.message);
      });
  };

  React.useEffect(() => {
    if (formik.values.type) {
      handleFetchingUnits();
    }
  }, [formik.values.type]);
  React.useEffect(() => {
    if (!add) {
      formik.resetForm();
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 2,
          }}
        >
          <DialogTitle variant="h3">Add Measuring Unit</DialogTitle>
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
              <InputLabel htmlfor="name">Name</InputLabel>
              <OutlinedInput
                id="name"
                name="name"
                label="name"
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
          </DialogContent>
          <DialogActions sx={{ paddingX: 2 }}>
            <Button variant="" onClick={onClose} sx={{ marginLeft: 10 }}>
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

AddMeasuringUnit.propTypes = {
  add: PropTypes.bool.isRequired,
  isAdding: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
};

export default AddMeasuringUnit;
