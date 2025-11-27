import React, { createContext, useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { CheckForPendingTasks } from 'utils/check-for-pending-tasks';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [activeDashboard, setActiveDashboard] = useState('Manager'); // Default dashboard
  const dispatch = useDispatch();

  const handleChangingDashboard = async (newDashboard, fiscal_year_id) => {
    setActiveDashboard(newDashboard);
    // await CheckForPendingTasks(dispatch, selectedYear?.id);
  };

  return (
    <DashboardContext.Provider
      value={{
        activeDashboard,
        handleChangingDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboards = () => useContext(DashboardContext);
