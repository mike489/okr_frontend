import React, { useEffect, useState } from 'react';
import { Box, Chip, Grid, Stack } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { SET_FISCAL_YEARS, SET_SELECTED_FISCAL_YEAR } from 'store/actions';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import PageContainer from 'ui-component/MainPage';
import AddButton from 'ui-component/buttons/AddButton';
import BudgetYear from './components/BudgetYear';
import AddFiscalYear from './components/AddFiscalYear';
import EditFiscalYear from './components/EditFiscalYear';
import DeletePrompt from 'ui-component/modal/DeletePrompt';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Fallbacks from 'utils/components/Fallbacks';
import StaticPeriodsComponent from './components/StaticComponents';
import FrequencyDefinition from './components/TargetEvaluationPeriod';
import EvaluationPeriod from './components/EvaluationPeriod';

const Periods = () => {
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [edit, setEdit] = useState(false);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(
    selectedYear?.id || '',
  );
  const [openPeriod, setOpenPeriod] = useState(false);
  const [openEvaluation, setOpenEvaluation] = useState(false);

  const [toBeEdited, setToBeEdited] = useState(null);
  const [toBeDeleted, setToBeDeleted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteFiscal, setDeleteFiscal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isPeriodLoading, setIsPeriodLoading] = useState(false);
  const [periods, setPeriods] = useState([]);

  // ----------------- Handlers -----------------
  const handleExpanding = (yearID) => {
    if (selectedFiscalYear === yearID) {
      setSelectedFiscalYear('');
    } else {
      setSelectedFiscalYear(yearID);
      handleFetchingDetails(yearID);
    }
    setOpenPeriod(false);
  };

  const handleCloseModal = () => setOpen(false);

  const handleRefreshingHeaderMenu = (data) => {
    setFiscalYears(data.data);
    dispatch({ type: SET_FISCAL_YEARS, fiscalYears: data.data });

    if (selectedFiscalYear) {
      const selected = data.data.find((y) => y.id === selectedFiscalYear);
      if (selected)
        dispatch({
          type: SET_SELECTED_FISCAL_YEAR,
          selectedFiscalYear: selected,
        });
    } else if (data.data.length > 0) {
      dispatch({
        type: SET_SELECTED_FISCAL_YEAR,
        selectedFiscalYear: data.data[0],
      });
      setSelectedFiscalYear(data.data[0].id);
    }
  };

  const handleFiscalYearCreation = async (values) => {
    setSubmitting(true);
    try {
      const token = await GetToken();
      const Api = Backend.pmsUrl(Backend.fiscal_years);
      const data = {
        name: values.name || `FY ${values.year}`,
        year: values.year,
        start_date: format(new Date(values.start_date), 'yyyy-MM-dd'),
        end_date: format(new Date(values.end_date), 'yyyy-MM-dd'),
        description: values.description || `Fiscal Year ${values.year}`,
      };

      const response = await fetch(Api, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Fiscal year added successfully');
        handleCloseModal();
        handleFetchingFiscalYear(true);
      } else {
        toast.error(result.message || 'Failed to add fiscal year');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitEdition = (fiscal) => {
    setToBeEdited(fiscal);
    setEdit(true);
  };

  const handleClosingModal = () => {
    setToBeEdited(null);
    setEdit(false);
  };

  const handleFiscalYearEditing = async (values) => {
    if (!toBeEdited) return;
    setSubmitting(true);
    try {
      const token = await GetToken();
      const Api = Backend.pmsUrl(`${Backend.fiscal_years}/${toBeEdited.id}`);

      const data = {
        name: values.name || `FY ${values.year}`,
        year: values.year,
        start_date: format(new Date(values.start_date), 'yyyy-MM-dd'),
        end_date: format(new Date(values.end_date), 'yyyy-MM-dd'),
        description: values.description || `Fiscal Year ${values.year}`,
      };

      const response = await fetch(Api, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Fiscal year updated');
        setEdit(false);
        handleFetchingFiscalYear(true);
      } else {
        toast.error(result.message || 'Failed to update fiscal year');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitDelete = (fiscal) => {
    setToBeDeleted(fiscal);
    setDeleteFiscal(true);
  };

  const handleDelete = async () => {
    if (!toBeDeleted) return;
    setDeleting(true);
    try {
      const token = await GetToken();
      const Api = Backend.pmsUrl(`${Backend.fiscal_years}/${toBeDeleted.id}`);
      const response = await fetch(Api, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Fiscal year deleted successfully');
        setDeleteFiscal(false);
        handleFetchingFiscalYear(true);
      } else {
        toast.error(result.message || 'Failed to delete fiscal year');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreatePeriod = () => setOpen(true);

  // ----------------- Fetching Fiscal Years -----------------
  const handleFetchingFiscalYear = async (refreshHeader = false) => {
    setLoading(true);
    try {
      const token = await GetToken();
      const Api = Backend.pmsUrl(Backend.fiscal_years);
      const response = await fetch(Api, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setFiscalYears(result.data.data);
        if (refreshHeader) handleRefreshingHeaderMenu(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch fiscal years');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchingDetails = async (yearID) => {
    setIsPeriodLoading(true);
    try {
      const token = await GetToken();
      const fiscalYearId = yearID || selectedYear?.id;
      const Api = Backend.pmsUrl(
        `${Backend.getSinglePeriods}?fiscal_year_id=${fiscalYearId}`,
      );
      const response = await fetch(Api, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setPeriods(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch periods');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsPeriodLoading(false);
    }
  };

  useEffect(() => {
    handleFetchingFiscalYear();
  }, []);

  useEffect(() => {
    setSelectedFiscalYear(selectedYear?.id);
    handleFetchingDetails();
    setOpenPeriod(false);
  }, [selectedYear]);

  // ----------------- Render -----------------
  return (
    <Stack spacing={4} sx={{ width: '100%' }}>
      <PageContainer
        title="Fiscal Years"
        rightOption={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: 2,
              mt: 4,
            }}
          >
            {fiscalYears.length > 1 && (
              <Chip
                label="Show all"
                sx={{
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  px: 2,
                  py: 0.4,
                  mr: 3,
                }}
                color="primary"
                variant={showAll ? 'filled' : 'outlined'}
                onClick={() => setShowAll(!showAll)}
              />
            )}
            <AddButton
              title="Add Fiscal Year"
              variant="contained"
              onPress={handleCreatePeriod}
            />
          </Box>
        }
      >
        <Grid container>
          <Grid item xs={12} sx={{ mx: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <ActivityIndicator size={20} />
              </Box>
            ) : fiscalYears.length === 0 ? (
              <Fallbacks
                severity="info"
                title="Fiscal year not found"
                description="The list of added fiscal years will be listed here"
                sx={{ pt: 6 }}
              />
            ) : (
              fiscalYears
                .filter((y) => showAll || y.id === selectedYear?.id)
                .map((year) => (
                  <BudgetYear
                    key={year.id}
                    year={year.year}
                    startDate={year.start_date}
                    endDate={year.end_date}
                    expand={year.id === selectedFiscalYear}
                    onExpand={() => handleExpanding(year.id)}
                    onEdit={() => handleInitEdition(year)}
                    onDelete={() => handleInitDelete(year)}
                  >
                    {year.id === selectedFiscalYear && (
                      <>
                        <StaticPeriodsComponent
                          isLoading={isPeriodLoading}
                          data={periods}
                          fiscalYear={selectedYear}
                          onRefresh={handleFetchingDetails}
                        />
                        <FrequencyDefinition
                          sx={{ mt: 2 }}
                          open={openPeriod}
                          setOpen={setOpenPeriod}
                        />
                        <EvaluationPeriod
                          sx={{ mt: 2 }}
                          open={openEvaluation}
                          setOpen={setOpenEvaluation}
                        />
                      </>
                    )}
                  </BudgetYear>
                ))
            )}
          </Grid>
        </Grid>
      </PageContainer>

      {/* Add Fiscal Year */}
      <AddFiscalYear
        open={open}
        handleCloseModal={handleCloseModal}
        handleSubmission={handleFiscalYearCreation}
        submitting={submitting}
      />

      {/* Edit Fiscal Year */}
      {toBeEdited && (
        <EditFiscalYear
          open={edit}
          fiscal={toBeEdited}
          handleCloseModal={handleClosingModal}
          handleSubmission={handleFiscalYearEditing}
          submitting={submitting}
        />
      )}

      {/* Delete Fiscal Year */}
      {toBeDeleted && (
        <DeletePrompt
          type="Delete"
          open={deleteFiscal}
          title="Deleting fiscal year"
          description={`Are you sure you want to delete ${toBeDeleted.year}?`}
          onNo={() => setDeleteFiscal(false)}
          onYes={handleDelete}
          deleting={deleting}
          handleClose={() => setDeleteFiscal(false)}
        />
      )}

      <ToastContainer />
    </Stack>
  );
};

export default Periods;
