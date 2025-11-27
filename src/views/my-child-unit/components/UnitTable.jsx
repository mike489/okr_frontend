import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Chip,
  useTheme,
  Avatar,
  Tooltip,
  IconButton,
  alpha,
} from '@mui/material';
import {
  IconArrowsSort,
  IconUser,
  IconFilter,
  IconDotsVertical,
  IconChevronRight,
} from '@tabler/icons-react';
import PropTypes from 'prop-types';

const UnitTable = ({ data }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleRowClick = (id) => {
    navigate(`/unit-plan/${id}`);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const sortedData = stableSort(data, getComparator(order, orderBy));
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="units table">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
              {[
                { id: 'name', label: 'Unit Name' },
                { id: 'unit_type', label: 'Type' },
                { id: 'parent', label: 'Parent Unit' },
                { id: 'manager', label: 'Manager' },
                { id: 'actions', label: '', align: 'right' },
              ].map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={{
                    py: 2,
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {headCell.id !== 'actions' ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                      IconComponent={IconArrowsSort}
                      sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    <Box display="flex" justifyContent="flex-end">
                      {/* <Tooltip title="Filter">
                        <IconButton size="small">
                          {/* <IconFilter size={18} /> */}
                      {/* </IconButton> */}
                      {/* </Tooltip> */}
                    </Box>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => handleRowClick(row.id)}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      cursor: 'pointer',
                    },
                    backgroundColor:
                      hoveredRow === row.id
                        ? alpha(theme.palette.primary.main, 0.04)
                        : 'inherit',
                  }}
                >
                  <TableCell sx={{ py: 2.5 }}>
                    <Box display="flex" alignItems="center">
                      <Typography fontWeight={500}>{row.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.unit_type}
                      size="small"
                      sx={{
                        backgroundColor:
                          row.unit_type === 'Department'
                            ? theme.palette.primary.light
                            : theme.palette.secondary.light,
                        color:
                          row.unit_type === 'Department'
                            ? theme.palette.primary.dark
                            : theme.palette.secondary.dark,
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.parent}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: theme.palette.primary.main,
                          fontSize: 20,
                          fontWeight: 500,
                          textAlign: 'center',
                          lineHeight: '32px',
                          borderRadius: '50%',
                          color: 'white',


                        }}
                      >
                        <IconUser size={20} color='white'/>
                      </Avatar>
                      <Typography variant="body2">{row.manager}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleRowClick(row.id)}
                    >
                      <IconChevronRight size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No units found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

UnitTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      unit_type: PropTypes.string.isRequired,
      parent: PropTypes.string.isRequired,
      manager: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default UnitTable;
