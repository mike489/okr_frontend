import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const validationSchema = Yup.object({
  key_result_id: Yup.string().required('Key Result is required'),
  assigned_to: Yup.string().required('Unit assignment is required'),
  notes: Yup.string().optional(),
});

const CreatePlan = ({
  create,
  isCreating,
  unit = [],
  keyResults = [],
  onClose,
  handleSubmission,
}) => {
  const [initialValues] = useState({
    key_result_id: '',
    assigned_to: '',
    notes: '',
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await handleSubmission(values);
      resetForm();
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={create} onClose={onClose} aria-labelledby="create-plan-modal">
      <Box sx={style}>
        <Typography id="create-plan-modal" variant="h6" component="h2" mb={3}>
          Assign Objective
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={touched.assigned_to && Boolean(errors.assigned_to)}
                  >
                    <InputLabel id="assigned-to-label">
                      Assign To (Unit)
                    </InputLabel>
                    <Select
                      labelId="assigned-to-label"
                      id="assigned_to"
                      name="assigned_to"
                      value={values.assigned_to}
                      label="Assign To (Unit)"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      {unit.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.name || u.unit_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.assigned_to && errors.assigned_to && (
                      <Typography color="error" variant="caption">
                        {errors.assigned_to}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={
                      touched.key_result_id && Boolean(errors.key_result_id)
                    }
                  >
                    <InputLabel id="key-result-label">Key Result</InputLabel>
                    <Select
                      labelId="key-result-label"
                      id="key_result_id"
                      name="key_result_id"
                      value={values.key_result_id}
                      label="Key Result"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      {keyResults.map((kr) => (
                        <MenuItem key={kr.id} value={kr.id}>
                          {kr.name || `KR-${kr.id}`}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.key_result_id && errors.key_result_id && (
                      <Typography color="error" variant="caption">
                        {errors.key_result_id}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    name="notes"
                    label="Notes"
                    value={values.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.notes && Boolean(errors.notes)}
                    helperText={touched.notes && errors.notes}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={isCreating || isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isCreating || isSubmitting}
                  >
                    {isCreating || isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Assign'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};

export default CreatePlan;
