import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
} from '@mui/material';
import { IconListCheck, IconChecklist } from '@tabler/icons-react';

const TaskSummary = ({ tasks, subtasks }) => {
  // Calculate progress for tasks and subtasks
  const taskProgress = (tasks?.achieved_count / tasks?.total_count) * 100;
  const subtaskProgress = (subtasks?.achieved_count/ subtasks?.total_count) * 100;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
      {/* Tasks Card */}
      <Typography
        variant="h4"
        sx={{ fontWeight: 500, fontSize: '20px', font: 'inter', color: '#111827', my: 2 }}
      >
        Tasks
      </Typography>
      <Grid sx={{ display: 'flex', flexDirection:{xs:'column', md:'row'}, gap: 2, mb: 3, }}>
        <Card sx={{ border: '1px solid #EAEAEA', bgcolor: 'white',  }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 , width:{md:'300px', xs:'100%'}}}>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, fontSize: '42px', font: 'Manrope' }}
                >
                  {tasks?.total_count}
                </Typography>
                <Typography variant="body2">Tasks</Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 400,
                  fontSize: '16px',
                  color: '#111827',
                  font: 'Inter Tight',
                }}
              >
                Achieved: {tasks?.achieved_count}/{tasks?.total_count}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={taskProgress}
                sx={{
                  mt: 1,
                  height: 8,
                  borderRadius: 5,
                  border: '0.5px solid #0000001A',
                  bgcolor: '#FAFAFA', 
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#FC0000', 
                  },
                }}
              />
            </Box>
            <Box
              sx={{
                bgcolor: '#F3F3F3',
                borderRadius: '50%',
                padding: 1,
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
              }}
            >
              <IconListCheck size={40} />
            </Box>
          </CardContent>
        </Card>

       
      </Grid>
    </Box>
  );
};

export default TaskSummary;
