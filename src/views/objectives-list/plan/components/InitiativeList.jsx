import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  IconChevronRight,
  IconChevronDown,
  IconTarget,
  IconList,
  IconX,
} from '@tabler/icons-react';

const InitiativeList = ({ data }) => {
  const [expandedInitiative, setExpandedInitiative] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([]);

  const handleInitiativeClick = (initiativeId) => {
    setExpandedInitiative(
      expandedInitiative === initiativeId ? null : initiativeId,
    );
  };

  const handleOpenDialog = (months) => {
    setSelectedMonths(months);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMonths([]);
  };

  return (
    <Box
      sx={{ width: '100%', bgcolor: 'background.paper', overflow: 'hidden' }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          py: 1,
          bgcolor: '#e3f2fd',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ minWidth: 36 }} /> {/* icon spacer */}
        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: '#0E74B8',
            width: '40%',
          }}
        >
          Initiative
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: '#0E74B8',
            width: '60%',
          }}
        >
          Objective
        </Typography>
      </Box>

      {/* List */}
      <List sx={{ width: '100%', padding: 0 }}>
        {data?.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem
              disablePadding
              sx={{ flexDirection: 'column', alignItems: 'stretch' }}
            >
              {/* Initiative Row */}
              <ListItemButton
                onClick={() => handleInitiativeClick(item.id)}
                sx={{
                  px: 2,
                  py: 1,
                  backgroundColor:
                    expandedInitiative === item.id ? '#e8f0fe' : 'inherit',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  transition: 'background-color 0.3s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {expandedInitiative === item.id ? (
                    <IconChevronDown color="gray" size={20} />
                  ) : (
                    <IconChevronRight color="gray" size={20} />
                  )}
                </ListItemIcon>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1,
                  }}
                >
                  {/* Initiative Info */}
                  <Box sx={{ width: '40%' }}>
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: '#0E74B8',
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>

                  {/* Objective */}
                  <Box sx={{ width: '60%' }}>
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        color: 'text.secondary',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.objective}
                    </Typography>
                  </Box>
                </Box>
              </ListItemButton>

              {/* Expanded Table */}
              <Collapse
                in={expandedInitiative === item.id}
                timeout="auto"
                unmountOnExit
              >
                <Box sx={{ pl: 4, pr: 2, pt: 1, pb: 2 }}>
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                    }}
                  >
                    <Table
                      size="small"
                      sx={{
                        '& .MuiTableCell-root': {
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        },
                      }}
                    >
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell
                            sx={{ fontWeight: 'bold', color: '#0E74B8' }}
                          >
                            Main Activity
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 'bold',
                              color: '#0E74B8',
                              width: 120,
                            }}
                          >
                            Weight
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 'bold',
                              color: '#0E74B8',
                              width: 120,
                            }}
                          >
                            Target
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 'bold', color: '#0E74B8' }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <IconTarget size={18} />
                              Month Targets
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {item.main_activities?.map((activity) => (
                          <TableRow
                            key={activity.id}
                            sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
                          >
                            <TableCell>
                              <Typography
                                sx={{
                                  fontSize: '0.9rem',
                                  fontWeight: 'bold',
                                  color: '#0E74B8',
                                }}
                              >
                                {activity.title}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {activity?.weight ?? '-'}
                            </TableCell>
                            <TableCell align="center">
                              {activity?.target ?? '-'}
                            </TableCell>
                            <TableCell>
                              <Box display="flex" justifyContent="flex-start">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<IconList size={16} />}
                                  onClick={() =>
                                    handleOpenDialog(
                                      activity.plans?.flatMap(
                                        (plan) => plan.months_target,
                                      ) || [],
                                    )
                                  }
                                >
                                  View
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Collapse>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      {/* Popup Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <IconTarget size={20} color="#0E74B8" />
            <Typography sx={{ fontWeight: 'bold', color: '#0E74B8' }}>
              Month Targets
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMonths.length > 0 ? (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#0E74B8' }}>
                      Month
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#0E74B8' }}>
                      Target
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedMonths.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell>{month.month_name}</TableCell>
                      <TableCell>{month.target}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">
              No month targets available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InitiativeList;
