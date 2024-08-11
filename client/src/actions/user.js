import * as api from "../api/index";
import Cookies from "js-cookie";
import { UPDATESEARCH } from "../constants/actionTypes";

export const updateSearch = (payload) => async (dispatch) => {
  try {
    dispatch({ type: UPDATESEARCH, payload });
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};

export const signOut = (userId, navigate) => async (dispatch) => {
  try {
    let token = Cookies.get("token");
    const { data } = await api.signOut(userId, token);
    if (data.message == "Signed out successfully") {
      Cookies.remove("token");
      localStorage.removeItem("profile");
      navigate("/auth");
    }
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};
