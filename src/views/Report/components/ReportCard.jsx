import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
  Tooltip,
  Divider,
} from '@mui/material';
import { IconBulb, IconDotsVertical } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const ReportCard = ({ data, onEdit, onDelete }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        p: 3,
        borderRadius: 4,
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(to bottom right, #1e1e1e, #2c2c2c)'
            : 'linear-gradient(to bottom right, #ffffff, #f5f7fa)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[3],
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: theme.shadows[6],
        },
        width: '100%',
        height: '100%',
      }}
    >
      {/* Menu */}
      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
        <Tooltip title="Actions">
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
          >
            <IconDotsVertical size={20} />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onEdit?.(data);
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onDelete?.(data);
            }}
            sx={{ color: 'error.main', fontWeight: 600 }}
          >
            Remove
          </MenuItem>
        </Menu>
      </Box>

      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          mb: 1.5,
          fontWeight: 700,
          color: 'text.primary',
          lineHeight: 1.4,
        }}
      >
        {data?.plan?.main_activity?.title || 'No Title'}
      </Typography>

      {/* Description */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {/* <IconBulb
          size={20}
          style={{ marginRight: 8, color: theme.palette.warning.main }}
        /> */}
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          {data?.description || 'No description available'}
        </Typography>
      </Box>

      {/* Creator */}
      <Typography
        variant="caption"
        sx={{
          mb: 2,
          fontStyle: 'italic',
          color: 'text.disabled',
          textAlign: 'right',
        }}
      >
        By: {data?.creator?.name || 'Unknown'}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Footer Info */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Weight */}
        <Box
          sx={{
            textAlign: 'center',
            flex: 1,
            flexDirection: 'column',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', mb: 0.5 }}
          >
            Weight
          </Typography>
          <Chip
            label={data?.plan?.main_activity?.weight ?? 'N/A'}
            size="small"
            sx={{
              maxWidth: 50,
              backgroundColor: theme.palette.success.light,
              color: theme.palette.success.contrastText,
              fontWeight: 600,
              alignItems: 'center',
              justifyContent: 'center',
              // color: theme.palette.success.contrastText,
            }}
          />
        </Box>

        {/* Status */}
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', mb: 0.5 }}
          >
            Status
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: theme.palette.info.main,
            }}
          >
            {data?.creator?.status || 'N/A'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

ReportCard.propTypes = {
  data: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ReportCard;
