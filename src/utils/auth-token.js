import { Storage } from 'configration/storage';
import { handleBackendLogout } from './user-inactivity';
import { SIGN_IN } from 'store/actions/actions';
import Backend from 'services/backend';
import { store } from 'store';

export const RefreshToken = async () => {
  const Api = Backend.auth + Backend.refreshToken;
  const token = Storage.getItem('token');

  try {
    const response = await fetch(Api, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      const currentTime = new Date().getTime();
      const ttl = data.data.expires_in * 1000;
      const expirationTime = ttl + currentTime;

      Storage.setItem('token', data.data.access_token);
      Storage.setItem('tokenExpiration', expirationTime);
    } else {
      throw new Error('Token refresh failed');
    }
  } catch (error) {
    throw error;
  }
};

const GetToken = async () => {
  const token = Storage.getItem('token');
  const ttl = Storage.getItem('tokenExpiration');
  const currentTime = new Date().getTime();
  const twoMinutes = 2 * 60 * 1000;

  if (ttl - currentTime < twoMinutes) {
    try {
      await RefreshToken();
      return Storage.getItem('token');
    } catch (error) {
      store.dispatch({ type: SIGN_IN, signed: false });
      await handleBackendLogout();
      Storage.clear();
      return null;
    }
  } else if (token) {
    return token;
  } else {
    store.dispatch({ type: SIGN_IN, signed: false });
    await handleBackendLogout();
    Storage.clear();
  }
};

export default GetToken;
