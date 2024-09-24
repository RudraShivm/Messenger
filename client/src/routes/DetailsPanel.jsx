import React from "react";
import { useOutletContext } from "react-router-dom";

function DetailsPanel() {
  const { data } = useOutletContext();
  
  return (
    <div className="absolute z-20 md:h-[calc(100%-10.75rem)] xs:h-[calc(100%-9.75rem)] lg:w-[calc(66.67%-0.75rem)] md:w-[calc(60%-0.75rem)] xs:w-[calc(100%-0.75rem)] md:right-[0.75rem] xs:right-[0.375rem] bottom-[4.75rem] slideIn">
    <div 
      className="w-full h-full overflow-hidden relative"
    >
        <img
          src={
            data.detailsType == "individual"
              ? data.userInfo.profile_picture
              : data.detailsType == "group"
              ? data.groupInfo.profile_picture
              : ""
          }
          className="h-full w-auto min-w-[100%] object-cover absolute top-0 right-1/3 filter brightness-50"
        />
      <div className="z-30 h-full w-full backdrop-blur-sm">

      </div>
      <div className="absolute top-0 right-0 w-2/3 h-full bg-[#2c2c2c] overflow-y-auto z-50 flex flex-col items-center">
        <div className="w-full h-fit flex justify-center items-center mt-8 mb-4">
          <div className="md:h-[8.5rem] md:w-[8.5rem] xs:h-[6rem] xs:w-[6rem] h-[5rem] w-[5rem] ml-4 flex justify-center items-center">
            <img
              src={
                data.detailsType == "individual"
                  ? data.userInfo.profile_picture
                  : data.detailsType == "group"
                  ? data.groupInfo.profile_picture
                  : ""
              }
              alt="user"
              className="rounded-[50%] h-full w-auto min-w-[100%] object-cover "
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <table className="w-[calc(100%-2rem)] my-6 text-zinc-200 md:text-xl xs:text-lg text-lg">
          <tbody>
          <tr>
            <td>
              <b>Name</b>
            </td>
            <td>{data.userInfo.name}</td>
          </tr>
          <tr>
            <td>
              <b>Nickname</b>
            </td>
            <td>{data.userInfo.nickname}</td>
          </tr>
          <tr></tr>
          </tbody>
        </table>
        <div className="w-full h-2 flex flex-row justify-between items-center my-2">
          <div className="w-[calc(50%)] ml-[1rem] h-[3px] bg-[#d0d0d08e]"></div>
          <p className="text-[#d0d0d0] lg:text-xl xs:text-md  w-[5rem] text-center italic">
            About
          </p>
          <div className="w-[calc(50%)] mr-[1rem] h-[3px] bg-[#d0d0d08e]"></div>
        </div>
        <div className="px-[1rem] mt-[1rem] text-zinc-200 font-emoji 2xl:text-xl xl:text-lg lg:text-base md:text-sm xs:text-lg">
          {data.userInfo.about}
        </div>
      </div>
      <div></div>
    </div>
    </div>
  );
}

export default DetailsPanel;
