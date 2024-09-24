import * as api from "../api/index";
import Cookies from "js-cookie";
import { UPDATEHOMESEARCH, UPDATECREATEGROUPSEARCH, UPDATE_FRIENDS, UPDATECHATCARDINFO } from "../constants/actionTypes";
import { errorDispatcher } from "../functions/errorDispatcher";
import Localbase from "localbase";
import { deleteProfile, getProfile, updateProfile, updateProfileFriends } from "../store/indexedDB";


export const updateHomeSearch = (payload) => async (dispatch, getState) => {
  try {
    let serialObj = {...getState().auth.authData};
    dispatch({ type: UPDATEHOMESEARCH, payload : {searchTerm : payload, serialObj} });
  } catch (error) {
    console.log(error);
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};
export const updateCreateGroupSearch = (payload) => async (dispatch, getState) => {
  try {
    let serialObj = {...getState().auth.authData};
    dispatch({ type: UPDATECREATEGROUPSEARCH, payload : {searchTerm:payload, serialObj} });
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};

export const updateFriends = (prevFriendsMap, userArr) => async(dispatch, getState) => {
  try {
    let serialObj = {...getState().auth.authData};
    let friendsMap = prevFriendsMap;
    for(let usr of userArr){
      friendsMap.set(usr._id, usr);
    } 
    let user = {...serialObj.user ,friends : [...friendsMap.values()]};
    serialObj = {...serialObj, user: user};
    dispatch({type : UPDATE_FRIENDS, payload : serialObj});
    await updateProfile(serialObj);
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
}
export const updateChatCardInfo = (chatsArrIndex, value) => async(dispatch, getState) => {
  try{
    let serialObj = {...getState().auth.authData};
    let user = { ...serialObj.user, chats: [...serialObj.user.chats] };

    let chatObj = {...user.chats[chatsArrIndex], chatCardInfo : {...user.chats[chatsArrIndex].chatCardInfo, name : value}};
    user.chats[chatsArrIndex] = chatObj;
    serialObj = { ...serialObj, user: user };

    dispatch({
      type: UPDATECHATCARDINFO,
      payload: serialObj,
    });
    await updateProfile(serialObj);
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
}

export const signOut = (userId, navigate) => async (dispatch) => {
  try {
    let token = Cookies.get("token");
    const { data } = await api.signOut(userId, token);
    if (data.message == "Signed out successfully") {
      Cookies.remove("token");
      await deleteProfile();
      navigate("/auth");
    }
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};
