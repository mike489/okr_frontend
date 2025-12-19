// import React from 'react';
// import { FormControl, MenuItem, Select, Typography } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import { SET_SELECTED_FISCAL_YEAR } from 'store/actions';

// const FiscalYearMenu = () => {
//   const dispatch = useDispatch();

//   const years = useSelector((state) => state.customization.fiscalYears);
//   const selectedYear = useSelector(
//     (state) => state.customization.selectedFiscalYear,
//   );
//   console.log('Fiscal years from store:', years);
//   console.log('Selected fiscal year from store:', selectedYear);
//   const handleSelection = (event) => {
//     dispatch({
//       type: SET_SELECTED_FISCAL_YEAR,
//       selectedFiscalYear: event.target.value,
//     });
//   };

//   return (
//     <FormControl
//       variant="standard"
//       sx={{
//         mx: 2,
//         minWidth: 110,
//         color: 'white',

//         // Make underline white
//         '& .MuiInput-underline:before': {
//           borderBottomColor: 'white',
//         },
//         '& .MuiInput-underline:hover:before': {
//           borderBottomColor: 'white',
//         },
//         '& .MuiInput-underline:after': {
//           borderBottomColor: 'white',
//         },
//       }}
//     >
//       <Typography variant="caption" sx={{ color: 'white' }}>
//         Fiscal year
//       </Typography>

//       <Select
//         value={selectedYear}
//         onChange={handleSelection}
//         renderValue={(selected) => (
//           <Typography sx={{ color: 'white' }}>{selected?.year}</Typography>
//         )}
//         sx={{
//           color: 'white',
//           '& .MuiSelect-icon': { color: 'white' },
//         }}
//       >
//         {years?.map((year) => (
//           <MenuItem key={year.id} value={year}>
//             <Typography sx={{ color: 'black' }}>{year.year}</Typography>
//           </MenuItem>
//         ))}
//       </Select>
//     </FormControl>
//   );
// };

// export default FiscalYearMenu;

import React, { useEffect } from 'react';
import { FormControl, MenuItem, Select, Typography, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { SET_SELECTED_FISCAL_YEAR } from 'store/actions';
import GetFiscalYear from 'utils/components/GetFiscalYear';

const FiscalYearMenu = () => {
  const dispatch = useDispatch();

  const years = useSelector((state) => state.customization.fiscalYears);
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  // Auto-select first year if years exist but no year is selected
  useEffect(() => {
    if (years && years.length > 0 && !selectedYear) {
      dispatch({
        type: SET_SELECTED_FISCAL_YEAR,
        selectedFiscalYear: years[0],
      });
    }
  }, [years, selectedYear, dispatch]);

  // Always fetch data on mount
  useEffect(() => {
    // The GetFiscalYear component handles the fetching
  }, []);

  console.log('Fiscal years from store:', years);
  console.log('Selected fiscal year from store:', selectedYear);

  const handleSelection = (event) => {
    dispatch({
      type: SET_SELECTED_FISCAL_YEAR,
      selectedFiscalYear: event.target.value,
    });
  };

  return (
    <React.Fragment>
      {/* Always fetch fiscal years */}
      <GetFiscalYear />

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
          value={selectedYear || ''}
          onChange={handleSelection}
          renderValue={(selected) => (
            <Typography sx={{ color: 'white' }}>
              {selected?.year || 'Loading...'}
            </Typography>
          )}
          sx={{
            color: 'white',
            '& .MuiSelect-icon': { color: 'white' },
          }}
          disabled={!years || years.length === 0}
        >
          {years?.map((year) => (
            <MenuItem key={year.id} value={year}>
              <Typography sx={{ color: 'text.primary' }}>
                {year.year}
              </Typography>
            </MenuItem>
          ))}

          {(!years || years.length === 0) && (
            <MenuItem value="" disabled>
              <Typography sx={{ color: 'textSecondary' }}>
                No fiscal years available
              </Typography>
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </React.Fragment>
  );
};

export default FiscalYearMenu;
