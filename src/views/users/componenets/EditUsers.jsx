import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, FormControl, InputLabel, Select, MenuItem, ListItemText } from '@mui/material';
import { toast } from 'react-toastify';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';

const EditUser = ({ edit, isUpdating, userData = {}, roles, onClose, onSubmit }) => {
  const { name: userName, email: userEmail, phone: userPhone, roles: userRoles = [] } = userData;

  const [userDetails, setUserDetails] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: userPhone || '',
    roles: userRoles.map((role) => role.uuid) || []
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleRoleChange = (event) => {
    const selectedRoles = event.target.value;
    setUserDetails({ ...userDetails, roles: selectedRoles });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { name, email } = userDetails;
    if (!email || !name) {
      toast.error('Please fill all required fields.');
      return;
    }
    onSubmit(userDetails);
  };

  return (
    <DrogaFormModal open={edit} title="Edit User" handleClose={onClose} onCancel={onClose} onSubmit={handleSubmit} submitting={isUpdating}>
      <TextField fullWidth label="Name" name="name" value={userDetails.name} onChange={handleChange} margin="normal" required />

      <TextField fullWidth label="Email" name="email" value={userDetails.email} onChange={handleChange} margin="normal" required />

      <TextField fullWidth label="Phone" name="phone" value={userDetails.phone} onChange={handleChange} margin="normal" />

      <FormControl fullWidth margin="normal">
        <InputLabel>Roles</InputLabel>
        <Select
          label="Roles"
          multiple
          value={userDetails.roles}
          onChange={handleRoleChange}
          renderValue={(selected) =>
            roles
              .filter((role) => selected.includes(role.uuid))
              .map((role) => role.name)
              .join(', ')
          }
        >
          {roles.map((role) => (
            <MenuItem key={role.uuid} value={role.uuid}>
              <ListItemText primary={role.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </DrogaFormModal>
  );
};

EditUser.propTypes = {
  edit: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  userData: PropTypes.object,
  roles: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default EditUser;
