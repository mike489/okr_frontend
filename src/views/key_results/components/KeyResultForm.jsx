// import React from 'react';
// import { Grid, TextField, MenuItem, Button } from '@mui/material';
// import { Formik, Form } from 'formik';
// import * as Yup from 'yup';

// const KeyResultSchema = Yup.object().shape({
//   objective_id: Yup.string().required('Objective is required'),
//   name: Yup.string().required('Name is required'),
//   metric_unit: Yup.string().required('Metric unit required'),
//   target_type: Yup.string().required('Target type required'),
//   start_value: Yup.number()
//     .required('Start value required')
//     .typeError('Start value must be a number'),
//   current_value: Yup.number()
//     .required('Current value required')
//     .typeError('Current value must be a number'),
//   target_value: Yup.number()
//     .required('Target value required')
//     .typeError('Target value must be a number'),
//   weight: Yup.number()
//     .min(0, 'Weight must be at least 0')
//     .max(1, 'Weight must be at most 1')
//     .required('Weight required')
//     .typeError('Weight must be a number'),
// });

// const KeyResultForm = ({ initialValues, objectives, onSubmit, loading }) => {
//   return (
//     <Formik
//       initialValues={initialValues}
//       validationSchema={KeyResultSchema}
//       enableReinitialize
//       onSubmit={onSubmit}
//     >
//       {({
//         values,
//         errors,
//         touched,
//         handleChange,
//         handleBlur,
//         handleSubmit,
//         isSubmitting,
//       }) => (
//         <Form onSubmit={handleSubmit}>
//           <Grid container spacing={2}>
//             {/* Objective */}
//             <Grid item xs={12}>
//               <TextField
//                 select
//                 fullWidth
//                 label="Objective"
//                 name="objective_id"
//                 value={values.objective_id}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 error={touched.objective_id && Boolean(errors.objective_id)}
//                 helperText={touched.objective_id && errors.objective_id}
//                 disabled={loading}
//               >
//                 {objectives.map((obj) => (
//                   <MenuItem key={obj.id} value={obj.id}>
//                     {obj.title || obj.name}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>

//             {/* Name */}
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Key Result Name"
//                 name="name"
//                 value={values.name}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 error={touched.name && Boolean(errors.name)}
//                 helperText={touched.name && errors.name}
//                 disabled={loading}
//               />
//             </Grid>

//             {/* Metric Unit */}
//             <Grid item xs={6}>
//               <TextField
//                 fullWidth
//                 label="Metric Unit"
//                 name="metric_unit"
//                 value={values.metric_unit}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 error={touched.metric_unit && Boolean(errors.metric_unit)}
//                 helperText={touched.metric_unit && errors.metric_unit}
//                 disabled={loading}
//               />
//             </Grid>

//             {/* Target Type */}
//             <Grid item xs={6}>
//               <TextField
//                 select
//                 fullWidth
//                 label="Target Type"
//                 name="target_type"
//                 value={values.target_type}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 error={touched.target_type && Boolean(errors.target_type)}
//                 helperText={touched.target_type && errors.target_type}
//                 disabled={loading}
//               >
//                 <MenuItem value="increase_to">Increase To</MenuItem>
//                 <MenuItem value="decrease_to">Decrease To</MenuItem>
//                 <MenuItem value="maintain">Maintain</MenuItem>
//               </TextField>
//             </Grid>

//             {/* Start Value */}
//             <Grid item xs={4}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Start Value"
//                 name="start_value"
//                 value={values.start_value}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 error={touched.start_value && Boolean(errors.start_value)}
//                 helperText={touched.start_value && errors.start_value}
//                 disabled={loading}
//                 inputProps={{ step: '0.01' }}
//               />
//             </Grid>

//             {/* Current Value */}
//             <Grid item xs={4}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Current Value"
//                 name="current_value"
//                 value={values.current_value}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 error={touched.current_value && Boolean(errors.current_value)}
//                 helperText={touched.current_value && errors.current_value}
//                 disabled={loading}
//                 inputProps={{ step: '0.01' }}
//               />
//             </Grid>

//             {/* Target Value */}
//             <Grid item xs={4}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Target Value"
//                 name="target_value"
//                 value={values.target_value}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 error={touched.target_value && Boolean(errors.target_value)}
//                 helperText={touched.target_value && errors.target_value}
//                 disabled={loading}
//                 inputProps={{ step: '0.01' }}
//               />
//             </Grid>

//             {/* Weight */}
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Weight (0 - 1)"
//                 name="weight"
//                 value={values.weight}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 error={touched.weight && Boolean(errors.weight)}
//                 helperText={touched.weight && errors.weight}
//                 disabled={loading}
//                 inputProps={{
//                   step: '0.01',
//                   min: '0',
//                   max: '1',
//                 }}
//               />
//             </Grid>

//             {/* Submit Button */}
//             <Grid item xs={12}>
//               <Button
//                 type="submit"
//                 disabled={loading || isSubmitting}
//                 sx={{
//                   width: '100%',
//                   padding: '10px',
//                   borderRadius: 6,
//                   bgcolor: 'primary.main',
//                   border: 'none',
//                   color: 'white',
//                   fontSize: 16,
//                 }}
//               >
//                 {loading || isSubmitting ? 'Saving...' : 'Save'}
//               </Button>
//             </Grid>
//           </Grid>
//         </Form>
//       )}
//     </Formik>
//   );
// };

// export default KeyResultForm;

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const KeyResultSchema = Yup.object().shape({
  objective_id: Yup.string().required('Objective is required'),
  name: Yup.string().required('Name is required'),
  metric_unit: Yup.string().required('Metric unit required'),
  target_type: Yup.string().required('Target type required'),
  start_value: Yup.number().required().typeError('Must be a number'),
  current_value: Yup.number().required().typeError('Must be a number'),
  target_value: Yup.number().required().typeError('Must be a number'),
  weight: Yup.number().min(0).max(1).required().typeError('Must be a number'),
});

const KeyResultModal = ({
  open,
  onClose,
  initialValues,
  // objectives,
  onSubmit,
  loading,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        Create Key Result
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={KeyResultSchema}
          enableReinitialize
          onSubmit={onSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Objective"
                    value={initialValues.objective_id}
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Key Result Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Metric Unit"
                    name="metric_unit"
                    value={values.metric_unit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.metric_unit && Boolean(errors.metric_unit)}
                    helperText={touched.metric_unit && errors.metric_unit}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Target Type"
                    name="target_type"
                    value={values.target_type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.target_type && Boolean(errors.target_type)}
                    helperText={touched.target_type && errors.target_type}
                  >
                    <MenuItem value="increase_to">Increase To</MenuItem>
                    <MenuItem value="decrease_to">Decrease To</MenuItem>
                    <MenuItem value="maintain">Maintain</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Start Value"
                    name="start_value"
                    value={values.start_value}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Current Value"
                    name="current_value"
                    value={values.current_value}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Target Value"
                    name="target_value"
                    value={values.target_value}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Weight (0 - 1)"
                    name="weight"
                    value={values.weight}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={loading || isSubmitting}
                    sx={{
                      py: 1.2,
                      borderRadius: 6,
                      fontSize: 16,
                    }}
                    variant="contained"
                  >
                    {loading || isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default KeyResultModal;
