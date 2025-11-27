import React, { useState } from 'react';
import { Box, Collapse, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { format } from 'date-fns';
import { EODTask } from './EODTask';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import ErrorPrompt from 'utils/components/ErrorPrompt';
import Fallbacks from 'utils/components/Fallbacks';
import PropTypes from 'prop-types';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import taskDoneSound from 'assets/audio/done_sound.wav';

export const MyDay = ({ isLoading, error, tasks = [], onRefresh }) => {
  const theme = useTheme();
  
  // Initialize tasks as empty array if undefined
  const [selectedSubtask, setSelectedSubTask] = useState(null);
  const [showDoneTasks, setShowDoneTasks] = useState(false);

  const getFormattedDate = () => format(new Date(), 'EEEE, MMMM d');

  // Safely filter tasks
  const todoTasks = tasks?.filter((task) => task?.status === 'todo') || [];
  const doneTasks = tasks?.filter((task) => task?.status === 'done') || [];

  const handleShowCompletedTasks = () => setShowDoneTasks(!showDoneTasks);

  const handleSelectedSubtask = (subtask, newStatus, subtaskID) => {
    if (!subtask?.id) {
      toast.error('Invalid task data');
      return;
    }
    setSelectedSubTask(subtaskID);
    handleTaskStatusMiddleware(subtask, newStatus);
  };

  const playTaskDoneBeep = async () => {
    try {
      const beepSound = new Audio(taskDoneSound);
      beepSound.volume = 0.075;
      await beepSound.play();
    } catch (err) {
      console.error('Could not play sound', err);
    }
  };

  const handleTaskStatusMiddleware = async (task, status) => {
    if (!task?.id) {
      toast.error('Invalid task ID');
      return;
    }

    try {
      if (status === 'remove') {
        await handleSubtaskRemoval(task.id);
      } else {
        if (status === 'done') await playTaskDoneBeep();
        await handleSubTaskStatusChange(task, status);
      }
    } catch (error) {
      toast.error(`Operation failed: ${error.message}`);
    }
  };

  const handleSubTaskStatusChange = async (task, status) => {
    try {
      const token = await GetToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${Backend.api}${Backend.changeTaskStatus}/${task.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update task status');
      }

      toast.success(data?.data?.message || 'Task updated successfully');
      onRefresh();
    } catch (error) {
      toast.error(error.message);
      console.error('Task update error:', error);
    }
  };

  const handleSubtaskRemoval = async (id) => {
    if (!id) {
      toast.error('Invalid task ID');
      return;
    }

    try {
      const token = await GetToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${Backend.api}${Backend.subTasks}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete task');
      }

      toast.success(data?.data?.message || 'Task deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error(error.message);
      console.error('Task deletion error:', error);
    }
  };

  return (
    <Box sx={{ minHeight: '100%', borderRadius: { xs: 0, sm: 3 } }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        p: 2,
        pb: 14,
        zIndex: 1
      }}>
        <Typography variant="h3" color={theme.palette.common.white}>
          My Day
        </Typography>
        <Typography variant="body2" color={theme.palette.common.white} mt={0.6}>
          {getFormattedDate()}
        </Typography>

        <Grid container>
          <Grid item xs={12} pt={3}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
                <ActivityIndicator size={20} />
              </Box>
            ) : error ? (
              <ErrorPrompt 
                title="Server Error" 
                message="There was an error fetching your tasks" 
                size={140} 
              />
            ) : tasks.length === 0 ? (
              <Fallbacks 
                severity="tasks" 
                title="No tasks found" 
                description="Your tasks will appear here" 
                sx={{ paddingTop: 6 }} 
              />
            ) : (
              <>
                {todoTasks.map((task) => (
                  <EODTask
                    key={task.id}
                    task={task}
                    selected={selectedSubtask}
                    checked={task.status === 'done'}
                    handleSubTaskCompleted={(task, newStatus) => 
                      handleSelectedSubtask(task, newStatus, task?.id)
                    }
                  />
                ))}

                {doneTasks.length > 0 && (
                  <Box>
                    <Box
                      sx={{
                        width: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#0008',
                        borderRadius: 2,
                        pr: 2,
                        cursor: 'pointer'
                      }}
                      onClick={handleShowCompletedTasks}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton>
                          {showDoneTasks ? (
                            <IconChevronDown size="1.4rem" stroke="1.8" color={theme.palette.common.white} />
                          ) : (
                            <IconChevronRight size="1.4rem" stroke="1.8" color={theme.palette.common.white} />
                          )}
                        </IconButton>
                        <Typography variant="subtitle1" color={theme.palette.common.white}>
                          Completed
                        </Typography>
                      </Box>
                      <Typography variant="body1" color={theme.palette.common.white}>
                        {doneTasks.length}
                      </Typography>
                    </Box>

                    <Collapse in={showDoneTasks}>
                      {doneTasks.map((task) => (
                        <EODTask
                          key={task.id}
                          task={task}
                          selected={selectedSubtask}
                          checked={task.status === 'done'}
                          handleSubTaskCompleted={(task, newStatus) => 
                            handleSelectedSubtask(task, newStatus, task?.id)
                          }
                        />
                      ))}
                    </Collapse>
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

MyDay.propTypes = {
  isLoading: PropTypes.bool,
  error: PropTypes.bool,
  tasks: PropTypes.array,
  onRefresh: PropTypes.func.isRequired
};

MyDay.defaultProps = {
  isLoading: false,
  error: false,
  tasks: []
};