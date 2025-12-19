import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { SET_SELECTED_FISCAL_YEAR } from 'store/actions';
import GetFiscalYear from 'utils/components/GetFiscalYear';

const FiscalYearSelector = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const selectedFiscalYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );
  const fiscalYears = useSelector((state) => state.customization.fiscalYears);

  const handleYearSelection = (year) => {
    dispatch({
      type: SET_SELECTED_FISCAL_YEAR,
      selectedFiscalYear: year,
    });
  };

  // Fetch fiscal years if not already loaded
  if (!fiscalYears || fiscalYears.length === 0) {
    return <GetFiscalYear />;
  }

  return (
    <React.Fragment>
      {fiscalYears.map((year) => (
        <Box
          key={year.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingY: 2.2,
            paddingX: 2,
            border: 0.6,
            borderRadius: 2,
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.grey[50],
            cursor: 'pointer',
            marginY: 1.6,
          }}
          onClick={() => handleYearSelection(year)}
        >
          <Typography variant="h4">{year.year}</Typography>

          {selectedFiscalYear?.id === year.id && (
            <IconCircleCheckFilled
              size={24}
              style={{ color: theme.palette.primary.main }}
            />
          )}
        </Box>
      ))}
      <ToastContainer />
    </React.Fragment>
  );
};

export default FiscalYearSelector;
