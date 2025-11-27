import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Comment from './Comment';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import CommentForm from './CommentForm';

const Conversations = ({ task }) => {
  const [remarks, setRemarks] = useState({
    loading: false,
    error: false,
    data: [], 
  });
  const [commenting, setCommenting] = useState(false);
console.log('Remarks', task.remark);
  // Append new remark to state
  const handleAppendingNewRemark = (newRemark) => {
    setRemarks((prevState) => ({
      ...prevState,
      data: [newRemark, ...prevState.data], 
    }));
  };

  // Handle posting a new comment
  const handleCommenting = async (values) => {
    setCommenting(true);

    try {
      const token = await GetToken();
      const Api = `${Backend.api}${Backend.tasks}/${task?.id}/remarks`;

      const response = await fetch(Api, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remark: values.remark,
          type: 'task',
        }),
      });

      const result = await response.json();

      if (result?.success) {
        toast.success(result?.message || 'Remark added successfully!');
        handleAppendingNewRemark(result?.data?.remark);
      } else {
        toast.error(result?.message || 'Failed to add remark.');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setCommenting(false);
    }
  };

  // Update remarks when task prop changes (ensure you're setting the correct task data here)
  useEffect(() => {
    if (task?.remarks && Array.isArray(task.remarks)) {
      setRemarks((prevState) => ({
        ...prevState,
        data: task.remarks, // Ensure the remarks are correctly set here
      }));
    }
  }, [task?.remarks]);

  return (
    <Box>
      {remarks.loading ? (
        <Grid container sx={{ minHeight: 400 }}>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
            }}
          >
            <ActivityIndicator size={20} />
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ paddingTop: 2 }}>
          <CommentForm
            handleSubmission={handleCommenting}
            submitting={commenting}
          />

          <Box sx={{ mt: 2 }}>
            {task.remarks?.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No remarks yet.
              </Typography>
            ) : (
              Array.isArray(task.remarks) && task.remarks.length > 0 ? (
                task.remarks.map((item) => (
                  <Comment key={item?.id} comment={item?.remark} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No remarks available.
                </Typography>
              )
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

Conversations.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    remarks: PropTypes.array,
  }).isRequired,
};

export default Conversations;
