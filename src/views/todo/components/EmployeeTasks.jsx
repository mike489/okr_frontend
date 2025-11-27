import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Box,
  Collapse,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import DrogaCard from 'ui-component/cards/DrogaCard';
import {
  IconCalendarMonth,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';
import { formatDate } from 'utils/function';
import { Subtask } from './Subtask';
import Fallbacks from 'utils/components/Fallbacks';
import StatusSelector from './StatusSelector';

const TaskStatuses = [
  { label: 'Pending', value: 'pending' },
  { label: 'Todo', value: 'todo' },
  { label: 'In-progress', value: 'inprogress' },
  { label: 'Done', value: 'done' },
  { label: 'Blocked', value: 'blocked' },
];

export const EmployeeTasks = ({
  task,
  color,
  onChangeStatus,
  onActionTaken,
  onAddSubtask,
  onSubtaskStatusChange,
  statusIsChanging,
  onViewDetail,
}) => {
  const theme = useTheme();
  const [viewSubtasks, setViewSubtasks] = useState(false);
  const [selectedSubtask, setSelectedSubTask] = useState(null);

  const handleSubtaskExpanding = (event) => {
    event.stopPropagation();
    setViewSubtasks(!viewSubtasks);
  };

  const handleStatusChange = (option) => {
    onChangeStatus(task, option);
  };

  const handleSelectedSubtask = (subtask, newStatus, subtaskID) => {
    setSelectedSubTask(subtaskID);
    onSubtaskStatusChange(subtask, newStatus);
  };

  // Calculate total subtask count safely
  let totalCountSubTasks = 0;
  if (task.sub_tasks && typeof task.sub_tasks === 'object') {
    for (const day in task.sub_tasks) {
      totalCountSubTasks += task.sub_tasks[day].length;
    }
  }

  return (
    <DrogaCard
      sx={{
        my: 1.6,
        padding: 1.6,
        py: 1.2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease-in-out',
        ':hover': { backgroundColor: theme.palette.grey[50] },
        cursor: 'pointer',
      }}
    >
      <Box onClick={() => onViewDetail(task)}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginY: 0.4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              cursor: 'pointer',
              ':hover': { color: theme.palette.primary.main },
            }}
            color={theme.palette.text.primary}
            mt={1}
          >
            {task?.title}
          </Typography>

          <StatusSelector
            name="status"
            options={TaskStatuses}
            selected={task.status}
            handleSelection={(option) => handleStatusChange(option)}
            onActionTaken={onActionTaken}
            hideStatusOptions={task?.status !== 'pending'}
          />
        </Box>
        <Typography
          variant="subtitle1"
          color={theme.palette.text.secondary}
          mt={0}
        >
          {task?.plan?.kpi?.name}
        </Typography>

        {/* {task.sub_tasks && Object.keys(task.sub_tasks).length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', marginY: 0.4 }}>
            <Typography variant="body2" color={theme.palette.text.secondary}>
              Sub Tasks
            </Typography>
            <Box
              sx={{
                width: 4.43,
                height: 4.43,
                borderRadius: 2.6,
                backgroundColor: 'gray',
                marginX: 1,
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="body2"
                color={theme.palette.text.secondary}
                mr={1}
              >
                {
                  Object.values(task.sub_tasks)
                    .flat()
                    .filter((miniTask) => miniTask.status === 'done').length
                }
              </Typography>
              <Typography variant="body2" color={theme.palette.text.secondary}>
                out of
              </Typography>
              <Typography
                variant="body2"
                color={theme.palette.text.secondary}
                ml={1}
              >
                {Object.values(task.sub_tasks).flat().length}
              </Typography>
            </Box>
          </Box>
        )} */}

        <Box sx={{ display: 'flex', alignItems: 'center', marginY: 1.2 }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 11,
                height: 11,
                borderRadius: 5.5,
                backgroundColor: color,
                border: 1,
                borderColor: 'white',
              }}
            />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{ textTransform: 'capitalize', marginLeft: 1.2 }}
          >
            {task?.status}
          </Typography>
        </Box>

        <Box

        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 2 }}>
              {/* <IconCalendarMonth size="1.1rem" stroke="1.4" /> */}
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconCalendarMonth size="1.1rem" stroke="1.4" />
                Created at
              </Typography>
              <Typography variant="subtitle2" sx={{}}>
                {task?.created_at ? formatDate(task?.created_at).formattedDate : ''}
              </Typography>

            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 2 }}>
              {/* <IconCalendarMonth size="1.1rem" stroke="1.4" /> */}
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconCalendarMonth size="1.1rem" stroke="1.4" />
                Deadline
              </Typography>
              <Typography variant="subtitle2" sx={{}}>
                {task?.deadline ? formatDate(task?.deadline).formattedDate : ''}
              </Typography>

            </Box>
          </Box>
          {/* <Box
            onClick={(event) => handleSubtaskExpanding(event)}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              p: 1,
            }}
          >
            <Badge
              badgeContent={totalCountSubTasks}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: theme.palette.grey[100],
                  color: theme.palette.primary[800],
                },
              }}
            />
            <Typography
              variant="subtitle2"
              color="text.primary"
              sx={{ marginLeft: 2 }}
            >
              Subtasks
            </Typography>
            {viewSubtasks ? (
              <IconChevronDown size="1rem" stroke="1.8" />
            ) : (
              <IconChevronRight size="1rem" stroke="1.8" />
            )}
          </Box> */}
        </Box>
      </Box>

      <Collapse in={viewSubtasks}>
        <Box sx={{ marginY: 1 }}>
          <Fallbacks
            size={60}
            severity="to do"
            title=""
            description="Subtasks are not available"
            sx={{ paddingY: 6 }}
          />
        </Box>
      </Collapse>
    </DrogaCard>
  );
};

EmployeeTasks.propTypes = {
  task: PropTypes.shape({
    title: PropTypes.string,
    status: PropTypes.string,
    plan: PropTypes.shape({
      kpi: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
    date: PropTypes.string,
    sub_tasks: PropTypes.objectOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          status: PropTypes.string,
        }),
      ),
    ),
  }).isRequired,
  color: PropTypes.string,
  onChangeStatus: PropTypes.func.isRequired,
  onActionTaken: PropTypes.func.isRequired,
  onAddSubtask: PropTypes.func.isRequired,
  onSubtaskStatusChange: PropTypes.func.isRequired,
  statusIsChanging: PropTypes.bool,
  onViewDetail: PropTypes.func.isRequired,
};

EmployeeTasks.defaultProps = {
  task: {
    sub_tasks: {},
  },
  color: '',
  statusIsChanging: false,
};