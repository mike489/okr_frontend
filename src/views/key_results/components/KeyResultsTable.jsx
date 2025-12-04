import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  IconButton,
  Avatar
} from '@mui/material';

import { DotMenu } from 'ui-component/menu/DotMenu';
import hasPermission from 'utils/auth/hasPermission';

const KeyResultsTable = ({ keyResults, onEdit, onDelete, onView }) => {
  const theme = useTheme();

  const [selectedKR, setSelectedKR] = useState(null);

  const handleOpen = (kr) => {
    setSelectedKR(kr);
  };

  const handleClose = () => {
    setSelectedKR(null);
  };

  const handleEdit = () => {
    if (onEdit && selectedKR) onEdit(selectedKR);
    handleClose();
  };

  const handleDelete = () => {
    if (onDelete && selectedKR) onDelete(selectedKR.id);
    handleClose();
  };

  const handleView = () => {
    if (onView && selectedKR) onView(selectedKR);
    handleClose();
  };

  return (
    <Paper sx={{ minHeight: '60dvh', overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 800 }} aria-label="Key Results Table">
          <TableHead>
            <TableRow>
              {[
                'Name',
                'Metric Unit',
                'Start',
                'Current',
                'Target',
                'Weight',
                'Confidence',
                'Progress',
                'Calculation Method',
                'Actions'
              ].map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    background: theme.palette.grey[100],
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {keyResults?.map((kr) => (
              <TableRow
                key={kr.id}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] },
                  '&:hover': { backgroundColor: theme.palette.grey[100] },
                }}
              >
                <TableCell>{kr.name}</TableCell>
                <TableCell>{kr.metric_unit}</TableCell>
                <TableCell>{kr.start_value}</TableCell>
                <TableCell>{kr.current_value}</TableCell>
                <TableCell>{kr.target_value}</TableCell>
                <TableCell>{kr.weight}</TableCell>
                <TableCell>{kr.confidence}%</TableCell>
                <TableCell>{kr.progress}%</TableCell>
                <TableCell>{kr.calc_method}</TableCell>

                <TableCell>
                  <DotMenu
                    onOpen={() => handleOpen(kr)}
                    onClose={handleClose}
                    onView={
                      hasPermission('read_key_result') ? handleView : null
                    }
                    onEdit={
                      hasPermission('update_key_result') ? handleEdit : null
                    }
                    onDelete={
                      hasPermission('delete_key_result') ? handleDelete : null
                    }
                  />
                </TableCell>
              </TableRow>
            ))}

            {!keyResults?.length && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography>No key results found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default KeyResultsTable;
