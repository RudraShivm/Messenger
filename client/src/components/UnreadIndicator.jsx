import React from "react";

function UnreadIndicator() {
  return (
    <div className="w-full h-4  flex flex-row justify-between items-center my-2">
      <div className="w-[calc(50%-7rem)] ml-[2rem] h-[2px] bg-[#d0d0d08e]"></div>
      <p className="text-[#d0d0d0] lg:text-lg xs:text-sm  w-[10rem] text-center">
        Unread Messages
      </p>
      <div className="w-[calc(50%-7rem)] mr-[2rem] h-[2px] bg-[#d0d0d08e]"></div>
    </div>
  );
}

export default UnreadIndicator;
