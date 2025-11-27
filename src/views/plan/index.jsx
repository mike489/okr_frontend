import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  TablePagination,
} from '@mui/material';
import CreatePlan from './components/CreatePlan';
import { toast, ToastContainer } from 'react-toastify';
import { gridSpacing } from 'store/constant';
import { UpdatePlan } from './components/UpdatePlan';
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
import PlanStatusNotice from './components/PlanStatusNotice';
import * as Yup from 'yup';

import SplitButton from 'ui-component/buttons/SplitButton';
import InitiativeList from './components/InitiativeList';

const AddUnitOptions = ['Add Unit Plan', 'Import From Excel'];
const Plan = () => {
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  const years = useSelector((state) => state.customization.fiscalYears);
  const { handleUpdatePlan } = useKPI();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(false);
  const [allowedStatus, setAllowedState] = useState([]);
  const [create, setCreate] = useState(false);
  const [myPlan, setMyPlan] = useState([]);
  const [planStatus, setPlanStatus] = useState('');

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [update, setUpdate] = useState(false);
  const [selectedPlanID, setSelectedPlanID] = useState(null);
  const [deletePlan, setDeletePlan] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [units, setUnits] = useState([]);
  const [perspectiveTypes] = useState([
    { label: 'All Perspectives', value: '' },
  ]);
  const [measuringUnit] = useState([
    { label: 'All Measuring Units', value: '' },
  ]);
  const [filter, setFilter] = useState({
    m_unit: '',
    perspective: '',
  });
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
  });

  const [actionInfo, setActionInfo] = useState({
    openModal: false,
    title: 'Change Status',
    action: '',
    submitting: false,
  });

  console.log('Units', units);
  console.log('My Plan', myPlan);
  const handleFetchingUnits = async () => {
    const token = await GetToken();
    const Api = Backend.api + Backend.getMyChildUnits;
    // `?fiscal_year_id=${selectedYear?.id}&page=${pagination.page + 1}&per_page=${pagination.per_page}`;

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
          setUnits(response.data);
        }
      })
      .catch((error) => {
        toast.warning(error.message);
      });
  };

  const handleOpenModal = (title, action) => {
    setActionInfo((PrevState) => ({
      ...PrevState,
      openModal: true,
      title: title,
      action: action,
    }));
  };
  const handlePlanAddition = async (value) => {
    setIsCreating(true);
    const token = await GetToken();
    const Api = Backend.api + Backend.plans;

    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    try {
      // Use the payload as received from CreatePlan
      const data = {
        plans: value.plans, // Array of { id, months }
        unit_id: value.unit_id,
        fiscal_year_id: value.fiscal_year_id,
      };

      console.log('Sending payload:', JSON.stringify(data, null, 2)); // Debug

      const response = await fetch(Api, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (response?.success) {
        toast.success(response?.data?.message || 'Plan created successfully.');
        handleCreateModalClose();
        handleFetchingPlan();
      } else {
        toast.error(response?.data?.message || 'Failed to create plan.');
      }
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    setActionInfo((PrevState) => ({
      ...PrevState,
      openModal: false,
      action: '',
    }));
  };

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

  const handleCreatePlan = () => {
    setCreate(true);
    // setIsCreating(true);
  };

  const handleCreateModalClose = () => {
    setCreate(false);
  };

  const handleUpdateModalClose = () => {
    handleUpdatePlan([]);
    setUpdate(false);
    setSelectedPlanID(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = await GetToken();
      const Api = Backend.api + Backend.deletePlan + `/${selectedPlan?.id}`;
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
            setDeletePlan(false);
            toast.success(response.data.message);
            handleFetchingPlan();
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
  const handlePlanAdd = (index) => {
    if (index === 0) {
      handleCreatePlan();
    } else if (index === 1) {
      handleOpenDialog();
    } else {
      alert('We will be implement importing from odoo');
    }
  };

  const handleOpenDialog = () => {
    setImportExcel(true);
  };

  const handleFetchingPlan = async () => {
    try {
      setLoading(true);
      const token = await GetToken();

      const queryParams = new URLSearchParams({
        page: pagination.page + 1, // backend pages start at 1
        per_page: pagination.per_page,
      });

      if (selectedYear?.id) {
        queryParams.append('fiscal_year_id', selectedYear.id);
      }

      const Api = `${Backend.api}${Backend.myPlansPaginated}?${queryParams.toString()}`;
      console.log('📡 Fetching plans with URL:', Api);

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
        setData(paginationData.data || []);
        setPagination((prev) => ({
          ...prev,
          page: paginationData.current_page - 1, // convert back to zero-based
          per_page: paginationData.per_page,
          total: paginationData.total || 0,
        }));
        setError(false);
      } else {
        toast.warning(response?.data?.message || 'Failed to fetch plans');
        setError(false);
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      toast.warning(error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch user's main activities (also filtered by fiscal year)
  const handleMyMainActivities = async () => {
    try {
      setActionInfo((prev) => ({ ...prev, submitting: true }));
      const token = await GetToken();

      const queryParams = new URLSearchParams();
      if (selectedYear?.id)
        queryParams.append('fiscal_year_id', selectedYear.id);

      const Api = `${Backend.api}${Backend.myPlans}?${queryParams.toString()}`;
      console.log('📡 Fetching my main activities with URL:', Api);

      const response = await fetch(Api, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('✅ My Main Activities Response:', result);

      if (result.success) {
        setMyPlan(result.data || []);
        // handleFetchingPlan(); ❌ Remove this duplicate call
      } else {
        toast.error(result?.data?.message || 'Failed to fetch plan');
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      toast.error(error?.message || 'Something went wrong');
    } finally {
      setActionInfo((prev) => ({ ...prev, submitting: false }));
    }
  };

  useEffect(() => {
    if (selectedYear?.id) {
      handleFetchingPlan();
      handleFetchingUnits();
      handleMyMainActivities();
    }
  }, [selectedYear?.id, pagination.page, pagination.per_page]);

  const groupedPlans = [];

  data?.forEach((plan) => {
    const perspectiveType = plan?.kpi?.perspective_type?.name;

    if (perspectiveType) {
      if (!groupedPlans[perspectiveType]) {
        groupedPlans[perspectiveType] = [];
      }
      groupedPlans[perspectiveType].push(plan);
    }
  });

  return (
    <PageContainer
      title={'My Main Activities'}
      searchField={
        <Search
          value={search}
          onChange={(event) => handleSearchFieldChange(event)}
        />
      }
      rightOption={
        hasPermission('create:plan') && (
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap={2} // Optional spacing
          >
            {/* <SplitButton
              options={AddUnitOptions}
              handleSelection={(value) => handlePlanAdd(value)}
            /> */}
            <SplitButton
              options={['Distribute']}
              handleSelection={(value) => handlePlanAdd(value)}
            />
          </Box>
        )
      }
    >
      {allowedStatus?.length > 0 && (
        <PlanStatusNotice
          status={planStatus}
          changingStatus={actionInfo.submitting}
          onAccept={
            allowedStatus.includes('accepted')
              ? () => handleOpenModal('Accepting', 'accepted')
              : null
          }
          onOpenToDiscussion={
            allowedStatus.includes('open for discussion')
              ? () =>
                  handleOpenModal(
                    'Opening for discussion',
                    'open for discussion',
                  )
              : null
          }
          onEsclate={
            allowedStatus.includes('escalated')
              ? () => handleOpenModal('Esclating', 'escalated')
              : null
          }
        />
      )}

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
          description="Unable find the My Plan"
        />
      ) : data?.length === 0 ? (
        <Fallbacks
          severity="My Plan"
          title="My Plan is not found"
          description="The list of added plan will be listed here"
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
            <InitiativeList data={data} />
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
        onRowsPerPageChange={(event) => {
          setPagination((prev) => ({
            ...prev,
            per_page: parseInt(event.target.value, 10),
            page: 0,
          }));
        }}
        labelRowsPerPage="Plans per page"
      />

      <CreatePlan
        create={create}
        isCreating={isCreating}
        unit={units}
        activities={myPlan}
        fiscalYearId={selectedYear?.id}
        onClose={handleCreateModalClose}
        handleSubmission={(value) => handlePlanAddition(value)}
      />

      {selectedPlanID && (
        <UpdatePlan
          add={update}
          plan_id={selectedPlanID}
          onClose={handleUpdateModalClose}
          onSucceed={() => handleFetchingPlan()}
          isUpdate={true}
        />
      )}
      {deletePlan && (
        <DeletePrompt
          type="Delete"
          open={deletePlan}
          title="Deleting Plan"
          description={
            `Are you sure you want to delete ` + selectedPlan?.kpi?.name
          }
          onNo={() => setDeletePlan(false)}
          onYes={() => handleDelete()}
          deleting={deleting}
          handleClose={() => setDeletePlan(false)}
        />
      )}
      <ToastContainer />
    </PageContainer>
  );
};

export default Plan;
