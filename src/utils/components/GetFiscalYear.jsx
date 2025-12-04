import { useEffect } from 'react';
import { SET_FISCAL_YEARS, SET_SELECTED_FISCAL_YEAR } from 'store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from 'utils/user-inactivity';
import Backend from 'services/backend';
import GetToken from '../auth-token';

const GetFiscalYear = () => {
  const selectedFiscal = useSelector((state) => state.customization.selectedFiscalYear);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleGettingFiscalYear = async () => {
      try {
        const token = await GetToken();
        const Api = Backend.pmsUrl(Backend.fiscal_years); // tenant-aware API

        const response = await fetch(Api, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          const fiscalYears = result.data?.data || []; // <--- extract array from data.data
          dispatch({ type: SET_FISCAL_YEARS, fiscalYears });

          // Set selected fiscal year
          if (selectedFiscal?.id) {
            const selected = fiscalYears.find((year) => year.id === selectedFiscal.id);
            if (selected) {
              dispatch({ type: SET_SELECTED_FISCAL_YEAR, selectedFiscalYear: selected });
            }
          } else if (fiscalYears.length > 0) {
            dispatch({ type: SET_SELECTED_FISCAL_YEAR, selectedFiscalYear: fiscalYears[0] });
          }
        } else if (result.message === 'Unauthorized') {
          logout();
        } else {
          console.error('Failed to fetch fiscal years:', result.message);
        }
      } catch (error) {
        console.error(`Error fetching fiscal year: ${error.message}`);
      }
    };

    handleGettingFiscalYear();
  }, [dispatch, selectedFiscal]);

  return null;
};

export default GetFiscalYear;
