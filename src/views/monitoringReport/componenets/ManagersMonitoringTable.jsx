import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

const ManagersMonitoringTable = ({ data }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: '#eee' }}>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle1" fontWeight="bold">
                Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" fontWeight="bold">
                Parent
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" fontWeight="bold">
                Manager
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {/* <TableCell sx={{ fontWeight: 'bold' }}>{row.username}</TableCell> */}
              <TableCell>{row.name || 'N/A'}</TableCell>
              <TableCell>{row.parent || 'N/A'}</TableCell>
              <TableCell>{row.manager || 'N/A'}</TableCell>
              {/* <TableCell>{row.unit}</TableCell>
              <TableCell>{row.phone}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
ManagersMonitoringTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
      name: PropTypes.string,
      manager: PropTypes.string,
      plan_status: PropTypes.string,
      weight_sum: PropTypes.number,
    }),
  ).isRequired,
};

export default ManagersMonitoringTable;
