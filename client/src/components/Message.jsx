import React, { useState, memo, useEffect, useRef } from "react";
import EmojiButton from "./EmojiButton";
import SmallEmojiIcon from "../components/svgs/smallEmojiIcon.svg?react";
import DownloadIcon from "../components/svgs/downloadIcon.svg?react";
import RetryIcon from "../components/svgs/retryIcon.svg?react";
import ReactionBox from "./ReactionBox";
import { useDispatch, useSelector } from "react-redux";
import { errorDispatcher } from "../functions/errorDispatcher";
import FileViewer from "@codesmith-99/react-file-preview";
import "../index.css";
import { supaBaseFileDownloader } from "../functions/supaBaseFileDownloader";
import shortenName from "../functions/shortenName";
import { useLocation, useNavigate } from "react-router-dom";
//here at first I used a parent state to hide all 'Reaction Box' as all messages had to re-render anyway
//but memo can reduce re-render if the props passed to its children don't change.
//it will only re-render the childs with changed props.
//So now instead of keeping one variable to dictate all components to shut its ReactionBox, now it uses
//boolean to determine if the ReactionBox will be active or not, thereby reducing the changes in props

//cool :)

function Message({
  user,
  connectedUserArr,
  msgObj,
  prevMsgObj,
  nextMsgObj,
  chatId,
  chatType,
  nickNameMap,
  isActiveReactionBox,
  setActiveReactionBoxMsgId,
  showMediaViewerFn,
  setSelectedProfile,
  showTime
}) {
  const friendsMap = useSelector(
    (state) => state.auth?.authData?.user?.friends
  );
  const [isHovered, setIsHovered] = useState(false);
  const [fileURL, setFileURL] = useState(null);
  const fileURLRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [downloadAgain, setDownloadAgain] = useState(false);
  const reactionCount = msgObj.reaction.filter((item) => item.emoji !== null).length;
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
  const messageType =
    msgObj.messageType.split("/").length == 1
      ? msgObj.messageType.split("/")[0]
      : msgObj.messageType.split("/")[1];
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  let prevMessageFromSameUser = prevMsgObj && msgObj.sender == prevMsgObj.sender && !showTime;
  let nextMessageFromSameUser = nextMsgObj && msgObj.sender == nextMsgObj.sender && !showTime;
  let profile_picture = "";
  let name = "";
  if (msgObj.sender) {
    if (msgObj.sender === user._id) {
      profile_picture = user.profile_picture;
    } else {
      profile_picture = friendsMap.get(msgObj.sender).profile_picture;
    }
    if (nickNameMap.get(msgObj)) {
      name = nickNameMap.get(msgObj.sender);
    } else {
      name = friendsMap.get(msgObj.sender).name;
    }
    name = name.split(" ")[0];
  }

  useEffect(() => {
    if (messageType !== "text") {
      if (!msgObj.file.fileURL) {
        supaBaseFileDownloader(
          chatId,
          msgObj,
          setFileURL,
          hasError,
          setHasError,
          dispatch
        );
      } else {
        setFileURL(msgObj.file.fileURL);
      }
    }
  }, [downloadAgain]);

  useEffect(() => {
    fileURLRef.current = fileURL;
  }, [fileURL]);

  useEffect(() => {
    setTimeout(() => {
      if (!fileURLRef.current) {
        setHasError(true);
      }
    }, 10000);
  }, [downloadAgain]);

  const handleReload = () => {
    setDownloadAgain((downloadAgain) => !downloadAgain);
  };
  const handleSaveFile = () => {
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = msgObj.file.name.split(msgObj.sender)[1];
    document.body.appendChild(link);
    link.click();
    handleImageClick;
    document.body.removeChild(link);
  };
  const handleImageClick = () => {
    const data = {
      detailsType: "individual",
      userInfo: {
        name: user.name,
        profile_picture: user.profile_picture,
        about: user.about,
        // nickname :
      },
    };

    setSelectedProfile(data);
    navigate(`${location.pathname}/detailsPanel`);
  };
  return (
    <div
      className={`flex ${
        msgObj.sender === user._id
          ? "flex-row-reverse"
          : "flex-row justify-start"
      } relative items-center transition ease-in-out mt-0`}
      style={{ animation: "popFromBelow 0.2s ease-out" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!prevMessageFromSameUser ? (
        <div
          className={`h-[2.5rem] w-[2.5rem] mx-4 flex justify-center items-center 
            ${chatType == "group" &&
              !prevMessageFromSameUser ? "mt-5" : "my-3"}`}
          onClick={handleImageClick}
        >
          <img
            src={profile_picture}
            referrerPolicy="no-referrer"
            alt="user"
            className="rounded-[50%] h-full w-auto min-w-[100%] object-cover"
          />
        </div>
      ):(
        <div className="h-[2.5rem] w-[2.5rem] mx-4 flex justify-center items-center"></div>
      )}
      <div
        className={`h-auto max-w-1/2 flex flex-col ${
          msgObj.sender === user._id ? "items-end" : "items-start"
        } `}
      >
        {chatType == "group" &&
          !prevMessageFromSameUser && (
            <div className="text-[#666866] font-emoji 2xl:text-base lg:text-base xs:text-sm">
              {name}
            </div>
          )}
        <div
          className={`relative max-w-full ${
            messageType == "text" || !fileURL || hasError
              ? "lg:px-4 lg:py-2 xs:px-2 xs:py-1 bg-[#58A89B]"
              : ""
          } rounded-md flex flex-col justify-center
          ${prevMessageFromSameUser ? "mt-1" : ""}
          ${reactionCount ? "mb-3" : ""}`}
        >
          {isActiveReactionBox && (
            <ReactionBox
              sender={msgObj.sender}
              user={user}
              chatId={chatId}
              msgId={msgObj._id}
              setActiveReactionBoxMsgId={setActiveReactionBoxMsgId}
            />
          )}
          {messageType == "text" ? (
            <p className="text-[#232423] font-emoji 2xl:text-xl lg:text-lg xs:text-md overflow-ellipsis break-words whitespace-pre-wrap">
              {msgObj.message}
            </p>
          ) : fileURL ? (
            hasError ? (
              <p className="text-[#232423] font-emoji italic 2xl:text-xl lg:text-lg xs:text-md overflow-ellipsis break-words whitespace-pre-wrap">
                The file couldn't be loaded.
                <button onClick={handleReload} className="italic px-1">
                  <RetryIcon />
                </button>
              </p>
            ) : eligiblePreviewTypes.includes(messageType) ? (
              <div
                className="rounded-md  max-h-[200px] lg:max-h-[300px] flex justify-center items-center overflow-hidden"
                id="file-viewer-container"
                onClick={() => showMediaViewerFn(msgObj._id)}
              >
                <FileViewer
                  src={fileURL}
                  onError={(e) => {
                    setHasError(true);
                  }}
                  fileName={msgObj.file.name}
                />
              </div>
            ) : (
              <div
                className="p-2 bg-[#3a3b3c] rounded-md flex flex-row cursor-pointer"
                onClick={handleSaveFile}
              >
                <button className="px-1 mr-2 bg-[#97e9e9] rounded-full">
                  <DownloadIcon />
                </button>
                <p className="text-zinc-50 font-emoji italic 2xl:text-xl lg:text-lg xs:text-md overflow-ellipsis break-words whitespace-pre-wrap">
                  {shortenName(msgObj.file.name.split(msgObj.sender)[1], 30)}
                </p>
              </div>
            )
          ) : hasError ? (
            <p className="text-[#232423] font-emoji italic 2xl:text-xl lg:text-lg xs:text-md overflow-ellipsis break-words whitespace-pre-wrap">
              The file couldn't be loaded.
              <button onClick={handleReload} className="italic px-1">
                <RetryIcon />
              </button>
            </p>
          ) : (
            <p className="text-[#232423] italic font-emoji 2xl:text-xl lg:text-lg xs:text-md overflow-ellipsis break-words whitespace-pre-wrap">
              Loading ...
            </p>
          )}
          {msgObj.reaction.length !== 0 && (
            <div
              className={`flex flex-row ${
                msgObj.sender === user._id ? "-left-[1rem]" : "-right-[1rem]"
              } items-center gap-1 absolute  -bottom-[1rem] bg-[#222323] text-[#d0d0d0] text-sm p-1 rounded-xl`}
            >
              <div className="flex flex-row">
                {msgObj.reaction.map((item, idx) => {
                  return (
                    <div key={idx}>
                      {idx == 0 ? (
                        <div key={item._id}>{item.emoji}</div>
                      ) : item.emoji !== msgObj.reaction[idx - 1].emoji ? (
                        <div key={item._id}>{item.emoji}</div>
                      ) : (
                        <></>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-[12px]">
                {reactionCount}
              </div>
            </div>
          )}
        </div>
      </div>
      {isHovered && (
        <button
          className={`rounded-full h-fit bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition  p-2 mx-2 ${
            isHovered ? "pop-in" : ""
          } 
          ${chatType == "group" &&
            !prevMessageFromSameUser ? "mt-5" : ""}
          ${reactionCount ? "mb-3" : ""}
          `}
          onClick={(e) => {
            if (isActiveReactionBox) {
              setActiveReactionBoxMsgId(null);
            } else {
              setActiveReactionBoxMsgId(msgObj._id);
            }
            e.stopPropagation();
          }}
        >
          <SmallEmojiIcon />
        </button>
      )}
    </div>
  );
}

export default memo(Message);
