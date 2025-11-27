import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  IconCalendarClock,
  IconCalendarDue,
  IconCalendarCheck,
  IconCalendarDot,
  IconCalendarCancel,
} from '@tabler/icons-react';

const TaskStatus = ({ pending, todo, inProgress, done, rejected }) => {
  const statuses = [
    {
      label: 'Pending',
      count: pending,
      icon: <IconCalendarClock />,
      color: '#1A22E6',
      bgcolor: '#E5E6FF',
    },
    {
      label: 'Todo',
      count: todo,
      icon: <IconCalendarDue />,
      color: '#2CA4FF',
      bgcolor: '#E1F2FF',
    },
    {
      label: 'In Progress',
      count: inProgress,
      icon: <IconCalendarDot />,
      color: '#32A73D',
      bgcolor: '#DDF3DF',
    },
    {
      label: 'Done',
      count: done,
      icon: <IconCalendarCheck />,
      color: '#33A73D',
      bgcolor: '#DDF3DF',
    },
    {
      label: 'Rejected',
      count: rejected,
      icon: <IconCalendarCancel />,
      color: '#FF0000',
      bgcolor: '#FFE1E1',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection:{xs:'column', md:'row'}, gap: 2, flexWrap: 'wrap', mb: 3 }}>
      {statuses.map((status) => (
        <Card
          key={status.label}
          sx={{
            maxWidth: {md: '300px', xs: '100%'},
            border: '1px solid #EAEAEA',
            bgcolor: 'white',
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: {md: '300px', xs: '100%'},
            }}
          >
            <Box
              sx={{
                width: '40px',
                height: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '50%',
                bgcolor: status.bgcolor,
              }}
            >
              <Typography icon={status.icon} color={status.color}>
                {status.icon}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 400,
                  fontSize: '16px',
                  color: '#000000',
                  font: 'inter',
                }}
              >
                {status.label}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '32px',
                  color: '#111827',
                  font: 'Manrope',
                }}
              >
                {status.count || 0}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default TaskStatus;
