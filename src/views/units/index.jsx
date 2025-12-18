import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  Grid,
  Typography,
  useTheme,
  CardContent,
  TablePagination,
} from '@mui/material';
import { DotMenu } from 'ui-component/menu/DotMenu';
import { ExcelTemplates } from 'configration/templates';
import { toast, ToastContainer } from 'react-toastify';
import Backend from 'services/backend';
import Fallbacks from 'utils/components/Fallbacks';
import Search from 'ui-component/search';
import AddUnitType from './components/AddUnitType';
import AddUnit from './components/AddUnit';
import PageContainer from 'ui-component/MainPage';
import UnitsTable from './components/UnitsTable';
import EditUnit from './components/EditUnit';
import EditUnitType from './components/EditUnitType';
import GetToken from 'utils/auth-token';
import DrogaCard from 'ui-component/cards/DrogaCard';
import SplitButton from 'ui-component/buttons/SplitButton';
import UploadFile from 'ui-component/modal/UploadFile';
import axios from 'axios';
import hasPermission from 'utils/auth/hasPermission';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import SelectorMenu from 'ui-component/menu/SelectorMenu';

const Units = () => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    last_page: 0,
    total: 0,
  });
  const [unitLoading, setUnitLoading] = useState(true);
  const [unitType, setUnitType] = useState([]);
  const [managers, setManagers] = useState([]);
  const [add, setAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [anchorEl, setAnchorEl] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUnitTypeModalOpen, setEditUnitTypeModalOpen] = useState(false);
  const [selectedUnitType, setSelectedUnitType] = useState(null);
  const [search, setSearch] = useState('');
  const [importExcel, setImportExcel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const AddUnitOptions = ['Add Unit', 'Import From Excel'];
  const templateUrl = ExcelTemplates.unit_data;

  const handleClick = (unitType) => {
    setSelectedUnitType(unitType);
  };

  const handleClose = () => {
    setAnchorEl(false);
    setSelectedUnit(null);
  };

  const handleSearchFieldChange = (event) => {
    setSearch(event.target.value);
    setPagination({ ...pagination, page: 0 });
  };

  const handleFetchingTypes = async () => {
    setUnitLoading(true);
    try {
      const token = await GetToken();
      const Api = Backend.pmsUrl(Backend.types);
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'GET', headers: header });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setUnitType(
        data.success
          ? data.data.data
          : Array.isArray(data.data)
            ? data.data
            : [],
      );
      setUnitLoading(false);
    } catch (error) {
      toast.error(`Error fetching unit types: ${error.message}`);
      setUnitLoading(false);
    }
  };

  const handleFetchingManagers = async () => {
    try {
      const token = await GetToken();
      console.log('Token:', token);
      const Api = Backend.api + Backend.getManagers;
      console.log('Fetching managers from:', Api);
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'GET', headers: header });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Managers response:', data);
      setManagers(data.success ? data.data : Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(`Error fetching managers: ${error.message}`);
    }
  };

  const handleAddUnitClick = () => {
    setAdd(true);
    handleFetchingTypes();
    // handleFetchingManagers();
  };

  const handleUnitModalClose = () => {
    setAdd(false);
  };

  const handleUnitAddition = async (value) => {
    setIsAdding(true);
    try {
      const token = await GetToken();
      const Api = Backend.pmsUrl(Backend.units);
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const data = {
        name: value.name,
        type: value.type,
        parent: value.parent,
        head: value.head,
        description: value.description,
      };

      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(result.data?.message || 'Unit added successfully');
        handleUnitModalClose();
        handleFetchingUnits();
      } else {
        toast.error(result.data?.message || 'Failed to add unit');
      }
    } catch (error) {
      toast.error(`Error adding unit: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditingUnit = async (values) => {
    setIsAdding(true);
    try {
      const token = await GetToken();
      const Api = `${Backend.pmsUrl(Backend.units)}/${selectedUnit.id}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const data = {
        name: values.name,
        type: values.type,
        parent: values.parent,
        head: values.head,
        description: values.description,
      };

      const response = await fetch(Api, {
        method: 'PATCH',
        headers: header,
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(result.data?.message || 'Unit updated successfully');
        handleEditModalClose();
        handleFetchingUnits();
      } else {
        toast.error(result.data?.message || 'Failed to update unit');
      }
    } catch (error) {
      toast.error(`Error updating unit: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleTypeAddition = async (value) => {
    setIsAdding(true);
    try {
      const token = await GetToken();
      const Api = Backend.pmsUrl(Backend.types);
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const data = { name: value?.name };

      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(result.message || 'Unit type added successfully');
        handleFetchingTypes();
      } else {
        toast.error(result.message || 'Failed to add unit type');
      }
    } catch (error) {
      toast.error(`Error adding unit type: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({
      ...pagination,
      per_page: parseInt(event.target.value),
      page: 0,
    });
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedUnit(null);
  };

  const handleEditUnitType = (unitType) => {
    setSelectedUnitType(unitType);
    setEditUnitTypeModalOpen(true);
    handleClose();
  };

  const handleUpdateUnitType = () => {
    handleFetchingTypes();
  };

  const handleEditUnitTypeModalClose = () => {
    setEditUnitTypeModalOpen(false);
    setSelectedUnitType(null);
  };

  const handleDelete = async (id, type = 'unit') => {
    try {
      const token = await GetToken();
      const Api = `${Backend.pmsUrl(type === 'unit' ? Backend.units : Backend.types)}/${id}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'DELETE', headers });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(
          `${type === 'unit' ? 'Unit' : 'Unit Type'} deleted successfully`,
        );
        if (type === 'unit') handleFetchingUnits();
        else handleFetchingTypes();
        handleClose();
      } else {
        toast.error(data.message || `Failed to delete ${type}`);
      }
    } catch (error) {
      toast.error(
        `Error deleting ${type === 'unit' ? 'unit' : 'unit type'}: ${error.message}`,
      );
    }
  };

  const handleFetchingUnits = async () => {
    setLoading(true);
    try {
      const token = await GetToken();
      const Api = `${Backend.pmsUrl(Backend.units)}?page=${pagination.page + 1}&per_page=${pagination.per_page}&search=${search}`;

      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'GET', headers: header });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setData(data.data.data.data);
        setPagination({
          ...pagination,
          last_page: data.data.data.last_page,
          total: data.data.data.total,
        });
        setError(false);
      } else {
        setError(true);
      }
    } catch (error) {
      toast.error(`Error fetching units: ${error.message}`);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      const token = await GetToken();
      const Api = Backend.pmsUrl(Backend.unitexcel);
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      };
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(Api, formData, {
        headers,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percent);
        },
      });
      toast.success(
        response.data?.data?.message || 'File uploaded successfully',
      );
    } catch (error) {
      toast.error(`Error uploading file: ${error.message}`);
    }
  };

  const handleUnitAdd = (index) => {
    if (index === 0) {
      handleAddUnitClick();
    } else if (index === 1) {
      handleOpenDialog();
    } else {
      alert('We will implement importing from Odoo');
    }
  };

  const handleOpenDialog = () => {
    setImportExcel(true);
  };

  const handleCloseDialog = () => {
    setImportExcel(false);
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleFetchingUnits();
    }, 800);
    return () => clearTimeout(debounceTimeout);
  }, [search]);

  useEffect(() => {
    if (mounted) {
      handleFetchingUnits();
    } else {
      setMounted(true);
    }
  }, [pagination.page, pagination.per_page]);

  useEffect(() => {
    handleFetchingTypes();
    // handleFetchingManagers();
  }, []);

  return (
    <PageContainer
      maxWidth="lg"
      title={'Units Management'}
      searchField={
        <Search
          title="Search units"
          value={search}
          onChange={handleSearchFieldChange}
          filter={false}
        />
      }
      rightOption={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {hasPermission('create_unit') && (
            <SplitButton
              options={AddUnitOptions}
              handleSelection={handleUnitAdd}
            />
          )}
        </Box>
      }
    >
      <Grid container sx={{ borderRadius: 2, marginTop: 2 }}>
        <Grid
          container
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Grid
            xs={12}
            sm={12}
            md={8}
            lg={8}
            xl={8}
            sx={{ minHeight: '64dvh', margin: 2 }}
          >
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
            ) : data.length === 0 ? (
              <Fallbacks
                severity="department"
                title="Unit not found"
                description="The list of added units will be listed here"
                sx={{ paddingTop: 6 }}
              />
            ) : (
              <>
                <UnitsTable
                  units={data}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  pagination={pagination}
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
              </>
            )}
          </Grid>
          <Grid
            xs={12}
            sm={12}
            md={3.6}
            lg={3.6}
            xl={3.6}
            sx={{ paddingTop: 1 }}
          >
            <DrogaCard>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingX: 1.6,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
                >
                  Unit Types
                </Typography>
                {hasPermission('create_unit_type') && (
                  <AddUnitType
                    isAdding={isAdding}
                    handleSubmission={handleTypeAddition}
                  />
                )}
              </Box>
              <Divider
                sx={{
                  borderBottom: 0.4,
                  borderColor: theme.palette.divider,
                  marginY: 1,
                }}
              />
              <Box>
                {unitLoading ? (
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
                    description="There is error fetching unit type"
                  />
                ) : unitType.length === 0 ? (
                  <Fallbacks
                    severity="department"
                    title="Unit type not found"
                    description="The list of added unit types will be listed here"
                    sx={{ paddingTop: 6 }}
                  />
                ) : (
                  unitType.map((type, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingY: 0.8,
                        paddingX: 2,
                        ':hover': {
                          backgroundColor: theme.palette.grey[50],
                          borderRadius: 2,
                        },
                      }}
                    >
                      <Typography
                        variant="body1"
                        color={theme.palette.text.primary}
                        sx={{ textTransform: 'capitalize' }}
                      >
                        {type.name}
                      </Typography>
                      <DotMenu
                        orientation="vertical"
                        onOpen={() => handleClick(type)}
                        onClose={handleClose}
                        onEdit={
                          hasPermission('update_unit_type')
                            ? () => handleEditUnitType(selectedUnitType)
                            : null
                        }
                        onDelete={
                          hasPermission('delete_unit_type')
                            ? () => handleDelete(selectedUnitType.id, 'type')
                            : null
                        }
                      />
                    </Box>
                  ))
                )}
              </Box>
            </DrogaCard>
          </Grid>
        </Grid>
      </Grid>
      <AddUnit
        add={add}
        isAdding={isAdding}
        types={unitType}
        managers={managers}
        onClose={handleUnitModalClose}
        handleSubmission={handleUnitAddition}
      />
      {selectedUnit && (
        <EditUnit
          edit={editModalOpen}
          types={unitType}
          managers={managers}
          selectedUnit={selectedUnit}
          isEditing={isAdding}
          onClose={handleEditModalClose}
          handleSubmission={handleEditingUnit}
        />
      )}
      <EditUnitType
        open={editUnitTypeModalOpen}
        unitType={selectedUnitType}
        onClose={handleEditUnitTypeModalClose}
        onUpdate={handleUpdateUnitType}
      />
      <UploadFile
        open={importExcel}
        onClose={handleCloseDialog}
        onUpload={handleUpload}
        uploadProgress={uploadProgress}
        onRemove={() => setUploadProgress(0)}
        templateUrl={templateUrl}
      />
      <ToastContainer />
    </PageContainer>
  );
};

export default Units;
