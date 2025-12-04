import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Box, useTheme } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import PageContainer from 'ui-component/MainPage';
import { DotMenu } from 'ui-component/menu/DotMenu';
import Search from 'ui-component/search';
import ErrorPrompt from 'utils/components/ErrorPrompt';
import Fallbacks from 'utils/components/Fallbacks';
import AddObjectives from './components/AddObjectives';
import AddButton from 'ui-component/buttons/AddButton';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import hasPermission from 'utils/auth/hasPermission';
import EditObjective from './components/EditObjective';

const Objective = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    last_page: 0,
    total: 0,
  });

  const handleModalClose = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setSelectedObjective(null);
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, per_page: event.target.value, page: 0 });
  };

  const handleSearchFieldChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPagination({ ...pagination, page: 0 });
  };

  const handleFetchingObjective = async () => {
    setLoading(true);
    const token = await GetToken();
  const Api = Backend.pmsUrl(Backend.objectives)
  + `?page=${pagination.page + 1}&per_page=${pagination.per_page}&search=${search}`;

    try {
      const response = await fetch(Api, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
      });
      const responseData = await response.json();

      if (responseData.success) {
        setData(responseData.data.data);
        setPagination({
          ...pagination,
          last_page: responseData.data.last_page,
          total: responseData.data.total,
        });
      } else {
        toast.error(responseData.message || 'Failed to fetch objectives');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch objectives');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleObjectiveAddition = async (values) => {
    setIsAdding(true);
    const token = await GetToken();
    const Api = Backend.pmsUrl(Backend.objectives);

    try {
      const response = await fetch(Api, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(responseData.message || 'Objective added successfully!');
        handleFetchingObjective();
        handleModalClose();
      } else {
        toast.error(responseData.message || 'Failed to add objective');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add objective');
    } finally {
      setIsAdding(false);
    }
  };

  const handleObjectiveUpdate = async (values) => {
    setIsEditing(true);
    const token = await GetToken();
  const Api = Backend.pmsUrl(`${Backend.objectives}/${selectedObjective?.id}`);

    try {
      const response = await fetch(Api, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(
          responseData.message || 'Objective updated successfully!',
        );
        handleFetchingObjective();
        handleModalClose();
      } else {
        toast.error(responseData.message || 'Failed to update objective');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update objective');
    } finally {
      setIsEditing(false);
    }
  };

  const handleObjectiveDelete = async (objective) => {
    if (
      !window.confirm(`Are you sure you want to delete "${objective.title}"?`)
    ) {
      return;
    }

    setIsDeleting(true);
    const token = await GetToken();
    const Api = Backend.pmsUrl(`${Backend.objectives}/${objective?.id}`);
    try {
      const response = await fetch(Api, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(
          responseData.message || 'Objective deleted successfully!',
        );
        handleFetchingObjective();
      } else {
        toast.error(responseData.message || 'Failed to delete objective');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete objective');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (objective) => {
    setSelectedObjective(objective);
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  useEffect(() => {
    handleFetchingObjective();
  }, [pagination.page, pagination.per_page, search]);

  return (
    <PageContainer title="Objective">
      <Grid container>
        <Grid item xs={12} padding={3}>
          <Grid item xs={10} md={12} marginBottom={3}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Search
                title="Search Objectives"
                value={search}
                onChange={handleSearchFieldChange}
                filter={false}
              />

              <AddButton title="Add Objective" onPress={handleAddClick} />
            </Box>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              {loading ? (
                <Grid container>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 4,
                    }}
                  >
                    <ActivityIndicator size={20} />
                  </Grid>
                </Grid>
              ) : error ? (
                <ErrorPrompt
                  title="Server Error"
                  message="Unable to retrieve objectives."
                />
              ) : data.length === 0 ? (
                <Fallbacks
                  severity="evaluation"
                  title="No Objectives Found"
                  description="The list of objectives will be listed here."
                  sx={{ paddingTop: 6 }}
                />
              ) : (
                <TableContainer
                  sx={{
                    minHeight: '66dvh',
                    border: 0.4,
                    borderColor: 'grey.300',
                    borderRadius: 2,
                  }}
                >
                  <Table aria-label="Objective table" sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Visibility</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {data.map((item) => (
                        <TableRow
                          key={item.id}
                          sx={{
                            ':hover': {
                              backgroundColor: theme.palette.grey[50],
                            },
                          }}
                        >
                          <TableCell>{item.title}</TableCell>
                          <TableCell
                            sx={{ maxWidth: 300, whiteSpace: 'normal' }}
                          >
                            {item.description}
                          </TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.visibility}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            {item.status}
                          </TableCell>
                          <TableCell>
                            {new Date(item.created_at).toLocaleDateString()}
                          </TableCell>

                          <TableCell>
                            <DotMenu
                              onEdit={
                                hasPermission('update_objective')
                                  ? () => handleEditClick(item)
                                  : null
                              }
                              onDelete={
                                hasPermission('delete_objective')
                                  ? () => handleObjectiveDelete(item)
                                  : null
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {pagination.total > 0 && (
                    <TablePagination
                      component="div"
                      count={pagination.total}
                      page={pagination.page}
                      onPageChange={handleChangePage}
                      rowsPerPage={pagination.per_page}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  )}
                </TableContainer>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <ToastContainer />

      <AddObjectives
        add={addModalOpen}
        onClose={handleModalClose}
        onSubmit={handleObjectiveAddition}
        loading={isAdding}
      />

      <EditObjective
        edit={editModalOpen}
        onClose={handleModalClose}
        onSubmit={handleObjectiveUpdate}
        loading={isEditing}
        objectiveDetails={selectedObjective}
      />
    </PageContainer>
  );
};

export default Objective;
