import rootReducer from "../reducers/index";
import { createStore, compose, applyMiddleware } from "redux";
import {thunk} from "redux-thunk";
import Localbase from "localbase";
import { syncMiddleware } from "./Middleware/syncMiddleware";
import { composeWithDevTools } from 'redux-devtools-extension';
async function loadFromLocalStorage() {
  try {
    let db = new Localbase("db");
    const doc = await db.collection("messenger").doc({ id: 1 }).get();
    if (doc) {
      console.log("why here?")
      const state = doc.profile;
      return {
        auth: { authData: state },
      };
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("Could not load state", error);
    return undefined;
  }
}

// Function to get the store
export async function getStore() {
  const persistedState = await loadFromLocalStorage();
  const store = createStore(
    rootReducer,
    persistedState,
    composeWithDevTools(
      applyMiddleware(thunk),
    )
  );
  return store;
}