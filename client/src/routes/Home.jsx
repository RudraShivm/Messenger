import React, { useEffect, useState, useRef } from "react";
import {
  useLocation,
  useNavigate,
  Outlet,
  useLoaderData,
} from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ChatCard from "../components/ChatCard";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import {
  addToSeenBy,
  reactMessage,
  updateChat,
  updateChatsArr,
} from "../actions/chat";
import Lottie from "react-lottie";
import animationData from "../animations/Animation - 1720284169313.json";
import loadingContext from "./loadingContext";
import selectedChatsArrObjContext from "./selectedChatsArrObjContext";
import { useMediaQuery } from "react-responsive";
import AddIcon from "../components/svgs/addIcon.svg?react";
import LogOutIcon from "../components/svgs/logOutIcon.svg?react";
import TappingFingerIcon from "../components/svgs/tappingFingerIcon.svg?react";
import {
  ADDTOSEENBYARR,
  REACTMESSAGE,
  UPDATE_FRIENDS,
} from "../constants/actionTypes";
import { signOut, updateChatCardInfo, updateFriends } from "../actions/user";
const socket = io(`${import.meta.env.VITE_SERVER_BASE_URL}`);

export async function loader({ request }) {
  const url = new URL(request.url);
  const s = url.searchParams.get("homeSearchTerm");
  return { s };
}

