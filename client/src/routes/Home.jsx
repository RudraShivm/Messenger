import React, { useEffect, useState } from "react";
import { useLocation, useSubmit, useNavigate, Outlet, useLoaderData, Navigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ChatCard from "../components/ChatCard";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { updateChat, updateChatsArr } from "../actions/chat";
import Lottie from "react-lottie";
import animationData from "../images/Animation - 1720284169313.json";
import loadingContext from "./loadingContext";
import { CREATECHAT } from "../constants/actionTypes";
import { useMediaQuery } from "react-responsive";
const socket = io("http://localhost:3000");

export async function loader({ request }) {
  const url = new URL(request.url);
  const s = url.searchParams.get("s");
  return {s};
}

function Home() {
  const {s} = useLoaderData();
  const location = useLocation();
  const chatHistory = useSelector((state) => state.auth?.authData?.user?.chats);
  const searchResult = useSelector((state) => state.auth?.searchResult);
  const [chatsArr, setChatsArr] = useState (chatHistory);
  const currentUserId = useSelector((state) => state.auth?.authData?.user?._id);
  const searching = false;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("");
  const isSmallScreen = useMediaQuery({ query: '(min-width: 0px) and (max-width: 768px)' });
  const showHomeComp = !(isSmallScreen && location.pathname.includes("/chat/"));
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  useEffect(()=>{
    searchResult? setChatsArr(searchResult) : setChatsArr(chatHistory);
  },[searchResult, chatHistory]);

  useEffect(() => {
    socket.on("userUpdated", (change) => {
      console.log("User updated:", change);
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
          chatObj = change.updateDescription.updatedFields[key][change.updateDescription.updatedFields[key].length - 1];
          if (chatObj) {
            dispatch(updateChatsArr(chatObj));
          }
        }
      });
      
    });

    socket.on("chatCreated", (change) => {
      console.log("Chat created:", change);
    });
    socket.on("chatDeleted", (change) => {
      console.log("Chat deleted:", change);
    });
    //when A new array element is added, the whole array is returned, but when a new item is added
    // to that array, it makes a key comprised of the array field name and the index like 'messages.1'
    //pretty convenient :)

    socket.on("chatUpdated", (change) => {
      console.log("Chat updated:", change);
      const chatId = change.documentKey._id;
      let index;
      let messageObj = null;
      Object.keys(change.updateDescription.updatedFields).forEach((key) => {
        if (key.startsWith("messages.")) {
          index = parseInt(key.split(".")[1], 10);
          messageObj = change.updateDescription.updatedFields[key];
        } else if (key.startsWith("messages")) {
          //returns updated fields with array when new array is populated for the first time
          messageObj = change.updateDescription.updatedFields[key][0];
          index = 0;
        }
      });
      if (messageObj && index !== undefined) {
        dispatch(
          updateChat(chatId, messageObj, index, location.pathname, navigate)
        );
      }
    });

    return () => {
      socket.off("userChange");
      socket.off("chatChange");
    };
  }, []);

  

  //// can be corner cases in future which can break the route and generate invalid url
  const handleAddClick = () => {
    navigate(`/home/searchUser`);
  };
  const handleLogOutClick = ()=>{
    localStorage.removeItem("profile");
    navigate('/auth');
  };
  //Using ContextProvider is pretty inconvenient after using so much redux. Also it is like the pirated broken copy of react props xd
  return (
    <div className="relative h-full w-full ">
      <loadingContext.Provider value={setLoading}>
        <Outlet />
      </loadingContext.Provider>
      
      <div className={`h-screen lg:w-1/3 md:w-2/5 xs:w-full bg-[#191919] flex justify-center items-center`}>
        {showHomeComp &&
        <div className="w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] bg-[#222323] rounded-lg">
          <div className="flex flex-row relative">
            <button onClick={()=> navigate('/home')}>
            <p className="font-bold lg:text-4xl md:text-3xl xs:text-3xl text-white pl-6 md:py-4 xs:pt-4 hover:cursor-pointer">Chats</p>
            </button>
            <button
              className="absolute lg:right-24 xs:right-20 xs:mt-3 2xl:mt-2 bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition delay-75 rounded-full"
              onClick={handleAddClick}
            >
              <svg
                className="2xl:h-[48px] 2xl:w-[48px] lg:h-[42px] lg:w-[42px] xs:h-[38px] xs:w-[38px]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#ffffff"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M6 12H18M12 6V18"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                </g>
              </svg>
            </button>
            <button 
              className="absolute lg:right-7 xs:right-7 xs:mt-3 2xl:mt-2 bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition delay-75 rounded-full"
              onClick={handleLogOutClick}
            >
              <svg
                className="2xl:h-[48px] 2xl:w-[48px] lg:h-[42px] lg:w-[42px] xs:h-[38px] xs:w-[38px]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M10 12H20M20 12L17 9M20 12L17 15"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M4 12C4 7.58172 7.58172 4 12 4M12 20C9.47362 20 7.22075 18.8289 5.75463 17"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>{" "}
                </g>
              </svg>
            </button>
          </div>
          <SearchBar searching={searching} s={s}/>
          <div className="overflow-y-auto">
          {chatsArr.slice().reverse().map((chatObj) => {
            return (
              <ChatCard
                user={chatObj.user}
                chatObjId={chatObj._id}
                chatId={
                  typeof chatObj.chat == "string"
                    ? chatObj.chat
                    : chatObj.chat._id
                }
                lastMessageInfo = {chatObj.lastMessageInfo}
                key={chatObj._id}
                setLoading={setLoading}
                selected={selected}
                setSelected={setSelected}
              />
            );
          })}
          </div>
        </div>
        }
      </div>
      {!isSmallScreen &&
      <div className="h-screen lg:w-2/3 md:w-3/5 absolute right-0 top-0 bg-[#191919] flex flex-col justify-center items-center ">
        {loading ? (
          <div className="my-4">
            <Lottie options={defaultOptions} height={200} width={200} />
          </div>
        ) : (
          <>
            <div className="my-4">
              <svg
                height="50px"
                width="50px"
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                fill="#000000"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <g>
                    <path
                      style={{ fill: "#FFDBCC" }}
                      d="M111.31,310.777v50.306l55.895,22.358L144.847,277.24C126.324,277.24,111.31,292.256,111.31,310.777 z"
                    ></path>
                    <path
                      style={{ fill: "#FFDBCC" }}
                      d="M346.069,260.472v50.306h44.716l-11.179-83.843C361.084,226.934,346.069,241.95,346.069,260.472z"
                    ></path>
                  </g>
                  <path
                    style={{ fill: "#FFC1A6" }}
                    d="M413.144,260.472c0-18.521-15.015-33.537-33.537-33.537v83.843l33.537-33.537V260.472z"
                  ></path>
                  <path
                    style={{ fill: "#FFDBCC" }}
                    d="M245.458,193.397c-18.523,0-33.537,15.015-33.537,33.537l-22.358,83.843h111.79l-22.358-83.843 C278.995,208.412,263.979,193.397,245.458,193.397z"
                  ></path>
                  <g>
                    <path
                      style={{ fill: "#FEA680" }}
                      d="M312.532,210.166c-18.523,0-33.537,15.016-33.537,33.537v67.074h67.074v-67.074 C346.069,225.182,331.054,210.166,312.532,210.166z"
                    ></path>
                    <path
                      style={{ fill: "#FEA680" }}
                      d="M178.384,75.459c-18.523,0-33.537,15.015-33.537,33.537v201.782h67.074V108.996 C211.921,90.473,196.905,75.459,178.384,75.459z"
                    ></path>
                    <path
                      style={{ fill: "#FEA680" }}
                      d="M381.842,277.24L262.227,512c83.349,0,150.917-67.568,150.917-150.917V277.24H381.842z"
                    ></path>
                  </g>
                  <path
                    style={{ fill: "#FFC1A6" }}
                    d="M144.847,277.24v83.843H111.31c0,83.35,67.568,150.917,150.917,150.917 c64.827,0,117.38-67.567,117.38-150.917V277.24H144.847z"
                  ></path>
                  <g>
                    <path
                      style={{ fill: "#42C8C6" }}
                      d="M178.384,50.306c-4.63,0-8.384-3.753-8.384-8.384V8.384C170,3.753,173.753,0,178.384,0 s8.384,3.753,8.384,8.384v33.537C186.768,46.553,183.014,50.306,178.384,50.306z"
                    ></path>
                    <path
                      style={{ fill: "#42C8C6" }}
                      d="M130.956,74.249c-2.145,0-4.292-0.818-5.928-2.455l-23.715-23.715 c-3.274-3.275-3.274-8.583,0-11.858c3.274-3.273,8.583-3.273,11.856,0l23.714,23.715c3.274,3.275,3.274,8.583,0,11.858 C135.246,73.431,133.101,74.249,130.956,74.249z"
                    ></path>
                    <path
                      style={{ fill: "#42C8C6" }}
                      d="M225.812,74.249c-2.145,0-4.292-0.818-5.928-2.455c-3.274-3.275-3.274-8.583,0-11.858l23.714-23.716 c3.274-3.273,8.583-3.273,11.856,0c3.274,3.275,3.274,8.583,0,11.858L231.74,71.793C230.104,73.431,227.958,74.249,225.812,74.249z "
                    ></path>
                  </g>
                </g>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mb-4">
              Click a chat to display
            </div>
          </>
        )}
      </div>
      
      }
    </div>
  );
}

export default Home;
