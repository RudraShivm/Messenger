import React from "react";
import SendIcon from "./svgs/sendIcon.svg?react";
import EmojiIcon from "./svgs/emojiIcon.svg?react";
import MoreIcon from "./svgs/moreIcon.svg?react";

function BottomBar({
  handleSubmit,
  handleMorePanelClick,
  emojiButtonClick,
  msg,
  setMsg,
}) {
  return (
    <div className="absolute z-10 bottom-[0.75rem] h-[4rem] flex justify-center items-center lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:right-[0.75rem] xs:right-[0.375rem] bg-[#222323] rounded-b-lg">
      <form
        className="container flex flex-row justify-end"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="rounded-full bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition delay-75 px-3 mt-1 lg:mx-2 xs:mx-1"
          onClick={handleMorePanelClick}
        >
          <MoreIcon />
        </button>
        <textarea
          name="msg"
          id="msg"
          rows="1"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="border-1 font-emoji text-white resize-none rounded-xl bg-[#3a3b3c] outline-none mt-1 py-2.5 lg:w-9/12 sm:w-9/12 pl-4 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 2xl:text-xl lg:text-base md:text-base"
          placeholder="Message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSubmit(e);
            }
          }}
        />
        <button
          className="rounded-full bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition delay-75 px-3 mt-1 lg:mx-2 xs:mx-1"
          type="submit"
        >
          <SendIcon />
        </button>
        <button
          className="rounded-full bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition delay-75 px-3 mt-1 lg:mx-2 md:mx-1"
          onClick={emojiButtonClick}
          type="button"
        >
          <EmojiIcon />
        </button>
      </form>
    </div>
  );
}

export default BottomBar;
