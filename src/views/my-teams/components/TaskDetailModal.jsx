import PropTypes from 'prop-types';
import DrogaModal from 'ui-component/modal/DrogaModal';
import { TaskOverview } from 'views/todo/components/task-detail/TaskOverview';
import { TaskRemarks } from 'views/todo/components/task-detail/Remarks';
import TaskDetailTabs from 'views/todo/components/TaskDetailTabs';
import { Box } from '@mui/material';

const TaskDetailModal = ({
  open,
  task,
  title,
  handleClose,
  onCancel,
  onSubmit,
  submitting,
  statusIsChanging,
}) => {
  return (
    <DrogaModal
      open={open}
      title={title}
      handleClose={handleClose}
      onCancel={onCancel}
      onSubmit={onSubmit}
      submitting={submitting}
      containerStyle={{ display: 'flex', justifyContent: 'center' }}
      sx={{
        width: { xs: '100%', sm: '100%', md: 600 },
        minHeight: { xs: '90%', sm: '90%', md: 500 },
        p: 0,
      }}
      hideActionButtons={true}
    >
      <TaskDetailTabs
        overview={<TaskOverview task={task} />}
        remarks={<TaskRemarks task={task} />}
      />
    </DrogaModal>
  );
};

TaskDetailModal.propTypes = {
  open: PropTypes.bool,
  task: PropTypes.object,
  title: PropTypes.string,
  handleClose: PropTypes.func,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  statusIsChanging: PropTypes.bool,
};

DrogaModal.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  children: PropTypes.node,
  handleClose: PropTypes.func,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
};

export default TaskDetailModal;