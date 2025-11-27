import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
} from '@mui/material';
import { toast } from 'react-toastify';
import DrogaFormModal from 'ui-component/modal/DrogaFormModal';
import { Phone } from '@mui/icons-material';

const AddUser = ({ add, isAdding, roles, onClose, onSubmit }) => {
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    Phone: '',
    password: '',
    roles: [],
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
    if (!userDetails.email || !userDetails.name) {
      toast.error('Please fill all required fields.');
      return;
    }
    onSubmit(userDetails);
  };

  return (
    <DrogaFormModal
      open={add}
      title="Add User"
      handleClose={onClose}
      onCancel={onClose}
      onSubmit={(event) => handleSubmit(event)}
      submitting={isAdding}
    >
      <TextField
        fullWidth
        label="Name"
        name="name"
        value={userDetails.name}
        onChange={handleChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Email"
        name="email"
        value={userDetails.email}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Phone"
        name="phone"
        value={userDetails.phone}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Password"
        name="password"
        value={userDetails.password}
        onChange={handleChange}
        margin="normal"
      />

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
AddUser.propTypes = {
  add: PropTypes.bool.isRequired,
  isAdding: PropTypes.bool.isRequired,
  roles: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddUser;
