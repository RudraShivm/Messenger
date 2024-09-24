import React, { useEffect, useState } from "react";

function UserOptionCard({ user, selectedUserArr, setSelectedUserArr }) {
  const [selected, setSelected] = useState(false);

  useEffect(()=>{
    // updating the checkboxes with changes in selectedUserArr
    if (selectedUserArr.find((i) => i._id == user._id)) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  },[selectedUserArr])
  const handleClick = () => {
    if (!selectedUserArr.find((i) => i._id == user._id)) {
      setSelectedUserArr((selectedUserArr) => [...selectedUserArr, user]);
      setSelected(true);
    } else {
      setSelectedUserArr((selectedUserArr) =>
        selectedUserArr.filter((i) => i._id !== user._id)
      );
      setSelected(false);
    }
  };
  return (
    <div
      className="w-11/12 py-2 pl-3 mt-2 relative flex flex-row items-center hover:bg-[#3a3b3c] transition ease-in-out rounded-lg cursor-pointer"
      onClick={handleClick}
    >
      <input type="checkbox" checked={selected} onChange={() => {}} className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out cursor-pointer"/>
      <div className="h-[2rem] w-[2rem] lg:h-[2.5rem] lg:w-[2.5rem] ml-4 flex justify-center items-center">
        <img
          src={user?.profile_picture}
          alt="user"
          className="rounded-[50%] h-full w-auto min-w-[100%] object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="pl-4 2xl:text-xl md:text-lg xs:text-base text-zinc-50 font-semibold">
        {user?.name}
      </div>
    </div>
  );
}

export default UserOptionCard;
