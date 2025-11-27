import { useEffect, useState } from 'react';
import { Grid, TablePagination } from '@mui/material';
import Search from 'ui-component/search';
import { useDispatch, useSelector } from 'react-redux';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Fallbacks from 'utils/components/Fallbacks';
import { toast, ToastContainer } from 'react-toastify';
import GetToken from 'utils/auth-token';
import Backend from 'services/backend';
import PageContainer from 'ui-component/MainPage';
import TeamListTable from './components/TeamListTable';
import { CheckForPendingTasks } from 'utils/check-for-pending-tasks';

const MyTeam = () => {
  const [mounted, setMounted] = useState(false);
  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );
  const dispatch = useDispatch();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
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

  const handleGettingMyTeam = async () => {
    setLoading(true);
    const token = await GetToken();

    let Api =
      Backend.api +
      Backend.myTeams +
      `?fiscal_year_id=${selectedYear?.id}&page=${pagination.page + 1}&per_page=${pagination.per_page}&search=${search}`;

    if (from) {
      Api += `&from=${from}`;
    }
    if (to) {
      Api += `&to=${to}`;
    }

    console.log('API Request:', Api); 

    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(Api, {
        method: 'GET',
        headers: header,
      });
      const result = await response.json();
      console.log('API Response:', result); // Debug log

      if (result.success) {
        setData(result.data.data || []);
        setPagination({ ...pagination, total: result.data.total || 0 });
        setError(false);
      } else {
        toast.warning(result.data?.message || 'Failed to fetch team list');
        setError(true);
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching team list');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, per_page: parseInt(event.target.value, 10), page: 0 });
  };

  const handleDateChange = (newStartDate, newEndDate) => {
    console.log('Date Change:', { newStartDate, newEndDate }); // Debug log
    setFrom(newStartDate);
    setTo(newEndDate);
  };

  // Debounce for date filter
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (from && to) {
        handleGettingMyTeam();
      }
    }, 800);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [from, to]);

  // Debounce for search filter
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleGettingMyTeam();
    }, 800);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [search]);

  // Fetch data on mount, fiscal year change, or pagination change
  useEffect(() => {
    if (mounted) {
      handleGettingMyTeam();
      // CheckForPendingTasks(dispatch, selectedYear?.id);
    } else {
      setMounted(true);
    }
  }, [selectedYear, pagination.page, pagination.per_page]);

  return (
    <PageContainer
      back={false}
      title="My Teams"
      searchField={
        <Search
          value={search}
          onChange={(event) => handleSearchFieldChange(event)}
        />
      }
    >
      <Grid container>
        <Grid item xs={12} sx={{ padding: 2 }}>
          {loading ? (
            <Grid container>
              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4,
                }}
              >
                <ActivityIndicator size={20} />
              </Grid>
            </Grid>
          ) : error ? (
            <Fallbacks
              severity="my-teams"
              title="Error loading team list"
              description="There was an issue fetching your team list. Please try again."
              sx={{ paddingTop: 6 }}
            />
          ) : data.length === 0 ? (
            <Fallbacks
              severity="my-teams"
              title="No teams found"
              description="No teams match the selected filters. Try adjusting the date range or search term."
              sx={{ paddingTop: 6 }}
            />
          ) : (
            <TeamListTable
              teamList={data}
              onDateChange={handleDateChange}
              from={from}
              to={to}
            />
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
              labelRowsPerPage="Per page"
            />
          )}
        </Grid>
      </Grid>
      <ToastContainer />
    </PageContainer>
  );
};

export default MyTeam;