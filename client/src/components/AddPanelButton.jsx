import React from "react";
import { Link, useLocation } from "react-router-dom";

function AddPanelButton({path, buttonLabel}) {
  const location = useLocation();
  return (
    <Link 
      to={`/home/addPanel/${path}`}
      className={`text-zinc-50 font-extrabold py-3 px-3 mb-1 2xl:text-xl xl:text-lg lg:text-base xs:text-sm  ${location.pathname.includes(path) ? "bg-[#292a2b]" : "bg-[#181819]"} rounded-lg w-[calc(100%-1rem)] text-left`}
    >
      <p>{buttonLabel}</p>
    </Link>
  );
}

export default AddPanelButton;
