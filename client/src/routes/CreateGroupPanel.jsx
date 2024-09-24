import React, { useEffect, useRef, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { useDispatch, useSelector } from "react-redux";
import UserOptionCard from "../components/UserOptionCard";
import { createChat } from "../actions/chat";
import { getLoadingFunc } from "./loadingContext";
import CrossIconSmall from "../components/svgs/crossIconSmall.svg?react";
import SingleImageUploadComponent from "../components/SingleImageUploadComponent";

export async function createGroupPanelLoader({ request }) {
  const url = new URL(request.url);
  const s = url.searchParams.get("createGroupSearchTerm");
  return { s };
}

function CreateGroupPanel() {
  const { s } = useLoaderData();
  const setLoading = getLoadingFunc();
  const createGroupSearchResult = useSelector(
    (state) => state.auth?.createGroupSearchResult
  );
  const user = useSelector((state) => state.auth?.authData?.user);
  const friendsObjArr = useSelector(
    (state) => state.auth?.authData?.user?.friends
  );
  const [userArr, setUserArr] = useState(createGroupSearchResult || friendsObjArr.filter(usr => usr._id !== user._id));
  const [selectedUserArr, setSelectedUserArr] = useState([
    {
      _id: user._id,
      name: user.name,
      profile_picture: user.profile_picture,
      about: user.about,
    },
  ]);
  const [showGroupSettingsPanel, setShowGroupSettingsPanel] = useState(false);
  const templateGroupNamesArr = [
    "Link Lounge",
    "Echo Chamber",
    "Connect Club",
    "Pulse Room",
    "Chat Hive",
    "Sync Squad",
    "Vibe Tribe",
    "Convo Cove",
    "Threaded Together",
    "Message Matrix",
    "BuzzZone",
    "Talk Tunnel",
    "Relay Realm",
    "GatherHub",
    "WordWave",
  ];
  const getRandomGroupName = () => {
    const randomIndex = Math.floor(
      Math.random() * templateGroupNamesArr.length
    );
    return templateGroupNamesArr[randomIndex];
  };
  const [formData, setFormData] = useState({ groupName: getRandomGroupName() });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(()=>{
    if(createGroupSearchResult){
      setUserArr(createGroupSearchResult);
    }
  },[createGroupSearchResult])


  const handleConfirmClick = () => {
    let selectedUserIdArr = selectedUserArr.map((item) => item._id);

    dispatch(
      createChat(
        selectedUserIdArr,
        "group",
        {
          name: formData.groupName,
          about:
            formData.groupAbout ||
            "This is a sample group description. Edit description to let everyone know the purpose of this group",
          profile_picture:
            formData.profile_picture || "/images/profile-group.png",
        },
        navigate,
        setLoading
      )
    );
  };
  const handleCreateClick = () => {
    setShowGroupSettingsPanel(true);
  };
  const handleDeleteFile = (item) => {
    if (item._id !== user._id) {
      let new_selectedUserArr = selectedUserArr.filter(
        (i) => i._id !== item._id
      );
      setSelectedUserArr(new_selectedUserArr);
    }
  };
  return (
    <div className="relative h-full w-2/3 flex flex-col items-center">
      <SearchBar s={s} id="createGroupSearchTerm" />
      <div className="h-[calc(45px+1rem)] w-full flex flex-row justify-start items-center overflow-x-auto pl-3">
        {selectedUserArr.map((item) => (
          <div
            key={item._id}
            className="h-[2.5rem] w-[2.5rem] lg:h-[3.5rem] lg:w-[3.5rem] mx-1 flex justify-center items-center relative cursor-pointer"
            onClick={() => handleDeleteFile(item)}
          >
            <img
              src={item?.profile_picture}
              alt="user"
              className="rounded-[50%] h-full w-auto min-w-[100%] object-cover"
              referrerPolicy="no-referrer"
            />
            <button className="absolute top-0 right-0 bg-[#222323] rounded-full">
              <CrossIconSmall />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center w-full h-[calc(100%-135px-3rem)] overflow-y-auto">
        {userArr.map((item) => (
          <UserOptionCard
            key={item._id}
            user={item}
            selectedUserArr={selectedUserArr}
            setSelectedUserArr={setSelectedUserArr}
          />
        ))}
      </div>
      <button
        className="w-11/12 h-[45px] mb-[1rem] bg-[#6bccbc] hover:bg-[#66b2a5] rounded-lg hover:scale-105 transition delay-0"
        onClick={handleCreateClick}
      >
        <div className="2xl:text-xl xl:text-lg lg:text-base md:text-sm xs:text-lg text-[#252525] font-semibold">
          Create Group
        </div>
      </button>
      {showGroupSettingsPanel && (
        <div className="absolute top-0 left-0 h-full w-full flex justify-center items-center backdrop-blur-md">
          <div className="h-5/6 w-5/6 bg-[#191919] rounded-md border-[1px] border-[#3a3b3c] flex flex-col items-center">
            <div className="h-[calc(100%-45px-1rem)] w-11/12 text-white overflow-y-auto">
              <div className="pl-1 mt-2 text-sm text-[#c6c5c5]">Group Name</div>
              <input
                type="text"
                name="groupName"
                id="groupName"
                onChange={(e) =>
                  setFormData({ ...formData, groupName: e.target.value })
                }
                value={formData.groupName}
                className="border-[1px] outline-none  border-gray-400 rounded-xl bg-transparent py-2.5 w-full  my-1 pl-4 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 md:text-base"
                placeholder="chat name..."
                required
              />
              <div className="pl-1 mt-2 text-sm text-[#c6c5c5]">
                Description
              </div>
              <textarea
                name="about"
                id="about"
                rows="3"
                onChange={(e) =>
                  setFormData({ ...formData, groupAbout: e.target.value })
                }
                className="border-[1px] outline-none border-gray-400 rounded-xl bg-transparent py-2.5 w-full  my-1 pl-4 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 md:text-base"
                placeholder="what will this group be about?"
              />
              <SingleImageUploadComponent
                formData={formData}
                setFormData={setFormData}
              />
            </div>
            <button
              className="h-[45px] w-11/12 my-[0.5rem] bg-[#6bccbc] hover:bg-[#66b2a5] rounded-lg hover:scale-105 transition delay-0"
              onClick={handleConfirmClick}
            >
              <div className="2xl:text-xl xl:text-lg lg:text-base md:text-sm xs:text-lg text-[#252525] font-semibold">
                Confirm
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateGroupPanel;
