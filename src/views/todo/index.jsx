import { useEffect, useState } from 'react';
import { Icon3dCubeSphere, IconPlus } from '@tabler/icons-react';
import { toast, ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import PageContainer from 'ui-component/MainPage';
import DrogaButton from 'ui-component/buttons/DrogaButton';
import Backend from 'services/backend';
import CreateTask from './components/CreateTask';
import GetToken from 'utils/auth-token';
import PropTypes from 'prop-types';
import TaskTabs from './components/TaskTabs';
import AddSubTask from './components/AddSubTask';
import EditTask from './components/EditTask';
import TaskDetailModal from './components/TaskDetailModal';
import FilterTasks from './components/FilterTasks';
import { Box } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

const Todo = ({ hideCreate }) => {
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  const [myPlan, setMyPlan] = useState([]);
  const [data, setData] = useState([]);
  const [task, setTask] = useState({
    loading: true,
    taskList: [],
    openModal: false,
    openEdit: false,
    selected: null,
    submitting: false,
    date: '',
    picker: false,
    changing: false,
    search: '',
    deleting: false,
  });

  const [taskDetail, setTaskDetail] = useState({
    openModal: false,
    selected: null,
  });

  const [subTask, setSubTask] = useState({
    loading: true,
    selectedTask: {},
    dateSelected: '',
    openModal: false,
    submitting: false,
    changing: false,
  });

  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    last_page: 0,
    total: 0,
  });

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState('');

  // Filter-related states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [MyPlanSelected, setMyPlanSelected] = useState('');

  const handlePlanSelection = (event) => {
    setMyPlanSelected(event.target.value);
  };

  const handleStatusChange = async (task, option) => {
    setTask((prevTask) => ({ ...prevTask, changing: true }));
    try {
      const token = await GetToken('token');
      const Api = `${Backend.api}${Backend.changeTaskStatus}/${task.id}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const data = { status: option?.value };

      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        handleFetchingTask();
      } else {
        toast.error(result.data?.message || 'Failed to change status');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTask((prevTask) => ({ ...prevTask, changing: false }));
    }
  };

  const handleGettingMyPlan = async () => {
    try {
      const token = await GetToken();
      // Use myPlans endpoint and include fiscal_year_id when available
      const queryParams = new URLSearchParams();
      if (selectedYear?.id)
        queryParams.append('fiscal_year_id', selectedYear.id);
      const Api = `${Backend.api}${Backend.myPlans}?${queryParams.toString()}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'GET', headers: header });
      const result = await response.json();

      if (result.success) {
        // Ensure options have id and title fields expected by UI
        const plans = Array.isArray(result.data)
          ? result.data.map((it) => ({
              id: it?.id,
              title: it?.title || it?.name || it?.kpi?.name || `Plan ${it?.id}`,
              ...it,
            }))
          : [];
        setMyPlan(plans);
      } else {
        toast.warning(result.data?.message || 'Failed to fetch plans');
      }
    } catch (error) {
      toast.warning(error.message);
    }
  };

  const handleSettingUpEdit = async (task) => {
    setTask((prevTask) => ({ ...prevTask, selected: task }));
  };

  const handleTaskAction = async (action, task) => {
    if (action === 'remove') {
      handleDeleteTask(task?.id);
    } else {
      await handleSettingUpEdit(task);
      handleOpenEditModal();
    }
  };

  const handleOpenCreateModal = async () => {
    await Promise.all([handleGettingMyPlan(), handleFetchingUsers()]);
    setTask((prevTask) => ({ ...prevTask, openModal: true }));
  };

  const handleCloseCreateModal = () => {
    setTask((prevTask) => ({ ...prevTask, openModal: false }));
  };

  const handleOpenEditModal = async () => {
    await handleGettingMyPlan();
    setTask((prevTask) => ({ ...prevTask, openEdit: true }));
  };

  const handleCloseEditModal = () => {
    setTask((prevTask) => ({ ...prevTask, openEdit: false }));
  };

  const handleTaskCreation = async (value) => {
    setTask((prevTask) => ({ ...prevTask, submitting: true }));
    try {
      const token = await GetToken('token');
      const Api = Backend.api + Backend.createTask;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const data = {
        main_activity_id: value?.main_activity_id,
        title: value?.title,
        description: value?.description,
        deadline: value?.deadline,
        start_date: value?.start_date,
      };

      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      });

      // Try to read response JSON (even for non-2xx)
      let result = null;
      try {
        result = await response.json();
      } catch (_) {
        result = null;
      }

      if (!response.ok) {
        // Prefer server-provided message if available
        const serverMsg = result?.data?.message || result?.message;
        if (response.status === 401) {
          toast.error(serverMsg || 'Unauthorized: Please log in again');
        } else {
          toast.error(serverMsg || `Request failed (${response.status})`);
        }
        return; // keep modal open for correction
      }

      if (result?.success) {
        toast.success(result?.data?.message || 'Task created!');
        handleFetchingTask();
      } else {
        toast.error(result?.data?.message || 'Task creation failed');
      }
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setTask((prevTask) => ({
        ...prevTask,
        submitting: false,
        // Do not auto-close on error; close happens on successful refresh
      }));
    }
  };

  const handleTaskEdition = async (value) => {
    setTask((prevTask) => ({ ...prevTask, submitting: true }));
    try {
      const token = await GetToken('token');
      const Api = `${Backend.api}${Backend.tasks}/${task?.selected?.id}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const data = {
        plan_id: value?.plan_id,
        title: value?.title,
        description: value?.description,
      };

      const response = await fetch(Api, {
        method: 'PATCH',
        headers: header,
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.data?.message || 'Task updated!');
        handleFetchingTask();
        handleCloseEditModal();
      } else {
        console.error('Task update failed:', result.data?.message);
        // toast.error(result.data?.message || 'Task update failed');
      }
    } catch (error) {
      // toast.error(error.message);
      console.error('Error updating task:', error);
    } finally {
      setTask((prevTask) => ({ ...prevTask, submitting: false }));
    }
  };

  const handleDeleteTask = async (id) => {
    setTask((prevTask) => ({ ...prevTask, deleting: true }));
    try {
      const token = await GetToken('token');
      const Api = `${Backend.api}${Backend.tasks}/${id}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'DELETE', headers });
      const result = await response.json();

      if (result.success) {
        toast.success(result.data?.message || 'Task deleted!');
        handleFetchingTask();
      } else {
        console.error('Task deletion failed:', result.data?.message);
        // toast.error(result.data?.message || 'Task deletion failed');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      // toast.error(error.message);
    } finally {
      setTask((prevTask) => ({ ...prevTask, deleting: false }));
    }
  };

  const handleViewingDetail = (task) => {
    setTaskDetail((prevTask) => ({
      ...prevTask,
      openModal: true,
      selected: task,
    }));
  };

  const handleCloseDetailModal = () => {
    setTaskDetail((prevTask) => ({
      ...prevTask,
      openModal: false,
      selected: null,
    }));
  };

  const handleRefreshSelectedTask = (data) => {
    const selectedTask = data.find(
      (task) => task.id === taskDetail.selected?.id,
    );
    setTaskDetail((prevTask) => ({ ...prevTask, selected: selectedTask }));
  };

  const handleGettingDate = (dateStr) => {
    if (dateStr) {
      const dateObj = new Date(dateStr);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const handleFetchingTask = async (doesLoad) => {
    if (selectedYear?.id) {
      doesLoad && setTask((prevTask) => ({ ...prevTask, loading: true }));
      try {
        const token = await GetToken();
        const NormalEndpoint = Backend.api + Backend.tasks;
        const queryParams = new URLSearchParams({
          fiscal_year_id: selectedYear?.id,
          ...(startDate && { start_date: handleGettingDate(startDate) }),
          ...(endDate && { end_date: handleGettingDate(endDate) }),
          ...(MyPlanSelected && { plan_id: MyPlanSelected }),
        });

        const Api = `${NormalEndpoint}?${queryParams.toString()}`;
        const header = {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        };

        const response = await fetch(Api, { method: 'GET', headers: header });
        const result = await response.json();

        if (result.success) {
          setData(result.data.data || []);
          setTask((prevTask) => ({
            ...prevTask,
            taskList: result.data.data || [],
          }));
          taskDetail.selected && handleRefreshSelectedTask(result.data.data);
          setPagination({ ...pagination, total: result.data.total });
          handleCloseCreateModal();
        } else {
          console.error('Failed to fetch tasks:', result.data?.message);
          // toast.warning(result.data?.message || 'Failed to fetch tasks');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // toast.error(error.message);
      } finally {
        setTask((prevTask) => ({ ...prevTask, loading: false }));
      }
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
      setLoadingUsers(false);
    }
  };
  const handleOpenAddSubtaskModal = (dateSelected, task) => {
    setSubTask((prevTask) => ({
      ...prevTask,
      openModal: true,
      selectedTask: task,
      dateSelected: dateSelected,
    }));
  };

  const handleCloseSubTaskModal = () => {
    setSubTask((prevTask) => ({
      ...prevTask,
      openModal: false,
      selectedTask: {},
    }));
  };

  const handleSubTaskCreation = async (value) => {
    setSubTask((prevTask) => ({ ...prevTask, submitting: true }));
    try {
      const token = await GetToken('token');
      const Api = Backend.api + Backend.subTasks;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const data = {
        task_id: value.task_id,
        title: value?.title,
        date: value?.date,
        description: value?.description,
        deadline: value.deadline,
      };

      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.data?.message || 'Subtask created!');
        handleFetchingTask();
      } else {
        toast.error(result.data?.message || 'Subtask creation failed');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubTask((prevTask) => ({
        ...prevTask,
        submitting: false,
        openModal: false,
      }));
    }
  };

  const handleTaskStatusMiddleware = (task, statuses) => {
    if (statuses === 'remove') {
      handleSubtaskRemoval(task?.id);
    } else {
      handleSubTaskStatusChange(task, statuses);
    }
  };

  const handleSubTaskStatusChange = async (task, statuses) => {
    setSubTask((prevTask) => ({ ...prevTask, changing: true }));
    try {
      const token = await GetToken('token');
      const Api = `${Backend.api}${Backend.updateSubTaskStatus}${task?.id}`;
      const response = await fetch(Api, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statuses }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.data?.message || 'Subtask updated!');
        handleFetchingTask();
      } else {
        toast.error(result.data?.message || 'Subtask update failed');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubTask((prevTask) => ({ ...prevTask, changing: false }));
    }
  };
  console.log('taskDetail.selected', taskDetail.selected);
  const handleSubtaskRemoval = async (id) => {
    try {
      const token = await GetToken('token');
      const Api = `${Backend.api}${Backend.subTasks}/${id}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'DELETE', headers });
      const result = await response.json();

      if (result.success) {
        toast.success(result.data?.message || 'Subtask deleted!');
        handleFetchingTask();
      } else {
        toast.error(result.data?.message || 'Subtask deletion failed');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    handleFetchingTask(true);
    handleFetchingUsers();
  }, [
    task.date,
    endDate,
    startDate,
    MyPlanSelected,
    selectedYear?.id,
    pagination.page,
    pagination.per_page,
    search,
  ]);

  return (
    <PageContainer
      title="Monthly Tasks"
      rightOption={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
          <FilterTasks
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            GetPlans={() => handleGettingMyPlan()}
            myPlan={myPlan}
            MyPlanSelected={MyPlanSelected}
            handlePlanSelection={(event) => handlePlanSelection(event)}
          />
          {!hideCreate && (
            <DrogaButton
              title="Create Task"
              variant="contained"
              icon={
                <IconPlus
                  size="1.2rem"
                  stroke="1.2"
                  style={{ marginRight: 4 }}
                />
              }
              sx={{ boxShadow: 0 }}
              onPress={handleOpenCreateModal}
            />
          )}
        </Box>
      }
    >
      {task.taskList && (
        <TaskTabs
          isLoading={task.loading}
          tasks={task.taskList}
          onCreateTask={() => handleOpenCreateModal()}
          onChangeStatus={(task, option) => handleStatusChange(task, option)}
          onAddSubTask={(dateSelected, task) =>
            handleOpenAddSubtaskModal(dateSelected, task)
          }
          onSubtaskStatusChange={(subtask, newStatus) =>
            handleTaskStatusMiddleware(subtask, newStatus)
          }
          statusIsChanging={subTask.changing}
          onActionTaken={(action, task) => handleTaskAction(action, task)}
          onViewDetail={(task) => handleViewingDetail(task)}
        />
      )}

      {myPlan && (
        <CreateTask
          open={task.openModal}
          handleCloseModal={handleCloseCreateModal}
          mainActivity={myPlan}
          users={users}
          handleTaskSubmission={(values) => handleTaskCreation(values)}
          submitting={task.submitting}
          loadingUsers={loadingUsers}
        />
      )}

      {myPlan && task.selected && (
        <EditTask
          open={task.openEdit}
          handleCloseModal={handleCloseEditModal}
          myPlan={myPlan}
          selectedMyPlan={task.selected}
          handleTaskSubmission={(values) => handleTaskEdition(values)}
          submitting={task.submitting}
        />
      )}

      {taskDetail.selected && (
        <TaskDetailModal
          open={taskDetail.openModal}
          task={taskDetail.selected}
          title="Task Detail"
          handleClose={handleCloseDetailModal}
          onCancel={handleCloseDetailModal}
          onSubtaskStatusChange={(subtask, newStatus) =>
            handleTaskStatusMiddleware(subtask, newStatus)
          }
          statusIsChanging={subTask.changing}
        />
      )}

      {subTask.selectedTask && (
        <AddSubTask
          open={subTask.openModal}
          handleCloseModal={handleCloseSubTaskModal}
          task={subTask.selectedTask}
          handleSubmission={handleSubTaskCreation}
          submitting={subTask.submitting}
          day={subTask.dateSelected}
        />
      )}

      <ToastContainer />
    </PageContainer>
  );
};

export default Todo;
