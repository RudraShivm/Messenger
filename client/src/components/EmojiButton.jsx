import React from "react";
import { useDispatch } from "react-redux";
import { reactMessage } from "../actions/chat";

function EmojiButton({
  emoji,
  userId,
  chatId,
  messageId,
  setActiveReactionBoxMsgId,
}) {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(reactMessage(userId, chatId, messageId, emoji));
    setActiveReactionBoxMsgId(null);
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
