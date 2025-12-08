import React from 'react';
import { FormControl, MenuItem, Select, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { SET_SELECTED_FISCAL_YEAR } from 'store/actions';

const FiscalYearMenu = () => {
  const dispatch = useDispatch();

  const years = useSelector((state) => state.customization.fiscalYears);
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  const handleSelection = (event) => {
    dispatch({
      type: SET_SELECTED_FISCAL_YEAR,
      selectedFiscalYear: event.target.value,
    });
  };

  return (
    <FormControl
      variant="standard"
      sx={{
        mx: 2,
        minWidth: 110,
        color: 'white',

        // Make underline white
        '& .MuiInput-underline:before': {
          borderBottomColor: 'white',
        },
        '& .MuiInput-underline:hover:before': {
          borderBottomColor: 'white',
        },
        '& .MuiInput-underline:after': {
          borderBottomColor: 'white',
        },
      }}
    >
      <Typography variant="caption" sx={{ color: 'white' }}>
        Fiscal year
      </Typography>

      <Select
        value={selectedYear}
        onChange={handleSelection}
        renderValue={(selected) => (
          <Typography sx={{ color: 'white' }}>{selected?.year}</Typography>
        )}
        sx={{
          color: 'white',
          '& .MuiSelect-icon': { color: 'white' },
        }}
      >
        {years?.map((year) => (
          <MenuItem key={year.id} value={year}>
            <Typography sx={{ color: 'black' }}>{year.year}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FiscalYearMenu;
