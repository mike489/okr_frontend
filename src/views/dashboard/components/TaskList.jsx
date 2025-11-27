import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';

const TaskList = ({ tasks }) => {
    return (
      <Grid  spacing={2} sx={{ maxWidth: 'auto', width: '100%' }}>
        <Grid item xs={12}>
          <Card  sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={500} color="#111827" fontSize={20}>
                My Tasks
              </Typography>
              {tasks?.map((task, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2, // Reduced gap for better alignment
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    border: '1px solid #EAEAEA',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                      {task.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created on: {task.date}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600} color="#707070">
                    Subtasks • {task.sub_task_count}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

export default TaskList;
