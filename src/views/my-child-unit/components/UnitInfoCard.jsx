import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
} from '@mui/material';
import {
  IconRuler,
  IconCategory,
  IconHierarchy,
  IconUser,
  IconInfoCircle,
} from '@tabler/icons-react';

const InfoBox = ({ label, value, icon }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minWidth: { xs: '100%', sm: '200px' },
        padding: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant="h6"
        fontWeight={600}
        sx={{
          color: value ? 'text.primary' : 'text.disabled',
          pl: 3, // Align with icon
        }}
      >
        {value || 'Not specified'}
      </Typography>
    </Box>
  );
};

const UnitInfoCard = ({ unit }) => {
  const theme = useTheme();

  if (!unit) return null;

  return (
    <Grid item xs={12} sx={{ mb:0 }}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            flexWrap="wrap"
            gap={2}
            justifyContent="space-between"
          >
            <InfoBox
              label="Unit Name"
              value={unit.name}
              icon={<IconRuler size={20} color={theme.palette.primary.main} />}
            />
            <InfoBox
              label="Unit Type"
              value={unit.unit_type}
              icon={
                <IconCategory size={20} color={theme.palette.secondary.main} />
              }
            />
            <InfoBox
              label="Parent Unit"
              value={unit.parent}
              icon={<IconHierarchy size={20} color={theme.palette.info.main} />}
            />
            <InfoBox
              label="Manager"
              value={unit.manager}
              icon={<IconUser size={20} color={theme.palette.success.main} />}
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default UnitInfoCard;
