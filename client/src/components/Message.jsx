import React, { useState, memo, useEffect, useRef } from "react";
import EmojiButton from "./EmojiButton";
import SmallEmojiIcon from "../components/svgs/smallEmojiIcon.svg?react";
import DownloadIcon from "../components/svgs/downloadIcon.svg?react";
import RetryIcon from "../components/svgs/retryIcon.svg?react";
import ReactionBox from "./ReactionBox";
import { useDispatch } from "react-redux";
import { errorDispatcher } from "../functions/errorDispatcher";
import FileViewer from '@codesmith-99/react-file-preview'
import "../index.css";
import shortenName from "../functions/shortenName";
//here at first I used a parent state to hide all 'Reaction Box' as all messages had to re-render anyway
//but memo can reduce re-render if the props passed to its children don't change.
//it will only re-render the childs with changed props.
//So now instead of keeping one variable to dictate all components to shut its ReactionBox, now it uses
//boolean to determine if the ReactionBox will be active or not, thereby reducing the changes in props

//cool :)

function Message({
  user,
  secondPerson,
  msgObj,
  chatId,
  isActiveReactionBox,
  setActiveReactionBoxMsgId,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET;
  const BEARER_TOKEN = import.meta.env.VITE_BEARER_TOKEN;
  const [fileURL, setFileURL] = useState(null);
  const fileURLRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [downloadAgain, setDownloadAgain] = useState(false);
  const eligiblePreviewTypes = ["jpeg", "jpg", "png", "gif", "webp", "svg", "bmp", "ico", "mp3", "wav", "ogg", "webm", "mp4", "webm", "ogv"]
  const messageType =
    msgObj.messageType.split("/").length == 1
      ? msgObj.messageType.split("/")[0]
      : msgObj.messageType.split("/")[1];
  const dispatch = useDispatch();
  useEffect(() => {
    const supaBaseFileDownloader = async () => {
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
        setFileURL(URL.createObjectURL(data));
        if (!hasError) {
          setHasError(false);
        }
      } catch (error) {
        dispatch(
          errorDispatcher(error.status || 500, { message: error.message })
        );
      }
    };
    if (messageType !== "text") {
      supaBaseFileDownloader();
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
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = msgObj.file.name.split('/')[1];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div
      className={`flex ${
        msgObj.sender === user._id
          ? "flex-row-reverse"
          : "flex-row justify-start"
      } relative items-center transition ease-in-out`}
      style={{ animation: "popFromBelow 0.2s ease-out" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-[2.5rem] w-[2.5rem] mx-4 flex justify-center items-center my-3">
        <img
          src={
            msgObj.sender === user._id
              ? user?.profile_picture
              : secondPerson?.profile_picture
          }
          referrerPolicy="no-referrer"
          alt="user"
          className="rounded-[50%] h-full w-auto min-w-[100%] object-cover"
        />
      </div>

      <div
        className={`bg-[#58A89B] h-auto relative max-w-1/2 my-3 ${
          messageType == "text" || !fileURL || hasError
            ? "lg:px-4 lg:py-2 xs:px-2 xs:py-1"
            : ""
        } rounded-md flex flex-col justify-center`}
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
          ) : (
            eligiblePreviewTypes.includes(messageType) ? (
            <div
              className="rounded-md min-w-[10%] max-w-full h-auto overflow-hidden"
              id="file-viewer-container"
            >
              <FileViewer
                src={fileURL}
                onError={(e) => {
                  setHasError(true);
                  dispatch(
                    errorDispatcher(400, { message: "File could not be loaded" })
                  );
                }}
                fileName={msgObj.file.name}
              />
            </div>
          ) : (
            <div 
              className="p-2 bg-[#3a3b3c] rounded-md flex flex-row cursor-pointer" 
              onClick={handleSaveFile}
            >
              <button 
                className="px-1 mr-2 bg-[#97e9e9] rounded-full"
                
              >
                <DownloadIcon/>
              </button>
              <p className="text-zinc-50 font-emoji italic 2xl:text-xl lg:text-lg xs:text-md overflow-ellipsis break-words whitespace-pre-wrap">
                {
                shortenName( msgObj.sender === user._id ? msgObj.file.name.split(user._id)[1] : msgObj.file.name.split(secondPerson._id)[1], 30)
                }
              </p>
            </div>
          )

        )) : hasError ? (
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
                  <div key={item._id}>
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
              {msgObj.reaction.filter((item) => item.emoji !== null).length}
            </div>
          </div>
        )}
      </div>
      {isHovered && (
        <button
          className={`rounded-full h-fit bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition  p-2 mx-2 ${
            isHovered ? "pop-in" : ""
          }`}
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
