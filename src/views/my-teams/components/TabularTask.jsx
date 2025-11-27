import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { formatDate, getStatusColor } from 'utils/function';
import {
  IconCircleCheck,
  IconX,
  IconMessageReply,
} from '@tabler/icons-react';
import DrogaCard from 'ui-component/cards/DrogaCard';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';

export const TabularTask = ({
  task,
  onActionTaken,
  statusIsChanging,
  onViewDetail,
}) => {
  const theme = useTheme();
  const bigDevice = useMediaQuery(theme.breakpoints.up('sm'));

  const [actionInfo, setActionInfo] = useState({
    approving: false,
    rejecting: false,
  });

  const handleApprove = () => {
    setActionInfo((prevState) => ({ ...prevState, approving: true }));
    onActionTaken('approved');
  };

  const handleReject = () => {
    setActionInfo((prevState) => ({ ...prevState, rejecting: true }));
    onActionTaken('rejected');
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <DrogaCard
          sx={{ ':hover': { backgroundColor: theme.palette.grey[50] } }}
        >
          <Box>
            <Grid container spacing={1}>
              <Grid
                item
                xs={12}
                sm={12}
                md={4}
                lg={4}
                xl={4}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Grid
                  container
                  spacing={1}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Grid
                    item
                    xs={1.2}
                    sm={1.2}
                    md={2.8}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    {bigDevice && (
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: getStatusColor(task.status),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 2,
                          ml: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 11,
                            height: 11,
                            borderRadius: 5.5,
                            backgroundColor: getStatusColor(task.status),
                            border: 1,
                            borderColor: 'white',
                          }}
                        />
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={9.2}>
                    <Typography
                      variant="h4"
                      onClick={onViewDetail}
                      sx={{
                        cursor: 'pointer',
                        ':hover': { color: theme.palette.primary.main },
                      }}
                    >
                      {task?.title}
                    </Typography>
                    <Typography variant="subtitle2" mt={0.4}>
                      {task?.description}
                    </Typography>
                    {/* <Typography variant="subtitle2" mt={0.4}>
                      {task?.plan?.main_activity?.title}
                    </Typography> */}
                  </Grid>
                </Grid>
              </Grid>
              <Grid

                item
                xs={12}
                sm={12}
                md={4}
                lg={4}
                xl={4}
              >
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ textTransform: 'capitalize' }}
                >
                  {formatDate(task?.created_at).formattedDate}
                </Typography>
                <Typography variant="subtitle2">Date created</Typography>
              </Grid>

              <Grid
                item
                xs={12}
                sm={12}
                md={2}
                lg={2}
                xl={2}

              >
                {/* Placeholder for removed subtask section */}
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ textTransform: 'capitalize' }}
                >
                  {formatDate(task?.deadline).formattedDate}
                </Typography>
                <Typography variant="subtitle2">Deadline</Typography>
              </Grid>



              <Grid
                item
                xs={12}
                sm={12}
                md={2}
                lg={2}
                xl={2}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <IconMessageReply
                  size="1.4rem"
                  stroke="2"
                  style={{ color: theme.palette.grey[150] }}
                  onClick={onViewDetail}
                />

                {task.status === 'pending' ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <IconButton onClick={handleApprove} title="Approve">
                      {actionInfo.approving ? (
                        <ActivityIndicator size={16} />
                      ) : (
                        <IconCircleCheck
                          size="1.4rem"
                          stroke="2"
                          style={{ color: 'green' }}
                        />
                      )}
                    </IconButton>
                    <IconButton onClick={handleReject} title="Reject">
                      {actionInfo.rejecting ? (
                        <ActivityIndicator size={16} />
                      ) : (
                        <IconX
                          size="1.4rem"
                          stroke="1.6"
                          style={{ color: 'red' }}
                        />
                      )}
                    </IconButton>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color={getStatusColor(task.status)}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {task.status}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DrogaCard>
      </Grid>
    </Grid>
  );
};

TabularTask.propTypes = {
  task: PropTypes.object.isRequired,
  onActionTaken: PropTypes.func.isRequired,
  statusIsChanging: PropTypes.bool.isRequired,
  onViewDetail: PropTypes.func.isRequired,
};