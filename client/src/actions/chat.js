import * as api from '../api/index';
import { LOADCHAT, UPDATECHAT, CREATECHAT, UPDATELASTMESSAGE } from '../constants/actionTypes';

export const loadChat = (chatObjId, chatId, navigate, setLoading) => async (dispatch) =>{
    try{
        const {data} = await api.loadChat(chatId);
        if(data){
            dispatch({type: LOADCHAT, payload : data});
            navigate(`/home/chat/${chatObjId}/${chatId}`);
            setLoading(false);
        }
    }catch(error){
        console.log(error);
    }
}
export const createChat = (user1Id, user2Id, navigate, setLoading) => async (dispatch) =>{
    try{
        const serialObj = JSON.parse(localStorage.getItem('profile'));
        const chatsArr = serialObj.user.chats;
        const {data} = await api.createChat(user1Id, user2Id);
        if(data && chatsArr.filter(obj => obj._id==chatObj._id).length == 0){
            dispatch({type: CREATECHAT, payload : data});
            navigate(`/home/chat/${data._id}/${data.chat._id}`); //update code
            setLoading(false);
        } 
    }catch(error){ 
        console.log(error);
    }
}
export const updateChatsArr = (chatObj) =>async(dispatch) =>{
    try{
        const serialObj = JSON.parse(localStorage.getItem('profile'));
        const chatsArr = serialObj.user.chats;
        console.log(chatsArr);
        console.log("hel");
        if(chatsArr.filter(obj => obj._id==chatObj._id).length > 0){
            console.log("oop");
            dispatch({type: UPDATELASTMESSAGE, payload : {lastMessageInfo: chatObj.lastMessageInfo, _id: chatObj._id}});
        }else{
            console.log("dwa");
            const {data} = await api.getSingleUser(chatObj.user);
            if(data){
                console.log("44qef");
                chatObj.user = data.existingUser;
                dispatch(
                    {type: CREATECHAT, payload : chatObj}
                );
            }
        }
        }catch(error){
        console.log(error);
    }
}

//not an action creator, but wanted to keep all api callers together..
export const postMessage = async(user1Id, user2Id, chatObjId, chatId, sender, message) =>{
    try {
        await api.postMessage(user1Id, user2Id, chatObjId, chatId, sender, message);
    } catch (error) {
        console.log(error);
    }
}

export const updateChat = (chatId, messageObj, index, location, navigate) => async(dispatch) =>{
    try {
        dispatch({type: UPDATECHAT, payload:{chatId, messageObj, index, location, navigate}});
    } catch (error) {
        console.log(error);
    }
}
