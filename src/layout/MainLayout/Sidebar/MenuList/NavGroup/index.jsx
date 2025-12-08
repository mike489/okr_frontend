// layout/Sidebar/NavGroup.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import {
  List,
  Typography,
  Collapse,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';

import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';
import { useSelector } from 'react-redux';

const NavGroup = ({ item, mini = false }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const { weeklyTasks, approvalRequests } = useSelector(
    (state) => state.pending
  );

  const PendingTasks = {
    teams: { count: weeklyTasks },
    approvals: { count: approvalRequests }
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  // If mini mode → hide all text, show only icon with tooltip
  if (mini) {
    return (
      <Tooltip title={item.title} placement="right">
        <Box>
          <IconButton
            onClick={handleToggle}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover', color: 'primary.main' }
            }}
          >
            {item.icon && <item.icon size="1.4rem" stroke={1.5} />}
            {open ? <IconChevronUp /> : <IconChevronDown />}
          </IconButton>

          <Collapse in={open}>
            <List disablePadding sx={{ pl: 1 }}>
              {item.children?.map((menu) => {
                switch (menu.type) {
                  case 'collapse':
                    return <NavCollapse key={menu.id} menu={menu} level={1} mini={mini} PendingTasks={PendingTasks} />;
                  case 'item':
                    return <NavItem key={menu.id} item={menu} level={1} mini={mini} PendingTasks={PendingTasks} />;
                  default:
                    return null;
                }
              })}
            </List>
          </Collapse>
        </Box>
      </Tooltip>
    );
  }

  // FULL MODE — Your original beautiful design
  return (
    <>
      <List
        subheader={
          item.title && (
            <Typography
              variant="caption"
              onClick={handleToggle}
              sx={{
                ...theme.typography.menuCaption,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'text.secondary',
                cursor: 'pointer',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'all 0.2s'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color:'white' }}>
                {item.icon && <item.icon size="1.3rem" stroke={1.5} />}
                <span>{item.title}</span>
              </Box>
              {open ? <IconChevronUp size="1rem" color='white' /> : <IconChevronDown size="1rem" color='white' />}
            </Typography>
          )
        }
      >
        <Collapse in={open}>
          <List disablePadding sx={{ pl: 2 }}>
            {item.children?.map((menu) => {
              switch (menu.type) {
                case 'collapse':
                  return <NavCollapse key={menu.id} menu={menu} level={1} PendingTasks={PendingTasks} />;
                case 'item':
                  return <NavItem key={menu.id} item={menu} level={1} PendingTasks={PendingTasks} />;
                default:
                  return null;
              }
            })}
          </List>
        </Collapse>
      </List>
    </>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object.isRequired,
  mini: PropTypes.bool
};

export default NavGroup;