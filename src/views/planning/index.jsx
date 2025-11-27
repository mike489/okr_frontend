import React, { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  OutlinedInput,
  TablePagination,
  Typography,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CreatePlan } from './components/CreatePlan';
import { toast, ToastContainer } from 'react-toastify';
import { gridSpacing } from 'store/constant';
import { UpdatePlan } from './components/UpdatePlan';
import { useKPI } from 'context/KPIProvider';
import { Storage } from 'configration/storage';
import { useSelector } from 'react-redux';
import Backend from 'services/backend';
import PageContainer from 'ui-component/MainPage';
import AddButton from 'ui-component/buttons/AddButton';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import ErrorPrompt from 'utils/components/ErrorPrompt';
import Fallbacks from 'utils/components/Fallbacks';
import DeletePrompt from 'ui-component/modal/DeletePrompt';
import GetToken from 'utils/auth-token';
import Search from 'ui-component/search';
import SelectorMenu from 'ui-component/menu/SelectorMenu';
import IsEmployee from 'utils/is-employee';
import hasPermission from 'utils/auth/hasPermission';
import DrogaCard from 'ui-component/cards/DrogaCard';
import { IconChevronDown, IconChevronRight, IconMessage } from '@tabler/icons-react';
import PlanStatusNotice from './components/PlanStatusNotice';
import * as Yup from 'yup';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';
import { useFormik } from 'formik';
import MiniPlanCard from './components/MiniPlanCard';
import SlideInDrawer from 'ui-component/modal/SlideInDrawer';
import Comment from 'views/approvals/components/Comment';

const validationSchema = Yup.object().shape({
  remark: Yup.string()
});

