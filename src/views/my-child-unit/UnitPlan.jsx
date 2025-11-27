import { useEffect, useState } from 'react';
import PageContainer from 'ui-component/MainPage';
import { gridSpacing } from 'store/constant';
import {
  Grid,
  TablePagination,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import { toast } from 'react-toastify';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Fallbacks from 'utils/components/Fallbacks';
import UnitInfoCard from './components/UnitInfoCard';
import InitiativeList from '../plan/components/InitiativeList'; 
import { useSelector } from 'react-redux';

const UnitPlan = () => {
  const { id } = useParams();
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [units, setUnits] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 10,
    total: 0,
  });

  const handleFetchingUnitPlan = async (unitId) => {
    setLoading(true);
    try {
      const token = await GetToken();
      const Api = `${Backend.api}${Backend.unpaginatedUnitPlan}/${unitId}?fiscal_year_id=${selectedYear.id}&page=${pagination.page + 1}&per_page=${pagination.per_page}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'GET', headers: header });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data.data || []);
        setPagination({
          page: result.data.current_page - 1,
          per_page: result.data.per_page,
          total: result.data.total,
        });
        setError(false);
      } else {
        setError(true);
        toast.warning(result.data?.message || 'Something went wrong');
      }
    } catch (error) {
      setError(true);
      toast.warning(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchingUnits = async () => {
    try {
      const token = await GetToken();
      const Api = `${Backend.api}${Backend.getMyChildUnits}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, { method: 'GET', headers: header });
      const result = await response.json();
      if (result.success) {
        setUnits(result.data);
        setError(false);
      } else {
        setError(true);
        toast.warning(result.message || 'Failed to load units');
      }
    } catch (error) {
      toast.warning(error.message);
      setError(true);
    }
  };

  useEffect(() => {
    handleFetchingUnitPlan(id);
    handleFetchingUnits();
  }, [id, selectedYear, pagination.page, pagination.per_page]);

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, per_page: parseInt(event.target.value, 10), page: 0 });
  };

  const matchedUnit = units.find((unit) => unit.id.toString() === id?.toString());

  return (
    <PageContainer back={true} title="Unit Plan">
      <Grid>{matchedUnit && <UnitInfoCard unit={matchedUnit} />}</Grid>
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
            description="Unable to find the unit plan"
          />
        ) : (
          <>
             <Grid
              container
            >
              <InitiativeList data={data} />
            </Grid>
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
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
              </Stack>
            </Grid>
          </>
        )}
      </Grid>
    </PageContainer>
  );
};

export default UnitPlan;