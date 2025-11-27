import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TablePagination,
} from '@mui/material';
import CreateReport from '../Report/components/CreateReport';
import { toast, ToastContainer } from 'react-toastify';
import { gridSpacing } from 'store/constant';
import UpdateReport from '../Report/components/UpdateReport';
import { useSelector } from 'react-redux';
import Backend from 'services/backend';
import PageContainer from 'ui-component/MainPage';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Fallbacks from 'utils/components/Fallbacks';
import DeletePrompt from 'ui-component/modal/DeletePrompt';
import GetToken from 'utils/auth-token';
import Search from 'ui-component/search';
import hasPermission from 'utils/auth/hasPermission';
import SplitButton from 'ui-component/buttons/SplitButton';
import ReportTable from './ReportTable';

const AddUnitOptions = ['Add Report', 'Import From Excel'];

const PlanReports = () => {
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(false);
  const [create, setCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [update, setUpdate] = useState(false);
  const [deleteReport, setDeleteReport] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState([]);
  const [activityType, setActivityType] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
  });

  const handleFetchingMyPlans = async () => {
    const token = await GetToken();
    const Api = Backend.api + Backend.getMyPlans;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setPlan(response?.data || []);
        }
      })
      .catch((error) => {
        toast.warning(error.message);
      });
  };

  const handleFetchingActivityType = async () => {
    const token = await GetToken();
    const Api = Backend.api + Backend.getActivityTypes;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setActivityType(response?.data || []);
        }
      })
      .catch((error) => {
        toast.warning(error.message);
      });
  };

  const handleReportAddition = async (formData) => {
    setIsCreating(true);
    const token = await GetToken();
    const Api = Backend.api + Backend.PlanReports;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
    };

    try {
      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: formData,
      }).then((res) => res.json());

      if (response.success) {
        toast.success(response.data.message);
        handleCreateModalClose();
        handleFetchingReport();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSearchFieldChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPagination({ ...pagination, page: 0 });
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, per_page: event.target.value, page: 0 });
  };

  const handleCreatePlan = () => {
    setCreate(true);
  };

  const handleCreateModalClose = () => {
    setCreate(false);
  };

  const handleUpdateModalClose = () => {
    setUpdate(false);
    setSelectedPlan(null);
  };

  const handleChangeReportStatus = async (reportId, status, remarks) => {
    setIsCreating(true);
    try {
      const token = await GetToken();
      
      // Debug: Log input values
      console.log('Report ID:', reportId);
      console.log('Status:', status);
      console.log('Remarks:', remarks);

      // Use a corrected endpoint (replace with the actual endpoint from your backend)
      // Example: Assuming the correct endpoint is /api/reports/{reportId}/status
      const endpoint = `${Backend.changeReportStatus}${reportId}`; // Update this based on backend API
      const fullUrl = `${Backend.api}${endpoint}`;
      
      console.log('Request URL:', fullUrl);
      console.log('Request Payload:', JSON.stringify({ status, remarks }));

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, remarks }),
      });

      const data = await response.json();

      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Failed to update status: ${response.status}`);
      }

      toast.success(data.message || 'Status updated successfully');
      handleFetchingReport();
    } catch (error) {
      console.error('Status change error:', error);
      toast.error(error.message || 'Error updating status');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (selectedPlan) => {
    setDeleting(true);
    try {
      const token = await GetToken();
      const Api = Backend.api + Backend.PlanReports + `/${selectedPlan?.id}`;
      fetch(Api, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.success) {
            setDeleteReport(false);
            toast.success(response.data.message);
            handleFetchingReport();
          } else {
            toast.info(response.data.message);
          }
        });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handlePlanAdd = (index) => {
    if (index === 0) {
      handleCreatePlan();
    } else {
      alert('We will implement importing from odoo');
    }
  };

  const handleFetchingReport = async () => {
    setLoading(true);
    const token = await GetToken();
    const Api = Backend.api + Backend.myTeamsPlansReports + `?page=${pagination.page + 1}&per_page=${pagination.per_page}`;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success && response.data) {
          setData(response?.data?.data);
          handleFetchingMyPlans();
          handleFetchingActivityType();
          setPagination({ ...pagination, total: response.data?.total });
          setError(false);
        } else {
          toast.warning(response.data.message);
          setError(false);
        }
      })
      .catch((error) => {
        toast.warning(error.message);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEditingReport = async (values) => {
    setIsCreating(true);
    try {
      const token = await GetToken();
      const Api = Backend.api + Backend.PlanReports + `/${selectedPlan.id}`;
      const response = await fetch(Api, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: values.description,
          plan_id: values.plan_id,
        }),
      }).then(res => res.json());

      if (response.success) {
        toast.success(response.data.message);
        handleUpdateModalClose();
        handleFetchingReport();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditReport = (report) => {
    setSelectedPlan(report);
    setUpdate(true);
  };

  useEffect(() => {
    if (mounted) {
      handleFetchingReport();
    } else {
      setMounted(true);
    }
  }, [pagination.page, pagination.per_page]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleFetchingReport();
    }, 600);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [search]);

  return (
    <PageContainer
      title={'My Teams Reports'}
      searchField={
        <Search
          value={search}
          onChange={(event) => handleSearchFieldChange(event)}
        />
      }
      actions={
        hasPermission('create:plan') && (
          <SplitButton
            options={AddUnitOptions}
            onClick={handlePlanAdd}
            sx={{ marginLeft: 2 }}
          />
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
        <Fallbacks title="Data not found" description="Unable to find the My Reports" />
      ) : data?.length === 0 ? (
        <Fallbacks
          severity="My Reports"
          title="My Reports is not found"
          description="The list of added plan will be listed here"
          sx={{ paddingTop: 6 }}
        />
      ) : (
        <Grid container spacing={gridSpacing} sx={{ marginTop: 2, paddingBottom: 4 }}>
          <Grid item xs={12}>
            <ReportTable 
              reports={data} 
              onStatusChange={handleChangeReportStatus}
              onDelete={(report) => {
                setSelectedPlan(report);
                setDeleteReport(true);
              }}
              onEdit={handleEditReport}
            />
          </Grid>
        </Grid>
      )}

      {pagination.total > pagination.per_page && (
        <TablePagination
          component="div"
          rowsPerPageOptions={[10, 25, 50, 100]}
          count={pagination.total}
          rowsPerPage={pagination.per_page}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Plans per page"
        />
      )}

      <CreateReport
        create={create}
        isCreating={isCreating}
        plans={plan}
        activityTypes={activityType}
        onClose={handleCreateModalClose}
        handleSubmission={handleReportAddition}
      />

      <UpdateReport
        open={update}
        isUpdating={isCreating}
        plan={plan}
        reportData={selectedPlan}
        onClose={handleUpdateModalClose}
        handleUpdate={handleEditingReport}
      />

      <DeletePrompt
        type="Delete"
        open={deleteReport}
        title="Deleting Reports"
        description={`Are you sure you want to delete ${selectedPlan?.plan?.main_activity?.title || 'this report'}`}
        onNo={() => setDeleteReport(false)}
        onYes={() => handleDelete(selectedPlan)}
        deleting={deleting}
        handleClose={() => setDeleteReport(false)}
      />

      <ToastContainer />
    </PageContainer>
  );
};

export default PlanReports;