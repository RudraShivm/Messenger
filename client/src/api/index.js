import axios from 'axios';

const API = axios.create({baseURL:'https://messenger-9ck7.onrender.com'});

API.interceptors.request.use((req) =>{
    if(localStorage.getItem('profile')){
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile')).token}`
    }
    return req;
})

export const signIn = async (formData) => {return await API.post('/user/signin', formData)};
export const signUp = async (formData) => {return await API.post('/user/signup', formData)};
export const googleSignIn = async (_id, name, profile_picture, email, token) => {return await API.post('/user/googleSignin', {_id, name,profile_picture,email, token})};
export const loadChat = async (chatId) => {return await API.get(`/chat/${chatId}`)};
export const postMessage = async (user1Id, user2Id, chatObjId, chatId, sender, message) => {return await API.post(`/chat/${chatObjId}/${chatId}`, {user1Id, user2Id, sender, message})};
export const getAllUsers = async () => {return await API.get('/user/allUsers')}
export const getSingleUser = async (userId) => {return await API.get(`/user/${userId}`)}
export const createChat = async(user1Id, user2Id) => {return await API.post('/chat/create',{user1Id, user2Id})}
export const getInvite = async(inviteId) => { return await API.get(`/invite/${inviteId}`)}
export const createInvite = async(userId) => {return await API.post('/invite/create', {userId})}