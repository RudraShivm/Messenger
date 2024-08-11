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
import { ADDTOSEENBYARR, REACTMESSAGE } from "../constants/actionTypes";
import { signOut } from "../actions/user";
const socket = io(`${import.meta.env.VITE_SERVER_BASE_URL}`);

export async function loader({ request }) {
  const url = new URL(request.url);
  const s = url.searchParams.get("s");
  return { s };
}

function Home() {
  const { s } = useLoaderData();
  const location = useLocation();
  const chatHistory = useSelector((state) => state.auth?.authData?.user?.chats);
  const searchResult = useSelector((state) => state.auth?.searchResult);
  const [chatsArr, setChatsArr] = useState(chatHistory);
  const { _id: currentUserId, name: currentUserName } = useSelector(
    (state) => state.auth?.authData?.user
  );
  const searching = false;
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
    searchResult ? setChatsArr(searchResult) : setChatsArr(chatHistory);
  }, [searchResult, chatHistory]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    socket.on("userUpdated", (change) => {
      // only using for missing chatObj, rest of the chatObj changes are done after the chat changes as for now

      // console.log("User updated:", change);
      const userId = change.documentKey._id;
      if (currentUserId !== userId) return;

      let chatObj = null;
      Object.keys(change.updateDescription.updatedFields).forEach((key) => {
        if (key.startsWith("chats")) {
          //sample object recieved from mongoose change stream
          {
            //   "_id": {
            //     "_data": "82668D66E8000000102B042C0100296E5A10044405446A5054494FA89BB85C575AAE86463C6F7065726174696F6E54797065003C7570646174650046646F63756D656E744B65790046645F6964006466845AE51FF66D3C3CA338B5000004"
            //   },
            //   "operationType": "update",
            //   "clusterTime": {
            //     "$timestamp": "7389675710203297808"
            //   },
            //   "wallTime": "2024-07-09T16:35:52.568Z",
            //   "ns": {
            //     "db": "test",
            //     "coll": "usermodels"
            //   },
            //   "documentKey": {
            //     "_id": "66845ae51ff66d3c3ca338b5"
            //   },
            //   "updateDescription": {
            //     "updatedFields": {
            //       "__v": 43,
            //       "chats": [
            //         {
            //           "lastMessageInfo": {
            //             "message": "what?",
            //             "time": "2024-07-09T16:19:14.656Z"
            //           },
            //           "user": "668a5e0c8009ece807436c5a",
            //           "chat": "668bf935b4d461e539949c24",
            //           "_id": "668bf935b4d461e539949c2a"
            //         },
            //         {
            //           "lastMessageInfo": {
            //             "message": "daw",
            //             "time": "2024-07-09T16:35:52.510Z"
            //           },
            //           "user": "668575a9aaf673223ba636ac",
            //           "chat": "668c29a27cad46425180f57e",
            //           "_id": "668c29a27cad46425180f582"
            //         }
            //       ]
            //     },
            //     "removedFields": [],
            //     "truncatedArrays": []
            //   }
            // }
          }
          chatObj =
            change.updateDescription.updatedFields[key][
              change.updateDescription.updatedFields[key].length - 1
            ];
          if (chatObj) {
            dispatch(updateChatsArr(chatObj));
          }
        }
      });
    });

    //when A new array element is added, the whole array is returned, but when a new item is added
    // to that array, it makes a key comprised of the array field name and the index like 'messages.1'
    //pretty convenient :)

    socket.on("chatUpdated", (change) => {
      // console.log("Chat updated:", change);
      const chatId = change.documentKey._id;
      let index1, index2;
      let messageObj = null;
      let reactionObj = null;
      let seenByUsrId = null;
      Object.keys(change.updateDescription.updatedFields).forEach((key) => {
        if (key.startsWith("messages.")) {
          /* messages.3.seenBy.1
          messages.10 for new message
          message.10.reaction for new reaction on past messages */

          index1 = parseInt(key.split(".")[1], 10);
          if (key.split(".").length == 2) {
            messageObj = change.updateDescription.updatedFields[key];

            /* extra work but the messages should response accordingly if a chat is opened and new Messages
            comes it should not add any UnreadIndicator. That will be overkill..*/
            let selectedChatsArrObj = chatHistory.find(
              (item) => item.user._id == selectedRef.current
            );
            if (
              selectedChatsArrObj &&
              selectedChatsArrObj.chat?._id == chatId &&
              !messageObj.seenBy.includes(currentUserId)
            ) {
              messageObj.seenBy.push(currentUserId);
            }
            dispatch(
              updateChat(
                chatId,
                messageObj,
                index1,
                location.pathname,
                navigate
              )
            );
          } else if (key.includes("seenBy")) {
            if (key.endsWith("seenBy")) {
              seenByUsrId = change.updateDescription.updatedFields[key][0];
            } else {
              seenByUsrId = change.updateDescription.updatedFields[key];
            }
            dispatch({
              type: ADDTOSEENBYARR,
              payload: { chatId, seenByUsrId },
            });
          } else if (key.includes("reaction")) {
            if (!key.includes("emoji")) {
              if (key.endsWith("reaction")) {
                reactionObj = change.updateDescription.updatedFields[key][0];
              } else {
                reactionObj = change.updateDescription.updatedFields[key];
              }
              dispatch({
                type: REACTMESSAGE,
                payload: {
                  userId: reactionObj.user,
                  chatObjId: null,
                  chatId: change.documentKey._id,
                  messageId: null,
                  messageArrIndex: index1,
                  reactionArrIndex: null,
                  emoji: reactionObj.emoji,
                },
              });
            } else {
              let emoji = change.updateDescription.updatedFields[key];
              index2 = parseInt(key.split(".")[3], 10);
              dispatch({
                type: REACTMESSAGE,
                payload: {
                  userId: null,
                  chatObjId: null,
                  chatId: change.documentKey._id,
                  messageId: null,
                  messageArrIndex: index1,
                  reactionArrIndex: index2,
                  emoji,
                },
              });
            }
          }
        } else if (key.startsWith("messages")) {
          //returns updated fields with array when new array is populated for the first time
          messageObj = change.updateDescription.updatedFields[key][0];
          index1 = 0;
          dispatch(
            updateChat(chatId, messageObj, index1, location.pathname, navigate)
          );
        }
      });
    });

    return () => {
      socket.off("userChange");
      socket.off("chatChange");
    };
  }, []);

  const handleAddClick = () => {
    navigate(`/home/searchUser`);
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
          <div className="w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] bg-[#222323] rounded-lg">
            <div className="flex flex-row relative">
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
            <SearchBar searching={searching} s={s} />
            <div className="overflow-y-auto">
              {chatsArr
                ?.slice()
                .reverse()
                .map((chatObj) => {
                  return (
                    <ChatCard
                      userId={currentUserId}
                      userName={currentUserName}
                      secondPerson={chatObj.user}
                      chatObjId={chatObj._id}
                      chatId={
                        typeof chatObj.chat == "string"
                          ? chatObj.chat
                          : chatObj.chat._id
                      }
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
