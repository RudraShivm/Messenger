import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditIcon from "./svgs/editIcon.svg?react";
import TickIcon from "./svgs/tick.svg?react";
import BlockIcon from "./svgs/blockIcon.svg?react";
import { updateNickName } from "../actions/chat";
function AboutCard({
  userId,
  chatId,
  connectedUserArr,
  aboutPanelAnimationClass,
  chatType,
  chatCardInfo,
  nickNameMap,
  friendsMap,
}) {
  const [isNickNameEditing, setIsNickNameEditing] = useState(false);
  const [secondPerson, setSecondPerson] = useState({});
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const [initNickName, setInitNickName] = useState("");
  useEffect(() => {
    
    if (chatType === "individual" && friendsMap) {
      const user = connectedUserArr.filter((item) => item._id !== userId)[0];
      const friend = friendsMap.get(user);
      if(friend){
        setSecondPerson(friend);
        const initName = nickNameMap.has(friend._id)
        ? nickNameMap.get(friend._id)
        : friend.name;
        setInitNickName(initName);
        setFormData((formData) => ({...formData, nickName : initName}));
      }
    } else {
      setSecondPerson({});
    }
  }, [friendsMap, connectedUserArr, userId]);
  const handleNickNameEdit = () => {
    setIsNickNameEditing((isNickNameEditing) => !isNickNameEditing);
  };
  const handleNickNameSubmit = () => {
    if (formData.nickName !== initNickName) {
      dispatch(
        updateNickName(chatId, {
          userId: secondPerson._id,
          nickName: formData.nickName,
        })
      );
    }
  };
  return (
    <div
      className={`absolute z-20 h-fit lg:w-[calc(33.33%-0.75rem)] md:w-[calc(30%-0.75rem)] xs:w-[calc(70%-0.75rem)] left-0 lg:left-[calc(33.33%)] md:left-[calc(40%)] xs:left-[calc(0.875rem+28px)] md:top-[6rem] xs:top-[5rem] bg-[#222323] border-x-[1px] border-b-[1px] border-[#d0d0d08e] 2xl:text-xl lg:text-lg xs:text-md overflow-ellipsis break-words whitespace-pre-wrap fade-in-top ${aboutPanelAnimationClass}`}
    >
      {" "}
      {chatType == "individual" ? (
        <div className="py-2">
          <div className="px-[1rem] text-zinc-300">
            <b>Account Name</b> : {secondPerson.name}
          </div>
          <div className="px-[1rem] flex flex-row justify-start items-end">
            <div className=" text-zinc-200">
              <b>Nickname</b> :
              {isNickNameEditing ? (
                <input
                  type="text"
                  name="nickName"
                  id="nickName"
                  onChange={(e) =>
                    setFormData({ ...formData, nickName: e.target.value })
                  }
                  className="border-b-[1px] outline-none border-gray-400 bg-transparent lg:w-[calc(60%)] md:w-[calc(30%-0.75rem)] xs:w-[calc(70%-0.75rem)] pl-2 placeholder:text-gray-400 focus:ring-0  sm:leading-6 "
                  value={formData.nickName}
                />
              ) : (
                <span className="pl-2">{formData.nickName}</span>
              )}
            </div>
            <div
              className="rounded-full w-fit h-fit lg:mx-2 md:mx-1 cursor-pointer flex items-end bg-[#3a3b3c] hover:bg-[#28292a] p-[2px]"
              onClick={handleNickNameEdit}
            >
              {isNickNameEditing ? (
                <button onClick={handleNickNameSubmit}>
                  <TickIcon />
                </button>
              ) : (
                <EditIcon />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2">
          <div className="px-[1rem] flex flex-row justify-start items-end">
            <div className=" text-zinc-300">
              <b>Group Name</b> : {chatCardInfo.name}
            </div>
            <div className="rounded-full w-fit p-1 mt-1 lg:mx-2 md:mx-1 cursor-pointer ">
              <EditIcon />
            </div>
          </div>
          <div className="px-[1rem] text-zinc-300">
            <b>Member Counter</b> : {connectedUserArr.length}
          </div>
        </div>
      )}
      <div className="w-full h-2  flex flex-row justify-between items-center my-2">
        <div className="w-[calc(50%)] ml-[1rem] h-[2px] bg-[#d0d0d08e]"></div>
        <p className="text-[#d0d0d0] lg:text-lg xs:text-sm  w-[5rem] text-center italic">
          About
        </p>
        <div className="w-[calc(50%)] mr-[1rem] h-[2px] bg-[#d0d0d08e]"></div>
      </div>
      <div className="px-[1rem] text-zinc-200 font-emoji">
        {connectedUserArr.filter((item) => item._id !== userId)[0]?.about}
      </div>
      <div className="flex flex-row justify-end gap-2 px-[1rem] my-2">
        <div className="rounded-full bg-[#3a3b3c] hover:bg-[#28292a] w-fit hover:scale-105 transition delay-75 p-1 mt-1 lg:mx-2 md:mx-1 cursor-pointer">
          <BlockIcon />
        </div>
      </div>
    </div>
  );
}

export default AboutCard;
