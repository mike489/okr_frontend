import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TablePagination,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';


import { ToastContainer, toast } from 'react-toastify';

import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import hasPermission from 'utils/auth/hasPermission';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import PageContainer from 'ui-component/MainPage';
import Search from 'ui-component/search';
import Fallbacks from 'utils/components/Fallbacks';
import KeyResultForm from './components/KeyResultForm';
import KeyResultsTable from './components/KeyResultsTable';

const KeyResults = () => {
  const theme = useTheme();

  // -----------------------------
  // State
  // -----------------------------
  const [loading, setLoading] = useState(true);
  const [objectives, setObjectives] = useState([]);
  const [selectedObjective, setSelectedObjective] = useState(null);
console.log("Windows:", window.location.hostname)
// const tenant = window.location.hostname;
const tenant = localStorage.getItem('current_tenant');
console.log("Tenant:", tenant);

  const [keyResults, setKeyResults] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    last_page: 0,
    total: 0,
  });

  const [search, setSearch] = useState('');
  const [targetType, setTargetType] = useState('');
  const [progressMin, setProgressMin] = useState('');
  const [sortBy, setSortBy] = useState('confidence');
  const [sortDir, setSortDir] = useState('desc');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedKR, setSelectedKR] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  // -----------------------------
  // Fetch Objectives
  // -----------------------------
  const handleFetchObjectives = async () => {
    try {
      const token = await GetToken();
      const response = await fetch(Backend.pmsUrl(Backend.objectives), {
        headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setObjectives(data.data?.data ?? []);
        if (data.data?.length > 0) {
          setSelectedObjective(data.data[0].id);
        }
      } else {
        toast.error('Failed to load objectives');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // -----------------------------
  // Fetch Key Results
  // -----------------------------
  const handleFetchKeyResults = async () => {
    if (!selectedObjective) {
      setKeyResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await GetToken();

      const params = new URLSearchParams();
      params.append('objective_id', selectedObjective);
      if (search) params.append('search', search);
      if (targetType) params.append('target_type', targetType);
      if (progressMin) params.append('progress_min', progressMin);
      if (sortBy) params.append('sort_by', sortBy);
      if (sortDir) params.append('sort_dir', sortDir);
      params.append('page', pagination.page + 1);
      params.append('per_page', pagination.per_page);

     const response = await fetch(
  Backend.pmsUrl(Backend.keyResults) + '?' + params.toString(),
  {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
  }
);

      const data = await response.json();

      if (response.ok && data.success) {
        setKeyResults(data.data.data || []);
        setPagination(prev => ({
          ...prev,
          last_page: data.data.last_page || 1,
          total: data.data.total || 0,
        }));
      } else {
        toast.error(data?.message || 'Failed to load key results');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Effects
  // -----------------------------
  useEffect(() => {
    handleFetchObjectives();
  }, []);

  // Debounced search + filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 0 })); // reset to first page on search/filter
      handleFetchKeyResults();
    }, 600);

    return () => clearTimeout(timer);
  }, [search, selectedObjective, targetType, progressMin, sortBy, sortDir]);

  // Fetch when page or rows per page changes
  useEffect(() => {
    handleFetchKeyResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.per_page]);

  // -----------------------------
  // CRUD Handlers
  // -----------------------------
  const handleAddKeyResult = async (values) => {
    setActionLoading(true);
    try {
      const token = await GetToken();
    const response = await fetch(
  Backend.pmsUrl(Backend.keyResults),
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(values),
  }
);

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Key Result added successfully');
        setAddModal(false);
        handleFetchKeyResults();
      } else {
        toast.error(data.message || 'Failed to add key result');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditKeyResult = async (values) => {
    if (!selectedKR) return;

    setActionLoading(true);
    try {
      const token = await GetToken();
      const response = await fetch(
  Backend.pmsUrl(`${Backend.keyResults}/${selectedKR.id}`),
  {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(values),
  }
);

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Key Result updated');
        setEditModal(false);
        setSelectedKR(null);
        handleFetchKeyResults();
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteKeyResult = async (id) => {
    if (!window.confirm('Are you sure you want to delete this key result?')) return;

    try {
      const token = await GetToken();
      const response = await fetch(
  Backend.pmsUrl(`${Backend.keyResults}/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Key Result deleted');
        handleFetchKeyResults();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // -----------------------------
  // Default Form Values
  // -----------------------------
  const defaultFormValues = {
    objective_id: selectedObjective || '',
    name: '',
    metric_unit: '%',
    target_type: 'decrease_to',
    start_value: 0,
    current_value: 0,
    target_value: 0,
    weight: 0,
    confidence: 0,
    progress: 0,
    calc_method: 'manual',
  };

  return (
    <>
    <PageContainer
      maxWidth="lg"
      title="Key Results"
      searchField={
        <Search
          title="Search Key Results"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      }
      rightOption={
        hasPermission('create_key_result') && (
          <Button
            variant="contained"
            onClick={() => setAddModal(true)}
            sx={{ borderRadius: 1.5 }}
          >
            Add Key Result
          </Button>
        )
      }
    >
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <ActivityIndicator size={40} />
            </Box>
          ) : keyResults.length === 0 ? (
            <Fallbacks
              severity="info"
              title="No Key Results Found"
              description="Start by adding your first key result"
              sx={{ py: 8 }}
            />
          ) : (
            <>
              <KeyResultsTable
                keyResults={keyResults}
                onEdit={(kr) => {
                  setSelectedKR(kr);
                  setEditModal(true);
                }}
                onDelete={handleDeleteKeyResult}
              />

              <TablePagination
                component="div"
                count={pagination.total}
                page={pagination.page}
                rowsPerPage={pagination.per_page}
                rowsPerPageOptions={[10, 25, 50]}
                onPageChange={(_, newPage) =>
                  setPagination(prev => ({ ...prev, page: newPage }))
                }
                onRowsPerPageChange={(e) =>
                  setPagination(prev => ({
                    ...prev,
                    per_page: parseInt(e.target.value, 10),
                    page: 0,
                  }))
                }
              />
            </>
          )}
        </Grid>
      </Grid>

      {/* Add Modal */}
      <Dialog open={addModal} onClose={() => setAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Key Result</DialogTitle>
        <DialogContent dividers>
          <KeyResultForm
            initialValues={{ ...defaultFormValues, objective_id: selectedObjective }}
            objectives={objectives}
            onSubmit={handleAddKeyResult}
            loading={actionLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModal(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModal} onClose={() => {
        setEditModal(false);
        setSelectedKR(null);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Key Result</DialogTitle>
        <DialogContent dividers>
          {selectedKR && (
            <KeyResultForm
              initialValues={selectedKR}
              objectives={objectives}
              onSubmit={handleEditKeyResult}
              loading={actionLoading}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditModal(false);
            setSelectedKR(null);
          }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </PageContainer>
    </>
  );
};

export default KeyResults;