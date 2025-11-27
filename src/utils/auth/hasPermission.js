import getRolesAndPermissionsFromToken from './getRolesAndPermissionsFromToken';

const auth = getRolesAndPermissionsFromToken();

function hasPermission(permissionName) {
  return auth.some((role) => role.permissions.some((permission) => permission.name === permissionName));
}

export default hasPermission;
