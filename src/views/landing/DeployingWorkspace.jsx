import React from 'react';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import { CloudQueue, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';

export default function DeployingWorkspace({ tenant, status }) {
  const deploymentSteps = [
    'database_created',
    'database_migrating',
    'database_migrated',
    'database_seeding',
    'database_seeded',
    'domain_created',
    'deployed',
  ];

  const stepIndex = deploymentSteps.indexOf(status?.rawStatus);
  const progress =
    stepIndex >= 0
      ? Math.round((stepIndex / (deploymentSteps.length - 1)) * 100)
      : 0;

  const isCompleted = status?.rawStatus === 'deployed';
  const hasError = !!status?.error;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8f9ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box textAlign="center" maxWidth={700}>
        <CloudQueue sx={{ fontSize: 120, color: '#4c6ef5', mb: 4 }} />

        <Typography variant="h3" fontWeight={900} color="#1e293b" mb={2}>
          Deploying <span style={{ color: '#4c6ef5' }}>{tenant?.toUpperCase()}</span>
        </Typography>

        <Typography variant="h6" color="text.secondary" mb={6}>
          {status?.message || 'Setting up your workspace...'}
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              height: 14,
              borderRadius: 7,
              bgcolor: '#e0e7ff',
              '& .MuiLinearProgress-bar': { bgcolor: '#4c6ef5' },
            }}
          />
          <Typography variant="body1" mt={2} fontWeight="bold">
            {progress}% Complete
          </Typography>
        </Box>

        {/* Final States */}
        {hasError ? (
          <Box color="error.main">
            <ErrorIcon sx={{ fontSize: 80 }} />
            <Typography variant="h5" mt={2}>Deployment Failed</Typography>
            <Typography>{status.error}</Typography>
          </Box>
        ) : isCompleted ? (
          <Box color="success.main">
            <CheckCircle sx={{ fontSize: 90, animation: 'bounce 1.5s infinite' }} />
            <Typography variant="h4" mt={3} fontWeight={900}>
              All Done! Your workspace is ready!
            </Typography>
            <Typography variant="h6" mt={2} color="success.main">
              Redirecting you now...
            </Typography>
          </Box>
        ) : (
          <Box>
            <CircularProgress size={90} thickness={6} sx={{ color: '#4c6ef5' }} />
            <Typography variant="body1" mt={4} color="text.secondary">
              This usually takes 2 minutes
            </Typography>
          </Box>
        )}

        <style jsx>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-25px); }
          }
        `}</style>
      </Box>
    </Box>
  );
}
