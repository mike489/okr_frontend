import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useSelector } from 'react-redux';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';

const ROWS_PER_PAGE = 10;

const DepartmentsTable = () => {
  const [page, setPage] = useState(1);
  const [rawData, setRawData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedScale, setSelectedScale] = useState('');

  const [unitOptions, setUnitOptions] = useState([]);

  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);

  const months = [
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

  const scaleOptions = [
    { value: '', label: 'All Scales' },
    { value: 'low', label: '0 - 50%' },
    { value: 'medium', label: '51 - 75%' },
    { value: 'high', label: '76 - 100%' },
  ];

  // Fetch units from backend
const fetchUnits = useCallback(async () => {
  try {
    const token = await GetToken();
    let allUnits = [];
    let page = 1;
    let lastPage = 1;

    do {
      let url = `${Backend.api}${Backend.units}?page=${page}`;
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


  const fetchPage = useCallback(
  async (apiPage) => {
    try {
      setLoading(true);
      setError(false);
      const token = await GetToken();

      const params = new URLSearchParams();
      if (selectedYear?.id) params.append('fiscal_year_id', selectedYear.id);
      if (selectedMonth) params.append('month', selectedMonth); 
      if (selectedUnit) params.append('unit_id', selectedUnit); 
      if (selectedScale) params.append('scale', selectedScale);
      params.append('page', apiPage);
      params.append('per_page', ROWS_PER_PAGE);

      const url = `${Backend.api}${Backend.getPlanReports}?${params.toString()}`;

      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const json = await resp.json();

      if (json.success && json.data) {
        const { data, total, current_page } = json.data;
        setRawData(Array.isArray(data) ? data : []);
        setTotalItems(total || 0);
        setPage(current_page || 1);
      } else {
        setRawData([]);
        setError(true);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setRawData([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  },
  [selectedYear, selectedMonth, selectedUnit, selectedScale]
);

  useEffect(() => {
    if (selectedYear?.id) {
      fetchUnits();
      fetchPage(1);
    }
  }, [selectedYear, selectedMonth, selectedUnit, selectedScale, fetchPage, fetchUnits]);

  const handlePageChange = (_, value) => fetchPage(value);

  const dataWithSN = rawData.map((item, idx) => ({
    ...item,
    sn: idx + 1 + (page - 1) * ROWS_PER_PAGE,
  }));

  const totalPages = Math.ceil(totalItems / ROWS_PER_PAGE) || 1;

  return (
    <Paper sx={{ px: 4, py: 2, width: '100%', margin: 'auto' }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="month-select-label">Month</InputLabel>
          <Select
            labelId="month-select-label"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <MenuItem value="">All Months</MenuItem>
            {months.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="unit-select-label">Unit</InputLabel>
         <Select
  labelId="unit-select-label"
  value={selectedUnit}
  onChange={(e) => setSelectedUnit(e.target.value)}
>
  <MenuItem value="">All Units</MenuItem>
  {unitOptions.map((u) => (
    <MenuItem key={u.id} value={u.id}>
      {u.name}
    </MenuItem>
  ))}
</Select>

        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="scale-select-label">Scale</InputLabel>
          <Select
            labelId="scale-select-label"
            value={selectedScale}
            onChange={(e) => setSelectedScale(e.target.value)}
          >
            {scaleOptions.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load plan reports. Please try again.
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '6%' }}>SN</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Activity</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '12%' }}>
                {selectedYear?.name || 'Performance (%)'}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {dataWithSN.length === 0 && !loading && !error ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No activities found
                </TableCell>
              </TableRow>
            ) : (
              dataWithSN.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.sn}</TableCell>
                  <TableCell>{row.unit || ''}</TableCell>
                  <TableCell>{row.type || ''}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: row.percentage_completed?.color || '#c00000',
                      color: '#000',
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    {row.percentage_completed?.percentage != null
                      ? `${Math.round(row.percentage_completed.percentage)}%`
                      : ''}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
          disabled={loading}
        />
      </Box>
    </Paper>
  );
};

export default DepartmentsTable;
