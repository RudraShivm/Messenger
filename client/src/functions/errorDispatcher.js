import {
  SHOW_ERROR_400,
  SHOW_ERROR_401,
  SHOW_ERROR_403,
  SHOW_ERROR_404,
  SHOW_ERROR_500,
} from "../constants/actionTypes";

export const errorDispatcher = (error_code, payload) => (dispatch) => {
  switch (error_code) {
    case 400:
      dispatch({ type: SHOW_ERROR_400, payload });
      break;
    case 401:
      dispatch({ type: SHOW_ERROR_401, payload });
      break;
    case 403:
      dispatch({ type: SHOW_ERROR_403, payload });
      break;
    case 404:
      dispatch({ type: SHOW_ERROR_404, payload });
      break;
    case 500:
      dispatch({ type: SHOW_ERROR_500, payload });
      break;
  }
};
