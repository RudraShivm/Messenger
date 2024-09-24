/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadChat } from "../actions/chat";
import moment from "moment";
import { useMediaQuery } from "react-responsive";
import shortenName from "../functions/shortenName";
import addNotification from "react-push-notification";
import { errorDispatcher } from "../functions/errorDispatcher";
function formatAMPM(date, format) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var momentStr = moment(date).fromNow();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  if (format === "short") {
    return ` - ${hours}:${minutes} ${ampm}`;
  } else {
    return ` - ${hours}:${minutes} ${ampm} - ${momentStr}`;
  }
}

function ChatCard({
  userId,
  chatType,
  chatCardInfo,
  chatObjId,
  chatId,
  lastMessageInfo,
  setLoading,
  selected,
  setSelected,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const friendsMap = useSelector(
    (state) => state.auth?.authData?.user?.friends
  );
  let senderName = "";
  if (lastMessageInfo?.sender) {
    if (lastMessageInfo.sender === userId) {
      senderName = "You";
    } else if (friendsMap && friendsMap[lastMessageInfo.sender]) {
      senderName = friendsMap[lastMessageInfo.sender].name;
    }
  }
  let string = `${senderName} sent an attachment`;
  let chatCardLabel = chatCardInfo.name;
  let profile_picture = chatCardInfo.profile_picture;

  let format = "large";
  const isSmallerScreen = useMediaQuery({
    query: "(min-width: 0px) and (max-width: 1536px)",
  });
  const isSmallScreen = useMediaQuery({
    query: "(min-width: 0px) and (max-width: 768px)",
  });
  if (isSmallerScreen) {
    format = "short";
  }
  const seen = lastMessageInfo.seenBy.find((item) => item._id == userId);
  useEffect(() => {
    if (!seen) {
      addNotification({
        title: "Messenger",
        subtitle: "new message",
        message:
          lastMessageInfo.messageType == "text"
            ? lastMessageInfo.message
            : string,
        onClick: () => {
          dispatch(loadChat(chatObjId, chatId, navigate, location, setLoading));
        },
        native: true,
        icon: "/client/public/images/messenger.svg",
      });
    }
  }, [lastMessageInfo]);

  useEffect(()=>{
    //update selected chatId in case of reload
    if(location.pathname.split('/')[4] && chatId == location.pathname.split('/')[4]){
      setSelected({ userId, chatId : location.pathname.split('/')[4] });
    }
  },[]);
  const handleClick = () => {
    setLoading(true);
    dispatch(loadChat(chatObjId, chatId, navigate, location, setLoading));
    setSelected({ userId, chatId });
    setLoading(false);
  };
  return (
    <div
      className={`h-16 my-4 mx-4 relative flex flex-row items-center ${
        selected.chatId === chatId && !isSmallScreen ? "bg-[#3a3b3c]" : ""
      } hover:bg-[#3a3b3c] transition ease-in-out rounded-lg 2xl:py-0 lg:py-10 cursor-pointer`}
      onClick={handleClick}
    >
      <div className="lg:h-[2.5rem] lg:w-[2.5rem] md:h-[2rem] md:w-[2rem] xs:h-[2.8rem] xs:w-[2.8rem] ml-4 flex justify-center items-center">
        <img
          src={profile_picture}
          alt="user"
          className="rounded-[50%] h-full w-auto min-w-[100%] object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col items-start pl-4 ">
        <button className="2xl:text-xl xl:text-lg lg:text-base md:text-sm xs:text-lg text-zinc-50 font-semibold">
          {`${chatCardLabel}${!seen ? "🔸" : ""}`}
        </button>
        <div
          className={`text-sm  ${
            seen ? "text-zinc-300 font-thin" : "text-zinc-50 font-semibold"
          }`}
        >
          {lastMessageInfo.messageType == "text"
            ? `${
                format === "short"
                  ? shortenName(lastMessageInfo.message, 15)
                  : shortenName(lastMessageInfo.message, 30)
              } ${formatAMPM(new Date(lastMessageInfo.time), format)}`
            : `${
                format === "short"
                  ? shortenName(string, 15)
                  : shortenName(string, 30)
              } ${formatAMPM(new Date(lastMessageInfo.time), format)}`}
        </div>
      </div>
    </div>
  );
}

export default ChatCard;
