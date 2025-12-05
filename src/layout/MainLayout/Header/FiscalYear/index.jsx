import React from 'react';
import {
  FormControl,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { SET_SELECTED_FISCAL_YEAR } from 'store/actions';

const FiscalYearMenu = () => {
  const dispatch = useDispatch();

  const years = useSelector((state) => state.customization.fiscalYears);
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);

  console.log("Fiscal Year:", years);

  const handleSelection = (event) => {
    dispatch({
      type: SET_SELECTED_FISCAL_YEAR,
      selectedFiscalYear: event.target.value,
    });
  };

  return (
    <FormControl variant="standard" sx={{ mx: 2, minWidth: 110 }}>
      <Typography variant="caption">Fiscal year</Typography>

      <Select value={selectedYear} onChange={handleSelection}>
        {years?.map((year) => (
          <MenuItem key={year.id} value={year}>
            <Typography variant="body2">{year.year}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FiscalYearMenu;
