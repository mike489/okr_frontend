import { useEffect, useState } from 'react';
import { Box, Grid, TablePagination, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import ErrorPrompt from 'utils/components/ErrorPrompt';
import Fallbacks from 'utils/components/Fallbacks';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import PageContainer from 'ui-component/MainPage';
import TeamMemberTasks from './components/TeamMemberTasks';
import TaskDetailModal from './components/TaskDetailModal';
import CreateTask from './components/CreateTask';
import { IconPlus } from '@tabler/icons-react';
import DrogaButton from 'ui-component/buttons/DrogaButton';
import PropTypes from 'prop-types';

const ViewTeamMemberTasks = ({ hideCreate }) => {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);
  const dispatch = useDispatch();

  // Get user ID from location state with fallback
  const userId = locationState?.id;
  const userName = locationState?.name || 'Team Member';
 const [users, setUsers] = useState([]);
  // State management
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]); // Renamed from 'data' to be more descriptive
  const [error, setError] = useState(false);
  const [unitPLan, setUnitPlan] = useState([]);
  
  // Modal states
  const [taskDetail, setTaskDetail] = useState({
    openModal: false,
    selected: null,
  });
  
  const [createModal, setCreateModal] = useState({
    open: false,
    submitting: false
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
  });

  // Handle missing user ID
  useEffect(() => {
    if (!userId) {
      toast.error('No user selected. Redirecting...');
      navigate('/team-members'); // Redirect if no user ID
    }
  }, [userId, navigate]);

  // Fetch user tasks
  const handleGettingUserTasks = async (dontReload) => {
    if (!userId) return;

    !dontReload && setLoading(true);
    const token = await GetToken();

    let Api = `${Backend.api}${Backend.getUserTasks}/${userId}?fiscal_year_id=${selectedYear?.id}&page=${pagination.page + 1}&per_page=${pagination.per_page}`;

    if (locationState?.from) {
      Api += `&from=${encodeURIComponent(locationState.from)}`;
    }
    if (locationState?.to) {
      Api += `&to=${encodeURIComponent(locationState.to)}`;
    }

    try {
      const response = await fetch(Api, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (result.success) {
        setTasks(result.data.data);
        setPagination({ ...pagination, total: result.data.total });
        setError(false);
      } else {
        toast.warning(result.data?.message || 'Failed to fetch tasks');
        setError(true);
      }
    } catch (error) {
      toast.error(error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
const handleFetchingUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = await GetToken();
      const Api = `${Backend.auth}${Backend.users}?page=${pagination.page + 1}&per_page=${pagination.per_page}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const response = await fetch(Api, { method: 'GET', headers: header });
      const result = await response.json();
      console.log('Users API response:', result); 
      if (result.success) {
        setUsers(result.data?.data || []);
        setPagination({
          ...pagination,
          last_page: result.data.last_page,
          total: result.data.total,
        });
      } else {
        toast.warning(result.data?.message || 'Failed to fetch users');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  // Fetch my plans
  const handleGettingUnitPlan = async () => {
    try {
      const token = await GetToken();
      const response = await fetch(Backend.api + Backend.unitMainActivities + `/${locationState.unit_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (result.success) {
        setUnitPlan(result.data || []);
      } else {
        toast.warning(result.data?.message || 'Failed to fetch plans');
      }
    } catch (error) {
      toast.warning(error.message);
    }
  };

  // Task approval handler
  const handleTaskApproval = async (newStatus, task) => {
    const token = await GetToken();
    try {
      const response = await fetch(Backend.api + Backend.approveTask + task?.id, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result?.data?.message);
        handleGettingUserTasks(true);
      } else {
        toast.error(result?.data?.message);
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  // Task creation handler
  const handleTaskCreation = async (values) => {
    setCreateModal(prev => ({ ...prev, submitting: true }));
    try {
      const token = await GetToken('token');
      const response = await fetch(Backend.api + Backend.tasks, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          main_activity_id: values.main_activity_id,
          title: values.title,
          description: values.description,
          deadline: values.deadline,
          start_date:values.start_date,
          user_id: userId, // Use the userId from props
        }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.data?.message || 'Task created successfully!');
        handleGettingUserTasks();
        setCreateModal(prev => ({ ...prev, open: false }));
      } else {
        // toast.error(result.data?.message || 'Task creation failed');
        console.error('Task creation failed:', result.data?.message || 'Unknown error');
      }
    } catch (error) {
      // toast.error(error.message);
      console.error('Error creating task:', error);
    } finally {
      setCreateModal(prev => ({ ...prev, submitting: false }));
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({
      ...prev,
      per_page: parseInt(event.target.value, 10),
      page: 0,
    }));
  };

  // View task detail handler
  const handleViewingDetail = (task) => {
    setTaskDetail({
      openModal: true,
      selected: task,
    });
  };

  // Initial data fetch
  useEffect(() => {
    handleFetchingUsers()
    if (userId) {
      handleGettingUserTasks();

    }
  }, [userId, selectedYear?.id, pagination.page, pagination.per_page]);

  // Handle taskId from location state
  useEffect(() => {
    if (tasks.length > 0 && locationState?.taskId) {
      const task = tasks.find((t) => t.id === locationState.taskId);
      if (task) {
        setTaskDetail({ openModal: true, selected: task });
      }
    }
  }, [tasks, locationState?.taskId]);

  if (!userId) {
    return (
      <Fallbacks
        severity="error"
        title="No user selected"
        description="Please select a user from the team members page"
        sx={{ paddingTop: 6 }}
      />
    );
  }

  return (
    <PageContainer
      back={true}
      title={`${userName}'s Tasks`}
      rightOption={
        <Box sx={{ mr: 4, display: 'flex', flexDirection: 'column' }}>
          
          {locationState?.from && locationState?.to && (
            <Grid
              item
              xs={12}
              sx={{
                mb: 3,
                flexDirection: 'row',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                Selected Date Range:
                <span style={{ color: 'skyblue' }}>
                  {locationState.from} - {locationState.to}
                </span>
              </Typography>
            </Grid>
          )}
          {!hideCreate && (
            <DrogaButton
              title="Create Task"
              variant="contained"
              icon={<IconPlus size="1.2rem" stroke="1.2" style={{ marginRight: 4 }} />}
              sx={{ boxShadow: 0 }}
              onPress={() => {
                handleGettingUnitPlan();
                setCreateModal(prev => ({ ...prev, open: true }));
              }}
            />
          )}
        </Box>
      }
    >
      <Grid container>
        <Grid item xs={12} sx={{ padding: 2 }}>
          {loading ? (
            <Grid container justifyContent="center" alignItems="center" padding={4}>
              <ActivityIndicator size={20} />
            </Grid>
          ) : error ? (
            <Fallbacks
              severity="error"
              title="Failed to load tasks"
              description="Please try again later"
              sx={{ paddingTop: 6 }}
            />
          ) : tasks.length === 0 ? (
            <Fallbacks
              severity="info"
              title="No tasks found"
              description={`${userName} has no tasks assigned yet`}
              sx={{ paddingTop: 6 }}
            />
          ) : (
            <>
              <TeamMemberTasks
                tasks={tasks}
                onViewDetail={handleViewingDetail}
                onActionTaken={handleTaskApproval}
              />
              <TablePagination
                component="div"
                rowsPerPageOptions={[10, 25, 50, 100]}
                count={pagination.total}
                rowsPerPage={pagination.per_page}
                page={pagination.page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Tasks per page"
              />
            </>
          )}
        </Grid>
      </Grid>

      {/* Create Task Modal */}
      <CreateTask
        open={createModal.open}
        handleCloseModal={() => setCreateModal(prev => ({ ...prev, open: false }))}
        myMainActivities={unitPLan}
        userId={userId}
        handleTaskSubmission={handleTaskCreation}
        submitting={createModal.submitting}
      />

      {/* Task Detail Modal */}
      {taskDetail.selected && (
        <TaskDetailModal
          open={taskDetail.openModal}
          task={taskDetail.selected}
          title="Task Details"
          handleClose={() => setTaskDetail({ openModal: false, selected: null })}
          onCancel={() => setTaskDetail({ openModal: false, selected: null })}
        />
      )}

      <ToastContainer />
    </PageContainer>
  );
};

ViewTeamMemberTasks.propTypes = {
  hideCreate: PropTypes.bool,
};

export default ViewTeamMemberTasks;