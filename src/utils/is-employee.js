import { useSelector } from 'react-redux';

const IsEmployee = () => {
  const user = useSelector((state) => state.user.user);

  if (user?.roles) {
    const updatedRoles = user.roles.map((role) => role.name.trim().toLowerCase());
    return updatedRoles.length === 1 && updatedRoles.includes('employee');
  }
  return false;
};

export default IsEmployee;
