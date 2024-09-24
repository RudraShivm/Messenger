import React, { useState, useRef, useEffect } from "react";
import Message from "../components/Message";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToSeenBy, postMessage, storeDraftMessages } from "../actions/chat";
import EmojiPicker from "emoji-picker-react";
import { useMediaQuery } from "react-responsive";
import NoMessageIcon from "../components/svgs/noMessageIcon.svg?react";
import UnreadIndicator from "../components/UnreadIndicator";
import { getSelectedFunc } from "./selectedChatsArrObjContext";
import "./uppy.min.css";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import Tus from "@uppy/tus";
import MediaViewer from "../components/MediaViewer";
import MorePanel from "../components/MorePanel";
import TopBar from "../components/TopBar";
import FilePanel from "../components/FilePanel";
import BottomBar from "../components/BottomBar";
import AboutCard from "../components/AboutCard";
import DetailsPanel from "./DetailsPanel";
import { errorDispatcher } from "../functions/errorDispatcher";
import * as api from "../api/index";

function formatDate(currMsgDate) {
  const currentDate = new Date();
  currMsgDate = new Date(currMsgDate);
  const daysDifference = Math.floor(
    (currentDate - currMsgDate) / (1000 * 60 * 60 * 24)
  );
  if (daysDifference === 0) {
    return currMsgDate.toLocaleTimeString([], {
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    });
  } else if (daysDifference < 7) {
    const dayOfWeek = currMsgDate.toLocaleString([], { weekday: "short" });
    return `${dayOfWeek} ${currMsgDate.toLocaleTimeString([], {
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    })}`;
  } else {
    return (
      currMsgDate.toLocaleDateString([], { month: "short", day: "numeric" }) +
      " " +
      currMsgDate.toLocaleTimeString([], {
        hour12: true,
        hour: "numeric",
        minute: "numeric",
      })
    );
  }
}

//didn't use loader because can't use useDispatch hook outside functional react dom component

function removeTusItemsFromLocalStorage() {
  const keys = Object.keys(localStorage);

  keys.forEach((key) => {
    if (key.startsWith("tus")) {
      localStorage.removeItem(key);
    }
  });
}

