/* eslint-disable react/prop-types */
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadChat } from "../actions/chat";
import moment from 'moment';
import { useMediaQuery } from 'react-responsive';
function formatAMPM(date, format) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var momentStr = moment(date).fromNow(); 
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  if (format === 'short') {
    return `🔸${hours}:${minutes} ${ampm}`;
  } else {
    return `🔸${hours}:${minutes} ${ampm} 🔸${momentStr}`;
  }
}
function ChatCard({
  user,
  chatObjId,
  chatId,
  lastMessageInfo,
  setLoading,
  selected,
  setSelected,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let format ='large';
  const isSmallerScreen = useMediaQuery({ query: '(min-width: 0px) and (max-width: 1536px)' });
  const isSmallScreen = useMediaQuery({ query: '(min-width: 0px) and (max-width: 768px)' });
  if(isSmallerScreen){
    format = 'short';
  }
  const handleClick = () => {
    setLoading(true);
    dispatch(loadChat(chatObjId, chatId, navigate, setLoading));
    setSelected(user._id);
  };
  return (
    
    <div
      className={`h-16 my-4 mx-4 relative flex flex-row items-center ${
        selected === user._id && !isSmallScreen ? "bg-[#3a3b3c]" : ""
      } hover:bg-[#3a3b3c] transition ease-in-out rounded-lg 2xl:py-0 lg:py-10 cursor-pointer`}
      onClick={handleClick}
    >
      <div className="lg:h-[2.5rem] lg:w-[2.5rem] md:h-[2rem] md:w-[2rem] xs:h-[2.8rem] xs:w-[2.8rem] ml-4 flex justify-center items-center">
        <img
          src={user?.profile_picture}
          alt="user"
          className="rounded-[50%] h-full w-auto min-w-[100%] object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col items-start pl-4 ">
      <button
        className="2xl:text-xl xl:text-lg lg:text-base md:text-sm xs:text-lg text-zinc-50 font-semibold"
      >
        {user?.name}
      </button>
        <div className="text-sm text-zinc-50 font-light"> 
      {`${format === 'short' ? `${lastMessageInfo.message.substr(0, 15)}...` : `${lastMessageInfo.message.substr(0, 30)}...`} ${formatAMPM(new Date(lastMessageInfo.time), format)}`}
        </div>
    </div>
    </div>
  );
}

export default ChatCard;