const Planning = () => {
  const theme = useTheme();
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);
  const navigate = useNavigate();
  const isEmployee = IsEmployee();
  const { handleUpdatePlan } = useKPI();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [allowedStatus, setAllowedState] = useState([]);
  const [selectedPerspective, setSelectedPerspectve] = useState(null);
  const [create, setCreate] = useState(false);

  const [ObjectiveData, setObjectiveData] = useState();
  const [objectiveSelected, setObjectiveSelected] = useState('');

  const [canPlan, setCanPlan] = useState(false);
  const [canDistribute, setCanDistribute] = useState(false);
  const [planStatus, setPlanStatus] = useState('');

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [update, setUpdate] = useState(false);
  const [selectedPlanID, setSelectedPlanID] = useState(null);
  const [deletePlan, setDeletePlan] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [perspectiveTypes] = useState([{ label: 'All Perspectives', value: '' }]);
  const [measuringUnit] = useState([{ label: 'All Measuring Units', value: '' }]);
  const [filter, setFilter] = useState({
    m_unit: '',
    perspective: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0
  });

  const [actionInfo, setActionInfo] = useState({
    openModal: false,
    title: 'Change Status',
    action: '',
    submitting: false
  });

  // ============ PLANNING CONVERSATIONS =======START======
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleShowConversations = () => {
    handleFetchingConversations();
    setDrawerOpen(true);
  };

  const [loadingConversations, setLoadingConversations] = useState(false);
  const [conversationData, setConversationData] = useState([]);
  const [conversationError, setConversationError] = useState(false);
  const [conversationPagination, setConversationPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0
  });

  const handleFetchingConversations = async () => {
    setLoadingConversations(true);
    const token = await GetToken();
    const Api =
      Backend.api +
      Backend.getPlanConversations +
      `?fiscal_year_id=${selectedYear?.id}&page=${pagination.page + 1}&per_page=${pagination.per_page}`;

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
          setConversationData(response.data?.data);
          setConversationPagination({ ...conversationPagination, total: response.data.total });
          setConversationError(false);
        } else {
          setConversationError(false);
        }
      })
      .catch((error) => {
        toast.warning(error.message);
        setConversationError(true);
      })
      .finally(() => {
        setLoadingConversations(false);
      });
  };

  // ============ PLANNING CONVERSATIONS =======END======

  const formik = useFormik({
    initialValues: {
      remark: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handlePlanStatus(values);
    }
  });

  const handleOpenModal = (title, action) => {
    setActionInfo((PrevState) => ({ ...PrevState, openModal: true, title: title, action: action }));
  };

  const handleCloseModal = () => {
    setActionInfo((PrevState) => ({ ...PrevState, openModal: false, action: '' }));
    formik.resetForm();
  };

  const handleSearchFieldChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPagination({ ...pagination, page: 0 });
  };

  const handlePerspectiveCollapsing = (index, kpi) => {
    if (selectedPerspective === index) {
      setSelectedPerspectve(null);
      setObjectiveSelected('');
    } else {
      setSelectedPerspectve(index);
      handleGettingObjectives(kpi?.kpi?.perspective_type?.id);
      setObjectiveSelected('');
    }
  };

  const handleGettingObjectives = async (perspective) => {
    const token = await GetToken();
    const Api = Backend.api + Backend.getObjectiveByPerspectives + perspective;
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
          setObjectiveData(response.data);
        } else {
          toast.error(response.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleFiltering = (event) => {
    const { value, name } = event.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, per_page: event.target.value, page: 0 });
  };

  const handleRemarkPageChange = (event, newPage) => {
    setConversationPagination({ ...conversationPagination, page: newPage });
  };

  const handleRemarkRowsPerPageChange = (event) => {
    setConversationPagination({ ...conversationPagination, per_page: event.target.value, page: 0 });
  };

  const handleCreatePlan = () => {
    setCreate(true);
  };

  const handleCreateModalClose = () => {
    setCreate(false);
  };

  const handleSettingUP = (selected) => {
    const newKPI = {
      id: selected?.kpi_id,
      f_name: selected?.frequency?.name,
      f_value: selected?.frequency?.value,
      frequency_id: selected?.frequency_id,
      mu: selected?.kpi?.measuring_unit?.name,
      name: selected?.kpi?.name,
      total_target: selected?.total_target,
      weight: selected?.weight,
      objective: selected?.objective
    };

    const targets = selected?.target?.map((prevTarget) => ({ period_id: prevTarget?.period_id, target: prevTarget?.target }));
    handleUpdatePlan([{ ...newKPI, targets: targets }]);
    Storage.setItem('selectFiscal', JSON.stringify({ id: selected?.fiscal_year_id, year: '' }));

    setSelectedPlanID(selected?.id);
    setUpdate(true);
  };

  const handleUpdatingPlan = (plan) => {
    handleSettingUP(plan);
  };

  const handleUpdateModalClose = () => {
    handleUpdatePlan([]);
    setUpdate(false);
    setSelectedPlanID(null);
  };

  const handleDeletePlan = (data) => {
    setSelectedPlan(data);
    setDeletePlan(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = await GetToken();
      const Api = Backend.api + Backend.deletePlan + `/${selectedPlan?.id}`;
      fetch(Api, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
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

  //Plan fetching related function goes down here
  const handleSettingUpPerspectiveFilter = (perspective) => {
    perspectiveTypes.length < 2 &&
      perspective.forEach((perspective) => perspectiveTypes.push({ label: perspective.name, value: perspective.id }));
  };

  const handleSettingUpMeasuringUnitFilter = (measuring_unit) => {
    measuringUnit.length < 2 && measuring_unit.forEach((m_unit) => measuringUnit.push({ label: m_unit.name, value: m_unit.id }));
  };

  const handleFetchingPlan = async () => {
    setLoading(true);
    const token = await GetToken();
    const Api =
      Backend.api +
      Backend.getMyPlans +
      `?fiscal_year_id=${selectedYear?.id}&page=${pagination.page + 1}&per_page=${pagination.per_page}&search=${search}&perspective_type_id=${filter.perspective}&measuring_unit_id=${filter.m_unit}`;
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
        if (response.success && response.data?.plans) {
          setData(response.data?.plans?.data);
          setCanPlan(response?.data?.can_plan);
          setCanDistribute(response?.data?.can_distribute);
          setAllowedState(response.data?.allowed_status);
          setPlanStatus(response.data?.plan_status);

          handleSettingUpPerspectiveFilter(response.data?.perspectiveTypes);
          handleSettingUpMeasuringUnitFilter(response.data?.measuringUnits);
          setPagination({ ...pagination, total: response.data?.plans?.total });
          setError(false);
        } else {
          toast.warning(response.data.message);
          setError(false);
        }
      })
      .catch((error) => {
        toast.warning(error.message);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePlanStatus = async (values) => {
    setActionInfo((prevState) => ({ ...prevState, submitting: true }));
    const token = await GetToken();
    const Api = Backend.api + Backend.planStatus;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json'
    };

    const data = {
      fiscal_year_id: selectedYear?.id,
      status: actionInfo.action,
      remark: values.remark
    };

    fetch(Api, { method: 'POST', headers: header, body: JSON.stringify(data) })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          toast.success(response?.data?.message);
          handleCloseModal();
          handleFetchingPlan();
        } else {
          toast.error(response?.data?.message);
        }
      })
      .catch((error) => {
        toast.error(error?.message);
      })
      .finally(() => {
        setActionInfo((prevState) => ({ ...prevState, submitting: false }));
      });
  };

  useEffect(() => {
    if (mounted) {
      handleFetchingPlan();
    } else {
      setMounted(true);
    }
  }, [selectedYear?.id, pagination.page, pagination.per_page, filter]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleFetchingPlan();
    }, 600);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [search]);

  const groupedPlans = [];

  data.forEach((plan) => {
    const perspectiveType = plan?.kpi?.perspective_type?.name;

    if (perspectiveType) {
      if (!groupedPlans[perspectiveType]) {
        groupedPlans[perspectiveType] = [];
      }
      groupedPlans[perspectiveType].push(plan);
    }
  });

  const FilteredPlan = (plans) => {
    if (objectiveSelected) {
      return plans.filter((plan) => plan?.objective?.id === objectiveSelected);
    }
    return plans;
  };

  return (
    <PageContainer
      title={'Planning'}
      searchField={<Search value={search} onChange={(event) => handleSearchFieldChange(event)} />}
      rightOption={
        <Box sx={{ display: 'flex' }}>
          {hasPermission('create:kpitracker') && canPlan ? (
            <AddButton props={{ variant: 'contained' }} title={'Create new plan'} onPress={() => handleCreatePlan()} disable={loading} />
          ) : null}

          <IconButton title="Remarks" onClick={() => handleShowConversations()} sx={{ mx: 2 }}>
            <IconMessage />
          </IconButton>
        </Box>
      }
    >
      {allowedStatus.length > 0 && (
        <PlanStatusNotice
          status={planStatus}
          changingStatus={actionInfo.submitting}
          onAccept={allowedStatus.includes('accepted') ? () => handleOpenModal('Accepting', 'accepted') : null}
          onOpenToDiscussion={
            allowedStatus.includes('open for discussion') ? () => handleOpenModal('Opeining for discussion', 'open for discussion') : null
          }
          onEsclate={allowedStatus.includes('escalated') ? () => handleOpenModal('Esclating', 'escalated') : null}
        />
      )}

      <Grid container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <Grid container spacing={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <SelectorMenu name="perspective" options={perspectiveTypes} selected={filter.perspective} handleSelection={handleFiltering} />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <SelectorMenu name="m_unit" options={measuringUnit} selected={filter.m_unit} handleSelection={handleFiltering} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

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
              padding: 8
            }}
          >
            <ActivityIndicator size={20} />
          </Grid>
        </Grid>
      ) : error ? (
        <ErrorPrompt title="Server Error" message="Unable to retrieve Plans" />
      ) : data.length === 0 ? (
        <Fallbacks
          severity="planning"
          title="Plan is not found"
          description="The list of added plan will be listed here"
          sx={{ paddingTop: 6 }}
        />
      ) : (
        <Grid container sx={{ marginTop: 0.2, paddingRight: { xs: 2, md: 0 }, paddingBottom: { xs: 10, md: 0 } }} spacing={gridSpacing}>
          {Object.keys(groupedPlans).map((perspectiveType, index) => (
            <Grid item xs={12} key={perspectiveType}>
              <DrogaCard
                onPress={() => handlePerspectiveCollapsing(index, groupedPlans[perspectiveType][0])}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <Typography variant="h4" gutterBottom sx={{ m: 1 }}>
                  {perspectiveType}
                </Typography>

                <IconButton onClick={() => handlePerspectiveCollapsing(index, groupedPlans[perspectiveType][0])}>
                  {selectedPerspective === index ? (
                    <IconChevronDown size="1.4rem" stroke="1.4" />
                  ) : (
                    <IconChevronRight size="1.4rem" stroke="1.4" />
                  )}
                </IconButton>
              </DrogaCard>

              <Collapse in={selectedPerspective === index}>
                <Box
                  sx={{
                    mx: 2,
                    mt: 1.6,
                    display: 'flex',
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                      display: 'none'
                    },
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none'
                  }}
                >
                  <Chip
                    label="All"
                    variant="filled"
                    sx={{
                      mr: 1,
                      cursor: 'pointer',
                      bgcolor: objectiveSelected === '' ? 'primary.main' : null,
                      color: objectiveSelected === '' ? 'common.white' : null,
                      border: objectiveSelected === '' ? 'none' : null,
                      ':hover': {
                        bgcolor: objectiveSelected === '' ? 'primary.main' : null,
                        color: objectiveSelected === '' ? 'common.white' : 'common.black',
                        border: objectiveSelected === '' ? 'none' : null
                      },
                      px: 1
                    }}
                    onClick={() => setObjectiveSelected('')}
                  />
                  {ObjectiveData &&
                    ObjectiveData.map((objective) => (
                      <Chip
                        key={objective.id}
                        label={objective.name}
                        variant="filled"
                        sx={{
                          mr: 2,
                          cursor: 'pointer',
                          bgcolor: objectiveSelected === objective.id ? 'primary.main' : null,
                          color: objectiveSelected === objective.id ? 'common.white' : 'common.black',
                          border: objectiveSelected === objective.id ? 'none' : null,
                          ':hover': {
                            bgcolor: objectiveSelected === objective.id ? 'primary.main' : null,
                            color: objectiveSelected === objective.id ? 'common.white' : 'common.black',
                            border: objectiveSelected === objective.id ? 'none' : null
                          }
                        }}
                        onClick={() => setObjectiveSelected(objective.id)}
                      />
                    ))}
                </Box>
                <Grid container spacing={2} mt={0.6}>
                  {FilteredPlan(groupedPlans[perspectiveType]).length === 0 ? (
                    <Fallbacks
                      severity="planning"
                      title="No KPI"
                      description="Kpi with selected objective listed here "
                      sx={{ paddingY: 6 }}
                      size={80}
                    />
                  ) : (
                    FilteredPlan(groupedPlans[perspectiveType]).map((plan, index) => (
                      <Grid item xs={12} sm={12} md={6} lg={4} xl={4} key={index}>
                        <MiniPlanCard
                          plan={plan}
                          onPress={() => navigate('/planning/view', { state: { ...plan, can_distribute: canDistribute } })}
                          onEdit={() => handleUpdatingPlan(plan)}
                          onDelete={() => handleDeletePlan(plan)}
                          hideOptions={!canPlan}
                          editInitiative={true}
                          is_employee={isEmployee}
                          sx={{
                            ':hover': {
                              boxShadow: theme.shadows[1],
                              transform: 'scale(1.03)',
                              transition: 'transform 0.3s ease-in-out'
                            }
                          }}
                        />
                      </Grid>
                    ))
                  )}
                </Grid>
              </Collapse>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && pagination.total > pagination.per_page && (
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
      <CreatePlan add={create} onClose={handleCreateModalClose} onSucceed={() => handleFetchingPlan()} />

      {actionInfo.openModal && (
        <DrogaFormModal
          open={actionInfo.openModal}
          handleClose={handleCloseModal}
          title={actionInfo.title}
          onCancel={handleCloseModal}
          onSubmit={formik.handleSubmit}
          submitting={actionInfo.submitting}
        >
          <FormControl fullWidth error={formik.touched.remark && Boolean(formik.errors.remark)}>
            <InputLabel htmlFor="remark">Remark (Optional)</InputLabel>
            <OutlinedInput
              id="remark"
              name="remark"
              label="Remark (Optional)"
              value={formik.values.remark}
              onChange={formik.handleChange}
              multiline
              rows={4}
              fullWidth
            />
            {formik.touched.remark && formik.errors.remark && (
              <FormHelperText error id="standard-weight-helper-text-remark">
                {formik.errors.remark}
              </FormHelperText>
            )}
          </FormControl>
        </DrogaFormModal>
      )}
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
          description={`Are you sure you want to delete ` + selectedPlan?.kpi?.name}
          onNo={() => setDeletePlan(false)}
          onYes={() => handleDelete()}
          deleting={deleting}
          handleClose={() => setDeletePlan(false)}
        />
      )}

      <SlideInDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Planning Remarks">
        {loadingConversations ? (
          <Grid container sx={{ minHeight: 400 }}>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
              <ActivityIndicator size={20} />
            </Grid>
          </Grid>
        ) : conversationError ? (
          <ErrorPrompt title="Server Error" message="Unable to retrieve the conversation" size={160} />
        ) : conversationData.length === 0 ? (
          <Fallbacks severity="conversation" title={``} description={`There is no conversation yet`} sx={{ paddingTop: 6 }} size={80} />
        ) : (
          conversationData.map((item, index) => (
            <Comment
              key={index}
              name={item.employee?.user?.name}
              profile={item.employee?.profile}
              position={item.employee?.job_position?.name}
              from={item.status_from}
              to={item.status_to}
              date_time={item.created_at}
              user_comment={item.note}
            />
          ))
        )}

        {!loadingConversations && conversationPagination.total > conversationPagination.per_page && (
          <TablePagination
            component="div"
            rowsPerPageOptions={[]}
            count={conversationPagination.total}
            rowsPerPage={conversationPagination.per_page}
            page={conversationPagination.page}
            onPageChange={handleRemarkPageChange}
            onRowsPerPageChange={handleRemarkRowsPerPageChange}
            labelRowsPerPage="Per page"
          />
        )}
      </SlideInDrawer>
      <ToastContainer />
    </PageContainer>
  );
};

export default Planning;
