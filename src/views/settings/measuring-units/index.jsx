import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CardContent,
  useTheme,
  Button,
  TablePagination,
} from '@mui/material';

import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Backend from 'services/backend';
import Search from 'ui-component/search';
import GetToken from 'utils/auth-token';
import PageContainer from 'ui-component/MainPage';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import hasPermission from 'utils/auth/hasPermission';
import SplitButton from 'ui-component/buttons/SplitButton';
import AddMeasuringUnit from './components/AddMeasuringUnits';

function MeasuringUnits() {
  const [loading, setLoading] = useState(true);
  const [measuringUnits, setMeasuringUnits] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [managers, setManagers] = useState([]);
  const [pagination, setPagination] = useState({
      page: 0,
      per_page: 10,
      total: 0,
    });
  console.log('Measuring Units',measuringUnits);

  const AddUnitOptions = ['Add Measuring Unit', 'Import From Excel'];

  useEffect(() => {
    fetchMeasuringUnits();
  }, [pagination.page, pagination.per_page]);
  const handleAddUnitModalClose = () => {
    setAdd(false);
  };
  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, per_page: event.target.value, page: 0 });
  };
  const handleFetchingManagers = async () => {
      const token = await GetToken();
      const Api = Backend.api + Backend.employees + `?role=manager`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json'
      };
  
      fetch(Api, {
        method: 'GET',
        headers: header
      })
        .then((response) => response.json())
  
        .then((response) => {
          if (response.success) {
            setManagers(response.data.data);
          }
        })
        .catch((error) => {
          toast(error.message);
        });
    };

    const handleAddUnitClick = () => {
      setAdd(true);
      // handleFetchingTypes();
      handleFetchingManagers();
    };
    const fetchMeasuringUnits = async () => {
      try {
        measuringUnits?.length === 0 && setLoading(true);
        const token = await GetToken();
        const Api = `${Backend.api}${Backend.measuringUnitsPaginated}?page=${pagination.page + 1}&per_page=${pagination.per_page}`;
        const response = await fetch(Api, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        const data = await response.json();
        if (data.success) {
          setMeasuringUnits(data.data?.data || []);
          setPagination(prev => ({
            ...prev,
            total: data.data?.total || 0  // Make sure this matches your API response structure
          }));
        } else {
          toast.error(`Failed to fetch measuring units: ${data.message}`);
        }
      } catch (error) {
        toast.error(`Error fetching measuring units: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
  const handleSearchFieldChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    // setPagination({ ...pagination, page: 0 });
  };
  const handleSave = async (values) => {
    const method = editIndex !== null ? 'PATCH' : 'POST';
    const Api =
      editIndex !== null
        ? `${Backend.api}measuring-units/${measuringUnits[editIndex].id}`
        : `${Backend.api}measuring-units`;

    try {
      const token = await GetToken();
      const response = await fetch(Api, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.measuringUnit,
          description: values.measuringType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchMeasuringUnits();
        handleClose();
        toast.success('Measuring unit saved successfully!');
      } else {
        toast.error(`Error saving measuring unit: ${data.message}`);
      }
    } catch (error) {
      toast.error(`Error saving measuring unit: ${error.message}`);
    }
  };

  const formik = useFormik({
    initialValues: {
      measuringUnit: '',
      measuringType: '',
    },
    onSubmit: (values, { resetForm }) => {
      handleSave(values);
      resetForm();
    },
  });

  const handleUnitAddition = async (value) => {
    setIsAdding(true);
    const token = await GetToken();
    const Api = Backend.api + Backend.measuringUnits;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const data = {
      name: value?.name,
    };

    fetch(Api, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setIsAdding(false);
          handleAddUnitModalClose();
          toast.success(response.data.message);
          // handleFetchingUnits();
        } else {
          setIsAdding(false);
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
        setIsAdding(false);
      });
  };

  const filteredUnits = measuringUnits?.filter((unit) =>
    unit.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
    setEditIndex(null);
  };
  const theme = useTheme();
  const handleUnitAdd = (index) => {
    if (index === 0) {
      handleAddUnitClick();
    } else if (index === 1) {
      // handleOpenDialog();
    } else {
      alert('We will be implement importing from odoo');
    }
  };
  return (
    <PageContainer
      title="Measuring Units"
      searchField={
        <Search
          title="Search units"
          value={search}
          onChange={(event) => handleSearchFieldChange(event)}
          filter={false}
        ></Search>
      }
      rightOption={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {hasPermission('create:measuringunit') && (
            <SplitButton options={AddUnitOptions} handleSelection={(value) => handleUnitAdd(value)} />
          
          )}
        </Box>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CardContent>
            {loading ? (
              <Grid container>
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ActivityIndicator size={22} />
                </Grid>
              </Grid>
            ) : filteredUnits?.length === 0 ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <SentimentDissatisfiedIcon
                  color="disabled"
                  style={{ fontSize: 60 }}
                />
                <Typography
                  variant="subtitle1"
                  color="textSecondary"
                  align="center"
                  marginLeft={2}
                >
                  No measuring units entered yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer style={{ border: '1px solid #ddd' }}>
                <Table
                  sx={{
                    minWidth: 650,
                    borderCollapse: 'collapse',
                  }}
                >
                  <TableHead>
                    <TableRow>
                      {['Measuring Unit']?.map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            background: theme.palette.grey[100],
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            borderBottom: `2px solid ${theme.palette.divider}`,
                            position: 'relative',
                            padding: '12px 16px',
                            '&:not(:last-of-type)': {
                              borderRight: `1px solid ${theme.palette.divider}`,
                            },
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUnits?.map((unit) => (
                      <TableRow
                        key={unit.id}
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: 2,
                          '&:nth-of-type(odd)': {
                            backgroundColor: theme.palette.grey[50],
                          },
                          '&:hover': {
                            backgroundColor: theme.palette.grey[100],
                          },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: 0,
                            padding: '12px 16px',
                          }}
                        >
                          {unit.name}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Grid>
      </Grid>
      <ToastContainer />
       {pagination.total > pagination.per_page && (
       <TablePagination
          component="div"
          rowsPerPageOptions={[10, 25, 50, 100]}
          count={pagination.total}
          rowsPerPage={pagination.per_page}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Plans per page"
        />
      )}
      <AddMeasuringUnit
        add={add}
        isAdding={isAdding}
        managers={managers}
        onClose={handleAddUnitModalClose}
        handleSubmission={(value) => handleUnitAddition(value)}
      />
    </PageContainer>
  );
}

export default MeasuringUnits;
