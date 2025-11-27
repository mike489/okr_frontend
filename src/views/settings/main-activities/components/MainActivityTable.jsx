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
} from '@mui/material';

import { DotMenu } from 'ui-component/menu/DotMenu';
import hasPermission from 'utils/auth/hasPermission';

const MainActivityTable = ({ units, onEdit, onDelete }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const handleClick = (unit) => {
    setSelectedUnit(unit);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedUnit(null);
  };

  const handleOpenEditModal = () => {
    if (onEdit && selectedUnit) {
      onEdit(selectedUnit);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (onDelete && selectedUnit) {
      onDelete(selectedUnit.id);
    }
    handleClose();
  };

  return (
    <Paper
      sx={{
        minHeight: '66dvh',
        overflow: 'hidden',
        
      }}
    >
     <TableContainer sx={{ width: '100%' }}>
        <Table
          sx={{
            maxWidth: '100%',
            borderCollapse: 'collapse',
          }}
          
        >
          <TableHead>
            <TableRow>
              {['Name', 'Initiative', 'Type',  'Weight', 'Target', 'Actions'].map(
                (header) => (
                  <TableCell
                    key={header}
                    sx={{
                      background: theme.palette.grey[100],
                      color: theme.palette.text.primary,
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      position: 'relative',
                      padding: '12px 16px',
                      '&:not(:last-of-type)': {
                        borderRight: `1px solid ${theme.palette.divider}`,
                      },
                    }}
                  >
                    {header}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {units?.map((unit) => (
              <TableRow
                key={unit.id}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  '&:nth-of-type(odd)': {
                    backgroundColor: theme.palette.grey[50],
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.grey[100],
                  },
                }}
              >
                <TableCell
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: 0,
                    padding: '12px 16px',
                  }}
                >
                  <Typography variant="subtitle3" sx={{ flexGrow: 1 }}>
                    {unit.title}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    border: 0,
                    padding: '12px 16px',
                  }}
                >
                  {unit?.initiative ? unit?.initiative?.title : 'No Initiative'}
                </TableCell>

                <TableCell
                  sx={{
                    border: 0,
                    padding: '12px 16px',
                  }}
                >
                  {unit.type}
                </TableCell>
               
                <TableCell
                  sx={{
                    border: 0,
                    padding: '12px 16px',
                  }}
                >
                  {unit.weight} 
                </TableCell>
                 <TableCell
                  sx={{
                    border: 0,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {unit.target}
                </TableCell>
                <TableCell
                  sx={{
                    border: 0,
                    padding: '12px 16px',
                  }}
                >
                  <DotMenu
                    onOpen={() => handleClick(unit)}
                    onClose={() => handleClose()}
                    
                    onEdit={
                      hasPermission('update:mainactivity')
                        ? () => handleOpenEditModal()
                        : null
                    }
                    onDelete={
                      hasPermission('delete:mainactivity') ? () => handleDelete() : null
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
export default MainActivityTable;
