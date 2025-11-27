import React from 'react';
import UnitSelect from './UnitSelect'; 
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { IconHierarchy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom'; 

const DepSection = ({ unitData, departmentItems }) => {
  const navigate = useNavigate(); 

  const handleUnitChange = (id) => {
    console.log('Selected Unit:', id);
    navigate(`/units/${id}`);
  };

  return (
    <div>
      <List subheader={<strong style={{ paddingLeft: 16 }}>Department</strong>}>
        <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <UnitSelect
            units={unitData.units}
            lastActiveId={unitData.id}
            onChange={handleUnitChange}
          />
        </ListItem>

        <Divider sx={{ my: 1 }} />

        {departmentItems.map((item) => (
          <ListItem key={item.id} button onClick={() => navigate(item.url)}>
            <ListItemIcon>{<item.icon size={20} />}</ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default DepSection;
