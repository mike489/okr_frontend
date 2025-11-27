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
import ReportTable from '../Report/components/ReportTable';
import ReportForm from '../Report/components/CreateDiskReports';

const AddUnitOptions = ['Add Report', 'Import From Excel'];

const PlanReports = () => {
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(false);
  const [create, setCreate] = useState(false); // For CreateReport
  const [createDiskReport, setCreateDiskReport] = useState(false); // For ReportForm
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [update, setUpdate] = useState(false);
  const [deleteReport, setDeleteReport] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState([]);
  console.log('tasks:', tasks);
  const [activityType, setActivityType] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
  });

 const handleFetchingTasks = async () => {
  try {
    const token = await GetToken();
    const response = await fetch(Backend.api + Backend.getAllTasks, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      setTasks(data?.data );
    } else {
      throw new Error(data.message || 'Failed to fetch tasks');
    }
  } catch (error) {
    toast.error(`Failed to load tasks: ${error.message}`);
    setTasks([]); // Ensure tasks is always an array
  }
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
    console.log('handleReportAddition called with formData:', formData);
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

  const handleDiskReportAddition = async (values) => {
    setIsCreating(true);
    try {
      const token = await GetToken();
      const Api = Backend.api + Backend.reporting;
      const response = await fetch(Api, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      }).then((res) => res.json());

      if (response.success) {
        toast.success(response.message || 'Disk Report created successfully');
        handleCreateDiskModalClose();
        handleFetchingReport();
      } else {
        toast.error(response.message || 'Failed to create disk report');
      }
    } catch (error) {
      toast.error(error.message || 'Error creating disk report');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDiskReport = async (values) => {
    setIsCreating(true);
    try {
      const token = await GetToken();
      const Api = Backend.api + Backend.reporting + `/${selectedPlan?.id}`;
      const response = await fetch(Api, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      }).then((res) => res.json());

      if (response.success) {
        toast.success(response.message || 'Disk Report updated successfully');
        handleUpdateModalClose();
        handleFetchingReport();
      } else {
        toast.error(response.message || 'Failed to update disk report');
      }
    } catch (error) {
      toast.error(error.message || 'Error updating disk report');
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
    setPagination({ ...pagination, per_page: parseInt(event.target.value, 10), page: 0 });
  };

  const handleCreateDiskReport = () => {
    console.log('Opening ReportForm modal');
    setCreateDiskReport(true);
  };

  const handleCreateModalClose = () => {
    console.log('Closing CreateReport modal');
    setCreate(false);
  };

  const handleCreateDiskModalClose = () => {
    console.log('Closing ReportForm modal');
    setCreateDiskReport(false);
  };

  const handleUpdateModalClose = () => {
    console.log('Closing update modal');
    setUpdate(false);
    setSelectedPlan(null);
  };

  const handleChangeReportStatus = async (reportId, status, remarks) => {
    setIsCreating(true);
    try {
      const token = await GetToken();
      const endpoint = `${Backend.changeReportStatus}${reportId}`;
      const fullUrl = `${Backend.api}${endpoint}`;
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, remarks }),
      });

      const data = await response.json();

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
      const response = await fetch(Api, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json());

      if (response.success) {
        setDeleteReport(false);
        toast.success(response.data.message);
        handleFetchingReport();
      } else {
        toast.info(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handlePlanAdd = (index) => {
    console.log('handlePlanAdd called with index:', index);
    if (index === 0) {
      console.log('Setting create to true');
      setCreate(true);
    } else {
      alert('We will implement importing from Odoo');
    }
  };

  const handleReportAdd = (index) => {
    console.log('handleReportAdd called with index:', index);
    if (index === 0) {
      handleCreateDiskReport();
    } else {
      alert('We will implement importing from Odoo');
    }
  };

  const handleFetchingReport = async () => {
    setLoading(true);
    const token = await GetToken();
    const Api = Backend.api + Backend.PlanReports + `?page=${pagination.page + 1}&per_page=${pagination.per_page}`;
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
          handleFetchingTasks();
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
      const Api = Backend.api + Backend.PlanReports + `/${selectedPlan?.id}`;
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
      }).then((res) => res.json());

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
    setSelectedPlan({
      id: report.id,
      executive_summary: report.executive_summary || '',
      introduction: report.introduction || '',
      performance_indicators: report.performance_indicators || '',
      monthly_actions: report.monthly_actions || '',
      budget_utilization: report.budget_utilization || '',
      challenges: report.challenges || '',
      corrective_actions: report.corrective_actions || '',
      next_steps: report.next_steps || '',
      conclusion: report.conclusion || '',
      description: report.description || '',
      plan_id: report.plan_id || '',
    });
    setUpdate(true);
  };

  useEffect(() => {
    if (mounted) {
      handleFetchingReport();
    } else {
      setMounted(true);
    }
  }, [pagination.page, pagination.per_page, mounted]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleFetchingReport();
    }, 600);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [search]);

  useEffect(() => {
    console.log('create state:', create);
    console.log('createDiskReport state:', createDiskReport);
    console.log('update state:', update);
  }, [create, createDiskReport, update]);

  return (
    <PageContainer
      title={'Plan Reports'}
      searchField={
        <Search
          value={search}
          onChange={(event) => handleSearchFieldChange(event)}
        />
      }
      rightOption={
        hasPermission('create:planreport') && (
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap={2}
          >
            {/* <SplitButton
              options={['Disk Report', 'Import From Excel']}
              handleSelection={(value) => handleReportAdd(value)}
            /> */}
            <SplitButton
              options={AddUnitOptions}
              handleSelection={(value) => handlePlanAdd(value)}
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
        tasks={tasks}
        activityTypes={activityType}
        onClose={handleCreateModalClose}
        handleSubmission={handleReportAddition}
      />

      <ReportForm
        open={createDiskReport || update}
        isSubmitting={isCreating}
        onClose={createDiskReport ? handleCreateDiskModalClose : handleUpdateModalClose}
        onSubmit={createDiskReport ? handleDiskReportAddition : handleDiskReport}
        initialValues={update ? selectedPlan : null}
        isUpdate={update}
      />

      <UpdateReport
        open={update}
        isUpdating={isCreating}
        tasks={tasks}
        reportData={selectedPlan}
        onClose={handleUpdateModalClose}
        handleUpdate={handleEditingReport}
      />

      <DeletePrompt
        type="Delete"
        open={deleteReport}
        title="Deleting Reports"
        description={`Are you sure you want to delete ${selectedPlan?.tasks?.title || 'this report'}`}
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