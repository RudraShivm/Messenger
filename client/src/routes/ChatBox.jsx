import React, { useState } from "react";
import Message from "../components/Message";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { postMessage } from "../actions/chat";
import background from "../images/tactile_noise.png";
import EmojiPicker, { Emoji } from "emoji-picker-react";
import { useMediaQuery } from "react-responsive";
//didn't use loader because can't use useDispatch hook outside functional react dom component

function ChatBox() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatObjId, chatId } = useParams();
  const [msg, setMsg] = useState("");
  const user = useSelector((state) => state.auth.authData.user);
  const chatArray = user?.chats;
  const chatObj = chatArray.filter((chatObj) => chatObj.chat._id == chatId)[0];
  const chat = chatObj?.chat || { messages: [] };
  const secondPerson = chatObj?.user;
  const [emojiPanel, setEmojiPanel] = useState(false);
  const isSmallScreen = useMediaQuery({
    query: "(min-width: 0px) and (max-width: 768px)",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (msg !== "") {
      await postMessage(
        user._id,
        secondPerson._id,
        chatObjId,
        chatId,
        user._id,
        msg
      );
    }
  };
  const handleClick = () => {
    navigate("/home");
  };
  return (
    <div className="absolute top-0 left-0 h-full w-full md:click-through">
      <div className="absolute flex flex-row items-center z-10 md:right-[0.75rem] xs:right-[0.375rem] top-[0.75rem] lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:h-[5.25rem] xs:h-[4.25rem] bg-[#222323] rounded-t-lg">
        {isSmallScreen && (
          <button onClick={handleClick} className="ml-2">
            <svg
              width="28px"
              height="28px"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  fill="#ffffff"
                  d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                ></path>
                <path
                  fill="#ffffff"
                  d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                ></path>
              </g>
            </svg>
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
        className="absolute z-10 md:h-[calc(100%-10.75rem)] xs:h-[calc(100%-9.75rem)] overflow-y-auto flex flex-col-reverse lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:right-[0.75rem] xs:right-[0.375rem] bottom-[4.75rem] bg-fixed"
        style={{ backgroundImage: `url(${background})` }}
      >
        {chat.messages.length == 0 ? (
          <div className="h-full w-full flex flex-col justify-center items-center">
            <div>
              <svg
                width="120px"
                height="120px"
                viewBox="0 0 400 400"
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
                    d="M168.958 155.927C176.737 130.329 183.098 111.177 188.041 98.4702C195.455 79.4104 212.356 53.1502 212.356 60.1603C212.356 67.1705 239.365 153.837 243.921 155.927C248.477 158.016 327.888 156.593 326.992 160.124C326.097 163.655 327.188 164.541 317.314 170.331C310.732 174.19 287.62 191.086 247.979 221.017C245.644 221.991 245.882 224.949 248.692 229.891C252.907 237.304 265.034 277.871 269.41 290.528C273.786 303.186 282.717 337.149 278.251 340.628C273.786 344.108 252.431 322.129 247.979 317.222C243.527 312.314 212.356 253.79 204.271 253.79C196.186 253.79 178.108 279.57 174.148 284.216C170.187 288.862 128.921 336.672 114.124 338.65C99.3259 340.628 104.105 328.539 114.124 309.534C120.803 296.863 134.107 267.309 154.037 220.87C144.027 216.395 135.15 212.906 127.406 210.401C115.791 206.644 79.1085 194.473 73.9807 192.933C68.8528 191.392 84.9287 184.462 96.8396 177.396C108.751 170.331 135.032 160.124 149.953 160.124"
                    stroke="#ffffff"
                    strokeOpacity="0.9"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                </g>
              </svg>
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
              .map((msgObj) => {
                return (
                  <Message
                    key={msgObj._id}
                    user={user}
                    secondPerson={secondPerson}
                    sender={msgObj.sender}
                    msg={msgObj.message}
                  />
                );
              })}
          </>
        )}
        <div className="absolute bottom-0 md:right-1/3 xs:flex  transition ease-in-out">
          <EmojiPicker
            open={emojiPanel}
            theme="dark"
            lazyLoadEmojis="true"
            // functional update
            onEmojiClick={(emojiData, e) =>
              setMsg((currentMsg) => currentMsg + emojiData.emoji)
            }
            //User triggers onEmojiClick, calling setMsg.
            // React queues the state update but doesn't apply it immediately.
            // Any code running right after setMsg still sees the old state.
            // React completes the current execution context (e.g., the event handler).
            // React updates the state, causing a re-render.
            // After the re-render, useEffect with msg in its dependency array runs, now with the updated state.

            // useEffect hook does indeed run after the state has been updated and the component has re-rendered, 
            // but the state doesn't change "right away" in the sense that it's not immediately available
            height={"335px"}
            width={"335px"}
            previewConfig={{ showPreview: false }}
          />
        </div>
      </div>
      <div className="absolute z-10 bottom-[0.75rem] h-[4rem] lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:right-[0.75rem] xs:right-[0.375rem] bg-[#222323] flex items-center rounded-b-lg">
        <form
          className="container flex flex-row justify-end"
          onSubmit={handleSubmit}
        >
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
                e.preventDefault();
                handleSubmit(e);
                setMsg("");
              }
            }}
          />
          <button
            className="rounded-full bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition delay-75 px-3 mt-1 lg:mx-2 xs:mx-1"
            type="submit"
          >
            <svg
              className="lg:h-[28px] lg:w-[28px] xs:h-[20px] xs:w-[20px] "
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
                  d="M10.3009 13.6949L20.102 3.89742M10.5795 14.1355L12.8019 18.5804C13.339 19.6545 13.6075 20.1916 13.9458 20.3356C14.2394 20.4606 14.575 20.4379 14.8492 20.2747C15.1651 20.0866 15.3591 19.5183 15.7472 18.3818L19.9463 6.08434C20.2845 5.09409 20.4535 4.59896 20.3378 4.27142C20.2371 3.98648 20.013 3.76234 19.7281 3.66167C19.4005 3.54595 18.9054 3.71502 17.9151 4.05315L5.61763 8.2523C4.48114 8.64037 3.91289 8.83441 3.72478 9.15032C3.56153 9.42447 3.53891 9.76007 3.66389 10.0536C3.80791 10.3919 4.34498 10.6605 5.41912 11.1975L9.86397 13.42C10.041 13.5085 10.1295 13.5527 10.2061 13.6118C10.2742 13.6643 10.3352 13.7253 10.3876 13.7933C10.4468 13.87 10.491 13.9585 10.5795 14.1355Z"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{" "}
              </g>
            </svg>
          </button>
          <button
            className="rounded-full bg-[#3a3b3c] hover:bg-[#58A89B] hover:scale-105 transition delay-75 px-3 mt-1 lg:mx-2 md:mx-1"
            onClick={() => {
              setEmojiPanel(!emojiPanel);
            }}
            type="button"
          >
            <svg
              className="lg:h-[28px] lg:w-[28px] xs:h-[20px] xs:w-[20px]"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 512.009 512.009"
              xmlSpace="preserve"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <circle
                  style={{ fill: "#F7B239" }}
                  cx="256.004"
                  cy="256.004"
                  r="256.004"
                ></circle>
                <g>
                  <path
                    style={{ fill: "#E09B2D" }}
                    d="M121.499,390.501C29.407,298.407,22.15,153.608,99.723,53.204 c-8.593,6.638-16.861,13.895-24.743,21.777c-99.974,99.974-99.974,262.065,0,362.038s262.065,99.974,362.038,0 c7.881-7.881,15.138-16.15,21.777-24.743C358.392,489.85,213.593,482.593,121.499,390.501z"
                  ></path>
                  <path
                    style={{ fill: "#E09B2D" }}
                    d="M256.001,378.454c-9.558,0-19.114-1.303-28.407-3.908c-5.045-1.416-7.989-6.652-6.575-11.699 c1.414-5.045,6.651-7.991,11.698-6.575c15.234,4.271,31.335,4.271,46.569,0c5.049-1.413,10.283,1.53,11.698,6.575 c1.414,5.045-1.53,10.283-6.575,11.699C275.115,377.151,265.558,378.454,256.001,378.454z"
                  ></path>
                </g>
                <g>
                  <path
                    style={{ fill: "#4D4D4D" }}
                    d="M357.944,166.633c-19.358,0-35.107,15.749-35.107,35.107s15.749,35.107,35.107,35.107 s35.107-15.749,35.107-35.107S377.303,166.633,357.944,166.633z"
                  ></path>
                  <path
                    style={{ fill: "#4D4D4D" }}
                    d="M184.832,218.274c1.776,2.974,4.925,4.624,8.154,4.623c1.656,0,3.334-0.434,4.858-1.345 c4.499-2.688,5.966-8.513,3.279-13.012c-10.46-17.506-28.878-27.957-49.27-27.957c-20.393,0-38.812,10.451-49.272,27.957 c-2.687,4.499-1.22,10.325,3.279,13.012c4.5,2.688,10.325,1.22,13.012-3.279c7-11.718,19.329-18.714,32.98-18.714 C165.501,199.559,177.832,206.555,184.832,218.274z"
                  ></path>
                  <path
                    style={{ fill: "#4D4D4D" }}
                    d="M345.774,277.019c-4.495-2.686-10.324-1.221-13.012,3.279 c-16.295,27.273-44.991,43.556-76.761,43.556s-60.466-16.283-76.761-43.556c-2.687-4.498-8.512-5.965-13.012-3.279 c-4.499,2.688-5.966,8.513-3.279,13.012c19.753,33.061,54.538,52.8,93.052,52.8s73.299-19.739,93.052-52.8 C351.74,285.532,350.271,279.706,345.774,277.019z"
                  ></path>
                </g>
              </g>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;
