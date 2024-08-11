import React from "react";
import EmojiButton from "./EmojiButton";
function ReactionBox({
  sender,
  user,
  chatId,
  msgId,
  setActiveReactionBoxMsgId,
}) {
  return (
    <div
      className={`h-auto absolute z-20
              ${
                sender === user._id ? "-left-[7.5rem]" : "-right-[9.5rem]"
              } top-[calc(50%-4rem)] 2xl:text-xl lg:text-lg w-fit py-1 px-3 rounded-2xl flex flex-row justify-between gap-2 bg-[#3a3b3cb0]`}
    >
      <EmojiButton
        emoji="🆗"
        userId={user._id}
        chatId={chatId}
        messageId={msgId}
        setActiveReactionBoxMsgId={setActiveReactionBoxMsgId}
      />
      <EmojiButton
        emoji="🙂"
        userId={user._id}
        chatId={chatId}
        messageId={msgId}
        setActiveReactionBoxMsgId={setActiveReactionBoxMsgId}
      />
      <EmojiButton
        emoji="😮‍💨"
        userId={user._id}
        chatId={chatId}
        messageId={msgId}
        setActiveReactionBoxMsgId={setActiveReactionBoxMsgId}
      />
      <EmojiButton
        emoji="😮"
        userId={user._id}
        chatId={chatId}
        messageId={msgId}
        setActiveReactionBoxMsgId={setActiveReactionBoxMsgId}
      />
      <EmojiButton
        emoji="😟"
        userId={user._id}
        chatId={chatId}
        messageId={msgId}
        setActiveReactionBoxMsgId={setActiveReactionBoxMsgId}
      />
      <EmojiButton
        emoji="👎"
        userId={user._id}
        chatId={chatId}
        messageId={msgId}
        setActiveReactionBoxMsgId={setActiveReactionBoxMsgId}
      />
    </div>
  );
}

export default ReactionBox;
