import { Box, IconButton, TablePagination, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import DrogaCard from 'ui-component/cards/DrogaCard';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import ErrorPrompt from 'utils/components/ErrorPrompt';
import Fallbacks from 'utils/components/Fallbacks';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ChildUnitComponent from './ChildUnitComponent';
import ChildEmployees from './ChildEmployees';
import { IconBuilding, IconUsersGroup } from '@tabler/icons-react';

const ChildUnits = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const selectedYear = useSelector((state) => state.customization.selectedFiscalYear);

  const [tab, setTab] = useState('units');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);

  const [pagination, setPagination] = useState({
    page: 0,
    per_page: 5,
    total: 0,
  });

  const handleTabChange = (value) => {
    setTab(value);
    if (value !== tab) {
      setPagination((prev) => ({ ...prev, page: 0 })); 
      handleGettingChild(value);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({ ...pagination, per_page: parseInt(event.target.value, 10), page: 0 });
  };

  const normalizeResponse = (response, tab) => {
    if (tab === 'employees') {
      return {
        items: response.data.data,
        total: response.data.total,
      };
    }
    return {
      items: response.data,
      total: response.data.total ?? response.data.length,
    };
  };

  const handleGettingChild = async (selectedChild) => {
    try {
      setLoading(true);
      setError(false);

      const token = await GetToken();
      const units =
        Backend.api +
        Backend.getMyChildUnits +
        `?fiscal_year_id=${selectedYear?.id}&page=${pagination.page + 1}&per_page=${pagination.per_page}`;
      const employees =
        Backend.api +
        Backend.getChildEmployees +
        `?fiscal_year_id=${selectedYear?.id}&page=${pagination.page + 1}&per_page=${pagination.per_page}`;

      const Api = selectedChild === 'employees' ? employees : units;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await fetch(Api, {
        method: 'GET',
        headers: header,
      });
      const result = await response.json();

      if (result.success) {
        const { items, total } = normalizeResponse(result, selectedChild);
        setData(items);
        setPagination((prev) => ({ ...prev, total }));
        // setError(false);
      } else {
        // setError(true);
        // toast.error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      // setError(true);
      // toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear?.id) {
      // handleGettingChild(tab);
    }
  }, [selectedYear?.id, pagination.page, pagination.per_page, tab]);

  return (
    <DrogaCard>
      <Typography variant="h4" mb={1.4}>
        Child Unit and Employees
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {[
          { value: 'units', icon: <IconBuilding size="1.2rem" stroke="1.6" /> },
          { value: 'employees', icon: <IconUsersGroup size="1.2rem" stroke="1.6" /> },
        ].map((item, index) => (
          <IconButton
            key={index}
            title={item.value}
            sx={{
              width: 40,
              height: 40,
              marginLeft: index > 0 ? 2 : 0,
              cursor: 'pointer',
              textTransform: 'capitalize',
              padding: 0,
              backgroundColor: tab === item.value ? theme.palette.grey[100] : 'transparent',
            }}
            color="primary"
            variant={tab === item.value ? 'filled' : 'outlined'}
            onClick={() => handleTabChange(item.value)}
          >
            {item.icon}
          </IconButton>
        ))}
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
          }}
        >
          <ActivityIndicator size={20} />
        </Box>
      ) : error ? (
        <ErrorPrompt
          title="Server Error"
          message="There is an error with fetching your child"
          size={80}
        />
      ) : !data?.length ? (
        <Fallbacks
          severity="childs"
          title=""
          description="There is no child data"
          sx={{ paddingTop: 6 }}
          size={80}
        />
      ) : (
        <>
          {tab === 'units' &&
            data?.map((unit, index) => (
              <ChildUnitComponent
                key={index}
                name={unit.name}
                manager={unit?.manager?.user?.name}
                planningStatus={unit?.plan_status}
                hoverColor={theme.palette.grey[50]}
              />
            ))}

          {tab === 'employees' &&
            data?.map((employee, index) => (
              <ChildEmployees
                key={index}
                name={employee?.name}
                position={employee?.unit_name}
                employeeID={employee.username}
                hoverColor={theme.palette.grey[50]}
              />
            ))}

          {pagination.total > 0 && !loading && (
            <TablePagination
              component="div"
              rowsPerPageOptions={[]}
              count={pagination.total}
              rowsPerPage={pagination.per_page}
              page={pagination.page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Per page"
            />
          )}
        </>
      )}
    </DrogaCard>
  );
};

export default ChildUnits;