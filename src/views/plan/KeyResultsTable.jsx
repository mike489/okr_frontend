import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
  Box,
  useTheme,
} from '@mui/material';

const KeyResultsTable = ({ keyResults }) => {
  const theme = useTheme();

  if (!keyResults || keyResults.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No Key Results</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ mt: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="center">Target</TableCell>
              <TableCell align="center">Current</TableCell>
              <TableCell align="center">Progress</TableCell>
              <TableCell align="center">Weight</TableCell>
              <TableCell align="center">Confidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {keyResults.map((kr) => (
              <TableRow key={kr.id}>
                <TableCell>
                  <Typography variant="body2">{kr.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {kr.metric_unit} • {kr.target_type}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {kr.target_value.toLocaleString()} {kr.metric_unit}
                </TableCell>
                <TableCell align="center">
                  {kr.current_value.toLocaleString()} {kr.metric_unit}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={kr.progress}
                        color={
                          kr.progress >= 70
                            ? 'success'
                            : kr.progress >= 40
                              ? 'warning'
                              : 'error'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {kr.progress}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${kr.weight}%`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${kr.confidence}/10`}
                    size="small"
                    color={
                      kr.confidence >= 7
                        ? 'success'
                        : kr.confidence >= 5
                          ? 'warning'
                          : 'error'
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default KeyResultsTable;
