import rootReducer from '../reducers/index';
import {createStore, compose, applyMiddleware} from 'redux';
import {thunk} from 'redux-thunk';

function loadFromLocalStorage() {
    try {
        const state = localStorage.getItem('profile');
        if (state === null) return undefined;
        const stateObj = JSON.parse(state);
        return {auth: {authData:stateObj}}
    } catch(e) {
        console.error("Could not load state", e);
        return undefined;
    }
}

// Use the above functions with your Redux store
const persistedState = loadFromLocalStorage();

export const store = createStore(rootReducer, persistedState, compose(applyMiddleware(thunk)));