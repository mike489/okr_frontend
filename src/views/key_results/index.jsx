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
import { Add } from '@mui/icons-material';
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

  const [loading, setLoading] = useState(true);
  const [objectives, setObjectives] = useState([]);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [keyResults, setKeyResults] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    last_page: 0,
    total: 0,
  });
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedKR, setSelectedKR] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const tenant = localStorage.getItem('current_tenant');

  // Fetch Objectives
  const handleFetchObjectives = async () => {
    try {
      const token = await GetToken();
      const res = await fetch(Backend.pmsUrl(Backend.objectives), {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setObjectives(data.data?.data || []);
        if (data.data?.data[0]?.id) {
          setSelectedObjective(data.data.data[0].id);
        }
      } else toast.error('Failed to load objectives');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Fetch Key Results
  const handleFetchKeyResults = async () => {
    if (!selectedObjective) return setKeyResults([]);
    setLoading(true);
    try {
      const token = await GetToken();
      const params = new URLSearchParams({
        objective_id: selectedObjective,
        page: pagination.page + 1,
        per_page: pagination.per_page,
      });
      if (search) params.append('search', search);
      const res = await fetch(
        Backend.pmsUrl(Backend.keyResults) + '?' + params.toString(),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setKeyResults(data.data.data || []);
        setPagination((prev) => ({
          ...prev,
          last_page: data.data.last_page,
          total: data.data.total,
        }));
      } else toast.error(data.message || 'Failed to load key results');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Key Result Handler
  const handleAddKeyResult = async (values, { setSubmitting, resetForm }) => {
    setActionLoading(true);
    try {
      const token = await GetToken();
      const response = await fetch(Backend.pmsUrl(Backend.keyResults), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          ...values,
          tenant_id: tenant,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Key Result added successfully');
        setAddModal(false);
        handleFetchKeyResults(); // Refresh the list
        resetForm();
      } else {
        toast.error(data.message || 'Failed to add key result');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setActionLoading(false);
      setSubmitting(false);
    }
  };

  // Edit Key Result Handler
  const handleEditKeyResult = async (values, { setSubmitting }) => {
    if (!selectedKR?.id) return;

    setActionLoading(true);
    try {
      const token = await GetToken();
      const response = await fetch(
        Backend.pmsUrl(`${Backend.keyResults}/${selectedKR.id}`),
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify(values),
        },
      );

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Key Result updated successfully');
        setEditModal(false);
        setSelectedKR(null);
        handleFetchKeyResults(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to update key result');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setActionLoading(false);
      setSubmitting(false);
    }
  };

  // Delete Key Result Handler
  const handleDeleteKeyResult = async (id) => {
    if (!window.confirm('Are you sure you want to delete this key result?')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = await GetToken();
      const response = await fetch(
        Backend.pmsUrl(`${Backend.keyResults}/${id}`),
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Key Result deleted successfully');
        handleFetchKeyResults(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to delete key result');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    handleFetchObjectives();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 0 }));
      handleFetchKeyResults();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, selectedObjective, pagination.per_page]);

  useEffect(() => {
    if (selectedObjective) {
      handleFetchKeyResults();
    }
  }, [pagination.page, pagination.per_page, selectedObjective]);

  const defaultFormValues = {
    objective_id: selectedObjective || '',
    title: '',
    name: '',
    metric_unit: '%',
    target_type: 'decrease_to',
    start_value: 0,
    current_value: 0,
    target_value: 0,
    weight: 0,
  };

  return (
    <PageContainer
      maxWidth="lg"
      title="Key Results"
      searchField={
        <Search
          title="Search Key Results"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      }
      rightOption={
        hasPermission('create_key_result') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddModal(true)}
            sx={{ borderRadius: 2 }}
          >
            Add Key Result
          </Button>
        )
      }
    >
      <Grid container spacing={3} mt={1}>
        {/* Objective Selector */}
        <Grid item xs={12}>
          <Box mb={2}>
            <select
              value={selectedObjective || ''}
              onChange={(e) => setSelectedObjective(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: `1px solid ${theme.palette.divider}`,
                width: '100%',
                maxWidth: '300px',
              }}
            >
              <option value="">Select an Objective</option>
              {objectives.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.title || obj.name}
                </option>
              ))}
            </select>
          </Box>
        </Grid>

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
                  setPagination((prev) => ({ ...prev, page: newPage }))
                }
                onRowsPerPageChange={(e) =>
                  setPagination((prev) => ({
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
      <Dialog
        open={addModal}
        onClose={() => setAddModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Key Result</DialogTitle>
        <DialogContent dividers>
          <KeyResultForm
            initialValues={{
              ...defaultFormValues,
              objective_id: selectedObjective || '',
            }}
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
      <Dialog
        open={editModal}
        onClose={() => {
          setEditModal(false);
          setSelectedKR(null);
        }}
        maxWidth="sm"
        fullWidth
      >
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
          <Button
            onClick={() => {
              setEditModal(false);
              setSelectedKR(null);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </PageContainer>
  );
};

export default KeyResults;
