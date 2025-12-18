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

  const { handleUpdateObjective } = useKPI(); // Changed

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(false);
  const [units, setUnits] = useState([]);
  const [create, setCreate] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null); // Changed
  const [update, setUpdate] = useState(false);
  const [selectedObjectiveID, setSelectedObjectiveID] = useState(null); // Changed
  const [deleteObjective, setDeleteObjective] = useState(false); // Changed
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [keyResults, setKeyResults] = useState([]);

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
      };

      console.log('Sending payload:', JSON.stringify(data, null, 2));

      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (response?.success) {
        toast.success(
          response?.data?.message || 'Objective assigned successfully.',
        );
        handleCreateModalClose();
        handleFetchingObjectives(); // Refresh the list
      } else {
        toast.error(response?.data?.message || 'Failed to assign objective.');
      }
    } catch (error) {
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
    setLoading(true);
    const token = await GetToken();
    const Api =
      Backend.pmsUrl(Backend.objectives) +
      `?page=${pagination.page + 1}&per_page=${pagination.per_page}&search=${search}`;

    try {
      const response = await fetch(Api, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
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

  useEffect(() => {
    // if (selectedYear?.id) {
    //   handleFetchingObjectives();
    // }
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
      title={'Objectives & Key Results'}
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
