import React from "react";
import AttachmentIcon from "./svgs/attachmentIcon.svg?react";

function MorePanel({ morePanelAnimationClass, handleAttachmentClick }) {
  return (
    <div
      className={`transition ease-in-out flex ${morePanelAnimationClass} overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <div id="drag-drop-area" className="z-20 absolute"></div>
        <div className="h-[270px] w-[320px] bg-[#222323] rounded-lg border-[1px] border-[#3a3b3c] p-3">
          <button
            className="rounded-full bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition delay-75 px-2 py-2 mt-1 lg:mx-2 xs:mx-1"
            onClick={handleAttachmentClick}
          >
            <AttachmentIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MorePanel;
