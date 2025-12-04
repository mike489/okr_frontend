import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { SET_SELECTED_FISCAL_YEAR } from 'store/actions';
import GetFiscalYear from 'utils/components/GetFiscalYear';

const FiscalYearSelector = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const selectedFiscalYear = useSelector((state) => state.customization.selectedFiscalYear);
  const fiscalYears = useSelector((state) => state.customization.fiscalYears);

  const [selectedYearId, setSelectedYearId] = useState(selectedFiscalYear?.id || null);

  useEffect(() => { 
    setSelectedYearId(selectedFiscalYear?.id || null);
  }, [selectedFiscalYear]);

  const handleYearSelection = (year) => {
    if (selectedYearId === year.id) {
      setSelectedYearId(null);
      dispatch({ type: SET_SELECTED_FISCAL_YEAR, selectedFiscalYear: null });
    } else {
      setSelectedYearId(year.id);
      dispatch({ type: SET_SELECTED_FISCAL_YEAR, selectedFiscalYear: year });
    }
  };

  return (
    <>
      <GetFiscalYear /> 
      
      {fiscalYears?.length > 0 &&
        fiscalYears.map((year) => (
          <Box
            key={year.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2.2,
              px: 2,
              border: 0.6,
              borderRadius: 2,
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.grey[50],
              cursor: 'pointer',
              my: 1.6
            }}
            onClick={() => handleYearSelection(year)}
            aria-selected={selectedYearId === year.id}
          >
            <Box>
              <Typography variant="h4">{year.year}</Typography>
              <Typography variant="body2" color="textSecondary">
                {year.description} ({year.status})
              </Typography>
            </Box>

            {selectedYearId === year.id && (
              <IconCircleCheckFilled size={24} style={{ color: theme.palette.primary.main }} />
            )}
          </Box>
        ))}

      <ToastContainer />
    </>
  );
};

export default FiscalYearSelector;
