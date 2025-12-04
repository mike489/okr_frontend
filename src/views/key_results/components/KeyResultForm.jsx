import React from 'react';
import { Grid, TextField, MenuItem, Button } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const KeyResultSchema = Yup.object().shape({
  objective_id: Yup.string().required("Objective is required"),
  name: Yup.string().required("Name is required"),
  metric_unit: Yup.string().required("Metric unit required"),
  target_type: Yup.string().required("Target type required"),
  start_value: Yup.number().required("Start value required"),
  current_value: Yup.number().required("Current value required"),
  target_value: Yup.number().required("Target value required"),
  weight: Yup.number().min(0).max(1).required("Weight required"),
  confidence: Yup.number().min(0).max(100).required("Confidence required"),
  progress: Yup.number().min(0).max(100).required("Progress required"),
  calc_method: Yup.string().required("Calculation method required"),
});

const KeyResultForm = ({ initialValues, objectives, onSubmit, loading }) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={KeyResultSchema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Form>
          <Grid container spacing={2}>

            {/* Objective */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Objective"
                name="objective_id"
                value={values.objective_id}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.objective_id && Boolean(errors.objective_id)}
                helperText={touched.objective_id && errors.objective_id}
              >
                {objectives.map(obj => (
                  <MenuItem key={obj.id} value={obj.id}>
                    {obj.title || obj.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Name */}
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

            {/* Metric Unit */}
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

            {/* Target Type */}
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

            {/* Start Value */}
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Start Value"
                name="start_value"
                value={values.start_value}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.start_value && Boolean(errors.start_value)}
                helperText={touched.start_value && errors.start_value}
              />
            </Grid>

            {/* Current Value */}
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Current Value"
                name="current_value"
                value={values.current_value}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.current_value && Boolean(errors.current_value)}
                helperText={touched.current_value && errors.current_value}
              />
            </Grid>

            {/* Target Value */}
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Target Value"
                name="target_value"
                value={values.target_value}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.target_value && Boolean(errors.target_value)}
                helperText={touched.target_value && errors.target_value}
              />
            </Grid>

            {/* Weight */}
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Weight (0 - 1)"
                name="weight"
                value={values.weight}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.weight && Boolean(errors.weight)}
                helperText={touched.weight && errors.weight}
              />
            </Grid>

            {/* Confidence */}
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Confidence (0 - 100%)"
                name="confidence"
                value={values.confidence}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confidence && Boolean(errors.confidence)}
                helperText={touched.confidence && errors.confidence}
              />
            </Grid>

            {/* Progress */}
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Progress (0 - 100%)"
                name="progress"
                value={values.progress}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.progress && Boolean(errors.progress)}
                helperText={touched.progress && errors.progress}
              />
            </Grid>

            {/* Calculation Method */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Calculation Method"
                name="calc_method"
                value={values.calc_method}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.calc_method && Boolean(errors.calc_method)}
                helperText={touched.calc_method && errors.calc_method}
              >
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="auto">Automatic</MenuItem>
              </TextField>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                disabled={loading}
                sx={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  bgcolor: "primary.main",
                  border: "none",
                  color: "white",
                  fontSize: 16,
                }}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default KeyResultForm;
