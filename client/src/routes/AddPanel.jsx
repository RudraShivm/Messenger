import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AddPanelButton from "../components/AddPanelButton";

function AddPanel() {
  const navigate = useNavigate();
  const handleOutsideClick = () => {
    navigate("/home");
  };
  const handleInsideClick = (e) => {
    e.stopPropagation();
  };
  return (
    <div
      className="absolute h-dvh w-screen top-0 left-0 flex justify-center items-center backdrop-blur-sm z-30"
      onClick={handleOutsideClick}
    >
      <div
        className="relative h-4/6 lg:w-1/2 sm:w-4/5 w-full bg-[#191919] rounded-xl border-[1px] border-slate-500 flex flex-row items-center"
        onClick={handleInsideClick}
      >
        <div className="w-1/3 h-[calc(100%-1rem)] flex flex-col justify-start items-center border-r-[1px] border-slate-400">
          <AddPanelButton path="invitePanel" buttonLabel="QR Code" />
          <AddPanelButton path="createGroup" buttonLabel="Create Group" />
        </div>
        <Outlet/>
      </div>
    </div>
  );
}

export default AddPanel;
