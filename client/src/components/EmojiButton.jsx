import React from "react";
import { useDispatch } from "react-redux";
import * as api from "../api/index";
import { errorDispatcher } from "../functions/errorDispatcher";
function EmojiButton({
  emoji,
  userId,
  chatId,
  messageId,
  setActiveReactionBoxMsgId,
}) {
  const dispatch = useDispatch();
  const handleClick = async() => {
    try{
      await api.reactMessage(userId, chatId, messageId, emoji);
      setActiveReactionBoxMsgId(null);
    }catch(error){
      dispatch(
        errorDispatcher(error.response?.status || 500, {
          message: error.message,
        })
      );
    }
  };
  return (
    <button
      className="bg-transparent hover:bg-[#58A89B] rounded-xl p-[2px]"
      onClick={handleClick}
    >
      {emoji}
    </button>
  );
}

export default EmojiButton;
