import { useTheme } from '@mui/material';

export const useProgressIndicator = () => {
  const theme = useTheme();

  const getProgressColor = (progress) => {
    if (progress >= 100) return theme.palette.success.main;
    if (progress >= 75) return theme.palette.info.main;
    if (progress >= 50) return theme.palette.warning.main;
    if (progress >= 25) return theme.palette.secondary.main;
    return theme.palette.error.main;
  };

  const getProgressLabel = (progress) => {
    if (progress >= 100) return 'Completed';
    if (progress >= 75) return 'On Track';
    if (progress >= 50) return 'Moderate';
    if (progress >= 25) return 'Needs Attention';
    return 'Delayed';
  };

  return {
    getProgressColor,
    getProgressLabel,
  };
};
