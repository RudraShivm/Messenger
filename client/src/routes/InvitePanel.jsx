import React, { useEffect, useState, useRef } from "react";
import { getLoadingFunc } from "./loadingContext.js";
import animationData from "../animations/Animation - 1720284169313.json";
import Lottie from "react-lottie";
import * as api from "../api/index";
import { addToGroup, createChat, loadChat } from "../actions/chat.js";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import QRIcon from "../components/svgs/qrIcon.svg?react";
import CrossIcon from "../components/svgs/crossIcon.svg?react";
import RotateIcon from "../components/svgs/rotateIcon.svg?react";
import ScanIcon from "../components/svgs/scanIcon.svg?react";
import QRCode from "react-qr-code";
import QrScanner from "qr-scanner";

function InvitePanel() {
  const setLoading = getLoadingFunc();
  const [inviteLink, setInviteLink] = useState("");
  const [message, setMessage] = useState("");
  const currentUser = useSelector((state) => state.auth.authData.user);
  const chatsArr = currentUser.chats;
  const [loadingOnAddPanel, setLoadingOnAddPanel] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState("");
  const currentDeviceIdRef = useRef("");
  const [validity, setValidity] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { inviteId } = location.state || {};
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    currentDeviceIdRef.current = currentDeviceId;
  }, [currentDeviceId]);

  const findVideoMedia = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        return navigator.mediaDevices.enumerateDevices();
      })
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  };

  const startScanner = async () => {
    if (currentDeviceIdRef.current && videoRef?.current) {
      try {
        if (qrScannerRef.current) {
          await qrScannerRef.current.stop();
        }
        // Delay to ensure the previous scanner has stopped completely
        setLoadingOnAddPanel(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoadingOnAddPanel(false);
        let prevResult = "";
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          async (result) => {
            if (prevResult != result.data) {
              qrScannerRef.current.pause();
              await inviteLinkValidate(
                import.meta.env.VITE_CLIENT_BASE_URL + "/invite/" + result.data
              );
              qrScannerRef.current.start();
            }
            prevResult = result.data;
          },
          {
            returnDetailedScanResult: true,
            preferredCamera: currentDeviceId,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            calculateScanRegion: (video) => {
              return {
                x: 0,
                y: 0,
                width: video.videoWidth,
                height: video.videoHeight,
                downScaledWidth: video.videoWidth, // Maintain aspect ratio
                downScaledHeight: video.videoHeight, // Maintain aspect ratio
              };
            },
          }
        );

        await qrScannerRef.current.start();
      } catch (err) {
        console.error("Failed to start QR scanner:", err);
      }
    }
  };

  const inviteHelper = async (inviteIdString) => {
    if (inviteIdString.length !== 24) {
      setValidity(false);
      setMessage("The invite link is not valid!");
      return;
    }
    try {
      const response = await api.getInvite(inviteIdString);
      if (response.status === 200) {
        const { data } = response;
        if (data.user._id === currentUser._id) {
          setValidity(false);
          setMessage("Why are you inviting yourself? Don't you have friends?");
          return;
        }
        navigate("/home");
        setLoading(true);
        let existingChatObj;
        if (data.inviteType == "individual") {
          existingChatObj = chatsArr.find(
            (chatObj) =>
              chatObj.chatType == "individual" &&
              chatObj.chatCardInfo._id == data.user._id
          );
        } else if (data.inviteType == "group") {
          existingChatObj = chatsArr.find((chatObj) => {
            return chatObj.chatType == "group" && chatObj.chatCardInfo._id == data.chat;
          });
        }
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
          if (data.inviteType == "individual") {
            dispatch(
              createChat(
                [currentUser._id, data.user],
                "individual",
                null,
                navigate,
                setLoading
              )
            );
          } else if (data.inviteType == "group") {
            // wasting data.user here. mayb will use later
            dispatch(
              addToGroup(
                data.chat,
                navigate,
                setLoading
              )
            );
          }
        }
      }
    } catch (error) {
      if (error.response.status === 404 || error.response.status === 400) {
        setValidity(false);
        setMessage(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    if (inviteId) {
      inviteHelper(inviteId);
    }
  }, []);

  async function inviteLinkValidate(link) {
    const baseStr = `${import.meta.env.VITE_CLIENT_BASE_URL}/invite/`;
    let valid = link.trim().startsWith(baseStr);
    if (valid) {
      setValidity(valid);
      setMessage("Looks good so far");
      let inviteIdString = link.trim().slice(baseStr.length);
      await inviteHelper(inviteIdString);
    }
  }

  const handleChange = async (e) => {
    const link = e.target.value;
    setInputValue(link);
    await inviteLinkValidate(link);
  };

  const switchCamera = () => {
    // Find the index of the current device and switch to the next one
    const currentIndex = devices.findIndex(
      (device) => device.deviceId === currentDeviceId
    );
    // Cycle through the devices
    const nextIndex = (currentIndex + 1) % devices.length;
    setCurrentDeviceId(devices[nextIndex].deviceId);
    startScanner();
  };

  const handleQRClick = async () => {
    setMessage("");
    const { data } = await api.createInvite({
      userId: currentUser._id,
      inviteType: "individual",
    });
    setInviteLink(
      `${import.meta.env.VITE_CLIENT_BASE_URL}/invite/${data.newInvite._id}`
    );
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

  const handleCameraSwitch = async () => {
    setShowCamera(true);
    findVideoMedia();
    setTimeout(async () => {
      await startScanner();
    }, 200);
  };

  const handleCancelClick = () => {
    setInviteLink("");
    setShowCamera(false);
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
  };

  return (
    <div className="h-full w-2/3">
      <div className="h-[4rem] flex flex-row justify-center items-center">
        <input
          aria-label="Invite Link"
          placeholder="Enter invite link to start chatting"
          onChange={inviteLink.length == 0 ? handleChange : () => {}}
          onClick={inviteLink.length == 0 ? () => {} : handleCopyClick}
          value={inviteLink.length == 0 ? inputValue : inviteLink}
          className={`my-4 lg:mx-4 md:mx-2 sm:text-md lg:text-lg md:text-base text-sm px-2 py-2 xs:py-2 lg:py-1.5 text-white leading-1 w-9/12  rounded-lg  bg-[#3a3b3c] focus:outline-none ${
            inviteLink.length != 0 && "hover:cursor-copy"
          }`}
        />
        {inviteLink.length == 0 && !showCamera ? (
          <button
            className="rounded-xl lg:mx-1 md:mx-0 xs:mx-2 mx-1 bg-[#3a3b3c] hover:bg-[#01211c] hover:scale-105 hover:cursor-pointer transition delay-75 p-1.5"
            onClick={handleQRClick}
            style={{
              animation:
                inviteLink.length > 0 ? "popFromLeft 0.1s linear" : "none",
            }}
          >
            <QRIcon />
          </button>
        ) : (
          <button
            className="rounded-xl mx-1 bg-[#3a3b3c] hover:bg-[#01211c] hover:scale-105 hover:cursor-pointer transition delay-75 p-1.5"
            onClick={handleCancelClick}
          >
            <CrossIcon />
          </button>
        )}
      </div>
      <div
        className={`text-[10px] text-center ${
          validity ? "text-green-400" : "text-red-600"
        } font-light mx-8 h-[1rem]`}
      >
        {message}
      </div>
      {inviteLink.length != 0 ? (
        <div className="flex flex-col justify-center items-center h-[calc(100%-5rem)] w-full">
          <QRCode
            size={256}
            className="h-[calc(100%-1rem)] aspect-square p-2 bg-white"
            value={inviteLink.split("/").pop()}
            viewBox={`0 0 256 256`}
          />
          <div className="text-sm text-zinc-50 font-light italic my-2">
            share invite link or scan the QR code
          </div>
        </div>
      ) : (
        <div className="h-[calc(100%-5rem)] w-full flex justify-center items-center">
          <div className="h-[calc(100%)] w-[80%] relative mb-2 flex flex-row  justify-center items-center aspect-square overflow-hidden">
            {showCamera ? (
              <>
                {loadingOnAddPanel && (
                  <div className="my-4 absolute">
                    <Lottie options={defaultOptions} height={100} width={100} />
                  </div>
                )}
                <button onClick={switchCamera}>
                  <video ref={videoRef} className="w-[340px] h-full"></video>
                </button>
              </>
            ) : (
              <>
                <div
                  className="h-full w-full flex flex-col justify-center items-center bg-[#222] rounded-2xl cursor-pointer"
                  onClick={handleCameraSwitch}
                >
                  <ScanIcon />
                  <p className="text-gray-600 sm:text-md lg:text-lg md:text-base text-sm text-center">
                    Press to scan QR code
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InvitePanel;
