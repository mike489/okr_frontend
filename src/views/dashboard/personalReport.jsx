import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, TextField } from '@mui/material';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import TaskSummary from './components/TaskSummary';
import TaskStatus from './components/TaskStatus';
import TaskGraph from './components/TaskGraph';
import { WeeklyTasks } from './components/employee-dashboard/WeeklyTasks';

const PersonalReport = () => {
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);
  const [taskData, setTaskData] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [taskCount, setTaskCount] = useState({});

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // e.g., "2025-01-01"
  };

  const handleFetchingTaskCount = async (reload) => {
    try {
      if (reload) setLoading(true);
      const token = await GetToken();
      // Build query parameters
      const queryParams = new URLSearchParams({
        fiscal_year_id: selectedYear?.id || '',
        ...(fromDate && { from_date: formatDate(fromDate) }),
        ...(toDate && { to_date: formatDate(toDate) }),
      });
      const Api = `${Backend.api}${Backend.taskCounts}?${queryParams.toString()}`;
      const response = await fetch(Api, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setTaskCount(data.data || {});
        setError(false);
      } else {
        setError(true);
        // toast.error(data.message || 'Failed to fetch task counts');
      }
    } catch (err) {
      setError(true);
      // toast.error(err.message || 'Error fetching task counts');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchingTasks = async (reload) => {
    try {
      if (reload) setLoading(true);
      const token = await GetToken();
      // Build query parameters
      const queryParams = new URLSearchParams({
        fiscal_year_id: selectedYear?.id || '',
        ...(fromDate && { from: formatDate(fromDate) }),
        ...(toDate && { to: formatDate(toDate) }),
      });
      const Api = `${Backend.api}${Backend.tasks}?${queryParams.toString()}`;
      const response = await fetch(Api, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        const tasksList = data.data?.data || [];
        setTaskData(tasksList);
        setError(false);
      } else {
        setError(true);
        // toast.error(data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError(true);
      // toast.error(err.message || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when fiscal year or date range changes
  useEffect(() => {
    handleFetchingTaskCount(true);
    handleFetchingTasks(true);
  }, [selectedYear?.id, fromDate, toDate]);

  // Validate toDate is not before fromDate
  const handleToDateChange = (newToDate) => {
    if (fromDate && newToDate && newToDate < fromDate) {
      toast.error('To date cannot be before from date');
      return;
    }
    setToDate(newToDate);
  };

  return (
    <Grid
      container
      flexDirection="column"
      sx={{
        padding: { xs: 1, sm: 2, md: 3 },
        gap: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ width: { xs: '100%', sm: '170px' }, maxWidth: '100%' }}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(newDate) => setFromDate(newDate)}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{ width: '100%' }} />
              )}
            />
          </Box>
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ width: { xs: '100%', sm: '170px' }, maxWidth: '100%' }}>
            <DatePicker
              label="To Date"
              value={toDate}
              onChange={handleToDateChange}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{ width: '100%' }} />
              )}
            />
          </Box>
        </LocalizationProvider>
      </Box>

      {loading && <Typography></Typography>}
      {error && <Typography color="error">Error loading data</Typography>}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column',  md: 'row' },
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: { xs: 2, md: 4 },
        }}
      >
        <TaskSummary tasks={taskCount.tasks} subtasks={taskCount.subtasks} />
        <TaskStatus
          pending={taskCount.tasks?.pending_count}
          todo={taskCount.tasks?.todo_count}
          inProgress={taskCount.tasks?.inprogress_count}
          done={taskCount.tasks?.achieved_count}
          rejected={taskCount.tasks?.rejected_count}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 4 },
          width: '100%',
        }}
      >
        <Box sx={{ flex: { xs: '100%', md: 1 }, minWidth: 0 }}>
          <TaskGraph tasksData={taskData} />
        </Box>
        <Box sx={{ flex: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
          <WeeklyTasks tasks={taskData} />
        </Box>
      </Box>
    </Grid>
  );
};

export default PersonalReport;