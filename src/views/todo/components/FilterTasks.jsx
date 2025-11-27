import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Grid,
  useTheme,
} from '@mui/material';
import { toast } from 'react-toastify';
import { IconAdjustmentsHorizontal, IconX } from '@tabler/icons-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Popper from '@mui/material/Popper';
import Autocomplete from '@mui/material/Autocomplete';
import Transitions from 'ui-component/extended/Transitions';
import DrogaCard from 'ui-component/cards/DrogaCard';

const FilterTasks = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  GetPlans,
  myPlan,
  MyPlanSelected,
  handlePlanSelection,
}) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleOpenFilter = () => {
    setOpen((prevOpen) => !prevOpen);
    GetPlans();
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    if (newDate && endDate && newDate >= endDate) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (date) => {
    if (date && startDate && date <= startDate) {
      toast.error('End date must be at least one day after the start date.');
    } else {
      setEndDate(date);
    }
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        aria-controls={open ? 'filter-list-grow' : undefined}
        aria-haspopup="true"
        color="inherit"
        variant="outlined"
        aria-label="filter"
        onClick={handleOpenFilter}
        sx={{ marginRight: 3, position: 'relative' }}
      >
        <IconAdjustmentsHorizontal
          stroke="1.6"
          color={theme.palette.grey[500]}
          size="1.4rem"
        />
        {(startDate || endDate || MyPlanSelected) && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: theme.palette.error.main,
              transition: 'all 1s ease-in-out',
            }}
          />
        )}
      </IconButton>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        transition
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [0, 6] } }],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions in={open} {...TransitionProps}>
            <DrogaCard
              sx={{ pt: 1, pb: 2, boxShadow: 3, backgroundColor: 'none' }}
            >
              <Box
                sx={{
                  minWidth: 240,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 0.4,
                  pb: 0.5,
                  borderBottom: 0.6,
                  borderColor: theme.palette.divider,
                  mb: 2,
                }}
              >
                <Typography
                  variant="h4"
                  ml={0.6}
                  color={theme.palette.text.primary}
                >
                  Filter Tasks
                </Typography>
                <IconButton
                  onClick={(event) => handleClose(event)}
                  sx={{ cursor: 'pointer' }}
                >
                  <IconX stroke={1.6} size="1.2rem" />
                </IconButton>
              </Box>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={Boolean(
                          endDate && startDate && endDate < startDate,
                        )}
                        helperText={
                          endDate && startDate && endDate < startDate
                            ? 'End date must be later than start date'
                            : ''
                        }
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    disabled={startDate === null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={Boolean(
                          endDate && startDate && endDate < startDate,
                        )}
                        helperText={
                          endDate && startDate && endDate < startDate
                            ? 'End date must be later than start date'
                            : ''
                        }
                      />
                    )}
                  />
                </Grid>
              </LocalizationProvider>

              <Box sx={{ mt: 3 }}>
                <Autocomplete
                  disablePortal
                  options={myPlan}
                  getOptionLabel={(option) => option?.title || 'Unnamed Plan'}
                  isOptionEqualToValue={(option, value) =>
                    String(option.id) === String(value.id)
                  }
                  value={
                    myPlan.find(
                      (plan) => String(plan.id) === String(MyPlanSelected),
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handlePlanSelection({
                      target: { value: newValue ? newValue.id : '' },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Plan"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                  noOptionsText="No Plans found"
                />
              </Box>
            </DrogaCard>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

FilterTasks.propTypes = {
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  setStartDate: PropTypes.func.isRequired,
  setEndDate: PropTypes.func.isRequired,
  GetPlans: PropTypes.func.isRequired,
  myPlan: PropTypes.array.isRequired,
  MyPlanSelected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handlePlanSelection: PropTypes.func.isRequired,
};

export default FilterTasks;
