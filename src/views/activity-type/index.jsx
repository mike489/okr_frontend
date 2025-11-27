import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TablePagination,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';

import { gridSpacing } from 'store/constant';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import hasPermission from 'utils/auth/hasPermission';

import PageContainer from 'ui-component/MainPage';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Fallbacks from 'utils/components/Fallbacks';
import Search from 'ui-component/search';
import SplitButton from 'ui-component/buttons/SplitButton';
import ActivityTypeTable from './components/ActivityTypeTable';
import CreateActivityTypeForm from './components/CreateActivityTypeForm';
import UpdateActivityTypeForm from './components/UpdateActivityTypeForm';

const ActivityTypePage = () => {
  const [data, setData] = useState([]);
  console.log('ActivityTypePage rendered', data);
  const [pagination, setPagination] = useState({ page: 0, per_page: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [deleteActivity, setDeleteActivity] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    handleFetchingActivity();
  }, [pagination.page, pagination.per_page]);

  const handleSearchFieldChange = (e) => {
    setSearch(e.target.value);
    // Optionally add search fetch logic here
  };

  const handleChangePage = (_, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination((prev) => ({
      ...prev,
      per_page: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  const handleFetchingActivity = async () => {
    setLoading(true);
    try {
      const token = await GetToken();
      const Api = `${Backend.api}${Backend.getActivityType}?page=${pagination.page + 1}&per_page=${pagination.per_page}`;
      const response = await fetch(Api, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        }
      }).then((res) => res.json());

      if (response.success && response.data) {
        setData(response.data.data || []);
        setPagination((prev) => ({ ...prev, total: response.data.total }));
        setError(false);
      } else {
        toast.warning(response.message || 'Failed to fetch data');
        setError(true);
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching data');
      setError(true);
    } finally {
      setLoading(false);
    }
  };


  const handleAddition = async (formData) => {
    setIsCreating(true);
      
    try {
      const token = await GetToken();
      const Api = `${Backend.api}${Backend.activityType}`;
      const response = await fetch(Api, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
        body: formData
      }).then((res) => res.json());

      if (response.success) {
        toast.success(response.message || 'Created successfully');
        handleFetchingActivity();
      } else {
        toast.error(response.message || 'Creation failed');
      }
    } catch (error) {
      toast.error(error.message || 'Error during creation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdating = async (values) => {
    setIsCreating(true);
    try {
      const token = await GetToken();
      const Api = `${Backend.api}${Backend.activityType}/${selectedActivity?.id}`;
      const response = await fetch(Api, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      }).then((res) => res.json());

      if (response.success) {
        toast.success(response.message || 'Updated successfully');
        handleFetchingActivity();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.message || 'Error updating');
    } finally {
      setIsCreating(false);
    }
  };

  const handleActivityAdd = () => {
   
      setCreateOpen(true);  // Open create modal here
    
  };

  return (
    <PageContainer
      title={'Activity Types'}
      searchField={
        <Search
          value={search}
          onChange={handleSearchFieldChange}
        />
      }
      rightOption={
        hasPermission('create:activitytype') && (
          <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
            <SplitButton
              options={['Add Activity Type', 'Import From Excel']}
              handleSelection={handleActivityAdd} // Fixed here
            />
          </Box>
        )
      }
    >
      {loading ? (
        <Grid container>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
            <ActivityIndicator size={20} />
          </Grid>
        </Grid>
      ) : error ? (
        <Fallbacks title="Error loading data" description="Something went wrong while fetching activity types." />
      ) : data?.length === 0 ? (
        <Fallbacks
          title="No Activity Types Found"
          description="You haven't added any activity types yet."
          sx={{ paddingTop: 6 }}
        />
      ) : (
        <Grid container spacing={gridSpacing} sx={{ mt: 2, pb: 4 }}>
          <Grid item xs={12}>
            <ActivityTypeTable
              response={data} // Pass the array directly here
              onDelete={(item) => {
                setSelectedActivity(item);
                setDeleteActivity(true);
              }}
              onEdit={(item) => {
                setSelectedActivity(item);
                setUpdateOpen(true);  // Open update modal on edit click
              }}
            />
          </Grid>
        </Grid>
      )}

      {pagination.total > pagination.per_page && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.per_page}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Items per page"
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}

      {/* Create Modal */}
      <CreateActivityTypeForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(values) => {
          handleAddition(values);
          setCreateOpen(false);
        }}
      />

      {/* Update Modal */}
      <UpdateActivityTypeForm
        open={updateOpen}
        initialData={selectedActivity}
        onClose={() => setUpdateOpen(false)}
        onSubmit={(values) => {
          handleUpdating(values);
          setUpdateOpen(false);
        }}
      />

      <ToastContainer />
    </PageContainer>
  );
};

export default ActivityTypePage;
