import * as api from '../api/index';
import { UPDATESEARCH } from '../constants/actionTypes';

export const updateSearch = (payload) => (dispatch) =>{
    try {
        dispatch({type: UPDATESEARCH, payload});
    } catch (error) {
        console.log(error);
    }
}