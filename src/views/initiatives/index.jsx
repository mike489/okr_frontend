import {
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { Box, useTheme } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import AddButton from 'ui-component/buttons/AddButton';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import PageContainer from 'ui-component/MainPage';
import { DotMenu } from 'ui-component/menu/DotMenu';
import Search from 'ui-component/search';
import ErrorPrompt from 'utils/components/ErrorPrompt';
import Fallbacks from 'utils/components/Fallbacks';
import AddInitiative from './components/AddInitiative';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import hasPermission from 'utils/auth/hasPermission';
import EditInitiative from './components/EditInitiative';

const Initiative = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [objectives, setObjectives] = useState([]);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
  });

  const handleModalClose = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setSelectedInitiative(null);
  };
  console.log('selectedInitiative', selectedInitiative);
  console.log('Data', data);
  const handleInitiativeEdit = async (values) => {
    setIsEditing(true);
    const token = await GetToken();
    const Api = `${Backend.api}${Backend.initiatives}/${selectedInitiative?.id}`;

    try {
      const response = await fetch(Api, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          objective_id: values.objective_id,
        }),
      });

      const responseData = await response.json();

      if (!response.ok)
        throw new Error(responseData.message || 'Failed to update initiative');

      
      toast.success('Initiative updated successfully!');
      handleModalClose();
    } catch (error) {
      console.error('Error editing initiative:', error);
      toast.error(error.message || 'Failed to update initiative');
    } finally {
      setIsEditing(false);
    }
  };

  const handleInitiativeAddition = async (values) => {
    setIsAdding(true);
    const token = await GetToken();
    const Api = `${Backend.api}${Backend.initiatives}`;

    try {
      const response = await fetch(Api, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          objective_id: values.objective,
        }),
      });

      const responseData = await response.json();

      if (!response.ok)
        throw new Error(responseData.message || 'Failed to add initiative');

      // setData((prevData) => [...prevData, responseData.data]);
      toast.success('Initiative added successfully!');
      handleModalClose();
    } catch (error) {
      console.error('Error adding initiative:', error);
      toast.error(error.message || 'Failed to add initiative');
    } finally {
      setIsAdding(false);
    }
  };

  const handleInitiativeDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this initiative?'))
      return;

    setIsDeleting(true);
    const token = await GetToken();
    const Api = `${Backend.api}${Backend.initiatives}/${id}`;

    try {
      const response = await fetch(Api, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok)
        throw new Error(responseData.message || 'Failed to delete initiative');

      setData((prevData) => prevData.filter((item) => item.id !== id));
      toast.success('Initiative deleted successfully!');
    } catch (error) {
      console.error('Error deleting initiative:', error);
      toast.error(error.message || 'Failed to delete initiative');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFetchingObjectives = async () => {
    setLoading(true);
    const token = await GetToken();
    const Api = `${Backend.api}${Backend.objectives}`;

    try {
      const response = await fetch(Api, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();

      if (responseData.success) {
        setObjectives(responseData.data);
      } else {
        throw new Error(responseData.message || 'Failed to fetch objectives');
      }
    } catch (error) {
      toast.error(error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchingInitiatives = async () => {
    setLoading(true);
    const token = await GetToken();
    const Api = `${Backend.api}${Backend.initiatives}?page=${pagination.page + 1}&per_page=${pagination.per_page}&search=${search}`;

    try {
      const response = await fetch(Api, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
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
        throw new Error(responseData.message || 'Failed to fetch initiatives');
      }
    } catch (error) {
      toast.error(error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, per_page: event.target.value, page: 0 });
  };

  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  const handleEditClick = (initiative) => {
    setSelectedInitiative(initiative);
    setEditModalOpen(true);
  };

  useEffect(() => {
    handleFetchingInitiatives();
    handleFetchingObjectives();
  }, [pagination.page, pagination.per_page, search]);

  return (
    <PageContainer title="Initiative">
      <Grid container>
        <Grid item xs={12} padding={3}>
          <Grid item xs={10} md={12} marginBottom={3}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Search
                title="Search Initiative"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                filter={false}
              />
              <AddButton title="Add Initiative" onPress={handleAddClick} />
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
                  message="Unable to retrieve initiatives."
                />
              ) : data.length === 0 ? (
                <Fallbacks
                  severity="evaluation"
                  title="No Initiatives Found"
                  description="The list of initiatives will be listed here."
                  sx={{ paddingTop: 6 }}
                />
              ) : (
                <TableContainer
                  sx={{
                    minHeight: '66dvh',
                    border: 0.4,
                    borderColor: 'gray.300',
                    borderRadius: 2,
                  }}
                >
                  <Table aria-label="Initiative table" sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Initiative Title</TableCell>
                        <TableCell>Objective</TableCell>
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
                          <TableCell>
                            <Chip
                              label={item?.objective?.title}
                              color="primary"
                              variant="outlined"
                              size="small"
                              sx={{ margin: 0.5 }}
                            />
                          </TableCell>
                          <TableCell>
                            <DotMenu
                              onEdit={
                                hasPermission('update:initiative')
                                  ? () => handleEditClick(item)
                                  : null
                              }
                              onDelete={
                                hasPermission('delete:initiative')
                                  ? () => handleInitiativeDelete(item.id)
                                  : null
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={pagination.total}
                    page={pagination.page}
                    onPageChange={handleChangePage}
                    rowsPerPage={pagination.per_page}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <ToastContainer />

      <AddInitiative
        add={addModalOpen}
        objectives={objectives}
        onClose={handleModalClose}
        onSubmit={handleInitiativeAddition}
        loading={isAdding}
      />

      <EditInitiative
        open={editModalOpen}
        onClose={handleModalClose}
        onEdit={handleInitiativeEdit}
        initialData={selectedInitiative}
        objectives={objectives}
        isEditing={isEditing}
      />
    </PageContainer>
  );
};

export default Initiative;
