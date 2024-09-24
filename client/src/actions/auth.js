import * as api from "../api/index";
import { AUTH } from "../constants/actionTypes";
import { errorDispatcher } from "../functions/errorDispatcher";
import { addProfile } from "../store/indexedDB";

export const signin = (formData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signIn(formData);
    if (data) {
      const user = await addProfile(data.user, data.token);
      dispatch({ type: AUTH, payload : {user} });
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
      const user = await addProfile(data.user, data.token);
      dispatch({ type: AUTH, payload : {user} });
      navigate("/home");
    }
  } catch (error) {
    console.error(error);
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};

export const signup = (formData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signUp(formData);
    if (data) {
      const user = await addProfile(data.user, data.token);
      dispatch({ type: AUTH, payload : {user} });
      navigate("/home");
    }
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};
