import React from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Typography } from '@mui/material';
import { formatDate } from 'utils/function';

export const TaskOverview = ({ task }) => {
  if (!task) {
    return <Typography>No task data available</Typography>;
  }

  return (
    <Grid container sx={{ display: 'flex', alignItems: 'flex-start' }}>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={6} gap={2}>
            <Typography variant="subtitle2">Task Name</Typography>
            <Typography variant="body2">{task.title || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Task Created at</Typography>
            <Typography variant="body2">
              {task.created_at
                ? formatDate(task.created_at).formattedDate
                : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6} mt={2}>
            <Typography variant="subtitle2">Deadline</Typography>
            <Typography variant="body2">
              {task.deadline
                ? formatDate(task.created_at).formattedDate
                : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2">Main Activity</Typography>
            <Typography variant="body2">
              {task.main_activity?.title || 'N/A'}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          {task.description ? (
            <Box>
              <Typography variant="subtitle2">Description</Typography>
              <Typography variant="body2">{task.description}</Typography>
            </Box>
          ) : (
            <Typography variant="subtitle2">
              No description available
            </Typography>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

TaskOverview.propTypes = {
  task: PropTypes.object,
};
