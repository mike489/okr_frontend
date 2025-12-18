import { useEffect, useState } from 'react';
import PageContainer from 'ui-component/MainPage';
import Search from 'ui-component/search';
import {
  Badge,
  Box,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import Backend from 'services/backend';
import { AddEmployee } from './components/AddEmployee';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { DotMenu } from 'ui-component/menu/DotMenu';
import SplitButton from 'ui-component/buttons/SplitButton';
import UpdateEmployee from './components/UpdateEmployee';
import DeletePrompt from 'ui-component/modal/DeletePrompt';
import UploadFile from 'ui-component/modal/UploadFile';
import axios from 'axios';
import GetToken from 'utils/auth-token';
import hasPermission from 'utils/auth/hasPermission';
import {
  IconAdjustments,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { ExcelTemplates } from 'configration/templates';
import RightSlideIn from 'ui-component/modal/RightSlideIn';
// import FilterEmployees from './components/FilterEmployeeForm';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';

const AddEmployeeOptions = ['Add Employee', 'Import From Excel'];
const templateUrl = ExcelTemplates.employee_data;

const Employees = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    perPage: 10,
    last_page: 0,
    total: 0,
  });

  const [add, setAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [update, setUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteUser, setDeleteUser] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [importExcel, setImportExcel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  //  ------------ FILTER EMPLOYEES ----------- START -------
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);

  const initialFilterState = {
    id: 'asc',
    name: 'asc',
    gender: 'All',
    unit: 'All',
    job_position: 'All',
    sort_by: '',
    sort_order: '',
    eligibility: 'All',
    created_at: 'asc',
  };

  const [filters, setFilters] = useState(initialFilterState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSorting = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      sort_by: name,
      sort_order: value,
    }));
  };

  const handleReset = () => {
    setFilters({
      id: 'Asc',
      name: 'Asc',
      gender: 'All',
      unit: 'All',
      job_position: 'All',
      eligibility: 'All',
      sort_by: '',
      sort_order: '',
      created_at: 'Asc',
    });
  };

  const handleOpeningFilterModal = () => {
    setOpenFilterModal(true);
  };

  const handleClosingFilterModal = () => {
    setOpenFilterModal(false);
  };

  useEffect(() => {
    const isFilterApplied = Object.keys(initialFilterState).some(
      (key) => filters[key] !== initialFilterState[key],
    );

    setFilterApplied(isFilterApplied);
  }, [filters]);

  //  ------------ FILTER EMPLOYEES ----------- END -------

  const handleOpenDialog = () => {
    setImportExcel(true);
  };

  const handleCloseDialog = () => {
    setImportExcel(false);
  };

  const handleUpload = async (file) => {
    const token = localStorage.getItem('token');
    const Api = Backend.api + Backend.employeeExcel;
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

  const handleAddEmployeeModal = () => {
    setAdd(true);
  };

  const handleAddEmployeeClose = () => {
    setAdd(false);
  };

  const handleEmployeeUpdate = (employee) => {
    setSelectedRow(employee);
    setUpdate(true);
  };

  const handleUpdateEmployeeClose = () => {
    setUpdate(false);
  };

  const handleSearchFieldChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPagination({ ...pagination, page: 0 });
  };

  const handleEmployeeAdd = (index) => {
    if (index === 0) {
      handleAddEmployeeModal();
    } else if (index === 1) {
      handleOpenDialog();
    } else {
      alert('We will be implement importing from odoo');
    }
  };

  const handleEmployeeAddition = async (employeeData) => {
    setIsAdding(true);

    try {
      const token = await GetToken();
      const apiUrl = Backend.pmsUrl('employees');

      const headers = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      // Prepare the payload according to the new structure
      const payload = {
        employee_code: employeeData.employee_code,
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        gender: employeeData.gender,
        unit_id: employeeData.unit_id,
        supervisor_id: employeeData.supervisor_id || null,
        job_position_id: employeeData.job_position_id,
        address: employeeData.address,
        date_of_birth: employeeData.date_of_birth,
        started_date: employeeData.start_date,
        roles: employeeData.roles || [],
      };

      console.log('Adding employee with payload:', payload);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Employee added successfully');
        handleAddEmployeeClose();
        handleFetchingEmployees(); // Refresh the employee list
      } else {
        toast.error(data.message || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error(error.message || 'Failed to add employee');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdatingEmployees = (value, roles) => {
    setIsUpdating(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authorization token is missing.');
      setIsUpdating(false);
      return;
    }

    const Api = Backend.api + Backend.employees + `/${selectedRow?.id || ''}`;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const data = {
      name: value?.name,
      id: value?.id,
      phone: value?.phone,
      unit_id: value?.unit,
      roles: roles,
      started_date: value?.start_date,
    };

    console.log('Updating employee with data:', data); // Debug log

    fetch(Api, {
      method: 'PATCH',
      headers: header,
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setIsUpdating(false);
          handleUpdateEmployeeClose();
          handleFetchingEmployees();
          toast.success(response.data.message);
        } else {
          setIsUpdating(false);
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setIsUpdating(false);
        toast.error(error.message);
      });
  };

  const handleRemoveEmployee = (employee) => {
    setSelectedRow(employee);
    setDeleteUser(true);
  };

  const handleDeleteEmployee = () => {
    setDeleting(true);
    const token = localStorage.getItem('token');
    const Api = Backend.api + Backend.employees + '/' + selectedRow.id;

    const headers = {
      Authorization: `Bearer` + token,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'DELETE',
      headers: headers,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setDeleting(false);
          setDeleteUser(false);
          toast.success(response.data.message);

          handleFetchingEmployees();
        } else {
          setDeleting(false);
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setDeleting(false);
        toast.error(error.message);
      });
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, perPage: event.target.value });
  };

  const handleFetchingEmployees = async () => {
    setLoading(true);
    const token = await GetToken();

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: pagination.page + 1,
      per_page: pagination.perPage,
      search: search,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      gender: filters.gender === 'All' ? '' : filters.gender,
      unit_id: filters.unit === 'All' ? '' : filters.unit,
      job_position_id:
        filters.job_position === 'All' ? '' : filters.job_position,
      is_eligible:
        filters.eligibility === 'All'
          ? ''
          : filters.eligibility === 'Eligible'
            ? '1'
            : '0',
    }).toString();

    const apiUrl = Backend.pmsUrl(`employees?${queryParams}`);

    const headers = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Make sure to access the correct data path
        setData(data.data?.data || []);
        setPagination({
          ...pagination,
          last_page: data.data.last_page,
          total: data.data.total,
        });
      } else {
        toast.warning(data.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.warning(error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleFetchingEmployees();
    }, 800);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [search]);

  useEffect(() => {
    if (mounted) {
      handleFetchingEmployees();
    } else {
      setMounted(true);
    }

    return () => {};
  }, [pagination.page, pagination.perPage, filters]);

  return (
    <PageContainer
      title="Employees"
      searchField={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Search
            title="Filter Employees"
            value={search}
            onChange={(event) => handleSearchFieldChange(event)}
            filter={false}
          />

          <IconButton
            sx={{ ml: 1.2, p: 1.2, backgroundColor: 'grey.50' }}
            onClick={() => handleOpeningFilterModal()}
          >
            <IconAdjustments size="1.4rem" stroke="1.8" />
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                display: filterApplied ? 'flex' : 'none',
                position: 'absolute',
                top: 12,
                right: 11,
              }}
              badgeContent={
                <Box
                  sx={{
                    position: 'relative',
                    width: 5,
                    height: 5,
                    ml: 0.6,
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    animation: 'pulse 4s infinite ease-out',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                      '50%': {
                        transform: 'scale(1.4)',
                        opacity: 0.6,
                      },
                      '100%': {
                        transform: 'scale(1)',
                        opacity: 0.8,
                      },
                    },
                  }}
                />
              }
            />
          </IconButton>
        </Box>
      }
      rightOption={
        hasPermission('create_employee') && (
          <SplitButton
            options={AddEmployeeOptions}
            handleSelection={(value) => handleEmployeeAdd(value)}
          />
        )
      }
    >
      <Grid container padding={2}>
        <Grid item xs={12}>
          <TableContainer
            sx={{
              minHeight: '66dvh',
              border: 0.4,
              borderColor: theme.palette.divider,
              borderRadius: 2,
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="Employees table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      User ID
                      <IconButton
                        sx={{ ml: 1 }}
                        onClick={() =>
                          handleSorting(
                            'id',
                            filters.id === 'asc' ? 'desc' : 'asc',
                          )
                        }
                        title={
                          filters.id === 'desc'
                            ? 'Descending order'
                            : 'Ascending order'
                        }
                      >
                        {filters.id === 'asc' ? (
                          <IconSortAscending size="1.1rem" />
                        ) : (
                          <IconSortDescending size="1.1rem" />
                        )}
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Name{' '}
                      <IconButton
                        sx={{ ml: 1 }}
                        onClick={() =>
                          handleSorting(
                            'name',
                            filters.name === 'asc' ? 'desc' : 'asc',
                          )
                        }
                        title={
                          filters.name === 'desc'
                            ? 'Descending order'
                            : 'Ascending order'
                        }
                      >
                        {filters.name === 'asc' ? (
                          <IconSortAscending size="1.1rem" />
                        ) : (
                          <IconSortDescending size="1.1rem" />
                        )}
                      </IconButton>
                    </Box>
                  </TableCell>
                  {/* <TableCell>Gender</TableCell> */}
                  <TableCell>Phone</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Position</TableCell>
                  {/* <TableCell>Eligibility</TableCell> */}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow sx={{ justifyContent: 'center', padding: 4 }}>
                    <TableCell
                      sx={{ justifyContent: 'center', border: 0 }}
                      colSpan={8}
                    >
                      <ActivityIndicator size={20} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow sx={{ padding: 4 }}>
                    <TableCell colSpan={7} sx={{ border: 0 }}>
                      <Typography variant="body2">
                        There is error fetching the Employees
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : data?.length === 0 ? (
                  <TableRow
                    sx={{
                      padding: 4,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <TableCell colSpan={7} sx={{ border: 0 }}>
                      <Typography variant="body2">
                        Employee not found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.map((employee, index) => (
                    <TableRow
                      key={employee.id}
                      sx={{
                        backgroundColor:
                          selectedRow == index
                            ? theme.palette.grey[100]
                            : theme.palette.background.default,
                        ':hover': {
                          backgroundColor: theme.palette.grey[100],
                          color: theme.palette.background.default,
                          cursor: 'pointer',
                          borderRadius: 2,
                        },
                      }}
                      onClick={() =>
                        navigate('/employees/view', { state: employee })
                      }
                    >
                      <TableCell sx={{ border: 0 }}>
                        {employee?.user?.username || 'N/A'}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          border: 0,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          color={theme.palette.text.primary}
                        >
                          {employee?.full_name || employee?.user?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        {employee?.phone || employee?.user?.phone || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        {employee?.unit || employee?.user?.unit?.name || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        {employee?.job_position?.name || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        <DotMenu
                          onEdit={
                            hasPermission('update:employee')
                              ? () => handleEmployeeUpdate(employee)
                              : null
                          }
                          onDelete={
                            hasPermission('delete:employee')
                              ? () => handleRemoveEmployee(employee)
                              : null
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {pagination.total > 0 && (
            <TablePagination
              component="div"
              rowsPerPageOptions={[10, 25, 50, 100]}
              count={pagination.total}
              rowsPerPage={pagination.perPage}
              page={pagination.page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Grid>
      </Grid>

      <AddEmployee
        add={add}
        isAdding={isAdding}
        onClose={handleAddEmployeeClose}
        handleSubmission={(value, role) => handleEmployeeAddition(value, role)}
      />

      {selectedRow && (
        <UpdateEmployee
          update={update}
          isUpdating={isUpdating}
          EmployeeData={selectedRow}
          onClose={() => handleUpdateEmployeeClose()}
          handleSubmission={(value, roles) =>
            handleUpdatingEmployees(value, roles)
          }
        />
      )}

      {deleteUser && (
        <DeletePrompt
          type="Delete"
          open={deleteUser}
          title="Removing Employee"
          description={
            `Are you sure you want to remove ` + selectedRow?.user?.name
          }
          onNo={() => setDeleteUser(false)}
          onYes={() => handleDeleteEmployee()}
          deleting={deleting}
          handleClose={() => setDeleteUser(false)}
        />
      )}

      <UploadFile
        open={importExcel}
        onClose={handleCloseDialog}
        onUpload={(file) => handleUpload(file)}
        uploadProgress={uploadProgress}
        onRemove={() => setUploadProgress(0)}
        templateUrl={templateUrl}
      />

      <RightSlideIn
        title="Filter Employees"
        open={openFilterModal}
        handleClose={handleClosingFilterModal}
      >
        {/* <FilterEmployees
          filters={filters}
          onInputChange={handleChange}
          onReset={handleReset}
          onSort={(name, value) => handleSorting(name, value)}
        /> */}
      </RightSlideIn>

      <ToastContainer />
    </PageContainer>
  );
};

export default Employees;
