import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
} from '@mui/material';
import {
  IconArrowNarrowRight,
  IconSortAscending,
  IconSortDescending,
  IconArrowsSort,
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import Backend from 'services/backend';
import GetToken from 'utils/auth-token';
import { toast } from 'react-toastify';
import Fallbacks from 'utils/components/Fallbacks';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';

const getColor = (status) => {
  switch (status) {
    case 'good':
      return 'green';
    case 'bad':
      return 'red';
    case 'medium':
      return 'orange';
    default:
      return 'gray';
  }
};

const MyPlanTable = () => {
  const [frequency, setFrequency] = useState('Monthly');
  const [month, setMonth] = useState('May');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [data, setData] = useState([]);
  console.log("My Plan Grade", data);
  const [sortedData, setSortedData] = useState([]);

   console.log("My Plan Grade", sortedData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedYear = useSelector(
    (state) => state.customization.selectedFiscalYear,
  );

  const handleGettingPerformance = async () => {
    if (!selectedYear?.id) {
      setError('Please select a fiscal year');
      toast.error('Please select a fiscal year');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = await GetToken();
      const Api = `${Backend.api}${Backend.performance}?month=${month}`;
      const header = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      };

      const response = await fetch(Api, { method: 'GET', headers: header });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      const normalizedData = (result.data || []).map(item => {
        const percentage = parseFloat(item.monitoring_percentage) || 0; 
        const status =
          percentage >= 80 ? 'good' : percentage >= 50 ? 'medium' : 'bad';
        return {
          plan_name: item.plan_name || 'N/A',
          weight: parseFloat(item.weight) || 0, 
          target: parseFloat(item.target) || 0, 
          monitoring_percentage: percentage,
          status,
          actual: item.actual || 0,
        };
      });
      setData(normalizedData);
      setSortedData(normalizedData);
    } catch (err) {
      // setError(err.message);
      // toast.error(err.message);
      // console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGettingPerformance();
  }, [selectedYear, frequency, month]);

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }

    let newSortedData = [...data];
    if (direction) {
      newSortedData.sort((a, b) => {
        if (key === 'plan_name') {
          return direction === 'asc'
            ? a[key].localeCompare(b[key])
            : b[key].localeCompare(a[key]);
        }
        return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
      });
    } else {
      newSortedData = [...data];
    }

    setSortConfig({ key, direction });
    setSortedData(newSortedData);
  };

  const getSortIcon = (column) => {
    if (sortConfig.key !== column || sortConfig.direction === null) {
      return <IconArrowsSort size={16} />;
    }
    return sortConfig.direction === 'asc' ? (
      <IconSortAscending size={16} />
    ) : (
      <IconSortDescending size={16} />
    );
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Card elevation={0} sx={{ mt: 4 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            flexDirection: 'column',
            gap: 4,
            mb: 4,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '30px',
              color: '#111827',
            }}
          >
            Key Performance Indicators
          </Typography>
          {/* <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
            <FormControl size="small">
              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Quarterly">Quarterly</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                {months.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box> */}
        </Box>

        {loading ? (
          <Box component={'div'} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
             <ActivityIndicator size={20} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : sortedData.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <strong style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', color: '#687588' }}>
                        Plan
                      </strong>
                      <IconButton size="small" onClick={() => sortData('plan_name')}>
                        {getSortIcon('plan_name')}
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <strong style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', color: '#687588' }}>
                        Weight
                      </strong>
                      <IconButton size="small" onClick={() => sortData('weight')}>
                        {getSortIcon('weight')}
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <strong style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', color: '#687588' }}>
                        Target
                      </strong>
                      <IconButton size="small" onClick={() => sortData('target')}>
                        {getSortIcon('target')}
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <strong style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', color: '#687588' }}>
                        Performance (%)
                      </strong>
                      <IconButton size="small" onClick={() => sortData('monitoring_percentage')}>
                        {getSortIcon('monitoring_percentage')}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell
                      sx={{
                        maxWidth: 300,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.plan_name}
                    </TableCell>
                    <TableCell>{row.weight}</TableCell>
                    <TableCell>{row.target}</TableCell>
                    <TableCell
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {row.monitoring_percentage}%
                      </Box>
                      <Box>
                        <svg
                          width="75"
                          height="27"
                          viewBox="0 0 75 27"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_180_296)">
                            <mask
                              id="mask0_180_296"
                              style={{ maskType: 'luminance' }}
                              maskUnits="userSpaceOnUse"
                              x="0"
                              y="0"
                              width="76"
                              height="27"
                            >
                              <rect
                                x="0.833984"
                                width="74.1667"
                                height="27"
                                fill="white"
                              />
                            </mask>
                            <g mask="url(#mask0_180_296)">
                              <path
                                d="M0.994431 15.3714C5.3913 18.5388 9.19305 19.839 12.4221 19.1925C14.2644 18.8236 15.609 18.0135 18.2647 15.9832C18.8387 15.5444 18.8374 15.5454 19.0421 15.3909C21.3865 13.6213 22.8226 12.8921 24.3924 12.8921C25.2278 12.8921 25.8904 12.9289 27.3784 13.0396L27.4294 13.0434C32.3589 13.4103 34.8248 13.1325 38.4123 11.1813C39.5035 10.5878 40.471 9.92582 41.4646 9.1244C42.0933 8.61731 44.0449 6.89977 43.9758 6.95878C46.2743 4.99498 47.9946 4.23426 50.9603 4.23426C52.1726 4.23426 53.3402 4.60599 54.8332 5.39723C55.1604 5.57064 55.5024 5.76284 55.9269 6.00972C56.1451 6.13662 56.9196 6.59281 57.0603 6.67499C59.8496 8.30494 61.6953 9.05626 64.152 9.25753C67.3452 9.51913 70.8838 8.58644 75.0851 6.20313C83.8672 1.22122 92.3275 5.35345 100.652 18.967C100.775 19.1686 101.108 19.262 101.396 19.1757C101.684 19.0894 101.817 18.856 101.694 18.6544C93.1191 4.63096 83.9498 0.15244 74.3715 5.58603C70.3884 7.84558 67.137 8.70255 64.2837 8.46879C62.1069 8.29045 60.4184 7.60312 57.7866 6.06522C57.6486 5.9846 56.8727 5.52761 56.6512 5.39877C56.2147 5.14488 55.8602 4.94571 55.5173 4.76397C53.8457 3.87803 52.4702 3.44015 50.9603 3.44015C47.5939 3.44015 45.5919 4.32544 43.099 6.45531C43.1544 6.40798 41.2183 8.11187 40.6085 8.60372C39.6602 9.3686 38.7444 9.99525 37.7169 10.5541C34.4075 12.354 32.2151 12.601 27.5492 12.2538L27.4983 12.25C25.9708 12.1362 25.2809 12.098 24.3924 12.098C22.3875 12.098 20.7696 12.9195 18.211 14.8507C18.0915 14.9409 17.9668 15.0357 17.8193 15.1483C17.7247 15.2204 17.6238 15.2975 17.4287 15.4467C14.925 17.3608 13.6707 18.1165 12.1105 18.4289C9.38538 18.9746 5.94353 17.7974 1.80731 14.8178C1.58906 14.6606 1.23016 14.657 1.00569 14.8099C0.781221 14.9628 0.77618 15.2142 0.994431 15.3714Z"
                                fill={getColor(row.status)}
                              />
                              <path
                                d="M34.9512 13.9412C38.8172 13.9412 41.9512 10.8072 41.9512 6.94116C41.9512 3.07517 38.8172 -0.0588379 34.9512 -0.0588379C31.0852 -0.0588379 27.9512 3.07517 27.9512 6.94116C27.9512 10.8072 31.0852 13.9412 34.9512 13.9412Z"
                                fill="white"
                              />
                              <path
                                d="M34.9512 10.9412C37.1603 10.9412 38.9512 9.1503 38.9512 6.94116C38.9512 4.73202 37.1603 2.94116 34.9512 2.94116C32.742 2.94116 30.9512 4.73202 30.9512 6.94116C30.9512 9.1503 32.742 10.9412 34.9512 10.9412Z"
                                fill={getColor(row.status)}
                              />
                            </g>
                          </g>
                          <defs>
                            <clipPath id="clip0_180_296">
                              <rect
                                width="74.1667"
                                height="27"
                                fill="white"
                                transform="translate(0.833984)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ }}>
            <Fallbacks severity="plans" title="" description="There is no data available" sx={{ paddingTop: 6 }} size={80} />
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button endIcon={<IconArrowNarrowRight fontSize="small" />} size="small">
            View All
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MyPlanTable;