import { combineReducers } from 'redux';

// reducer import
import customizationReducer from './customizationReducer';
import userReducer from './userReducer';
import pendingTaskSlice from './pendingTaskSlice';
import ManagerUnits from './slices/active-unit';

// ============================== || COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  customization: customizationReducer,
  user: userReducer,
  pending: pendingTaskSlice,
  managerUnits: ManagerUnits.reducer
});

export default reducer;
