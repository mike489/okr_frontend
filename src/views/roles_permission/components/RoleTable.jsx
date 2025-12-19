import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
  TextField,
  useTheme,
  Checkbox,
  Grid,
  Chip,
} from '@mui/material';
import { toast } from 'react-toastify';
import { DotMenu } from 'ui-component/menu/DotMenu';
import { IconChevronDown, IconChevronRight, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Backend from 'services/backend';
import Fallbacks from 'utils/components/Fallbacks';
import ActivityIndicator from 'ui-component/indicators/ActivityIndicator';
import DrogaButton from 'ui-component/buttons/DrogaButton';
import Search from 'ui-component/search';
import DrogaCard from 'ui-component/cards/DrogaCard';
import GetToken from 'utils/auth-token';

const RoleTable = ({ searchQuery }) => {
  const theme = useTheme();
  const [roleLoading, setRoleLoading] = useState(true);
  const [permLoading, setPermLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editedRole, setEditedRole] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFetchingRole = () => {
    setRoleLoading(true);
    const token = localStorage.getItem('token');
    const Api = Backend.pmsUrl(Backend.roles);

    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setRoles(response.data); // Update roles state
        }
        setRoleLoading(false);
      })
      .catch((error) => {
        setRoleLoading(false);
        setError(true);
        toast(error.message);
      });
  };

  const filteredPermissions = Object.keys(allPermissions).reduce(
    (acc, type) => {
      const filtered = allPermissions[type].filter((perm) =>
        perm.name.toLowerCase().includes(search.toLowerCase()),
      );
      if (filtered.length > 0) {
        acc[type] = filtered;
      }
      return acc;
    },
    {},
  );

  const handleSearchingPermission = (event) => {
    const value = event.target.value;
    setSearch(value);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenRole = (index) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      setSelectedIndex(index);
    }
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedRole(null);
  };

  const handleOpenEditModal = (role) => {
    setPermLoading(true);
    setEditedRole({ name: role.name });
    setSelectedRole(role);
    setSelectedPermissions(role.permissions.map((perm) => perm.uuid)); // Map current permissions to the UUIDs
    setOpenEditModal(true);
    handleCloseMenu();

    // Fetch all permissions from the backend
    const token = localStorage.getItem('token');
    const Api = Backend.auth + Backend.permissi; // Assuming this is the correct endpoint
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'GET',
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          const permissionsData = response.data;

          const grouped = permissionsData.reduce((acc, perm) => {
            const type = perm.name.split(':')[1];
            if (!acc[type]) {
              acc[type] = [];
            }
            acc[type].push({ name: perm.name, id: perm.uuid });

            return acc;
          }, {});

          setAllPermissions(grouped); // Store all permissions
        } else {
          toast('Error fetching permissions');
        }
      })
      .catch((error) => {
        toast(error.message);
      })
      .finally(() => setPermLoading(false));
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedRole(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditedRole((prev) => ({ ...prev, [name]: value }));
  };
  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prevSelected) => {
      if (prevSelected.includes(permissionId)) {
        return prevSelected.filter((id) => id !== permissionId); // Deselect permission
      } else {
        return [...prevSelected, permissionId]; // Select permission
      }
    });
  };

  const handleSaveEdit = async () => {
    setSubmitting(true);
    const token = await GetToken();
    const Api = Backend.auth + Backend.roles + `/${selectedRole.uuid}`;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    // Prepare the payload with role name and selected permissions
    const payload = {
      name: editedRole.name,
      permissions: selectedPermissions, // Send the updated list of permissions
    };

    fetch(Api, {
      method: 'PATCH',
      headers: header,
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          toast('Role updated successfully');
          handleFetchingRole();
          handleCloseEditModal();
        } else {
          toast('Error updating role');
        }
      })
      .catch((error) => {
        toast(error.message);
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (roleId) => {
    const token = localStorage.getItem('token');
    const Api = Backend.auth + Backend.roles + `/${roleId}`;
    const header = {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    fetch(Api, {
      method: 'DELETE',
      headers: header,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setRoles((prevRoles) =>
            prevRoles.filter((role) => role.uuid !== roleId),
          );
          toast.success(response?.data?.message);
          handleFetchingRole();
        } else {
          toast('Error deleting role');
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const groupPermissionsByType = (permissions) => {
    return permissions.reduce((groups, permission) => {
      const { type } = permission;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(permission);
      return groups;
    }, {});
  };

  useEffect(() => {
    handleFetchingRole();
  }, []);

  return (
    <Box
      component={Paper}
      sx={{
        minHeight: '40dvh',
        width: '100%',
        border: 0.4,
        borderColor: theme.palette.divider,
        borderRadius: 2,
        p: 2,
      }}
    >
      {roleLoading ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40dvh',
          }}
        >
          <ActivityIndicator size={20} />
        </Box>
      ) : error ? (
        <Fallbacks
          severity="error"
          title="Server error"
          description="There is an error fetching Roles"
        />
      ) : filteredRoles.length === 0 ? (
        <Fallbacks
          severity="info"
          title="No Roles Found"
          description="The list of added Roles will be listed here"
        />
      ) : (
        filteredRoles.map((role, index) => (
          <Box key={role.uuid} onClick={() => handleOpenRole(index)}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor:
                  selectedIndex === index && theme.palette.primary.main,
                p: 1.4,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color:
                    selectedIndex === index
                      ? 'white'
                      : theme.palette.text.primary,
                }}
              >
                {role.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DotMenu
                  orientation="horizontal"
                  onEdit={() => handleOpenEditModal(role)}
                  onDelete={() => handleDelete(role.uuid)}
                  sx={{
                    color:
                      selectedIndex === index
                        ? 'white'
                        : theme.palette.text.primary,
                  }}
                />

                <IconButton
                  onClick={() => handleOpenRole(index)}
                  sx={{ marginLeft: 2 }}
                >
                  {selectedIndex === index ? (
                    <IconChevronDown
                      size="1.2rem"
                      stroke="1.4"
                      style={{
                        color:
                          selectedIndex === index
                            ? 'white'
                            : theme.palette.text.primary,
                      }}
                    />
                  ) : (
                    <IconChevronRight
                      size="1.2rem"
                      stroke="1.4"
                      style={{
                        color:
                          selectedIndex === index
                            ? 'white'
                            : theme.palette.text.primary,
                      }}
                    />
                  )}
                </IconButton>
              </Box>
            </Box>
            {selectedIndex === index && (
              <Box sx={{ mb: 1, transition: 'all 0.6s ease' }}>
                <Divider
                  sx={{
                    borderBottom: 0.4,
                    borderColor: theme.palette.divider,
                    my: 2,
                  }}
                />
                {Object.entries(groupPermissionsByType(role.permissions)).map(
                  ([type, perms], i) => (
                    <Box key={i} sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          textTransform: 'capitalize',
                          mb: 2,
                          color: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        Assigned Permissions
                      </Typography>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: 2,
                        }}
                      >
                        {perms.map((perm, idx) => (
                          <Paper
                            key={idx}
                            elevation={1}
                            sx={{
                              padding: 2,
                              borderRadius: 2,
                              backgroundColor: theme.palette.background.paper,
                              transition:
                                'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: theme.shadows[8],
                              },
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 'bold', mb: 1 }}
                            >
                              {perm.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {perm.description || 'No description available'}
                            </Typography>
                            <Chip
                              label="Assigned"
                              size="small"
                              sx={{
                                mt: 1,
                                fontSize: '0.75rem',
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.success.dark,
                              }}
                            />
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  ),
                )}
              </Box>
            )}
            <Divider
              sx={{
                borderBottom: 0.4,
                borderColor: theme.palette.divider,
                my: 0.8,
              }}
            />
          </Box>
        ))
      )}

      {/* Edit Modal */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseEditModal}
        fullWidth={true}
        maxWidth="lg"
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            m: 3,
            mb: 1,
          }}
        >
          <Typography variant="h3">Edit Role</Typography>

          <motion.div
            whileHover={{
              rotate: 90,
            }}
            transition={{ duration: 0.3 }}
            style={{ cursor: 'pointer', marginRight: 10 }}
            onClick={handleCloseEditModal}
          >
            <IconX size="1.4rem" stroke={2} />
          </motion.div>
        </Box>

        <DialogContent>
          <Box>
            <TextField
              label="Role Name"
              name="name"
              value={editedRole.name}
              onChange={handleEditChange}
              fullWidth
              margin="dense"
            />

            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h4" mb={1}>
                  Permissions
                </Typography>
              </Grid>

              <Grid item xs={12} mb={1}>
                <Search
                  title="Search Permissions"
                  filter={false}
                  value={search}
                  onChange={handleSearchingPermission}
                ></Search>
              </Grid>
              {permLoading ? (
                <Grid container>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ActivityIndicator size={20} />
                  </Grid>
                </Grid>
              ) : (Object.keys(allPermissions).length === 0) === 0 ? (
                <Typography>No permissions available</Typography>
              ) : (
                Object.keys(filteredPermissions).map((type, index) => (
                  <Grid item xs={12} sm={6} md={4} xl={3} key={index}>
                    <DrogaCard
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.01)',
                        },
                      }}
                    >
                      {filteredPermissions[type].map((permission) => (
                        <Box
                          key={permission.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: '2px',
                            transition: 'background-color 0.3s',
                            '&:hover': {
                              backgroundColor: '#f0f0f0',
                            },
                          }}
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(
                              permission.id,
                            )}
                            onChange={() =>
                              handlePermissionChange(permission.id)
                            }
                          />

                          <Typography
                            sx={{ ml: 1, cursor: 'pointer' }}
                            onClick={() =>
                              handlePermissionChange(permission.id)
                            }
                          >
                            {permission.name}
                          </Typography>
                        </Box>
                      ))}
                    </DrogaCard>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <DrogaButton
            title={
              submitting ? (
                <ActivityIndicator size={16} sx={{ color: 'white' }} />
              ) : (
                'Save Changes'
              )
            }
            onPress={handleSaveEdit}
            color="primary"
          />
        </DialogActions>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={openDetailModal} onClose={handleCloseDetailModal}>
        <DialogTitle>Role Details</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Role Name:</Typography>
          <Typography>{selectedRole?.name}</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Permissions:
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {selectedRole?.permissions.length === 0 ? (
              <Typography>No permissions assigned</Typography>
            ) : (
              selectedRole?.permissions.map((perm) => (
                <Chip key={perm.uuid} label={perm.name} sx={{ mr: 1, mb: 1 }} />
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleTable;