function ChatBox() {
  const dispatch = useDispatch();
  const setSelected = getSelectedFunc();
  const { chatObjId, chatId } = useParams();
  const [activeReactionBoxMsgId, setActiveReactionBoxMsgId] = useState(null);
  const [showMorePanel, setShowMorePanel] = useState(false);
  const [morePanelAnimationClass, setMorePanelAnimationClass] = useState("");
  const [aboutPanelAnimationClass, setAboutPanelAnimationClass] = useState("");
  const user = useSelector((state) => state.auth.authData.user);
  const chatArray = user?.chats;
  const chatObj = chatArray.filter((chatObj) => chatObj.chat._id == chatId)[0];
  const chat = chatObj?.chat || { _id: "", messages: [] };
  const connectedUserArr = chat.userArr;
  const chatType = chatObj?.chatType;
  const nickNameMap = chatObj?.chat.settings.nickNameMap;
  const chatCardInfo = chatObj?.chatCardInfo;
  const [msg, setMsg] = useState("");
  const [emojiPanel, setEmojiPanel] = useState(false);
  const [filesArr, setFilesArr] = useState([]);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const uppyRef = useRef(null);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(() => {
    const savedProfile = localStorage.getItem("selectedProfile");
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [showAboutCard, setShowAboutCard] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [notSeenMessagesIdArr, setNotSeenMessagesIdArr] = useState([]);
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET;
  const BEARER_TOKEN = import.meta.env.VITE_BEARER_TOKEN;
  const folder = "messages";
  const supabaseStorageURL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;

  const isSmallScreen = useMediaQuery({
    query: "(min-width: 0px) and (max-width: 768px)",
  });
  // as we reversed the messagesArr, we need to watch for the next element
  const hasSeenConflictWithPrevMessageFn = (
    seenByArr,
    userId,
    array,
    index,
    tempNotSeenMessagesIdArr
  ) => {
    if (index === chat?.messages.length - 1) {
      let result = seenByArr.findIndex((item) => item._id === userId);
      if (result === -1) {
        tempNotSeenMessagesIdArr.push(array[index]._id);
      }
      return result === -1;
    } else {
      let result1 = seenByArr.findIndex((item) => item._id === userId);
      let result2 = array[index + 1].seenBy.findIndex(
        (item) => item._id === userId
      );
      if (result1 === -1) {
        tempNotSeenMessagesIdArr.push(array[index]._id);
      }
      return result1 === -1 && result2 !== -1;
    }
  };

  const IsLastSeenMessageFn = (seenByArr, userId, array, index) => {
    if (index === 0) {
      return seenByArr.find((item) => item._id === userId);
    } else {
      return (
        seenByArr.find((item) => item._id === userId) &&
        !array[index - 1].seenBy.find((item) => item._id === userId)
      );
    }
  };

  useEffect(() => {
    setShowAboutCard(false);
    setMsg(chat.draftMessage)
  }, [chatId, chat.draftMessage]);


  useEffect(() => {
    return () => {
      if (uppyRef.current) {
        uppyRef.current.clear();
        uppyRef.current.cancelAll();
        uppyRef.current.destroy();
      }
      //! how to retrive draft file and msg
      //! how to delete not used file in chat
      // if(msg || filesArr.length){
      //   dispatch();
      // }
    };
  }, []);

  useEffect(() => {
    if (filesArr.length == 0) {
      setShowFilePanel(false);
    }
  }, [filesArr]);

  useEffect(() => {
    // trying out ways to add animation. Seeming quite challenging to add animation for conditional DOM nodes
    setMorePanelAnimationClass("fast-fade-in");
    const timer = setTimeout(() => setMorePanelAnimationClass(""), 200);
    return () => clearTimeout(timer);
  }, [showMorePanel]);

  useEffect(() => {
    if (selectedProfile) {
      localStorage.setItem("selectedProfile", JSON.stringify(selectedProfile));
    }
  }, [selectedProfile]);

  useEffect(() => {
    let tempNotSeenMessagesIdArr = [];
    chat?.messages
      .slice()
      .reverse()
      .forEach((msgObj, index, array) => {
        hasSeenConflictWithPrevMessageFn(
          msgObj.seenBy,
          user._id,
          array,
          index,
          tempNotSeenMessagesIdArr
        );
      });
    setNotSeenMessagesIdArr(tempNotSeenMessagesIdArr);
  }, [chat, user._id]);

  // callback ref
  const ref = React.useCallback((node) => {
    if (node) {
      node?.scrollIntoView({ behavior: "smooth" });
      setTimeout(async () => {
        if (node) {
          try {
            const seenByUsrInfo = {
              _id: user._id,
              name: user.name,
              profile_picture: user.profile_picture,
            };
            const response = await api.addToSeenBy(
              chat._id,
              notSeenMessagesIdArr,
              seenByUsrInfo
            );
            if (response.status == 200) {
              dispatch(addToSeenBy(chatId, seenByUsrInfo));
            }
          } catch (error) {
            dispatch(
              errorDispatcher(error.response?.status || 500, {
                message: error.message,
              })
            );
          }
        }
      }, 1000);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmojiPanel(false);
    setShowMorePanel(false);
    setShowFilePanel(false);

    if (msg !== "") {
      dispatch(
        postMessage(connectedUserArr, chatId, {
          sender: user._id,
          messageType: "text",
          message: msg,
          reaction: [],
          seenBy: [
            {
              _id: user._id,
              name: user.name,
              profile_picture: user.profile_picture,
            },
          ],
          time: Date.now(),
        })
      );
      setMsg("");
    }
    if (filesArr.length !== 0) {
      filesArr.forEach((fileObj) => {
        dispatch(
          postMessage(connectedUserArr, chatId, {
            sender: user._id,
            messageType: fileObj.type,
            file: { name: fileObj.name },
            reaction: [],
            seenBy: [
              {
                _id: user._id,
                name: user.name,
                profile_picture: user.profile_picture,
              },
            ],
            time: Date.now(),
          })
        );
      });
      setFilesArr([]);
    }
  };

  const handleChatBoxClick = () => {
    setEmojiPanel(false);
    setShowMorePanel(false);
    if (filesArr.length > 0) {
      setShowFilePanel(true);
    }
    setActiveReactionBoxMsgId(null);
  };
  const handleEmojiPickerClick = (e) => {
    e.stopPropagation();
  };
  const emojiButtonClick = () => {
    if (isSmallScreen) {
      setShowMorePanel(false);
    }
    if (filesArr.length > 0) {
      setShowFilePanel(true);
    }
    setEmojiPanel((emojiPanel) => !emojiPanel);
  };
  const handleMorePanelClick = () => {
    if (isSmallScreen) {
      setEmojiPanel(false);
    }
    if (!showMorePanel) {
      setShowFilePanel(false);
    } else {
      if (filesArr.length > 0) {
        setShowFilePanel(true);
      }
    }
    setShowMorePanel((showMorePanel) => !showMorePanel);
  };

  const showMediaViewerFn = (msgId) => {
    setSelectedMsgId(msgId);
    setShowMediaViewer(true);
  };
  const handleAttachmentClick = (e) => {
    e.stopPropagation();
    if (uppyRef.current) {
      uppyRef.current.cancelAll();
      uppyRef.current.clear();
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
    /* oh my god I solved something crazy. So uppy doesn't let files with same name upload twice.
    and that is a good thing for me. But what happened is that I could not upload the same file ever 
    again without changing the name or location. I tried to reset uppy with many complicated ways like
    changing the meta data or changing the generation id (i hope i remember the name correctly). At last I
    found on the first option documented in a seperate website of uppy under 'id' that uppy stores 
    data under that id. That clicked my head. I noticed huge amount of data in localStorage previously.
    Actually uppy was storing the files in localStorage. Finally I found the problem and deleting those
    entry solves the problem (full-stop) [sigh in relief]  */
    uppyRef.current.on("file-added", (file) => {
      removeTusItemsFromLocalStorage();
      const uniqueName = `${Date.now()}${user._id}${file.name}`;

      const supabaseMetadata = {
        bucketName: STORAGE_BUCKET,
        objectName: folder ? `${folder}/${uniqueName}` : uniqueName,
        contentType: file.type,
      };
      file.meta = {
        ...file.meta,
        ...supabaseMetadata,
      };
    });
    // uppy.opts.autoProceed === true
    uppyRef.current.on("complete", (result) => {
      result.successful.forEach((item) => {
        setFilesArr((filesArr) => [
          ...filesArr,
          {
            type: item.type,
            name: item.meta.objectName,
            previewURL: item.preview,
          },
        ]);
      });
      if (result.failed.length > 0) {
        console.error("Errors:");
        result.failed.forEach((file) => {
          console.error(file.error);
        });
      }
      uppyRef.current.clear();
    });
  };

  return (
    <div className="absolute top-0 left-0 h-full w-full z-10">
      <TopBar
        setSelected={setSelected}
        chatType={chatType}
        chatCardInfo={chatCardInfo}
        showAboutCard={showAboutCard}
        setShowAboutCard={setShowAboutCard}
        setAboutPanelAnimationClass={setAboutPanelAnimationClass}
      />
      {showSearchBar && <div></div>}
      <Outlet context={{ data: selectedProfile }} />
      {showMediaViewer && (
        <div className="absolute z-20 md:h-[calc(100%-10.75rem)] xs:h-[calc(100%-9.75rem)] lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:right-[0.75rem] xs:right-[0.375rem] bottom-[4.75rem] backdrop-blur-2xl">
          <MediaViewer
            messagesArr={chat?.messages}
            selectedMsgId={selectedMsgId}
            setShowMediaViewer={setShowMediaViewer}
          />
        </div>
      )}
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
                const showUnreadIndicator = notSeenMessagesIdArr.includes(
                  msgObj._id
                );
                const prevMsgObj =
                  index !== chat.messages.length - 1 ? array[index + 1] : null;
                const nextMsgObj = index !== 0 ? array[index - 1] : null;
                const showTime =
                  prevMsgObj &&
                  Math.floor(
                    (new Date(msgObj.time) - new Date(prevMsgObj.time)) /
                      (60 * 60 * 1000)
                  ) > 1;
                return (
                  <div key={msgObj._id}>
                    {showUnreadIndicator && (
                      <div ref={ref}>
                        <UnreadIndicator />
                      </div>
                    )}
                    {showTime && (
                      <div className="w-full flex justify-center text-[#999c99]">
                        {formatDate(msgObj.time)}
                      </div>
                    )}
                    <Message
                      key={msgObj._id}
                      user={user}
                      connectedUserArr={connectedUserArr}
                      msgObj={msgObj}
                      prevMsgObj={prevMsgObj}
                      nextMsgObj={nextMsgObj}
                      chatId={chatId}
                      chatType={chatType}
                      nickNameMap={nickNameMap}
                      isActiveReactionBox={activeReactionBoxMsgId == msgObj._id}
                      setActiveReactionBoxMsgId={setActiveReactionBoxMsgId}
                      showMediaViewerFn={showMediaViewerFn}
                      setSelectedProfile={setSelectedProfile}
                      showTime={showTime}
                    />
                    <div className="flex flex-row justify-end gap-2 px-4">
                      {msgObj.seenBy.map((item) => {
                        const showProfilePicture = IsLastSeenMessageFn(
                          msgObj.seenBy,
                          item._id,
                          array,
                          index
                        );
                        return (
                          showProfilePicture &&
                          item.profile_picture && (
                            <div
                              key={item._id}
                              className="h-[22px] w-[22px] rounded-full overflow-hidden flex justify-center items-center"
                            >
                              <img src={item.profile_picture} />
                            </div>
                          )
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </>
        )}
      </div>
      <div id="default-target"></div>
      {showAboutCard && (
        <AboutCard
          userId={user._id}
          chatId={chatId}
          connectedUserArr={connectedUserArr}
          aboutPanelAnimationClass={aboutPanelAnimationClass}
          chatType={chatType}
          chatCardInfo={chatCardInfo}
          nickNameMap={nickNameMap}
        />
      )}
      {(showMorePanel || emojiPanel || showFilePanel) && (
        <div
          className="absolute z-10 bottom-[4.75rem] h-fit flex justify-evenly lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:right-[0.75rem] xs:right-[0.375rem]"
          onClick={handleChatBoxClick}
        >
          {showFilePanel && (
            <FilePanel filesArr={filesArr} setFilesArr={setFilesArr} />
          )}
          {showMorePanel && (
            <MorePanel
              morePanelAnimationClass={morePanelAnimationClass}
              handleAttachmentClick={handleAttachmentClick}
            />
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
              style={{ opacity: "0.8", animation: "fadeIn2 0.2s ease-out" }}
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}
      <BottomBar
        handleSubmit={handleSubmit}
        handleMorePanelClick={handleMorePanelClick}
        emojiButtonClick={emojiButtonClick}
        msg={msg}
        setMsg={setMsg}
      />
    </div>
  );
}

export default ChatBox;
