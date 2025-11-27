import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import Backend from 'services/backend';
import PlanTable from './PlanTable';
import GetToken from 'utils/auth-token';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';

const UnitTable = ({ units, fiscalYear }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [selectedRow, setSelectedRow] = useState(null);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);

  const handleRowClick = (index, unitId) => {
    if (selectedRow === unitId) {
      setSelectedRow(null);
    } else {
      setSelectedRow(unitId);
      handleFetchingUnitPlan(unitId);
    }
  };
const handleFetchingUnitPlan = async (unitId) => {
  setLoading(true);
  try {
    const token = await GetToken();
    const Api = `${Backend.api}${Backend.unpaginatedUnitPlan}/${unitId}?fiscal_year_id=${fiscalYear}`;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const response = await fetch(Api, { method: 'GET', headers: header });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.success) {
      setData(data.data.data || []);
      setError(false);
    } else {
      setError(true);
      toast.warning(data.data?.message || 'Something went wrong');
    }
  } catch (error) {
    setError(true);
    toast.warning(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <TableContainer component={Paper} sx={{ minHeight: '66dvh', border: 0.4, borderColor: theme.palette.divider, borderRadius: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="Organization unit table">
        <TableHead>
          <TableRow>
            <TableCell>Unit name</TableCell>
            <TableCell>Unit Manager</TableCell>
            <TableCell>Unit Type</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {units?.map((unit, index) => (
            <React.Fragment key={unit.id}>
              <TableRow
                sx={{
                  backgroundColor: selectedRow == unit?.id ? theme.palette.grey[100] : theme.palette.background.default,
                  ':hover': {
                    backgroundColor: theme.palette.grey[100],
                    color: theme.palette.background.default,
                    cursor: 'pointer',
                    borderRadius: 2
                  }
                }}
              >
                <TableCell sx={{ display: 'flex', alignItems: 'center', border: 0 }}>
                  <IconButton aria-label="expand row" size="small" onClick={() => handleRowClick(index, unit.id)}>
                    {selectedRow === unit?.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>

                  <Typography
                    variant="subtitle1"
                    color={theme.palette.text.primary}
                    // onClick={() => navigate('/units/view', { state: unit })}
                    // sx={{ ':hover': { color: theme.palette.primary[800] }, ml: 1 }}
                  >
                    {unit?.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ border: 0 }}>
                  {unit?.manager} 
                </TableCell>
                <TableCell sx={{ border: 0 }}>{unit?.unit_type}</TableCell>
                <TableCell sx={{ border: 0 }}>
                  <Button variant="text" onClick={() => handleRowClick(index, unit.id)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>

              {selectedRow == unit?.id && (
                <TableRow sx={{ border: 0 }}>
                  <TableCell colSpan={7}>
                    <Collapse in={selectedRow !== null} timeout="auto" unmountOnExit>
                      {loading ? (
                        <TableRow sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                          <TableCell colSpan={7} sx={{ border: 0 }}>
                            <ActivityIndicator size={20} />
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow sx={{ padding: 4 }}>
                          <TableCell colSpan={7} sx={{ border: 0 }}>
                            <Typography variant="body2">There is error fetching the unit target</Typography>
                          </TableCell>
                        </TableRow>
                      ) : data.length === 0 ? (
                        <TableRow sx={{ padding: 4 }}>
                          <TableCell colSpan={7} sx={{ border: 0 }}>
                            <Typography variant="body2">There is no target found</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ width: '100%', border: 0 }}>
                            <PlanTable
                              plans={data}
                              unitName={unit?.name}
                              unitType={unit?.unit_type}
                              fiscalYear={fiscalYear}
                              page="evaluation"
                              hideActions={true}
                              onRefresh={() => handleFetchingUnitPlan(selectedRow)}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </Collapse>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UnitTable;
