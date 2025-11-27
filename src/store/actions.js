// action - customization reducer
export const SET_MENU = '@customization/SET_MENU';
export const MENU_TOGGLE = '@customization/MENU_TOGGLE';
export const MENU_OPEN = '@customization/MENU_OPEN';
export const SET_FONT_FAMILY = '@customization/SET_FONT_FAMILY';
export const SET_BORDER_RADIUS = '@customization/SET_BORDER_RADIUS';
export const SET_BACKDROP_FILTER = '@customization/SET_BACKDROP_FILTER';
export const SET_SYSTEM_THEME = '@customization/SET_SYSTEM_THEME';
export const SET_FISCAL_YEARS = '@customization/SET_FISCAL_YEARS';
export const SET_SELECTED_FISCAL_YEAR = '@customization/SET_SELECTED_FISCAL_YEAR';

export const setUser = (user) => ({
  type: 'SET_USER',
  payload: user
});
