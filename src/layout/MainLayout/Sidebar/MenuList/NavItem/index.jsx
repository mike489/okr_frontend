// NavItem.jsx
import { ListItemButton, ListItemIcon, ListItemText,Typography ,Box , Badge, Tooltip, alpha } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const NavItem = ({ item, mini }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === item.url;

  const Icon = item.icon || (() => null);

  const button = (
    <ListItemButton
      onClick={() => navigate(item.url)}
      sx={{
        borderRadius: 3,
        mb: 0.6,
        py: 1.3,
        px: mini ? 1.8 : 2.5,
        justifyContent: mini ? 'center' : 'flex-start',
        bgcolor: isActive
          ? alpha(theme.palette.primary.main, 0.15)
          : 'transparent',
        color: isActive ? 'text.secondary' : 'text.secondary',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          color: 'white',
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            bgcolor: 'primary.main',
            borderRadius: '0 4px 4px 0',
            boxShadow: `0 0 15px ${theme.palette.primary.main}`
          }}
        />
      )}

      <ListItemIcon
        sx={{
          minWidth: mini ? 'auto' : 44,
          color: 'inherit',
          mr: mini ? 0 : 2
        }}
      >
        <Icon stroke={1.5} size="1.4rem" />
      </ListItemIcon>

      {!mini && (
        <ListItemText
          primary={
            <Typography
              variant="body2"
              fontWeight={isActive ? 600 : 500}
              sx={{ color: 'inherit' }}
            >
              {item.title}
            </Typography>
          }
        />
      )}

      {item.badge && (
        <Badge badgeContent={item.badge} color="error" sx={{ mr: 1 }} />
      )}
    </ListItemButton>
  );

  return mini ? (
    <Tooltip title={item.title} placement="right" arrow>
      {button}
    </Tooltip>
  ) : (
    button
  );
};

export default NavItem;