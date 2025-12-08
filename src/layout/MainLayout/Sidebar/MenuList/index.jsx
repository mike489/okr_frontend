// layout/Sidebar/MenuList.jsx
import React from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Typography,
  Tooltip,
  Box,
  alpha
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import NavGroup from './NavGroup';
import useMenuFilter from 'hooks/useMenuFilter';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const MenuList = ({ mini = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredNavItems, loading } = useMenuFilter();

  if (loading) {
    return (
      <Typography variant="body2" align="center" sx={{ py: 4, color: 'text.secondary' }}>
        Loading menu...
      </Typography>
    );
  }

  if (!filteredNavItems || filteredNavItems.length === 0) {
    return (
      <Typography variant="body2" align="center" color="error" sx={{ py: 4 }}>
        No menu items available
      </Typography>
    );
  }

  const renderNavItem = (item) => {
    const isSelected = location.pathname === item.url;

    const ItemIcon = item.icon ? (
      React.cloneElement(item.icon, {
        stroke: 1.6,
        size: '1.4rem'
      })
    ) : (
      <FiberManualRecordIcon
        sx={{
          width: 8,
          height: 8,
          color: isSelected ? 'primary.main' : 'text.secondary'
        }}
      />
    );

    const content = (
      <ListItemButton
        onClick={() => navigate(item.url)}
        disabled={item.disabled}
        sx={{
          borderRadius: 3,
          mb: 0.75,
          py: 1.4,
          px: mini ? 2 : 2.5,
          justifyContent: mini ? 'center' : 'initial',
          position: 'relative',
          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.14) : 'transparent',
          color: isSelected ? 'primary.main' : 'text.secondary',
          fontWeight: isSelected ? 600 : 500,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            transform: 'translateY(-2px)',
            boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.15)}`
          },
          transition: 'all 0.32s cubic-bezier(0.4,0,.2,1)'
        }}
      >
        {isSelected && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 4,
              bottom: 4,
              width: 5,
              bgcolor: 'primary.main',
              borderRadius: '0 6px 6px 0',
              boxShadow: `0 0 16px ${theme.palette.primary.main}`
            }}
          />
        )}

        <ListItemIcon
          sx={{
            minWidth: mini ? 'auto' : 48,
            color: 'inherit',
            mr: mini ? 0 : 3
          }}
        >
          {ItemIcon}
        </ListItemIcon>

        {!mini && (
          <ListItemText
            primary={
              <Typography
                variant="body2"
                fontWeight={isSelected ? 600 : 500}
                sx={{ color: 'inherit' }}
              >
                {item.title}
              </Typography>
            }
          />
        )}

        {item.badge?.count > 0 && (
          <Badge
            badgeContent={item.badge.count}
            color="error"
            variant={item.badge.variant || 'standard'}
            sx={{
              '& .MuiBadge-badge': {
                right: mini ? -4 : 6,
                top: 10
              }
            }}
          />
        )}
      </ListItemButton>
    );

    return mini ? (
      <Tooltip key={item.id} title={item.title} placement="right" arrow>
        {content}
      </Tooltip>
    ) : (
      <React.Fragment key={item.id}>{content}</React.Fragment>
    );
  };

  const navItems = filteredNavItems.map((item) => {
    switch (item.type) {
      case 'group':
        // 🔥 FIXED: Always render NavGroup — pass mini so it handles small mode
        return <NavGroup key={item.id} item={item} mini={mini} />;

      case 'item':
        return renderNavItem(item);

      default:
        return null;
    }
  });

  return <>{navItems}</>;
};

export default MenuList;
