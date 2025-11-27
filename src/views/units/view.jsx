import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PageContainer from 'ui-component/MainPage';
import { gridSpacing } from 'store/constant';
import {
  Grid,
  Box,
  Typography,
  Stack,
  TablePagination,
} from '@mui/material';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import { toast } from 'react-toastify';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Fallbacks from 'utils/components/Fallbacks';
import InitiativeList from '../plan/components/InitiativeList';

const UnitDetails = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { selectedUnit } = location.state || {};
  const stateUnit = location.state && location.state.id ? location.state : null; // Handle case where state is the unit itself

  // State management
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [units, setUnits] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
  });

  // Get the effective ID
  const effectiveId = selectedUnit?.id || stateUnit?.id;

  // Log for debugging
  console.log('effectiveId:', effectiveId);
  console.log('selectedUnit:', selectedUnit);
  console.log('stateUnit:', stateUnit);

  console.log('location.state:', location.state);

  // Fetch unit plans
  const handleGettingUnitPlan = async () => {
    if (!effectiveId) {
      console.error('No effectiveId provided');
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await GetToken();
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      const trimmedId = effectiveId.toString().trim();
      const Api = `${Backend.api}${Backend.unpaginatedUnitPlan}/${trimmedId}?page=${pagination.page + 1}&per_page=${pagination.per_page}`;

      const header = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      console.log('Fetching unit plan:', { Api, header });

      const response = await fetch(Api, {
        method: 'GET',
        headers: header,
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (response.status === 404) {
        throw new Error('Unit plan not found');
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Unit plan response:', result);

      if (result.success) {
        setData(result?.data || []);
        setPagination(prev => ({
          ...prev,
          total: result.data?.total || 0,
        }));
        setError(false);
      } else {
        console.error('API error:', result.message);
        setError(true);
        toast.error(result.message || 'Failed to load unit plans');
      }
    } catch (error) {
      console.error('handleGettingUnitPlan error:', error);
      toast.error(error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all units
  const handleFetchingUnits = async () => {
    try {
      const token = await GetToken();
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      const Api = `${Backend.api}${Backend.units}`;

      const header = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      console.log('Fetching units:', { Api, header });

      const response = await fetch(Api, {
        method: 'GET',
        headers: header,
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Units response:', result);

      if (result.success) {
        setUnits(result.data || []);
        setError(false);
      } else {
        console.error('API error:', result.message);
        setError(true);
        toast.warning(result.message || 'Failed to load units');
      }
    } catch (error) {
      console.error('handleFetchingUnits error:', error);
      toast.warning(error.message);
      setError(true);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    console.log('Changing page to:', newPage);
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    console.log('Changing rows per page to:', event.target.value);
    setPagination(prev => ({
      ...prev,
      per_page: parseInt(event.target.value, 10),
      page: 0,
    }));
  };

  // Initial data loading
  useEffect(() => {
    console.log('useEffect triggered', { effectiveId, page: pagination.page, per_page: pagination.per_page });
    if (effectiveId) {
      handleGettingUnitPlan();
      handleFetchingUnits();
    } else {
      console.warn('effectiveId is undefined, redirecting to /units');
      navigate('/units', { replace: true });
    }
  }, [effectiveId, pagination.page, pagination.per_page, navigate]);

  // Find matched unit
  // const matchedUnit = units.find(
  //   unit => unit.id.toString() === effectiveId?.toString()
  // );

  return (
    <PageContainer back={true} title="Unit Details">
      <Grid
        container
        spacing={gridSpacing}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginTop: 0.5,
          padding: 2,
        }}
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
        ) : data?.length === 0 || error ? (
          <Fallbacks
            title="Data Not Found"
            description="No plans found for this unit"
          />
        ) : (
          <>
            <Grid
              container
              spacing={gridSpacing}
              sx={{

                paddingRight: { xs: 2, md: 0 },
                paddingBottom: { xs: 4, md: 4 },
              }}
            >

              <Grid container >
                <InitiativeList data={data} />
              </Grid>

            </Grid>

            {pagination.total > pagination.per_page && (
              <Grid item xs={12} sx={{ mt: 4 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
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
                </Stack>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </PageContainer>
  );
};

export default UnitDetails;