import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from 'react';
import { Box, Grid, useTheme, TablePagination } from '@mui/material';
import { useSelector } from 'react-redux';

import { ExcelTemplates } from 'configration/templates';
import { toast, ToastContainer } from 'react-toastify';
import Backend from 'services/backend';
import Fallbacks from 'utils/components/Fallbacks';
import Search from 'ui-component/search';
import AddMainActivity from './components/AddMainActivity';
import PageContainer from 'ui-component/MainPage';
import MainActivityTable from './components/MainActivityTable';

import EditMainActivity from './components/EditMainActivity';
import GetToken from 'utils/auth-token';

import SplitButton from 'ui-component/buttons/SplitButton';
import UploadFile from 'ui-component/modal/UploadFile';
import axios from 'axios';
import hasPermission from 'utils/auth/hasPermission';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';

const MainActivities = () => {
  const theme = useTheme();
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );
  console.log("Selected Year:", selectedYear)
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
    last_page: 1,
  });


  const [unitLoading, setUnitLoading] = useState(true);
  const [measuringUnit, setMeasuringUnit] = useState([]);
  const [initiative, setInitiative] = useState([]);
  const [managers, setManagers] = useState([]);
  const [add, setAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [anchorEl, setAnchorEl] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetForm, setResetForm] = useState(false);

  const [search, setSearch] = useState('');
  const [importExcel, setImportExcel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  console.log('data', data);
  console.log('initiative', initiative[0]);
  console.log('measuringUnit', measuringUnit[0]);

  const AddUnitOptions = ['Add Main Activity', 'Import From Excel'];
  const templateUrl = ExcelTemplates.unit_data;

  const handleClose = () => {
    setAnchorEl(false);
    setSelectedActivity(null);
  };

  const handleSearchFieldChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPagination({ ...pagination, page: 0 });
  };

  const handleFetchingMeasuringUnit = async () => {
    setUnitLoading(true);
    const token = await GetToken();
    const Api = Backend.api + Backend.measuringUnits;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setUnitLoading(false);
          setMeasuringUnit(response.data);
        } else {
          setUnitLoading(false);
        }
      })
      .catch((error) => {
        setUnitLoading(false);
        toast(error.message);
      });
  };
  const handleFetchingInitiative = async () => {
    setUnitLoading(true);
    const token = await GetToken();
    const Api = Backend.api + Backend.initiatives;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setUnitLoading(false);
          console.log('response ini', response);
          setInitiative(response.data.data);
        } else {
          setUnitLoading(false);
        }
      })
      .catch((error) => {
        setUnitLoading(false);
        toast(error.message);
      });
  };
  const handleFetchingManagers = async () => {
    const token = await GetToken();
    const Api = Backend.api + Backend.employees + `?role=manager`;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
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


  const handleMainActivityClick = () => {
    setAdd(true);
    handleFetchingMeasuringUnit();
    handleFetchingInitiative();
    handleFetchingManagers();
  };

  const handleUnitModalClose = () => {
    setAdd(false);

  };

  const handleMainActivityAddition = async (value) => {
    setIsAdding(true);
    const token = await GetToken();
    const Api = Backend.api + Backend.MainActivities + `?fiscal_year_id=${selectedYear?.id}`;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const data = {
      initiative_id: value?.initiative_id,
      type: value?.type,
      title: value?.title,
      weight: value?.weight,
      measuring_unit_id: value?.measuring_unit_id,
      target: value?.target,
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
          toast.success(response.data.message);
          handleFetchingMainActivities();

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


  const handleEditingActivity = async (value) => {
    setIsAdding(true);
    const token = await GetToken();
    const Api =
      Backend.api + Backend.mainActivities + `/` + selectedActivity?.id;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const data = {
      initiative_id: value?.initiative_id,
      type: value?.type,
      title: value?.title,
      weight: value?.weight,
      measuring_unit_id: value?.measuring_unit_id,
      target: value?.target,
    };

    fetch(Api, {
      method: 'PATCH',
      headers: header,
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          handleEditModalClose();
          toast.success(response.data.message);
          handleFetchingMainActivities();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setIsAdding(false);
      });
  };

  const handleChangePage = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination((prev) => ({
      ...prev,
      per_page: parseInt(event.target.value, 10),
      page: 0,
    }));
  };


  const handleEdit = (unit) => {
    setSelectedActivity(unit);

    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedActivity(null);
  };

  const handleDelete = async (id) => {
    try {
      const token = await GetToken();
      const Api = `${Backend.api}${Backend.MainActivities}/${id}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete');
      }

      if (data.success) {
        toast.success('Deleted successfully');
        handleFetchingMainActivities();
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      toast.error(`Error deleting: ${error.message}`);
    }
  };

  const handleFetchingMainActivities = async () => {
    if (!selectedYear?.id) {
      console.error("❌ No fiscal year selected. SelectedYear:", selectedYear);
      toast.error("Please select a fiscal year");
      setData([]); // Clear data if no year selected
      return;
    }

    console.log("📍 Selected Year ID:", selectedYear?.id);

    try {
      setLoading(true);
      setData([]); // Clear previous data to avoid stale state
      const token = await GetToken();
      console.log("📍 Token:", token ? token : "Missing");

      const queryParams = new URLSearchParams({
        fiscal_year_id: selectedYear?.id.trim(), // Trim to avoid whitespace
        page: pagination.page + 1,
        per_page: pagination.per_page,
        ...(search && { search }), // Include search if present
      });

      const apiUrl = `${Backend.api.replace(/\/$/, '')}/${Backend.mainActivities.replace(/^\//, '')}?${queryParams.toString()}`;
      console.log("📡 API URL:", apiUrl);
      console.log("📍 Request Headers:", {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      });

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Prevent caching
        },
      });

      console.log("📍 Response Status:", response.status, response.ok);
      const json = await response.json();
      console.log("✅ API Response:", JSON.stringify(json, null, 2));

      if (response.ok && json.success) {
        const paginationData = json.data;
        const receivedData = paginationData?.data || paginationData?.activities || paginationData?.results || [];
        console.log("📊 Data Received:", receivedData);
        setData(receivedData); // Update state
        setPagination((prev) => ({
          ...prev,
          page: paginationData.current_page - 1,
          per_page: paginationData.per_page,
          total: paginationData.total,
          last_page: paginationData.last_page,
        }));
        setError(false);
      } else {
        console.error("❌ Fetch failed:", json.message || "No message provided", "Status:", response.status);
        toast.error(json.message || "Failed to fetch main activities");
        setError(true);
        setData([]); // Clear data on error
      }
    } catch (error) {
      console.error("❌ Fetch Error:", error.message);
      toast.error(error.message || "Something went wrong");
      setError(true);
      setData([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when fiscal year, pagination, or search changes
  useEffect(() => {
    console.log("📍 useEffect Triggered:", {
      selectedYearId: selectedYear?.id,
      page: pagination.page,
      per_page: pagination.per_page,
      search,
    });
    handleFetchingMainActivities();
  }, [selectedYear?.id, pagination.page, pagination.per_page, search]);

  // Debug state updates
  useEffect(() => {
    console.log("📍 Updated Data State:", data);
  }, [data]);
  const handleUpload = async (file) => {
    const token = localStorage.getItem('token');
    const Api = Backend.api + Backend.mainactivityexcel;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    };

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(Api, formData, {
        headers: headers,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percent);
        },
      });

      if (response.success) {
        toast.success(response.data.data.message);
      } else {
        toast.success(response.data.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUnitAdd = (index) => {
    if (index === 0) {
      handleMainActivityClick();
    } else if (index === 1) {
      handleOpenDialog();
    } else {
      alert('We will be implement importing from odoo');
    }
  };

  const handleOpenDialog = () => {
    setImportExcel(true);
  };

  const handleCloseDialog = () => {
    setImportExcel(false);
  };



  useEffect(() => {
    handleFetchingMeasuringUnit();
    handleFetchingInitiative();
    handleFetchingManagers();
  }, []);

  return (
    <PageContainer
      maxWidth="100%"
      title={'Main Activities'}
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
          {hasPermission('create:mainactivity') && (
            <SplitButton
              options={AddUnitOptions}
              handleSelection={(value) => handleUnitAdd(value)}
            />
          )}
        </Box>
      }
    >
      <Grid
        container
        sx={{
          borderRadius: 2,
          marginTop: 2,
        }}
      >
        <Grid
          container
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Grid xs={12}>
            {loading ? (
              <Box
                sx={{
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator size={20} />
              </Box>
            ) : error ? (
              <Fallbacks
                severity="error"
                title="Server error"
                description="There is error fetching units"
              />
            ) : data?.length === 0 ? (
              <Fallbacks
                severity="department"
                title="Unit not found"
                description="The list of added units will be listed here"
                sx={{ paddingTop: 6 }}
              />
            ) : (
              <React.Fragment>
                <MainActivityTable
                  units={data}
                  onDelete={handleDelete}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  pagination={pagination}
                  onEdit={handleEdit}
                />
                <TablePagination
                  component="div"
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  count={pagination.total}
                  rowsPerPage={pagination.per_page}
                  page={pagination.page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </React.Fragment>
            )}
          </Grid>
        </Grid>
      </Grid>

      <AddMainActivity
        add={add}
        isAdding={isAdding}
        measuringUnits={measuringUnit}
        managers={managers}
        initiative={initiative}
        onClose={handleUnitModalClose}
        handleSubmission={(value) => handleMainActivityAddition(value)}
      />
      <ToastContainer />
      {selectedActivity && (
        <EditMainActivity
          edit={editModalOpen}
          measuringUnits={measuringUnit}
          initiatives={initiative}
          selectedActivity={selectedActivity}
          isEditing={isAdding}
          onClose={handleEditModalClose}
          handleSubmission={handleEditingActivity}
        />
      )}

      <UploadFile
        open={importExcel}
        onClose={handleCloseDialog}
        onUpload={handleUpload}
        uploadProgress={uploadProgress}
        onRemove={() => setUploadProgress(0)}
        templateUrl={templateUrl}
      />
    </PageContainer>
  );
};

export default MainActivities;
