// project imports
import config from 'config';

// action - state management
import * as actionTypes from './actions/actions';

export const initialState = {
  isOpen: [],
  defaultId: 'default',
  fontFamily: config.fontFamily,
  borderRadius: config.borderRadius,
  backdropFilter: config.backdropFilter,
  opened: true,
  systemTheme: 'light',
  fiscalYears: [],
  selectedFiscalYear: {},
  
};

// ==============================|| CUSTOMIZATION REDUCER ||============================== //

const customizationReducer = (state = initialState, action) => {
  let id;
  switch (action.type) {
    case actionTypes.MENU_OPEN:
      id = action.id;
      return {
        ...state,
        isOpen: [id]
      };
    case actionTypes.SET_MENU:
      return {
        ...state,
        opened: action.opened
      };
    case actionTypes.SET_FONT_FAMILY:
      return {
        ...state,
        fontFamily: action.fontFamily
      };
    case actionTypes.SET_BORDER_RADIUS:
      return {
        ...state,
        borderRadius: action.borderRadius
      };
    case actionTypes.SET_BACKDROP_FILTER:
      return {
        ...state,
        backdropFilter: action.backdropFilter
      };
    case actionTypes.SET_SYSTEM_THEME:
      return {
        ...state,
        systemTheme: action.systemTheme
      };
    case actionTypes.SET_FISCAL_YEARS:
      return {
        ...state,
        fiscalYears: action.fiscalYears
      };

    case actionTypes.SET_SELECTED_FISCAL_YEAR:
      return {
        ...state,
        selectedFiscalYear: action.selectedFiscalYear
      };

    default:
      return state;
  }
};

export default customizationReducer;