function Home() {
  const { s } = useLoaderData();
  const location = useLocation();
  const profile = useSelector((state) => state.auth?.authData);
  const user = profile.user;
  const chatHistory = useSelector((state) => state.auth?.authData.user.chats);
  const friendsMap = user.friends;
  const homeSearchResult = useSelector((state) => state.auth?.homeSearchResult);
  const [chatsArr, setChatsArr] = useState(chatHistory);
  const currentUserId = useSelector((state) => state.auth?.authData?.user._id);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selected, setSelected] = useState({});
  const selectedRef = useRef(selected);
  const isSmallScreen = useMediaQuery({
    query: "(min-width: 0px) and (max-width: 768px)",
  });
  const showHomeComp = !(isSmallScreen && location.pathname.includes("/chat/"));
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  useEffect(() => {
    homeSearchResult ? setChatsArr(homeSearchResult) : setChatsArr(chatHistory);
  }, [homeSearchResult, chatHistory]);
  useEffect(()=>{
  },[chatHistory]);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    const handleUserUpdated = (change) => {
      console.log("User updated:", change);
      const userId = change.documentKey._id;
      if (currentUserId !== userId) return;

      let chatObj = null;
      Object.keys(change.updateDescription.updatedFields).forEach((key) => {
        if (key.startsWith("chats")) {
          if (key.split(".")[2] === "lastMessageInfo") {
            return;
          }
          const value = change.updateDescription.updatedFields[key];

          if (key.split(".")[2] === "chatCardInfo" && key.split(".")[3] === "name") {
            const chatsArrIndex = key.split(".")[1];
            dispatch(updateChatCardInfo(chatsArrIndex, value));
            return;
          }

          if (value && typeof value === "object" && !Array.isArray(value)) {
            chatObj = value;
          } else {
            chatObj = value[value.length - 1];
          }
          if (chatObj) {
            dispatch(updateChatsArr(chatObj));
          }
        } else if (key.startsWith("friends")) {
          const value = change.updateDescription.updatedFields[key];
          if (!(value && typeof value === "object" && !Array.isArray(value))) {
            dispatch(updateFriends(friendsMap, value));
          }
        }
      });
    };

    const handleChatUpdated = (change) => {
      console.log("Chat updated:", change);
      const chatId = change.documentKey._id;

      if (!chatHistory.find((chatObj) => {
        let existingChatId = typeof chatObj?.chat === "object" ? chatObj?.chat?._id : chatObj?.chat;
        return existingChatId === chatId;
      })) {
        return;
      }

      let index1, index2;
      let messageObj = null;
      let reactionObj = null;
      let seenByUsrInfo = null;
      Object.keys(change.updateDescription.updatedFields).forEach((key) => {
        if (key.startsWith("messages")) {
          index1 = parseInt(key.split(".")[1], 10);
          if (!key.includes("seenBy") && !key.includes("reaction")) {
            const value = change.updateDescription.updatedFields[key];
            if (value && typeof value === "object" && !Array.isArray(value)) {
              messageObj = value;
            } else {
              messageObj = value[value.length - 1];
            }

            let selectedChatsArrObj = chatHistory.find(
              (item) => item.chat._id === selectedRef.current.chatId
            );
            if (selectedChatsArrObj && selectedChatsArrObj.chat._id === chatId && !messageObj.seenBy.includes(currentUserId)) {
              messageObj.seenBy.push(currentUserId);
            }
            dispatch(updateChat(chatId, messageObj));
          } else if (key.includes("seenBy")) {
            if (key.endsWith("seenBy")) {
              seenByUsrInfo = change.updateDescription.updatedFields[key][0];
            } else {
              seenByUsrInfo = change.updateDescription.updatedFields[key];
            }
            dispatch(addToSeenBy(chatId, seenByUsrInfo));
          } else if (key.includes("reaction")) {
            if (!key.includes("emoji")) {
              if (key.endsWith("reaction")) {
                reactionObj = change.updateDescription.updatedFields[key][0];
              } else {
                reactionObj = change.updateDescription.updatedFields[key];
              }
              dispatch(
                reactMessage(
                  reactionObj.user,
                  null,
                  change.documentKey._id,
                  null,
                  index1,
                  null,
                  reactionObj.emoji
                )
              );
            } else {
              let emoji = change.updateDescription.updatedFields[key];
              index2 = parseInt(key.split(".")[3], 10);
              dispatch(
                reactMessage(
                  null,
                  null,
                  change.documentKey._id,
                  null,
                  index1,
                  index2,
                  emoji
                )
              );
            }
          }
        } else if (key.startsWith("messages")) {
          messageObj = change.updateDescription.updatedFields[key][0];
          index1 = 0;
          dispatch(updateChat(chatId, messageObj));
        }
      });
    };

    socket.on("userUpdated", handleUserUpdated);
    socket.on("chatUpdated", handleChatUpdated);

    return () => {
      socket.off("userUpdated", handleUserUpdated);
      socket.off("chatUpdated", handleChatUpdated);
    };
  }, [chatHistory, currentUserId, selectedRef, dispatch]);

  const handleAddClick = () => {
    navigate(`/home/addPanel`);
  };
  const handleLogOutClick = async () => {
    dispatch(signOut(currentUserId, navigate));
  };
  //Using ContextProvider is pretty inconvenient after using so much redux. Also it is like the pirated broken copy of react props xd
  return (
    <div className="relative">
      <loadingContext.Provider value={setLoading}>
        <selectedChatsArrObjContext.Provider value={setSelected}>
          <Outlet />
        </selectedChatsArrObjContext.Provider>
      </loadingContext.Provider>

      <div
        className={`h-dvh lg:w-1/3 md:w-2/5 xs:w-full bg-[#191919] flex justify-center items-center`}
      >
        {showHomeComp && (
          <div className="w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] bg-[#222323] rounded-lg z-20">
            <div className="">
              <div className="flex flex-row relative h-[69px]">
                <button onClick={() => navigate("/home")}>
                  <p className="font-bold lg:text-4xl md:text-3xl xs:text-3xl text-white pl-6 md:py-4 xs:pt-4 hover:cursor-pointer">
                    Chats
                  </p>
                </button>
                <button
                  className="absolute lg:right-24 xs:right-20 xs:mt-3 2xl:mt-2 bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition delay-75 rounded-full"
                  onClick={handleAddClick}
                >
                  <AddIcon />
                </button>
                <button
                  className="absolute lg:right-7 xs:right-7 xs:mt-3 2xl:mt-2 bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition delay-75 rounded-full"
                  onClick={handleLogOutClick}
                >
                  <LogOutIcon />
                </button>
              </div>
              <SearchBar s={s} id="homeSearchTerm" />
            </div>
            <div className="overflow-y-auto h-[calc(100%-69px-45px-2rem)]">
              {chatsArr
                ?.slice()
                .reverse()
                .map((chatObj) => {
                  return (
                    <ChatCard
                      userId={currentUserId}
                      chatObjId={chatObj._id}
                      chatId={
                        typeof chatObj.chat == "string"
                          ? chatObj.chat
                          : chatObj.chat._id
                      }
                      chatType={chatObj.chatType}
                      chatCardInfo={chatObj.chatCardInfo}
                      lastMessageInfo={chatObj.lastMessageInfo}
                      key={chatObj._id}
                      setLoading={setLoading}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  );
                })}
            </div>
          </div>
        )}
      </div>
      {!isSmallScreen && (
        <div className="h-dvh lg:w-2/3 md:w-3/5 absolute right-0 top-0 bg-[#191919] flex flex-col justify-center items-center -z-10">
          {loading ? (
            <div className="my-4">
              <Lottie options={defaultOptions} height={200} width={200} />
            </div>
          ) : (
            <>
              <div className="my-4">
                <TappingFingerIcon />
              </div>
              <div className="text-2xl font-bold text-white mb-4">
                Click a chat to display
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
