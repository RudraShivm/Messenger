import {
  SHOW_ERROR_400,
  SHOW_ERROR_401,
  SHOW_ERROR_403,
  SHOW_ERROR_404,
  SHOW_ERROR_500,
  WITHDRAW_ERROR,
} from "../constants/actionTypes";
import { signOut } from "../actions/user";

const errorReducer = (state = { errObj: null }, action) => {
  switch (action.type) {
    case SHOW_ERROR_400:
      return {
        ...state,
        errObj: { message: action.payload.message, show: true },
      };

    case SHOW_ERROR_401:
      return {
        ...state,
        errObj: {
          message: action.payload.message,
          show: true,
          buttonText: "Log Out",
          buttonFunc: signOut,
        },
      };

    case SHOW_ERROR_403:
      return {
        ...state,
        errObj: { message: action.payload.message, show: true },
      };

    case SHOW_ERROR_404:
      return {
        ...state,
        errObj: { message: action.payload.message, show: true },
      };

    case SHOW_ERROR_500:
      return {
        ...state,
        errObj: {
          message: action.payload.message,
          show: true,
          buttonText: "Log Out",
          buttonFunc: signOut,
        },
      };

    case WITHDRAW_ERROR:
      return { ...state, errObj: { ...state.errObj, show: false } };
    default:
      return state;
  }
};

export default errorReducer;
