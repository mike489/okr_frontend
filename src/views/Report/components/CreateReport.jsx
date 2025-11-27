import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Autocomplete,
  Grid,
  FormHelperText,
  Typography,
} from '@mui/material';
import { IconX, IconTrash } from '@tabler/icons-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const validationSchema = Yup.object().shape({
  task_id: Yup.string().required('Task is required'),
  activity_type_id: Yup.string().required('Activity type is required'),
  place: Yup.string().required('At least one place is required'),
  participants: Yup.string().required('Participants are required'),
  objective: Yup.string().required('Objective is required'),
  summary: Yup.string().required('Summary is required'),
  deliverables: Yup.string().required('Deliverables are required'),
  summary_in_amharic: Yup.string().required('Summary in Amharic is required'),
});

const CreateReport = ({ create, isCreating, onClose, handleSubmission, tasks, activityTypes }) => {
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    console.log('Tasks prop:', tasks);
    console.log('ActivityTypes prop:', activityTypes);
  }, [tasks, activityTypes]);

  const formik = useFormik({
    initialValues: {
      task_id: '',
      activity_type_id: '',
      place: '',
      participants: '',
      objective: '',
      summary: '',
      deliverables: '',
      summary_in_amharic: '',
      photo: [],
    },
    validationSchema,
    onSubmit: (values) => {
      const formData = new FormData();
      Array.from(Object.keys(values)).forEach((key) => {
        if (key === 'photo') {
          values[key].forEach((file) => {
            formData.append('photos[]', file);
          });
        } else if (key !== 'task_id') {
          formData.append(key, values[key]);
        }
      });

      formData.append('task_id', values.task_id);

      const selectedActivity = Array.isArray(tasks)
        ? tasks.find((activity) => activity.id === values.task_id)
        : null;
      if (selectedActivity) {
        formData.append('tasks', selectedActivity.title);
      }
      const selectedActivityType = Array.isArray(activityTypes)
        ? activityTypes.find((type) => type.id === values.activity_type_id)
        : null;
      if (selectedActivityType) {
        formData.append('activity_type', selectedActivityType.name);
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      handleSubmission(formData);
    },
  });

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.currentTarget.files);
    formik.setFieldValue('photo', [...formik.values.photo, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    formik.setFieldValue(
      'photo',
      formik.values.photo.filter((_, index) => index !== indexToRemove)
    );
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
  ];

  React.useEffect(() => {
    if (!create) {
      formik.resetForm();
    }
  }, [create]);

  return (
    <Dialog open={create} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
        <DialogTitle variant="h3">Create Report</DialogTitle>
        <IconButton onClick={onClose}>
          <IconX size={20} />
        </IconButton>
      </Box>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={tasks || []}
                getOptionLabel={(option) => option?.title || ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(event, value) => formik.setFieldValue('task_id', value?.id || '')}
                onBlur={() => formik.setFieldTouched('task_id', true)}
                value={tasks?.find(task => task.id === formik.values.task_id) || null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tasks"
                    name="task_id"
                    error={formik.touched.task_id && Boolean(formik.errors.task_id)}
                    helperText={formik.touched.task_id && formik.errors.task_id}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={activityTypes || []}
                getOptionLabel={(option) => option.name || ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, value) => formik.setFieldValue('activity_type_id', value ? value.id : '')}
                onBlur={() => formik.setFieldTouched('activity_type_id', true)}
                value={activityTypes?.find(type => type.id === formik.values.activity_type_id) || null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Activity Type"
                    name="activity_type_id"
                    error={formik.touched.activity_type_id && Boolean(formik.errors.activity_type_id)}
                    helperText={formik.touched.activity_type_id && formik.errors.activity_type_id}
                  />
                )}
              />
            </Grid>
            {['place', 'participants', 'objective', 'summary', 'deliverables', 'summary_in_amharic'].map((name) => (
              <Grid item xs={12} key={name}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {name.replace(/_/g, ' ')}
                </Typography>
                <ReactQuill
                  theme="snow"
                  value={formik.values[name]}
                  onChange={(value) => formik.setFieldValue(name, value)}
                  onBlur={() => formik.setFieldTouched(name, true)}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ height: 'auto', marginBottom: '40px' }}
                />
                {formik.touched[name] && formik.errors[name] && (
                  <FormHelperText error sx={{ mt: 6 }}>
                    {formik.errors[name]}
                  </FormHelperText>
                )}
              </Grid>
            ))}
            <Grid item xs={12}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFileChange}
              />
              <Button variant="contained" onClick={() => fileInputRef.current.click()}>
                Upload Photos
              </Button>
              {formik.errors.photo && formik.touched.photo && (
                <FormHelperText error>{formik.errors.photo}</FormHelperText>
              )}
              <Box mt={2}>
                {formik.values.photo.map((file, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={1}
                    p={1}
                    border={1}
                    borderColor="grey.400"
                    borderRadius={2}
                  >
                    <Typography>{file.name}</Typography>
                    <IconButton onClick={() => handleRemoveFile(index)}>
                      <IconTrash size={20} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isCreating}>
            {isCreating ? <CircularProgress size={24} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

CreateReport.propTypes = {
  create: PropTypes.bool.isRequired,
  isCreating: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ),
  activityTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

CreateReport.defaultProps = {
  tasks: [],
  activityTypes: [],
};

export default CreateReport;