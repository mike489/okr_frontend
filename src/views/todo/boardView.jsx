import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { KanBanColumn } from './components/KanBanColumn';
import { EmployeeTasks } from './components/EmployeeTasks';
import KanbanColumns from 'data/todo/kanbanColumns';
import Fallbacks from 'utils/components/Fallbacks';

const BoardView = ({
  tasks,
  changeStatus,
  createTask,
  addSubtask,
  onSubtaskStatusChange,
  statusIsChanging,
  onActionTaken,
  onViewDetail,
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, []);

  const handleAddingSubtask = (day, task) => {
    // Call the addSubtask prop function with both day and task
    addSubtask(day, task);
  };

  const handleTaskAction = (action, task) => {
    onActionTaken(action, task);
  };

  const handleViewingDetail = (task) => {
    onViewDetail(task);
  };

  return (
    <React.Fragment>
      <Box sx={{ width: '100%', overflow: 'hidden', paddingTop: 2 }}>
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            overflowX: 'auto',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 3,
            paddingBottom: 2,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#555',
            },
          }}
        >
          {KanbanColumns.filter((column) => column.name !== 'all').map(
            (column, index) => {
              const columnTasks = tasks.filter(item => item.status === column.name);
              return (
                <KanBanColumn
                  key={index}
                  column={column}
                  no_of_tasks={columnTasks.length}
                  onAddTask={createTask}
                >
                  {columnTasks.length === 0 ? (
                    <Fallbacks
                      severity="daily-tasks"
                      title={`No ${column.name} task`}
                      description=""
                      sx={{ paddingY: 6 }}
                      size={60}
                    />
                  ) : (
                    columnTasks.map((task) => (
                      <EmployeeTasks
                        key={task.id}
                        task={task}
                        color={column?.primary_color}
                        onChangeStatus={changeStatus}
                        onAddSubtask={(day) => handleAddingSubtask(day, task)}
                        onSubtaskStatusChange={onSubtaskStatusChange}
                        statusIsChanging={statusIsChanging}
                        onActionTaken={(action) => handleTaskAction(action, task)}
                        onViewDetail={() => handleViewingDetail(task)}
                      />
                    ))
                  )}
                </KanBanColumn>
              );
            }
          )}
        </Box>
      </Box>
    </React.Fragment>
  );
};

BoardView.propTypes = {
  tasks: PropTypes.array.isRequired,
  changeStatus: PropTypes.func.isRequired,
  createTask: PropTypes.func.isRequired,
  addSubtask: PropTypes.func.isRequired,
  onSubtaskStatusChange: PropTypes.func.isRequired,
  statusIsChanging: PropTypes.bool.isRequired,
  onActionTaken: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired,
};

export default BoardView;