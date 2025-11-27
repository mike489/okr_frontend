import React from 'react';
import 'react-quill/dist/quill.snow.css';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DotMenu } from 'ui-component/menu/DotMenu';
import { getStatusColor, MeasuringUnitConverter, PeriodNaming } from 'utils/function';
import DrogaCard from 'ui-component/cards/DrogaCard';
import hasPermission from 'utils/auth/hasPermission';
import PropTypes from 'prop-types';

const MiniPlanCard = ({ plan, onPress, onEdit, onDelete, sx, hideOptions }) => {
  const theme = useTheme();
  const smallDevice = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <DrogaCard sx={{ ...sx, ':hover': { backgroundColor: theme.palette.grey[50] }, transition: 'all 0.1s ease-out' }}>
      <div onClick={onPress} style={{ cursor: 'pointer' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Typography
            variant={smallDevice ? 'h4' : 'h3'}
            color={theme.palette.text.primary}
            sx={{ marginTop: 0.6, cursor: 'pointer', textOverflow: 'ellipsis', whiteSpace: 'wrap' }}
          >
            {plan?.kpi?.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }} color={getStatusColor(plan?.status)}>
                {plan?.status}
              </Typography>
            </Box>
            {!hideOptions && (onDelete || onEdit) && (
              <DotMenu
                orientation="vertical"
                onEdit={onEdit && hasPermission('update:kpitracker') ? onEdit : null}
                onDelete={hasPermission('delete:kpitracker') && onDelete}
              />
            )}
          </Box>
        </Box>

        <Grid container sx={{ paddingTop: 2 }}>
          <Grid
            item
            xs={4}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 2 }}
          >
            <Typography variant="h3" color="primary">
              {plan?.weight}%
            </Typography>
            <Typography variant="subtitle1" color={theme.palette.text.primary} sx={{ marginTop: 1 }}>
              Weight
            </Typography>
          </Grid>

          <Grid
            item
            xs={8}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 2 }}
          >
            <Typography variant="h3" color="primary">
              {plan?.total_target}
              {MeasuringUnitConverter(plan?.kpi?.measuring_unit?.name)}
            </Typography>
            <Typography variant="subtitle1" color={theme.palette.text.primary} sx={{ marginTop: 1 }}>
              Target
            </Typography>
          </Grid>
        </Grid>
      </div>
      <Grid
        container
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          marginTop: 3,
          borderTop: 0.8,
          borderColor: theme.palette.divider,
          padding: 0.8,
          paddingTop: 2
        }}
      >
        {plan?.target.map((target, index) => (
          <Grid
            item
            xs={6}
            key={index}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 1, marginTop: 2 }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                {' '}
                <Typography variant="body2">
                  {PeriodNaming(plan?.frequency?.name)} {index + 1}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                {' '}
                <Box
                  sx={{
                    width: 'fit-content',

                    paddingX: 1.2,
                    backgroundColor: theme.palette.grey[50],
                    borderRadius: theme.shape.borderRadius,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="h5">
                    {target?.target}
                    {MeasuringUnitConverter(plan?.kpi?.measuring_unit?.name)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </DrogaCard>
  );
};

MiniPlanCard.propTypes = {
  plan: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onPress: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  sx: PropTypes.object
};
export default MiniPlanCard;
