import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import PageContainer from 'ui-component/MainPage';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import { Box, Typography, Grid } from '@mui/material';
import PendingTaskCard from '../components/PendingTaskCard';
import Fallbacks from 'utils/components/Fallbacks';

const PendingTask = () => {
  const [data, setData] = useState([]);
  const [deleting, setDeleting] = useState(false);

  // Function to approve a task
  const handleApproveTask = async (id) => {
    setDeleting(true); // Set deleting state to true when an approval request is made

    const token = await GetToken('token');
    const Api = Backend.api + Backend.approveTask + id;

    const headers = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    // Request body with status
    const requestBody = {
      status: 'approved',
    };

    // Approve task API call
    fetch(Api, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((response) => {
        if (response.success) {
          toast.success('Task approved successfully!'); // Success message
          handleFetchingTask(); // Reload tasks after approval
        } else {
          toast.error(
            `Approval failed: ${response.data?.message || 'Unknown error'}`,
          ); // Error message
        }
      })
      .catch((error) => {
        toast.error(`Error: ${error.message}`); // Network or other errors
      })
      .finally(() => {
        setDeleting(false); // Reset deleting state after task approval attempt
      });
  };

  // Function to fetch pending tasks
  const handleFetchingTask = async () => {
    const token = await GetToken('token');
    const Api = Backend.api + Backend.getPendingTasks;

    const headers = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    // Fetch tasks API call
    fetch(Api, {
      method: 'GET',
      headers: headers,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        return response.json();
      })
      .then((response) => {
        if (response.success) {
          setData(response.data.data || []); // Update tasks data
        } else {
          toast.warning(
            `Warning: ${response.data?.message || 'Failed to load tasks'}`,
          ); // Display warning
        }
      })
      .catch((error) => {
        toast.error(`Error: ${error.message}`); // Fetching tasks failed
      });
  };

  useEffect(() => {
    handleFetchingTask(); // Fetch tasks on component mount
  }, []);

  return (
    <PageContainer title="Pending Tasks">
      <Grid container spacing={3} mt={4}>
        {data?.length > 0 ? (
          data?.map((task) => (
            <PendingTaskCard
              key={task.id}
              task={task}
              onApprove={handleApproveTask}
            />
          ))
        ) : (
          <Fallbacks
            title="Data Not Found"
            description="Unable to find Pending Task"
          />
        )}
      </Grid>
      <ToastContainer />
    </PageContainer>
  );
};

export default PendingTask;
