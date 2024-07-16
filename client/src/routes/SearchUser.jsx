import React, { useEffect, useState } from "react";
import { getLoadingFunc } from "./loadingContext.js";
import animationData from "../images/Animation - 1720812556915.json";
import Lottie from "react-lottie";
import baseURL from "../../baseurl";
import * as api from "../api/index";
import { createChat, loadChat } from "../actions/chat";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import QRCode from "react-qr-code";

function SearchUser() {
  const setLoading = getLoadingFunc();
  const [inviteLink, setInviteLink] = useState("");
  const [message, setMessage] = useState("");
  const currentUser = useSelector((state) => state.auth.authData.user);
  const chatsArr = currentUser.chats;
  const [loadingOnSearchUser, setLoadingOnSearchUser] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] =useState("environment");
  const [validity, setValidity] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { inviteId } = location.state || {};

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
          dispatch(
            createChat(currentUser._id, data.user, navigate, setLoading)
          );
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
    if (inviteId) {
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

  const handleCancelClick = () => {
    setInviteLink("");
    setShowCamera(false);
  };
  const handleOutsideClick = () => {
    navigate("/home");
  };
  const handleInsideClick = (e) => {
    e.stopPropagation();
  };
  const handleCameraSwitch = () => {
    setShowCamera(true);
  };
  const toggleFacingMode = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };
  return (
    <div
      className="absolute h-dvh w-screen top-0 left-0 flex justify-center items-center backdrop-blur-sm z-10"
      onClick={handleOutsideClick}
    >
      <div
        className="container relative h-1/3 md:w-2/5 xs:w-4/5 bg-[#191919] rounded-xl border-[1px] border-slate-500"
        onClick={handleInsideClick}
      >
        <div className="h-[4rem] flex flex-row justify-center items-center">
          <input
            aria-label="Invite Link"
            placeholder="Enter invite link to start chatting"
            onChange={inviteLink.length == 0 ? handleChange : () => {}}
            onClick={inviteLink.length == 0 ? () => {} : handleCopyClick}
            value={inviteLink.length == 0 ? "" : inviteLink}
            className={`my-4 lg:mx-4 md:mx-2 lg:text-lg md:text-base text-white leading-1 w-9/12 py-1.5 px-2 rounded-lg  bg-[#3a3b3c] focus:outline-none ${
              inviteLink.length != 0 && "hover:cursor-copy"
            }`}
          />
          {inviteLink.length == 0 && !showCamera ? (
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
            <div className="h-[calc(100%-1rem)] relative mb-2 flex flex-col justify-center aspect-square">
              {showCamera ? (
                <>
                  <Scanner
                    onScan={(result) => console.log(result)}
                    facingMode={facingMode}
                  />
                  <button
                    onClick={toggleFacingMode}
                    className="bg-[#222] absolute bottom-0 w-full text-gray-600 rounded-b-md"
                  >
                    Switch Camera
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="h-full flex flex-col justify-center items-center bg-[#222] rounded-2xl cursor-pointer"
                    onClick={handleCameraSwitch}
                  >
                    <svg
                      width="100px"
                      height="100px"
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
                          d="M6.5 4C5.11929 4 4 5.11929 4 6.5V7C4 7.55228 3.55228 8 3 8C2.44772 8 2 7.55228 2 7V6.5C2 4.01472 4.01472 2 6.5 2H7C7.55228 2 8 2.44772 8 3C8 3.55228 7.55228 4 7 4H6.5Z"
                          fill="#4b5563 "
                        ></path>{" "}
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9598 6C10.294 5.99998 9.73444 5.99997 9.27657 6.03738C8.79785 6.07649 8.34289 6.16143 7.91103 6.38148C7.25247 6.71703 6.71703 7.25247 6.38148 7.91103C6.16143 8.34289 6.07649 8.79785 6.03738 9.27657C6.01958 9.49452 6.01025 9.73549 6.00536 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H17.9946C17.9898 9.73549 17.9804 9.49451 17.9626 9.27657C17.9235 8.79785 17.8386 8.34289 17.6185 7.91103C17.283 7.25247 16.7475 6.71703 16.089 6.38148C15.6571 6.16143 15.2021 6.07649 14.7234 6.03738C14.2656 5.99997 13.706 5.99998 13.0402 6H10.9598ZM15.9943 10C15.99 9.7843 15.9825 9.60112 15.9693 9.43944C15.9403 9.0844 15.889 8.92194 15.8365 8.81901C15.6927 8.53677 15.4632 8.3073 15.181 8.16349C15.0781 8.11105 14.9156 8.05975 14.5606 8.03074C14.1938 8.00078 13.7166 8 13 8H11C10.2834 8 9.80615 8.00078 9.43944 8.03074C9.0844 8.05975 8.92194 8.11105 8.81901 8.16349C8.53677 8.3073 8.3073 8.53677 8.16349 8.81901C8.11105 8.92194 8.05975 9.0844 8.03074 9.43944C8.01753 9.60112 8.00999 9.7843 8.00569 10H15.9943Z"
                          fill="#4b5563 "
                        ></path>{" "}
                        <path
                          d="M14.0757 18L10.9598 18C10.2941 18 9.7344 18 9.27657 17.9626C8.79785 17.9235 8.34289 17.8386 7.91103 17.6185C7.25247 17.283 6.71703 16.7475 6.38148 16.089C6.34482 16.017 6.32528 15.9835 6.29997 15.9401C6.28429 15.9132 6.26639 15.8825 6.24083 15.8365C6.17247 15.7135 6.09846 15.5585 6.05426 15.342C6.01816 15.1651 6.00895 14.9784 6.00455 14.795C6 14.6058 6 14.3522 6 14.0159V14C6 13.4477 6.44772 13 7 13C7.55229 13 8 13.4477 8 14C8 14.3558 8.00007 14.5848 8.00397 14.7469C8.0058 14.823 8.00837 14.872 8.01047 14.9021C8.04313 14.9585 8.10631 15.0688 8.16349 15.181C8.3073 15.4632 8.53677 15.6927 8.81901 15.8365C8.92194 15.889 9.0844 15.9403 9.43944 15.9693C9.80615 15.9992 10.2834 16 11 16H14C14.5027 16 14.6376 15.9969 14.7347 15.9815C15.3765 15.8799 15.8799 15.3765 15.9815 14.7347C15.9969 14.6376 16 14.5027 16 14C16 13.4477 16.4477 13 17 13C17.5523 13 18 13.4477 18 14L18 14.0757C18.0002 14.4657 18.0003 14.7734 17.9569 15.0475C17.7197 16.5451 16.5451 17.7197 15.0475 17.9569C14.7734 18.0003 14.4657 18.0002 14.0757 18Z"
                          fill="#4b5563 "
                        ></path>{" "}
                        <path
                          d="M22 17C22 16.4477 21.5523 16 21 16C20.4477 16 20 16.4477 20 17V17.5C20 18.8807 18.8807 20 17.5 20H17C16.4477 20 16 20.4477 16 21C16 21.5523 16.4477 22 17 22H17.5C19.9853 22 22 19.9853 22 17.5V17Z"
                          fill="#4b5563 "
                        ></path>{" "}
                        <path
                          d="M16 3C16 2.44772 16.4477 2 17 2H17.5C19.9853 2 22 4.01472 22 6.5V7C22 7.55228 21.5523 8 21 8C20.4477 8 20 7.55228 20 7V6.5C20 5.11929 18.8807 4 17.5 4H17C16.4477 4 16 3.55228 16 3Z"
                          fill="#4b5563 "
                        ></path>{" "}
                        <path
                          d="M4 17C4 16.4477 3.55228 16 3 16C2.44772 16 2 16.4477 2 17V17.5C2 19.9853 4.01472 22 6.5 22H7C7.55228 22 8 21.5523 8 21C8 20.4477 7.55228 20 7 20H6.5C5.11929 20 4 18.8807 4 17.5V17Z"
                          fill="#4b5563 "
                        ></path>{" "}
                      </g>
                    </svg>
                    <p className="text-gray-600">Press to scan QR code</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchUser;
