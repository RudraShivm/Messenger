import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { loadChat, createChat } from '../actions/chat';
import { useNavigate } from 'react-router-dom';

function UserCard({user, setLoading}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(state=>state.auth.authData.user);
    if(user._id===currentUser._id) return (<></>);
    const chatsArr = currentUser.chats;
    const existingChatObj = chatsArr.find(chatObj=>chatObj.user._id===user._id);
    const handleClick = () => {
        if(existingChatObj){
            navigate('/home');
            setLoading(true);
            dispatch(loadChat(existingChatObj._id, typeof(existingChatObj.chat)=='string' ? existingChatObj.chat : existingChatObj.chat._id, navigate, setLoading))
        }else{
            navigate('/home');
            setLoading(true);
            dispatch(createChat(currentUser._id, user._id, navigate, setLoading));
        }
    }
    return (
    <div className='h-1/2 my-4 mx-8 relative flex flex-row items-center hover:bg-[#3a3b3c] transition ease-in-out rounded-lg'>
        <div className='h-[2.5rem] w-[2.5rem] ml-4 flex justify-center items-center'>
        <img
            src={user?.profile_picture}
            alt='user'
            className='rounded-[50%] h-full w-auto min-w-[100%] object-cover'
            referrerPolicy="no-referrer"
        />
        </div>
        <button className='pl-4 text-xl text-zinc-50 font-semibold' onClick={handleClick}>
            {user?.name}
        </button>
        </div>
  )
}

export default UserCard