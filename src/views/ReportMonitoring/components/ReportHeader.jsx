import React, { useCallback, useEffect } from 'react';
import {
  Stack,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  useTheme,
  Grid,
} from '@mui/material';
import { IconSearch, IconRefresh, IconFilter } from '@tabler/icons-react';
import Backend from 'services/backend';
import { useSelector } from 'react-redux';
import GetToken from 'utils/auth-token';

const ReportHeader = ({
  title,
  search,
  onSearch,
  onSearchSubmit,
  onRefresh,
  loading,
  onPerPageChange,
  // New filter props
  filters = {},
  onFilterChange = () => {},
}) => {
  const theme = useTheme();
  const [unitOptions, setUnitOptions] = React.useState([]);
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );
  // const [loading, setLoading] = React.useState(false);
  // const [pagination, setPagination] = React.useState({
  //   page: 0,
  //   per_page: 10,
  //   total: 0,
  // });
  const [error, setError] = React.useState(false);

  // Filter options - you can pass these as props if they come from parent
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
            Accept: 'application/json',
          },
        });

        const json = await resp.json();

        console.log('Unit API Response:', json);

        const unitsArray = json.data?.data?.data;
        const paginationInfo = json.data?.data;

        if (Array.isArray(unitsArray)) {
          allUnits = [...allUnits, ...unitsArray];
          lastPage = paginationInfo?.last_page || 1;
          page++;
        } else {
          if (Array.isArray(paginationInfo?.data)) {
            allUnits = [...allUnits, ...paginationInfo.data];
            lastPage = paginationInfo?.last_page || 1;
            page++;
          } else {
            break;
          }
        }
      } while (page <= lastPage);

      setUnitOptions(allUnits);
    } catch (err) {
      console.error('Failed to fetch units:', err);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

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

  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" fontWeight={600}>
          {title}
        </Typography>

        {/* <IconButton
          onClick={onRefresh}
          disabled={loading}
          color="primary"
          title="Refresh and clear all filters"
        >
          <IconRefresh size={20} />
        </IconButton> */}
      </Stack>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        {/* Month Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Month</InputLabel>
            <Select
              value={filters.month || ''}
              label="Month"
              onChange={(e) => onFilterChange('month', e.target.value)}
              disabled={loading}
            >
              {monthOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Unit Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Unit</InputLabel>
            <Select
              value={filters.unit || ''}
              label="Unit"
              onChange={(e) => onFilterChange('unit', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>Select a unit</em>
              </MenuItem>
              {unitOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Scale Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Scale</InputLabel>
            <Select
              value={filters.scale || ''}
              label="Scale"
              onChange={(e) => onFilterChange('scale', e.target.value)}
              disabled={loading}
            >
              {scaleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Search Input */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            placeholder="Search reports..."
            value={search}
            onChange={onSearch}
            onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit()}
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1 },
            }}
            InputProps={{
              startAdornment: (
                <IconSearch
                  size={20}
                  style={{
                    marginRight: 8,
                    color: theme.palette.text.secondary,
                  }}
                />
              ),
            }}
            disabled={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportHeader;
