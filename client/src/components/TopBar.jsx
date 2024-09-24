import React from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";
import BackIcon from "./svgs/backIcon.svg?react";

function TopBar({
  setSelected,
  chatType,
  chatCardInfo,
  showAboutCard,
  setShowAboutCard,
  setAboutPanelAnimationClass
}) {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery({
    query: "(min-width: 0px) and (max-width: 768px)",
  });

  let chatCardLabel = chatCardInfo.name;
  let profile_picture = chatCardInfo.profile_picture;
  

  const handleBackClick = () => {
    navigate("/home");
    setSelected({});
  };
  return (
    <div className="absolute flex flex-row items-center z-10 md:right-[0.75rem] xs:right-[0.375rem] top-[0.75rem] lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:h-[5.25rem] xs:h-[4.25rem] bg-[#222323] rounded-t-lg">
      {isSmallScreen && (
        <button onClick={handleBackClick} className="ml-2">
          <BackIcon />
        </button>
      )}
      <div
        className="cursor-pointer flex flex-row items-center"
        onClick={() => {
          if(showAboutCard){
            setAboutPanelAnimationClass("fade-out-top");
            const timer = setTimeout(() => {
              setAboutPanelAnimationClass("")
              setShowAboutCard(false);
            }, 150);
            return () => clearTimeout(timer);
          }else{
            setShowAboutCard(true);
          }
        }}
      >
        <div className="2xl:h-[3.5rem] 2xl:w-[3.5rem] xs:h-[2.5rem] xs:w-[2.5rem] md:ml-4 xs:ml-2 flex flex-row justify-center items-center">
          <img
            src={profile_picture}
            alt="user"
            className="rounded-[50%] h-full w-auto min-w-[100%] object-cover"
          />
        </div>
        <div className="pl-4 2xl:text-2xl md:text-xl xs:text-lg text-zinc-50 font-semibold">
          {chatCardLabel}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
