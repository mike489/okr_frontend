import React from 'react';
import { Box, Paper, Typography, LinearProgress, Chip, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const KeyResultsTable = ({ keyResults, onEdit, onDelete }) => {
  return (
    <Paper elevation={2} sx={{ overflowX: 'auto' }}>
      <Box component="table" sx={{ width: '100%', minWidth: 650 }}>
        <Box component="thead" sx={{ backgroundColor: 'primary.light' }}>
          <Box component="tr">
            <Box component="th" sx={{ p: 1 }}>Name</Box>
            <Box component="th" sx={{ p: 1 }}>Objective</Box>
            <Box component="th" sx={{ p: 1 }}>Metric</Box>
            <Box component="th" sx={{ p: 1 }}>Progress</Box>
            <Box component="th" sx={{ p: 1 }}>Confidence</Box>
            <Box component="th" sx={{ p: 1 }}>Actions</Box>
          </Box>
        </Box>
        <Box component="tbody">
          {keyResults.map((kr) => (
            <Box
              component="tr"
              key={kr.id}
              sx={{
                '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                '&:hover': { backgroundColor: 'action.selected', transition: '0.3s' },
              }}
            >
              <Box component="td" sx={{ p: 1 }}>
                <Typography fontWeight={500}>{kr.name}</Typography>
              </Box>
              <Box component="td" sx={{ p: 1 }}>{kr.objective?.title}</Box>
              <Box component="td" sx={{ p: 1 }}>{kr.metric_unit}</Box>
              <Box component="td" sx={{ p: 1, width: 200 }}>
                <LinearProgress variant="determinate" value={kr.progress} />
                <Typography variant="caption">{kr.progress}%</Typography>
              </Box>
              <Box component="td" sx={{ p: 1 }}>
                <Chip label={kr.confidence} color="info" size="small" />
              </Box>
              <Box component="td" sx={{ p: 1 }}>
                <IconButton color="primary" onClick={() => onEdit(kr)}>
                  <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => onDelete(kr.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default KeyResultsTable;
