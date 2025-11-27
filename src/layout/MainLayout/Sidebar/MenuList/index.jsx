import React from 'react';
import { Typography } from '@mui/material';
import NavGroup from './NavGroup';
import useMenuFilter from 'hooks/useMenuFilter';

const MenuList = () => {
  const { filteredNavItems, loading } = useMenuFilter();

  if (loading) {
    return (
      <Typography variant="h6" align="center">
        Loading menu...
      </Typography>
    );
  }

  if (!filteredNavItems || filteredNavItems.length === 0) {
    return (
      <Typography variant="h6" align="center" color="error">
        No available menu items
      </Typography>
    );
  }

  const navItems = filteredNavItems.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
        
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Item Error
          </Typography>
        );
    }
  });

  return <>{navItems}</>;
};

export default MenuList;
