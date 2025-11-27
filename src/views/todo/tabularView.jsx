import React, { useState } from 'react';
import Fallbacks from 'utils/components/Fallbacks';
import { Chip, Grid, useTheme } from '@mui/material';
import { TabularTask } from './components/TabularTask';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import KanbanColumns from 'data/todo/kanbanColumns';

const TabularView = ({ 
  tasks = [], 
  changeStatus, 
  addSubtask, 
  onSubtaskStatusChange, 
  statusIsChanging, 
  onActionTaken, 
  onViewDetail 
}) => {
  const theme = useTheme();
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Safety check
  console.log("Tasks:", tasks);
  const handleViewingDetail = (task) => {
    onViewDetail(task);
  };

  if (!Array.isArray(tasks)) {
    console.error('Invalid tasks prop:', tasks);
    return <Fallbacks severity="error" title="Data loading error" />;
  }

  const filteredTasks = selectedStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task?.status === selectedStatus);

  const handleChangingStatusTab = (index, status) => {
    setSelectedStatusIndex(index);
    setSelectedStatus(status);
  };
console.log("Filtered Tasks", filteredTasks);
  return (
    <Grid container sx={{ gap: 3, py: 3, width: '100%' }}>
      <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', overflowX: 'auto', px: 1 }}>
        {KanbanColumns?.map((column, index) => (
          <Chip
            key={index}
            label={column?.name}
            onClick={() => handleChangingStatusTab(index, column?.name)}
            sx={{
              backgroundColor: selectedStatusIndex === index ? column?.primary_color : 'white',
              color: selectedStatusIndex === index ? theme.palette.common.white : column?.primary_color,
              border: 0.4,
              borderRadius: 4,
              mx: 0.4,
              cursor: 'pointer',
              ':hover': { 
                transform: 'scale(1.05)', 
                backgroundColor: column?.primary_color 
              },
            }}
          />
        ))}
      </Grid>

      {filteredTasks?.length === 0 ? (
        <Fallbacks
          severity="weekly-task"
          title={`No ${selectedStatus === 'all' ? '' : selectedStatus + ' '}tasks found`}
          sx={{ paddingY: 6 }}
        />
      ) : (
        filteredTasks?.map((task) => (
          
          <TabularTask
            key={task.id}
            task={task}
            color={KanbanColumns.find(c => c.name === task.status)?.primary_color}
            onChangeStatus={changeStatus}
            onAddSubtask={(subtask) => addSubtask(subtask, task)}
            onSubtaskStatusChange={onSubtaskStatusChange}
            statusIsChanging={statusIsChanging}
            onActionTaken={onActionTaken}
            onViewDetail={() => handleViewingDetail(task)}
          />
        ))
      )}
    </Grid>
  );
};

export default TabularView;