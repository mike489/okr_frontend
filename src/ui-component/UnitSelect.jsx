import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const UnitSelect = ({ units, lastActiveId, onChange }) => {
  const [selectedUnit, setSelectedUnit] = useState(lastActiveId);

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedUnit(value);
    onChange(value);
  };

  return (
    <FormControl fullWidth size="small" sx={{ my: 1 }}>
      <InputLabel id="unit-select-label">Select Unit</InputLabel>
      <Select
        labelId="unit-select-label"
        id="unit-select"
        value={selectedUnit}
        label="Select Unit"
        onChange={handleChange}
      >
        {units
          .filter((unit) => unit.is_active)
          .map((unit) => (
            <MenuItem key={unit.id} value={unit.id}>
              {unit.name}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

export default UnitSelect;
