import React from 'react';
import { Card, CardContent, Typography, Button, Grid, Box, Chip } from '@mui/material';
import { styled } from '@mui/system';
import { 
  IconClock, 
  IconCalendar, 
  IconFileDescription, 
  IconCheck, 
  IconAlertCircle,
  IconArrowRight
} from '@tabler/icons-react';

const PendingTaskCard = ({ task, onApprove }) => {
  if (!task) return null;

  return (
    <Grid item xs={12} sm={6} md={4} sx={{ mb: 3 }}>
      <StyledCard elevation={6}>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Header with title and status chip */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>
                {task.title}
              </Typography>
              <Chip 
                icon={task.status === 'pending' ? <IconClock size={16} /> : <IconCheck size={16} />}
                label={task.status.toUpperCase()}
                color={task.status === 'pending' ? 'warning' : 'success'}
                size="small"
                sx={{ 
                  fontWeight: 600,
                  borderRadius: 1,
                  px: 0.5
                }}
              />
            </Box>

            {/* Description with icon */}
            <Box display="flex" alignItems="flex-start" gap={1}>
              <IconFileDescription size={20} color="#6b7280" />
              <Typography variant="body2" color="text.secondary">
                {task.description}
              </Typography>
            </Box>

            {/* Date with icon */}
            <Box display="flex" alignItems="center" gap={1}>
              <IconCalendar size={20} color="#6b7280" />
              <Typography variant="body2" color="text.secondary">
                {task.date}
              </Typography>
            </Box>

            {/* Additional info section */}
            {task.priority && (
              <Box display="flex" alignItems="center" gap={1}>
                <IconAlertCircle size={20} color={
                  task.priority === 'high' ? '#ef4444' : 
                  task.priority === 'medium' ? '#f59e0b' : '#10b981'
                } />
                <Typography variant="body2" color="text.secondary">
                  Priority: 
                  <Box 
                    component="span" 
                    sx={{ 
                      ml: 1,
                      fontWeight: 600,
                      color: 
                        task.priority === 'high' ? 'error.main' : 
                        task.priority === 'medium' ? 'warning.main' : 'success.main'
                    }}
                  >
                    {task.priority}
                  </Box>
                </Typography>
              </Box>
            )}

            {/* Button Section */}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onApprove(task.id)}
                endIcon={<IconArrowRight size={18} />}
                sx={{
                  padding: '8px 20px',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    boxShadow: 'none',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Approve Task
              </Button>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    </Grid>
  );
};

// Enhanced styled Card component
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 2px 20px rgba(255, 255, 254, 0.08)',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2.5),
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  
}));

export default PendingTaskCard;