import { Storage } from 'configration/storage';
import { useDispatch } from 'react-redux';
import { logout } from 'utils/user-inactivity';

export const decodeJWT = (token) => {
  if (!token || typeof token !== 'string') {
    console.error('Invalid token provided');
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('Invalid JWT structure');
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

// Get roles and permissions from token
// export const getRolesAndPermissionsFromToken = (dispatch) => {
//   const token = Storage.getItem('userRoles'); // Retrieve the token
//   console.log('first', JSON.parse(token));

//   if (!token) {
//     dispatch && dispatch({ type: SIGN_IN, signed: false });
//     Storage.clear();
//     return;
//   }

//   try {
//     const decodedToken = decodeJWT(token);
//     if (!decodedToken) {
//       console.warn('Failed to decode token');
//       return [];
//     }
//     console.log('first', user);
//     // const roles = decodedToken.roles || [];
//     const roles = user.roles;

//     return roles;
//   } catch (error) {
//     console.error('Failed to get roles and permissions from token:', error);
//     return [];
//   }
// };

export const getRolesAndPermissionsFromToken = (dispatch) => {
  const response = Storage.getItem('userRoles'); // This likely contains the entire response object
  console.log('response', response);
  // If it's the full response object, extract the roles array
  if (response && response.data && Array.isArray(response.data.roles)) {
    return response.data.roles;
  }

  // If roles is directly stored as an array
  if (Array.isArray(response)) {
    return response;
  }

  if (typeof response === 'string') {
    try {
      const parsed = JSON.parse(response);
      if (parsed && parsed.data && Array.isArray(parsed.data.roles)) {
        return parsed.data.roles;
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Fallback: return empty array
  return [];
};

export default getRolesAndPermissionsFromToken;
