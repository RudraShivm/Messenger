import { errorDispatcher } from "./errorDispatcher";
import { UPDATE_FILE_URL } from "../constants/actionTypes";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET;
const BEARER_TOKEN = import.meta.env.VITE_BEARER_TOKEN;
export const supaBaseFileDownloader = async (chatId, msgObj, setFileURL, hasError, setHasError, dispatch) => {
  try {
    const url = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/authenticated/${STORAGE_BUCKET}/${msgObj.file.name}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.blob();
    const fileURL =URL.createObjectURL(data);
    setFileURL(fileURL);
    if (!hasError) {
      setHasError(false);
    }
    dispatch({type : UPDATE_FILE_URL, payload : {chatId,msgObjId: msgObj._id, fileURL}})
  } catch (error) {
    console.error(error.message);
    dispatch(errorDispatcher(error.status || 500, { message: error.message }));
  }
};
