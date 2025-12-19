import React, { useEffect, useState } from 'react';
import { Box, Grid, TablePagination } from '@mui/material';
// import CreateObjective from './components/CreateObjective'; /
import { toast, ToastContainer } from 'react-toastify';
import { gridSpacing } from 'store/constant';
// import { UpdateObjective } from './components/UpdateObjective'; \
import { useKPI } from 'context/KPIProvider';
import { useSelector } from 'react-redux';
import Backend from 'services/backend';
import PageContainer from 'ui-component/MainPage';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import ErrorPrompt from 'utils/components/ErrorPrompt';
import Fallbacks from 'utils/components/Fallbacks';
import DeletePrompt from 'ui-component/modal/DeletePrompt';
import GetToken from 'utils/auth-token';
import Search from 'ui-component/search';
import hasPermission from 'utils/auth/hasPermission';
import SplitButton from 'ui-component/buttons/SplitButton';
// import ObjectiveList from './components/ObjectiveList'; // Renamed
import * as Yup from 'yup';
import ObjectiveList from './ObjectiveList';
import CreatePlan from './components/CreatePlancopy';

const Plan = () => {
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  console.log('selectedYear', selectedYear);
  const { handleUpdateObjective } = useKPI();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(false);
  const [units, setUnits] = useState([]);
  const [create, setCreate] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [update, setUpdate] = useState(false);
  const [selectedObjectiveID, setSelectedObjectiveID] = useState(null);
  const [deleteObjective, setDeleteObjective] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [keyResults, setKeyResults] = useState([]);
  const [keyResultModal, setKeyResultModal] = useState(false);
  const [selectedObjectiveForKR, setSelectedObjectiveForKR] = useState(null);
  const [isCreatingKR, setIsCreatingKR] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
  });

  const handleSearchFieldChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPagination({ ...pagination, page: 0 });
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, per_page: event.target.value, page: 0 });
  };

  const handleCreateObjective = () => {
    setCreate(true);
  };

  const handleCreateModalClose = () => {
    setCreate(false);
  };

  const handleUpdateModalClose = () => {
    handleUpdateObjective([]);
    setUpdate(false);
    setSelectedObjectiveID(null);
  };

  // const handleObjectiveAddition = async (value) => {
  //   setIsCreating(true);
  //   const token = await GetToken();
  //   const Api = Backend.api + Backend.okrAssignmentDistribute;

  //   const header = {
  //     Authorization: `Bearer ${token}`,
  //     accept: 'application/json',
  //     'Content-Type': 'application/json',
  //   };

  //   try {
  //     const data = {
  //       plans: value.plans,
  //       unit_id: value.unit_id,
  //     };

  //     console.log('Sending payload:', JSON.stringify(data, null, 2)); // Debug

  //     const response = await fetch(Api, {
  //       method: 'POST',
  //       headers: header,
  //       body: JSON.stringify(data),
  //     }).then((res) => res.json());

  //     if (response?.success) {
  //       toast.success(response?.data?.message || 'Plan created successfully.');
  //       handleCreateModalClose();
  //     } else {
  //       toast.error(response?.data?.message || 'Failed to create plan.');
  //     }
  //   } catch (error) {
  //     toast.error(error.message || 'An unexpected error occurred.');
  //   } finally {
  //     setIsCreating(false);
  //   }
  // };

  const handleObjectiveAddition = async (value) => {
    setIsCreating(true);
    const token = await GetToken();
    const Api = Backend.pmsUrl(Backend.okrDistribute);

    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    try {
      // Validate that a fiscal year is selected
      if (!selectedYear?.id) {
        toast.error(
          'Please select a fiscal year before distributing objectives',
        );
        setIsCreating(false);
        return;
      }

      const data = {
        assigned_to: value.unit_id,
        key_results: value.plans.map((plan) => ({
          id: plan.id,
          objective_name: plan.objective_name,
          months: plan.months.map((month) => ({
            month_name: month.month_name,
            target: month.target,
          })),
        })),
        notes: value.notes || 'Increase sales by 10%',
        fiscal_year_id: selectedYear.id, // Add fiscal year ID to the payload
        fiscal_year_name: selectedYear.year, // Optional: Add fiscal year name for reference
      };

      console.log('Sending payload:', JSON.stringify(data, null, 2));

      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (response?.success) {
        toast.success(
          response?.data?.message ||
            `Objective assigned successfully for ${selectedYear.year}.`,
        );
        handleCreateModalClose();
        handleFetchingObjectives(); // Refresh the list
      } else {
        // Check if error is related to fiscal year
        const errorMessage =
          response?.data?.message || 'Failed to assign objective.';

        if (
          errorMessage.toLowerCase().includes('fiscal') ||
          errorMessage.toLowerCase().includes('year')
        ) {
          toast.error(`Fiscal year error: ${errorMessage}`);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error in objective addition:', error);
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleFetchingUnits = async () => {
    const token = await GetToken();
    const Api =
      Backend.pmsUrl(Backend.myUnits) +
      `?page=${pagination.page + 1}&per_page=${pagination.per_page}&search=${search}`;

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
          // Fix: Extract the data array from the paginated response
          setUnits(response.data.data || []); // Changed from response.data to response.data.data
        }
      })
      .catch((error) => {
        toast.warning(error.message);
      });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = await GetToken();
      const Api =
        Backend.api + Backend.deleteObjective + `/${selectedObjective?.id}`;
      fetch(Api, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.success) {
            setDeleteObjective(false);
            toast.success(response.data.message);
            handleFetchingObjectives();
          } else {
            toast.info(response.data.message);
          }
        });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleObjectiveAdd = (index) => {
    if (index === 0) {
      handleCreateObjective();
    } else if (index === 1) {
      // Import from Excel functionality
    }
  };

  // UPDATED: Fetch objectives instead of plans
  // const handleFetchingObjectives = async () => {
  //   try {
  //     setLoading(true);
  //     const token = await GetToken();

  //     const queryParams = new URLSearchParams({
  //       page: pagination.page + 1,
  //       per_page: pagination.per_page,
  //     });

  //     // if (selectedYear?.id) {
  //     //   queryParams.append('fiscal_year_id', selectedYear.id);
  //     // }

  //     // Changed from Backend.myPlansPaginated to Backend.objectives
  //     const Api = `${Backend.api}${Backend.objectives}?${queryParams.toString()}`;
  //     console.log('📡 Fetching objectives with URL:', Api);

  //     const res = await fetch(Api, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     const response = await res.json();
  //     console.log('✅ API Response:', response);

  //     if (response.success && response.data) {
  //       const paginationData = response.data;
  //       setData(paginationData.data || []);
  //       setPagination((prev) => ({
  //         ...prev,
  //         page: paginationData.current_page - 1,
  //         per_page: paginationData.per_page,
  //         total: paginationData.total || 0,
  //       }));
  //       setError(false);
  //     } else {
  //       toast.warning(response?.data?.message || 'Failed to fetch objectives');
  //       setError(false);
  //     }
  //   } catch (error) {
  //     console.error('❌ Fetch Error:', error);
  //     toast.warning(error.message);
  //     setError(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleFetchingObjectives = async () => {
    try {
      setLoading(true);
      const token = await GetToken();

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.page + 1,
        per_page: pagination.per_page,
      });

      if (search) {
        queryParams.append('search', search);
      }

      if (selectedYear?.id) {
        queryParams.append('fiscal_year_id', selectedYear.id);
      }

      const Api = `${Backend.pmsUrl(Backend.myObjectives)}?${queryParams.toString()}`;
      console.log('📡 Fetching objectives with URL:', Api);

      const res = await fetch(Api, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const response = await res.json();
      console.log('✅ API Response:', response);

      if (response.success && response.data) {
        const paginationData = response.data;

        // Handle different response structures
        const objectivesData = paginationData.data || paginationData || [];

        setData(Array.isArray(objectivesData) ? objectivesData : []);
        setPagination((prev) => ({
          ...prev,
          page: (paginationData.current_page || 1) - 1,
          per_page: paginationData.per_page || prev.per_page,
          total: paginationData.total || objectivesData.length || 0,
          last_page: paginationData.last_page || 1,
        }));
        setError(false);
      } else {
        toast.warning(response?.message || 'Failed to fetch objectives');
        setData([]);
        setError(false);
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      toast.error(error.message || 'Failed to fetch objectives');
      setError(true);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchKeyResults = async () => {
    // if (!selectedObjective) return setKeyResults([]);
    setLoading(true);
    try {
      const token = await GetToken();
      const params = new URLSearchParams({
        page: pagination.page + 1,
        per_page: pagination.per_page,
      });
      if (search) params.append('search', search);
      const res = await fetch(
        Backend.pmsUrl(Backend.keyResults) + '?' + params.toString(),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setKeyResults(data.data.data || []);
        setPagination((prev) => ({
          ...prev,
          last_page: data.data.last_page,
          total: data.data.total,
        }));
      } else toast.error(data.message || 'Failed to load key results');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKeyResult = async (values) => {
    setIsCreatingKR(true);
    const token = await GetToken();
    const Api = Backend.pmsUrl(Backend.keyResults);

    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    try {
      // Prepare payload based on your API requirements
      const payload = {
        objective_id: values.objective_id,
        name: values.name,
        metric_unit: values.metric_unit,
        target_type: values.target_type,
        start_value: parseFloat(values.start_value),
        current_value: parseFloat(values.current_value),
        target_value: parseFloat(values.target_value),
        weight: parseFloat(values.weight),
        confidence: 5, // Default value, adjust as needed
        calc_method: 'manual', // Default value, adjust as needed
      };

      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(payload),
      }).then((res) => res.json());

      if (response?.success) {
        toast.success('Key Result created successfully!');
        handleKeyResultModalClose();
        handleFetchingObjectives(); // Refresh objectives to show new key result
      } else {
        toast.error(response?.message || 'Failed to create key result.');
      }
    } catch (error) {
      console.error('Error creating key result:', error);
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsCreatingKR(false);
    }
  };

  // Add this function to close the modal
  const handleKeyResultModalClose = () => {
    setKeyResultModal(false);
    setSelectedObjectiveForKR(null);
  };

  // Add this function to open the modal
  const handleOpenKeyResultModal = (objective) => {
    setSelectedObjectiveForKR(objective);
    setKeyResultModal(true);
  };

  useEffect(() => {
    if (selectedYear?.id) {
      handleFetchingObjectives();
    }
    handleFetchingObjectives();
    handleFetchingUnits();
    handleFetchKeyResults();
  }, [selectedYear?.id, pagination.page, pagination.per_page]);

  // Filter data based on search
  const filteredData = data.filter((objective) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      objective.title?.toLowerCase().includes(searchLower) ||
      objective.description?.toLowerCase().includes(searchLower) ||
      objective.type?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <PageContainer
      title={'My Objectives'}
      searchField={
        <Search
          value={search}
          onChange={(event) => handleSearchFieldChange(event)}
        />
      }
      rightOption={
        // hasPermission('create:objective') && (
        <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
          <SplitButton
            options={['Distribute']}
            handleSelection={(value) => handleObjectiveAdd(value)}
          />
        </Box>
        // )
      }
    >
      {loading ? (
        <Grid container>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
            }}
          >
            <ActivityIndicator size={20} />
          </Grid>
        </Grid>
      ) : error ? (
        <Fallbacks
          title="Data not found"
          description="Unable to find objectives"
        />
      ) : filteredData?.length === 0 ? (
        <Fallbacks
          severity="Objectives"
          title="No objectives found"
          description="The list of objectives will be displayed here"
          sx={{ paddingTop: 6 }}
        />
      ) : (
        <Grid
          container
          sx={{
            marginTop: 2,
            paddingRight: { xs: 2, md: 0 },
            paddingBottom: { xs: 4, md: 4 },
          }}
          spacing={gridSpacing}
        >
          <Grid container>
            <ObjectiveList
              data={filteredData}
              onEdit={(objective) => {
                setSelectedObjectiveID(objective.id);
                setUpdate(true);
              }}
              onDelete={(objective) => {
                setSelectedObjective(objective);
                setDeleteObjective(true);
              }}
              onAddKeyResult={(objective) => {
                setSelectedObjectiveForKR(objective);
                setKeyResultModal(true);
              }}
              onRefresh={() => handleFetchingObjectives()}
            />
          </Grid>
        </Grid>
      )}

      <TablePagination
        component="div"
        rowsPerPageOptions={[10, 25, 50, 100]}
        count={pagination.total}
        rowsPerPage={pagination.per_page}
        page={pagination.page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Objectives per page"
      />

      <CreatePlan
        create={create}
        isCreating={isCreating}
        unit={units.data || []}
        keyResults={keyResults}
        // activities={data}
        fiscalYearId={selectedYear?.id}
        onClose={handleCreateModalClose}
        handleSubmission={(value) => handleObjectiveAddition(value)}
      />

      {/* {selectedObjectiveID && (
        <UpdateObjective
          add={update}
          objective_id={selectedObjectiveID}
          onClose={handleUpdateModalClose}
          onSucceed={() => handleFetchingObjectives()}
          isUpdate={true}
        />
      )} */}
      {deleteObjective && (
        <DeletePrompt
          type="Delete"
          open={deleteObjective}
          title="Deleting Objective"
          description={`Are you sure you want to delete "${selectedObjective?.title}"?`}
          onNo={() => setDeleteObjective(false)}
          onYes={() => handleDelete()}
          deleting={deleting}
          handleClose={() => setDeleteObjective(false)}
        />
      )}
      <ToastContainer />
    </PageContainer>
  );
};

export default Plan;
