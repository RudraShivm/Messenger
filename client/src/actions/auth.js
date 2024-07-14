import * as api from '../api/index';
import { AUTH } from '../constants/actionTypes';

export const signin = (formData, navigate) => async (dispatch) => {
    try{
        const {data} = await api.signIn(formData);
        if(data){
            dispatch({type:AUTH, data});
            navigate('/home');
        }
    }catch(error){
        console.log(error);
    }
}

export const googlesignin = (_id, name, profile_picture, email, token, navigate) => async (dispatch) => {
    try {
        console.log("a");
        const { data } = await api.googleSignIn(_id, name, profile_picture, email, token);
        console.log("data "+JSON.stringify(data));
        if(data){
            
            dispatch({type : AUTH, data});
            navigate('/home');
        }
    } catch (error) {
        console.log(error);       
    }
} 

export const signup = (formData, navigate) => async(dispatch) => {
    try{
        const {data} = await api.signUp(formData);
        if(data){
            dispatch({type:AUTH, data});
            navigate('/home');
        }
    }catch(error){
        console.log(error);
    }
}