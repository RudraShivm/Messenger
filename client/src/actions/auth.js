import * as api from "../api/index";
import { AUTH } from "../constants/actionTypes";

export const signin = (formData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signIn(formData);
    if (data) {
      dispatch({ type: AUTH, data });
      navigate("/home");
    }
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};

export const googlesignin = (code, navigate) => async (dispatch) => {
  try {
    const { data } = await api.googleSignIn(code);
    if (data) {
      dispatch({ type: AUTH, data });
      navigate("/home");
    }
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};

export const signup = (formData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signUp(formData);
    if (data) {
      dispatch({ type: AUTH, data });
      navigate("/home");
    }
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};
