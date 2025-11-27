import React, { useEffect, useState } from 'react';
import {
  Grid,
  TablePagination,
  useTheme,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';

import Backend from 'services/backend';
import PageContainer from 'ui-component/MainPage';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import Fallbacks from 'utils/components/Fallbacks';
// import Fallbacks from 'utils/components/Fallbacks';
import GetToken from 'utils/auth-token';
import Search from 'ui-component/search';
import UnitTable from './components/UnitTable';

const MyChildUnit = () => {
  const theme = useTheme();
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);

  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 0,
    per_page: 10,
  });

  const [loadingConversations, setLoadingConversations] = useState(false);
  const [conversationError, setConversationError] = useState(false);

  const handleFetchingUnits = async () => {
    const token = await GetToken();
    const Api = Backend.api + Backend.getMyChildUnits;
  
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
        console.log('Fetched response:', response); // Debug log
  
        if (response.success && Array.isArray(response.data)) {
          setUnits(response.data);
          setPagination((prev) => ({
            ...prev,
            total: response.data.length || 0,
          }));
          setError(false);
        } else if (response.success && response.data.length === 0) {
          setUnits([]);
          setError(false); // Not an error — just no data
        } else {
          toast.warning(response.message || 'Something went wrong while fetching units.');
          setError(true);
        }
      })
      .catch((error) => {
        console.error('API error:', error); 
        toast.warning(error.message || 'Failed to fetch units.');
        setError(true);
      })
      .finally(() => {
        setLoading(false);
       
      });
  };
  

  useEffect(() => {
    handleFetchingUnits();
  }, []);

  const handleSearchFieldChange = (event) => {
    setSearch(event.target.value.toLowerCase());
    setPagination((prev) => ({ ...prev, page: 0 })); // Reset to first page
  };

  const handleChangePage = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination((prev) => ({
      ...prev,
      per_page: parseInt(event.target.value, 10),
      page: 0,
    }));
  };

  const filteredUnits = units.filter((unit) =>
    unit?.name?.toLowerCase().includes(search)
  );

  const paginatedUnits = filteredUnits.slice(
    pagination.page * pagination.per_page,
    pagination.page * pagination.per_page + pagination.per_page
  );

  return (
    <PageContainer
      title={'My Child Units'}
      searchField={
        <Search
          value={search}
          onChange={handleSearchFieldChange}
        />
      }
    >
      {loading ? (
        <Grid container>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 8,
            }}
          >
            <ActivityIndicator size={20} />
          </Grid>
        </Grid>
      ) : error ? (
        <Fallbacks title="Data Not Found" description="Unable to find My child units" />
      ) : filteredUnits.length === 0 ? (
        <Fallbacks
          severity="Child Unit"
          title="My child unit is not found"
          description="The list of added child unit will be listed here"
          sx={{ paddingTop: 6 }}
        />
      ) : (
        <Grid
          
        >
          <UnitTable data={paginatedUnits} />
        </Grid>
      )}
      <ToastContainer />
    </PageContainer>
  );
};

export default MyChildUnit;
