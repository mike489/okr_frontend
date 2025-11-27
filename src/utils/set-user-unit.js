import { toast } from 'react-toastify';
import { setUserUnit } from 'store/actions/actions';
import Backend from 'services/backend';
import GetToken from './auth-token';

const StoreUserUnit = () => async (dispatch) => {
  try {
    const Api = Backend.api + Backend.units;
    const token = await GetToken();

    const response = await fetch(Api, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 403) {
      // Silently ignore forbidden error (no toast)
      console.warn('403 Forbidden response from user unit API');
      return;  // exit early
    }

    // For any other status, parse JSON
    const data = await response.json();

    if (data.success) {
      dispatch(setUserUnit(data.data));
    } else {
      toast.error(data.message || 'Failed to get user unit');
    }
  } catch (error) {
    // In case an error is thrown, skip toast if 403
    // if (
    //   // error.message.includes('403') ||
    //   // error.message.toLowerCase().includes('forbidden')
    // ) 
    {
      console.warn('403 Forbidden error caught in catch block');
      return;
    }
    toast.error(error.message);
  }
};


export default StoreUserUnit;
