import React, { useState, useRef, useEffect } from "react";
import Message from "../components/Message";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToSeenBy, postMessage } from "../actions/chat";
import EmojiPicker from "emoji-picker-react";
import { useMediaQuery } from "react-responsive";
import BackIcon from "../components/svgs/backIcon.svg?react";
import NoMessageIcon from "../components/svgs/noMessageIcon.svg?react";
import SendIcon from "../components/svgs/sendIcon.svg?react";
import EmojiIcon from "../components/svgs/emojiIcon.svg?react";
import MoreIcon from "../components/svgs/moreIcon.svg?react";
import AttachmentIcon from "../components/svgs/attachmentIcon.svg?react";
import UnreadIndicator from "../components/UnreadIndicator";
import { getSelectedFunc } from "./selectedChatsArrObjContext";
import "./uppy.min.css";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import Tus from "@uppy/tus";

//didn't use loader because can't use useDispatch hook outside functional react dom component

function ChatBox() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const setSelected = getSelectedFunc();
  const { chatObjId, chatId } = useParams();
  const [msg, setMsg] = useState("");
  const [activeReactionBoxMsgId, setActiveReactionBoxMsgId] = useState(null);
  const [showMorePanel, setShowMorePanel] = useState(false);
  const [morePanelAnimationClass, setMorePanelAnimationClass] =useState('');
  const user = useSelector((state) => state.auth.authData.user);
  const chatArray = user?.chats;
  const chatObj = chatArray.filter((chatObj) => chatObj.chat._id == chatId)[0];
  const chat = chatObj?.chat || { _id: "", messages: [] };
  const secondPerson = chatObj?.user;
  const [emojiPanel, setEmojiPanel] = useState(false);
  const [filesArr, setFilesArr] = useState([]);
  const uppyRef = useRef(null);
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET;
  const BEARER_TOKEN = import.meta.env.VITE_BEARER_TOKEN;

  const folder = "messages";
  const supabaseStorageURL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;

  const isSmallScreen = useMediaQuery({
    query: "(min-width: 0px) and (max-width: 768px)",
  });

  useEffect(() => {
    return () => {
      if (uppyRef.current) {
        uppyRef.current.cancelAll();
        uppyRef.current.destroy();
      }
    };
  }, []);


  useEffect(() => {
    //try out ways to add animation. Seeming quite challenging to add animation for conditional DOM nodes
    setMorePanelAnimationClass("fast-fade-in");
    const timer = setTimeout(() => setMorePanelAnimationClass(""), 200); 
    return () => clearTimeout(timer);
  }, [showMorePanel]);

  // callback ref
  const ref = React.useCallback((node) => {
    if (node) {
      node?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        if (node) {
          dispatch(addToSeenBy(chat._id));
        }
      }, 1000);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmojiPanel(false);
    setShowMorePanel(false);
    if (uppyRef.current) {
      uppyRef.current.cancelAll();
      uppyRef.current.destroy();
    }
    if (msg !== "") {
      dispatch(
        postMessage(user._id, secondPerson._id, chatId, {
          sender: user._id,
          messageType: "text",
          message: msg,
          reaction: [],
          seenBy: [user._id],
          time: Date.now(),
        })
      );
      setMsg("");
    }
    if (filesArr.length !== 0) {
      filesArr.forEach((fileObj) => {
        dispatch(
          postMessage(user._id, secondPerson._id, chatId, {
            sender: user._id,
            messageType: fileObj.type,
            file: { name: fileObj.name },
            reaction: [],
            seenBy: [user._id],
            time: Date.now(),
          })
        );
      });
      setFilesArr([]);
    }
  };
  const handleBackClick = () => {
    navigate("/home");
    setSelected({});
  };
  const handleChatBoxClick = () => {
    setEmojiPanel(false);
    setShowMorePanel(false);
    setActiveReactionBoxMsgId(null);
    if (uppyRef.current) {
      uppyRef.current.cancelAll();
      uppyRef.current.destroy();
    }
  };
  const handleEmojiPickerClick = (e) => {
    e.stopPropagation();
  };
  const emojiButtonClick = () => {
    if(isSmallScreen){
      setShowMorePanel(false);
    }
    setEmojiPanel((emojiPanel) => !emojiPanel);
  }
  const handleMorePanelClick = () =>{ 
    if(isSmallScreen){
      setEmojiPanel(false);
    }
    setShowMorePanel((showMorePanel) => !showMorePanel)
  }
  const handleAttachmentClick = (e) => {
    e.stopPropagation();
    if (uppyRef.current) {
      uppyRef.current.cancelAll();
      uppyRef.current.destroy();
    }
    uppyRef.current = new Uppy()
      .use(Dashboard, {
        inline: true,
        limit: 1,
        width: 320,
        height: 270,
        theme: "dark",
        target: "#drag-drop-area",
        showProgressDetails: true,
      })
      .use(Tus, {
        endpoint: supabaseStorageURL,
        headers: {
          authorization: `Bearer ${BEARER_TOKEN}`,
          apikey: SUPABASE_ANON_KEY,
        },
        uploadDataDuringCreation: true,
        chunkSize: 6 * 1024 * 1024,
        allowedMetaFields: [
          "bucketName",
          "objectName",
          "contentType",
          "cacheControl",
        ],
        onError: function (error) {
          console.log("Failed because: " + error);
        },
      });

    uppyRef.current.on("file-added", (file) => {
      const supabaseMetadata = {
        bucketName: STORAGE_BUCKET,
        objectName: folder
          ? `${folder}/${Date.now()}${user._id}${file.name}`
          : `${Date.now()}${user._id}${file.name}`,
        contentType: file.type,
      };

      file.meta = {
        ...file.meta,
        ...supabaseMetadata,
      };
    });

    uppyRef.current.on("complete", (result) => {
      result.successful.forEach((item) => {
        setFilesArr((filesArr) => [
          ...filesArr,
          { type: item.type, name: item.meta.objectName },
        ]);
      });
    });
  };

  return (
    <div className="absolute top-0 left-0 h-full w-full">
      <div className="absolute flex flex-row items-center z-10 md:right-[0.75rem] xs:right-[0.375rem] top-[0.75rem] lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:h-[5.25rem] xs:h-[4.25rem] bg-[#222323] rounded-t-lg">
        {isSmallScreen && (
          <button onClick={handleBackClick} className="ml-2">
            <BackIcon />
          </button>
        )}
        <div className="2xl:h-[3.5rem] 2xl:w-[3.5rem] xs:h-[2.5rem] xs:w-[2.5rem] md:ml-4 xs:ml-2 flex flex-row justify-center items-center">
          <img
            src={secondPerson?.profile_picture}
            alt="user"
            className="rounded-[50%] h-full w-auto min-w-[100%] object-cover"
          />
        </div>
        <div className="pl-4 2xl:text-2xl md:text-xl xs:text-lg text-zinc-50 font-semibold">
          {secondPerson?.name}
        </div>
      </div>
      <div
        className="absolute z-10 md:h-[calc(100%-10.75rem)] xs:h-[calc(100%-9.75rem)] overflow-y-auto flex flex-col-reverse lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:right-[0.75rem] xs:right-[0.375rem] bottom-[4.75rem] bg-fixed bg-tactile-noise"
        onClick={handleChatBoxClick}
      >
        {chat.messages.length == 0 ? (
          <div className="h-full w-full flex flex-col justify-center items-center">
            <div>
              <NoMessageIcon />
            </div>
            <div className="2xl:text-2xl lg:text-xl font-bold text-white mb-4">
              No messages yet
            </div>
          </div>
        ) : (
          <>
            {chat?.messages
              .slice()
              .reverse()
              .map((msgObj, index, array) => {
                const showUnreadIndicator =
                  index === chat?.messages.length - 1
                    ? !msgObj.seenBy.find((item) => item === user._id)
                    : !msgObj.seenBy.find((item) => item === user._id) &&
                      array[index + 1].seenBy.find((item) => item === user._id);
                // as we reversed the messagesArr, we need to watch for the next element

                return (
                  <div key={msgObj._id}>
                    {showUnreadIndicator && (
                      <div ref={ref}>
                        <UnreadIndicator />
                      </div>
                    )}
                    <Message
                      key={msgObj._id}
                      user={user}
                      secondPerson={secondPerson}
                      msgObj={msgObj}
                      chatId={chatId}
                      isActiveReactionBox={activeReactionBoxMsgId == msgObj._id}
                      setActiveReactionBoxMsgId={setActiveReactionBoxMsgId}
                    />
                  </div>
                );
              })}
          </>
        )}
      </div>
      <div id="default-target"></div>
      {(showMorePanel || emojiPanel) && (
        <div 
          className="absolute z-10 bottom-[4.75rem] h-[270px] flex justify-evenly lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:right-[0.75rem] xs:right-[0.375rem]"
          onClick={handleChatBoxClick}
        >
          {showMorePanel && (
            <div 
              className={`transition ease-in-out flex ${morePanelAnimationClass}`}
              onClick={(e)=> e.stopPropagation()}
            >
              <div>
                <div id="drag-drop-area" className="z-20"></div>
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
          )}
          <div
            className="transition ease-in-out"
            onClick={handleEmojiPickerClick}
          >
            <EmojiPicker
              open={emojiPanel}
              theme="dark"
              lazyLoadEmojis="true"
              // functional update
              onEmojiClick={(emojiData, e) =>
                setMsg((currentMsg) => currentMsg + emojiData.emoji)
              }
              /* User triggers onEmojiClick, calling setMsg.
              React queues the state update but doesn't apply it immediately.
              Any code running right after setMsg still sees the old state.
              React completes the current execution context (e.g., the event handler).
              React updates the state, causing a re-render.
              After the re-render, useEffect with msg in its dependency array runs, now with the updated state.

              useEffect hook does indeed run after the state has been updated and the component has re-rendered,
              but the state doesn't change "right away" in the sense that it's not immediately available */
              height={"270px"}
              width={"320px"}
              searchDisabled={true}
              style={{ opacity: "0.8", animation : "fadeIn2 0.2s ease-out" }}
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}
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
    </div>
  );
}

export default ChatBox;
