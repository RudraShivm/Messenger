import React, { useEffect, useState } from "react";
import { getLoadingFunc } from "./loadingContext.js";
import animationData from "../images/Animation - 1720812556915.json";
import Lottie from "react-lottie";
import baseURL from "../../baseurl";
import * as api from "../api/index";
import { createChat, loadChat } from "../actions/chat";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";

function SearchUser() {
  const setLoading = getLoadingFunc();
  const [inviteLink, setInviteLink] = useState("");
  const [message, setMessage] = useState("");
  const currentUser = useSelector((state) => state.auth.authData.user);
  const chatsArr = currentUser.chats;
  const [loadingOnSearchUser, setLoadingOnSearchUser] = useState(false);
  const [validity, setValidity] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location =useLocation();
  const {inviteId} = location.state || {};

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const inviteHelper = async (inviteIdString) => {
    if (inviteIdString.length !== 24) {
      setValidity(false);
      setMessage("The invite link is not valid!");
      return;
    }
    try {
      const response = await api.getInvite(inviteIdString);
      console.log(JSON.stringify(response));
      if (response.status === 200) {
        const { data } = response;
        if (data.user === currentUser._id) {
          setValidity(false);
          setMessage("Why are you inviting yourself? Don't you have friends?");
          return;
        }
        navigate("/home");
        setLoading(true);
        const existingChatObj = chatsArr.find(
          (chatObj) => chatObj.user._id === data.user
        );
        if (existingChatObj) {
          dispatch(
            loadChat(
              existingChatObj._id,
              typeof existingChatObj.chat === "string"
                ? existingChatObj.chat
                : existingChatObj.chat._id,
              navigate,
              setLoading
            )
          );
        } else {
          dispatch(createChat(currentUser._id, data.user, navigate, setLoading));
        }
      } 
    } catch (error) {
      console.log(error);
      if (error.response.status === 404 || error.response.status === 400) {
        setValidity(false);
        setMessage(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    if(inviteId){
      console.log("here");
      inviteHelper(inviteId);
    }
  }, []);

  const handleChange = async (e) => {
    const link = e.target.value;
    const baseStr = `${baseURL}/invite/`;
    let valid = link.trim().startsWith(baseStr);
    if (valid) {
      setValidity(valid);
      setMessage("Looks good so far");
      let inviteIdString = link.trim().slice(baseStr.length);
      inviteHelper(inviteIdString);
    }
  };

  const handleQRClick = async () => {
    setMessage("");
    const { data } = await api.createInvite(currentUser._id);
    setInviteLink(`${baseURL}/invite/${data._id}`);
  };

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        // alert("Text copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const handleCancelClick = ()=>{
    setInviteLink("");
  }

  return (
    <div className="absolute h-screen w-screen top-0 left-0 flex justify-center items-center backdrop-blur-sm z-10">
      <div className="container relative h-1/3 md:w-2/5 xs:w-4/5 bg-[#191919] rounded-xl border-[1px] border-slate-500">
        <div className="h-[4rem] flex flex-row justify-center items-center">
          <input
            aria-label="Invite Link"
            placeholder="Enter invite link to start chatting"
            onChange={inviteLink.length == 0 ? handleChange : () => {}}
            onClick={inviteLink.length == 0 ? ()=>{} : handleCopyClick}
            value={inviteLink.length == 0 ? "" : inviteLink}
            className={`my-4 lg:mx-4 md:mx-2 lg:text-lg md:text-base text-white leading-1 w-9/12 py-1.5 px-2 rounded-lg  bg-[#3a3b3c] focus:outline-none ${inviteLink.length != 0 && "hover:cursor-copy"}`}
          />
          {inviteLink.length == 0 ? (
            <button
            className="rounded-xl lg:mx-1 md:mx-0 xs:mx-2 bg-[#3a3b3c] hover:bg-[#01211c] hover:scale-105 hover:cursor-pointer transition delay-75 p-1.5"
            onClick={handleQRClick}
            style={{
              animation:
                inviteLink.length > 0 ? "popFromLeft 0.1s linear" : "none",
            }}
            >
            <svg
              className="lg:h-[28px] lg:w-[28px] xs:h-[24px] xs:w-[24px]"
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
                  d="M23 4C23 2.34315 21.6569 1 20 1H16C15.4477 1 15 1.44772 15 2C15 2.55228 15.4477 3 16 3H20C20.5523 3 21 3.44772 21 4V8C21 8.55228 21.4477 9 22 9C22.5523 9 23 8.55228 23 8V4Z"
                  fill="#FF6070"
                ></path>{" "}
                <path
                  d="M23 16C23 15.4477 22.5523 15 22 15C21.4477 15 21 15.4477 21 16V20C21 20.5523 20.5523 21 20 21H16C15.4477 21 15 21.4477 15 22C15 22.5523 15.4477 23 16 23H20C21.6569 23 23 21.6569 23 20V16Z"
                  fill="#FF6070"
                ></path>{" "}
                <path
                  d="M4 21C3.44772 21 3 20.5523 3 20V16C3 15.4477 2.55228 15 2 15C1.44772 15 1 15.4477 1 16V20C1 21.6569 2.34315 23 4 23H8C8.55228 23 9 22.5523 9 22C9 21.4477 8.55228 21 8 21H4Z"
                  fill="#FF6070"
                ></path>{" "}
                <path
                  d="M1 8C1 8.55228 1.44772 9 2 9C2.55228 9 3 8.55228 3 8V4C3 3.44772 3.44772 3 4 3H8C8.55228 3 9 2.55228 9 2C9 1.44772 8.55228 1 8 1H4C2.34315 1 1 2.34315 1 4V8Z"
                  fill="#FF6070"
                ></path>{" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11 6C11 5.44772 10.5523 5 10 5H6C5.44772 5 5 5.44772 5 6V10C5 10.5523 5.44772 11 6 11H10C10.5523 11 11 10.5523 11 10V6ZM9 7.5C9 7.22386 8.77614 7 8.5 7H7.5C7.22386 7 7 7.22386 7 7.5V8.5C7 8.77614 7.22386 9 7.5 9H8.5C8.77614 9 9 8.77614 9 8.5V7.5Z"
                  fill="#FF6070"
                ></path>{" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18 13C18.5523 13 19 13.4477 19 14V18C19 18.5523 18.5523 19 18 19H14C13.4477 19 13 18.5523 13 18V14C13 13.4477 13.4477 13 14 13H18ZM15 15.5C15 15.2239 15.2239 15 15.5 15H16.5C16.7761 15 17 15.2239 17 15.5V16.5C17 16.7761 16.7761 17 16.5 17H15.5C15.2239 17 15 16.7761 15 16.5V15.5Z"
                  fill="#FF6070"
                ></path>{" "}
                <path
                  d="M14 5C13.4477 5 13 5.44772 13 6C13 6.55229 13.4477 7 14 7H16.5C16.7761 7 17 7.22386 17 7.5V10C17 10.5523 17.4477 11 18 11C18.5523 11 19 10.5523 19 10V6C19 5.44772 18.5523 5 18 5H14Z"
                  fill="#FF6070"
                ></path>{" "}
                <path
                  d="M14 8C13.4477 8 13 8.44771 13 9V10C13 10.5523 13.4477 11 14 11C14.5523 11 15 10.5523 15 10V9C15 8.44772 14.5523 8 14 8Z"
                  fill="#FF6070"
                ></path>{" "}
                <path
                  d="M6 13C5.44772 13 5 13.4477 5 14V16C5 16.5523 5.44772 17 6 17C6.55229 17 7 16.5523 7 16V15.5C7 15.2239 7.22386 15 7.5 15H10C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13H6Z"
                  fill="#FF6070"
                ></path>{" "}
                <path
                  d="M10 17C9.44771 17 9 17.4477 9 18C9 18.5523 9.44771 19 10 19C10.5523 19 11 18.5523 11 18C11 17.4477 10.5523 17 10 17Z"
                  fill="#FF6070"
                ></path>{" "}
              </g>
            </svg>
          </button>
          ) : (
            <button 
              className="rounded-xl mx-1 bg-[#3a3b3c] hover:bg-[#01211c] hover:scale-105 hover:cursor-pointer transition delay-75 p-1.5"
              onClick={handleCancelClick}
            >
              <svg
                width="28px"
                height="28px"
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
                    d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z"
                    fill="#FF6070"
                  ></path>{" "}
                </g>
              </svg>
            </button>
          )}
          
        </div>
        <div
          className={`text-sm text-center ${
            validity ? "text-green-400" : "text-red-600"
          } font-light mx-8`}
        >
          {message}
        </div>
        {loadingOnSearchUser ? (
          <div className="my-4">
            <Lottie options={defaultOptions} height={200} width={200} />
          </div>
        ) : inviteLink.length != 0 ? (
          <div className="flex flex-col justify-center items-center h-[calc(100%-5rem)] w-full">
            <QRCode
              size={256}
              className="h-[calc(100%-1rem)]"
              value={inviteLink}
              viewBox={`0 0 256 256`}
            />
            <div className="text-sm text-zinc-50 font-light italic my-2">
              share invite link or scan the QR code
            </div>
          </div>
        ) : (
          <div className="h-[calc(100%-4rem)] flex justify-center items-center">
            <div className="h-full">
              <Lottie options={defaultOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchUser;
