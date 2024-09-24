import React, { useEffect, useRef, useState } from "react";
import FileViewer from "@codesmith-99/react-file-preview";
import CrossIconLarge from "./svgs/crossIconLarge.svg?react";
import DownloadIconLarge from "./svgs/downloadIconLarge.svg?react";
function MediaViewer({ messagesArr, selectedMsgId, setShowMediaViewer }) {
  const [hasError, setHasError] = useState(false);
  const eligiblePreviewTypes = [
    "jpeg",
    "jpg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "ico",
    "mp3",
    "wav",
    "ogg",
    "webm",
    "mp4",
    "webm",
    "ogv",
    "mpeg",
  ];
  const filtered_media_arr = messagesArr.filter(
    (item) => item.messageType !== "text"
  );
  const [msgObj, setMsgObj] = useState(
    filtered_media_arr.find((item) => item._id == selectedMsgId)
  );
  const msgObjRef = useRef(msgObj);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  useEffect(() => {
    msgObjRef.current = msgObj;
  }, [msgObj]);
  const handleClick = (e) => {
    e.stopPropagation();
    setShowMediaViewer(false);
  };

  const handleNext = () => {
    const currMsgObjIndex = filtered_media_arr.findIndex(
      (item) => item._id == msgObjRef.current._id
    );
    let nextMsgObjIndex = (currMsgObjIndex + 1) % filtered_media_arr.length;
    while (
      !eligiblePreviewTypes.includes(
        filtered_media_arr[nextMsgObjIndex].messageType.split("/")[1]
      )
    ) {
      nextMsgObjIndex = (nextMsgObjIndex + 1) % filtered_media_arr.length;
    }
    const nextMsgObj = filtered_media_arr[nextMsgObjIndex];
    setMsgObj(nextMsgObj);
  };

  const handlePrev = () => {
    const currMsgObjIndex = filtered_media_arr.findIndex(
      (item) => item._id == msgObjRef.current._id
    );
    let nextMsgObjIndex =
      (currMsgObjIndex - 1 + filtered_media_arr.length) %
      filtered_media_arr.length;
    while (
      !eligiblePreviewTypes.includes(
        filtered_media_arr[nextMsgObjIndex].messageType.split("/")[1]
      )
    ) {
      nextMsgObjIndex =
        (nextMsgObjIndex - 1 + filtered_media_arr.length) %
        filtered_media_arr.length;
    }
    const nextMsgObj = filtered_media_arr[nextMsgObjIndex];
    setMsgObj(nextMsgObj);
  };

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      setTouchStartX(touch.clientX);
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      setTouchEndX(touch.clientX);
    };

    const handleTouchEnd = () => {
      if (touchStartX - touchEndX > 50) {
        // Left swipe
        handleNext();
      }

      if (touchEndX - touchStartX > 50) {
        // Right swipe
        handlePrev();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [touchStartX, touchEndX]);

  const handleSaveFile = () => {
    const link = document.createElement("a");
    link.href = msgObjRef.current.file.fileURL;
    link.download = msgObjRef.current.file.name.split(
      msgObjRef.current.sender
    )[1];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {hasError ? (
        <div>Error</div>
      ) : (
        <div className="w-full h-full flex justify-center items-center" on>
          <div id="div-mediaViewer">
            <FileViewer
              src={msgObj.file.fileURL}
              onError={(e) => {
                setHasError(true);
              }}
              fileName={msgObj.file.name}
            />
          </div>
          <div className="absolute top-0 right-0 flex flex-row bg-[#222323] rounded-bl-lg">
            <div className="p-[8px] cursor-pointer" onClick={handleSaveFile}>
              <DownloadIconLarge />
            </div>
            <div className="cursor-pointer" onClick={handleClick}>
              <CrossIconLarge />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MediaViewer;
