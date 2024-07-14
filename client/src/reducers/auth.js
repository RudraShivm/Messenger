import { AUTH, CREATECHAT, LOADCHAT, LOGOUT, POSTMESSAGE, UPDATECHAT, UPDATELASTMESSAGE, UPDATESEARCH } from "../constants/actionTypes"

const  authReducer = (state = {authData:null, searchResult:null}, action) =>{
    let serialObj = {};
    let user = {};
    let token = '';
    let chatObj;
    let searchResult;
    switch (action.type) {
        case AUTH:
            localStorage.setItem('profile', JSON.stringify(action?.data));
            console.log("action.data"+JSON.stringify(action?.data));
            return {...state, authData:action?.data};
            case LOGOUT:
            localStorage.removeItem('profile');
            return {...state, authData: null};
        case LOADCHAT:
            serialObj = JSON.parse(localStorage.getItem('profile'));
            user= serialObj.user;
            token= serialObj.token;
            user.chats.filter(chatObj=>(chatObj.chat === action?.payload.chatId || chatObj.chat?._id == action?.payload.chatId))[0].chat= action?.payload.chat;
            
            localStorage.setItem('profile', JSON.stringify({...serialObj, user}));
            return {...state, authData: serialObj};
        case UPDATECHAT:
            serialObj = JSON.parse(localStorage.getItem('profile'));
            user = serialObj.user;
            token = serialObj.token;
            const messagesArr = user.chats.filter(chatObj=>(chatObj.chat?._id == action?.payload.chatId))[0].chat.messages;
            
            if(messagesArr && !messagesArr.find(msgObj => msgObj._id == action?.payload.messageObj._id)){
                messagesArr.push(action?.payload.messageObj);
            }

            const indexOfChatObj = user.chats.findIndex(chatObj=>(chatObj.chat?._id == action?.payload.chatId));
            chatObj = user.chats.splice(indexOfChatObj, 1)[0];
            user.chats.push(chatObj);

            localStorage.setItem('profile', JSON.stringify(serialObj));
            return {...state, authData : serialObj};
            
        case CREATECHAT:
            serialObj = JSON.parse(localStorage.getItem('profile'));
            user = serialObj.user;
            token = serialObj.token;
            //there are two cases when createChat calls CREATECHAT action it provides a chatObj with the
            //actual chats and all. But for updateChatsArr, it responds to userUpdated stream and gives a
            //chatModel document reference. So for the people who is creating the chats gets both object 
            //one after another. To resolve the issue and replace the references with actual documents
            // the code became somewhat hard to understand. Thats why this comment was necessary.

            let payloadChatId = typeof(action?.payload.chat) == 'object' ? action?.payload.chat._id : action?.payload.chat;
            let existingChatObjIndex =  user.chats.findIndex(chatObj => {
                let chatObjId = typeof(chatObj.chat) == 'object' ? chatObj.chat._id : chatObj.chat;
                return chatObjId == payloadChatId;
            });
            console.log("existingIndex"+existingChatObjIndex);
            if(existingChatObjIndex == -1){
                user.chats.push(action?.payload);
            }else if(typeof(action?.payload.chat) == 'object'){
                user.chats[existingChatObjIndex] = action?.payload;
            }

            localStorage.setItem('profile', JSON.stringify(serialObj));
            return {...state, authData : serialObj};
        case UPDATELASTMESSAGE:
                serialObj = JSON.parse(localStorage.getItem('profile'));
                user = serialObj.user;
            token = serialObj.token;
            
            chatObj = user.chats.find(chatObj => chatObj._id == action?.payload._id);
            console.log("chatobj"+chatObj);
            chatObj.lastMessageInfo = action?.payload.lastMessageInfo;

            localStorage.setItem('profile', JSON.stringify(serialObj));
            return {...state, authData : serialObj};
        case UPDATESEARCH:
            serialObj = JSON.parse(localStorage.getItem('profile'));
            user = serialObj.user;
            token = serialObj.token;
            searchResult = user.chats.filter(chatObj => 
                chatObj.user.name.toLowerCase().includes(action?.payload.toLowerCase()));
            return {...state, searchResult};
        default:
            return state;
    }
}   

export default authReducer;