import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Typography } from '@mui/material';
// import { FeedBackKanBanColumn } from './components/FeedBackKanBanColumn';
import FeedBackKanbanData from 'data/feedBacks/FeedBackKanbanData';
import Fallbacks from 'utils/components/Fallbacks';
import { EmployeeFeedBack } from './components/EmployeeFeedBack';
// import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { formatDate } from 'utils/function';
import { IconCalendarMonth } from '@tabler/icons-react';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { ref } from 'yup';

const View = ({ addSubtask, feedBack, onActionTaken, onViewDetail }) => {
  const [deleting, setDeleting] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  const [feedback, setFeedback] = React.useState({ openModal: false });
  const [feedbackData, setFeedbackData] = React.useState([]);

  const state = useSelector((state) => state.customization.user);

  const handleAddingSubtask = (subtask, task) => {
    addSubtask(subtask, task);
  };

  const handleOpenEditModal = () => {
    setFeedback({ openModal: true, submitting: false });
  };

  const handleEditSubtask = (subtask, task) => {
    addSubtask(subtask, task);
  };

  const handleTaskAction = (action, task) => {
    onActionTaken(action, task);
  };

  const handleViewingDetail = (task) => {
    onViewDetail(task);
  };

  const handleFetchingFeedback = async () => {
    setLoading(true);
    try {
      const token = await GetToken();
      const Api =
        Backend.api +
        Backend.feedBack +
        `?employee_id=${state?.employee_id}&fiscal_year_id=${selectedYear?.id}`;

      const response = await fetch(Api, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        onRefresh();
      } else {
        toast.warning(data.data?.message || 'Failed to fetch feedback');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  // const handleFeedbackEdit = async (value) => {
  //   try {
  //     const token = await GetToken('token');
  //     const Api = `${Backend.api}${Backend.feedBack}?employee_id=${state?.employee_id}&fiscal_year_id=${selectedYear?.id}`;

  //     const response = await fetch(Api, {
  //       method: 'PATCH',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         frequency_id: value?.id,
  //         strength: value?.strength,
  //         area_of_improvement: value?.area_of_improvement,
  //         weakness: value?.weakness,
  //         recommendation: value?.recommendation,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (data.success) {
  //       toast.success(data.data?.message || 'Feedback updated successfully');
  //       handleFetchingFeedback(); // Refresh data
  //     } else {
  //       toast.error(data.data?.message || 'Failed to update feedback');
  //     }
  //   } catch (error) {
  //     toast.error(error.message || 'Error updating feedback');
  //   }
  // };

  const onDelete = async (id) => {
    setSelectedRow(id);
    setDeleting(true);
    try {
      const token = await GetToken('token');
      const Api = Backend.api + Backend.feedBack + '/' + id;
      const headers = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'DELETE', headers });
      const data = await response.json();

      if (data.success) {
        toast.success(data.data?.message || 'Feedback deleted successfully');
        handleFetchingFeedback();
        window.location.reload();
      } else {
        toast.error(data.data?.message || 'Failed to delete feedback');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred during deletion');
    } finally {
      setDeleting(false);
    }
  };

  // Get array of colors from FeedBackKanbanData for section styling
  const columnColors = FeedBackKanbanData.map((col) => col.primary_color);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        py: 2,
      }}
    >
      {(Array.isArray(feedBack) ? feedBack : []).map((entry, index) => {
        const sectionColor = columnColors[index % columnColors.length];
        const tasks = [];

        // Extract feedback items for this entry
        if (entry.area_of_improvement) {
          tasks.push({
            type: 'Improvement',
            text: entry.area_of_improvement,
            frequency: entry.frequency,
            created_at: entry.created_at,
            entryId: entry.id,
          });
        }
        if (entry.strength) {
          tasks.push({
            type: 'Strength',
            text: entry.strength,
            frequency: entry.frequency,
            created_at: entry.created_at,
            entryId: entry.id,
          });
        }
        if (entry.weakness) {
          tasks.push({
            type: 'Weakness',
            text: entry.weakness,
            frequency: entry.frequency,
            created_at: entry.created_at,
            entryId: entry.id,
          });
        }
        if (entry.recommendation) {
          tasks.push({
            type: 'Recommendation',
            text: entry.recommendation,
            frequency: entry.frequency,
            created_at: entry.created_at,
            entryId: entry.id,
          });
        }

        return (
          <Box
            key={entry.id}
            sx={{
              width: '100%',
              borderLeft: `4px solid ${sectionColor}`,
              p: 2,
              borderTop: `0.5px solid grey`,
              borderRight: `0.5px solid grey`,
              borderBottom: `0.5px solid grey`,
              borderRadius: 4,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* Left Side: Feedback Entry, Frequency, and Created At */}
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" mb={1}>
                  Feedback Entry #{index + 1}
                </Typography>

                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="gray">
                      Frequency:
                    </Typography>
                    <Typography variant="caption" color="gray">
                      {entry?.frequency?.name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconCalendarMonth size="1.1rem" stroke="1.4" />
                    <Typography variant="caption">
                      {entry?.created_at
                        ? formatDate(entry?.created_at).formattedDate
                        : ''}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* <IconButton
                  sx={{
                    p: 0.8,
                    bgcolor: '#2F78EE',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#2a71e3' },
                  }}
                >
                  <EditOutlinedIcon
                    fontSize="small"
                    sx={{ color: 'white' }}
                    onClick={() => {
                      handleFeedbackEdit(entry);
                    }}
                  />
                </IconButton> */}
                <IconButton
                  sx={{ p: 0.8, bgcolor: '#E03137', borderRadius: 2 }}
                >
                  <DeleteOutlineOutlinedIcon
                    fontSize="small"
                    sx={{ color: 'white' }}
                    onClick={() => {
                      onDelete(entry.id);
                    }}
                  />
                </IconButton>
              </Box>
            </Box>

            {tasks.length === 0 ? (
              <Fallbacks
                severity="Feed-Back"
                title="No Feedback Available"
                description=""
                sx={{ paddingY: 6 }}
                size={60}
              />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: 2,
                }}
              >
                {tasks.map((feed, taskIndex) => (
                  <EmployeeFeedBack
                    key={`${entry.id}-${taskIndex}`}
                    feed={feed}
                    color={sectionColor}
                    onAddSubtask={(subtask) =>
                      handleAddingSubtask(subtask, feed)
                    }
                    onEditSubtask={(subtask) =>
                      handleEditSubtask(subtask, feed)
                    }
                    onActionTaken={(action) => handleTaskAction(action, feed)}
                    onViewDetail={() => handleViewingDetail(feed)}
                  />
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

View.propTypes = {
  tasks: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
  feedBack: PropTypes.array.isRequired,
  changeStatus: PropTypes.func.isRequired,
  createTask: PropTypes.func.isRequired,
  addSubtask: PropTypes.func.isRequired,
  onSubtaskStatusChange: PropTypes.func.isRequired,
  statusIsChanging: PropTypes.bool.isRequired,
  onActionTaken: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired,
};

export default View;
