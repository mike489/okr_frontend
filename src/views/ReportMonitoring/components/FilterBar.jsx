import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';

const FilterBar = ({ filters, onFilterChange }) => {
  const [loading, setLoading] = React.useState(false);
  const [unitOptions, setUnitOptions] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    per_page: 10,
    last_page: 1,
    total: 0,
  });
  const [error, setError] = React.useState(false);

  const monthOptions = [
    { value: '', label: 'All Months' },
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' },
  ];

  //   const unitOptions = [
  //     { value: '', label: 'All Units' },
  //     { value: 'unit1', label: 'Unit 1' },
  //     { value: 'unit2', label: 'Unit 2' },
  //     { value: 'unit3', label: 'Unit 3' },
  //     // Add more units as needed
  //   ];

  const scaleOptions = [
    { value: '', label: 'All Scales' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'enterprise', label: 'Enterprise' },
  ];

  const handleClearFilters = () => {
    onFilterChange('month', '');
    onFilterChange('unit', '');
    onFilterChange('scale', '');
  };

  const fetchUnits = useCallback(async () => {
    try {
      const token = await GetToken();
      let allUnits = [];
      let page = 1;
      let lastPage = 1;

      do {
        let url = `${Backend.pmsUrl}${Backend.units}?page=${page}`;
        if (selectedYear?.id) url += `&fiscal_year_id=${selectedYear.id}`;

        const resp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        });
        const json = await resp.json();

        if (json.success && json.data && Array.isArray(json.data.data)) {
          allUnits = allUnits.concat(json.data.data);
          page++;
          lastPage = json.data.last_page || 1;
        } else {
          break;
        }
      } while (page <= lastPage);

      setUnitOptions(allUnits);
    } catch (err) {
      console.error('Failed to fetch units:', err);
      setUnitOptions([]);
    }
  }, [selectedYear]);

  useEffect(() => {
    handleFetchingUnits();
  }, []);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 1,
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <FilterList color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight="medium">
          Filters
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Clear all filters">
          <IconButton
            size="small"
            onClick={handleClearFilters}
            disabled={!filters.month && !filters.unit && !filters.scale}
          >
            <Clear />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Month"
            value={filters.month}
            onChange={(e) => onFilterChange('month', e.target.value)}
            variant="outlined"
          >
            {monthOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Unit"
            value={filters.unit}
            onChange={(e) => onFilterChange('unit', e.target.value)}
            variant="outlined"
          >
            {unitOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Scale"
            value={filters.scale}
            onChange={(e) => onFilterChange('scale', e.target.value)}
            variant="outlined"
          >
            {scaleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FilterBar;
