import React from 'react';

function Message({ user, secondPerson, sender, msg }) {
  return (
    <div className={`flex ${(sender === user._id) ? "flex-row-reverse" : "flex-row justify-start"} transition ease-in-out`} style={{ animation: 'popFromBelow 0.2s ease-out' }}>
      <div className='h-[2.5rem] w-[2.5rem] mx-4 flex justify-center items-center my-3'>
        <img
          src={(sender === user._id) ? user?.profile_picture : secondPerson?.profile_picture}
          referrerPolicy="no-referrer"
          alt='user'
          className='rounded-[50%] h-full w-auto min-w-[100%] object-cover'
        />
      </div>
      <div className="bg-[#58A89B] h-auto max-w-1/2 my-3 px-4 rounded-2xl flex flex-col justify-center" >
        <p className='text-[#232423] font-emoji 2xl:text-xl lg:text-lg overflow-ellipsis break-words whitespace-pre-wrap'>
          {msg}
        </p>
      </div>
    </div>
  );
}

export default Message;