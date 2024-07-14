import React, { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useNavigation } from 'react-router-dom'


function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(()=>{
    if(localStorage.getItem('profile')){
      localStorage.setItem("jojo", location.pathname);
      //redirect causes full page reload, thats why we need to specify the following condition
      if(!location.pathname.startsWith('/home/searchUser')) {
        navigate('/home');
      }
    }else{
      navigate('/auth');
    }
  }, []);

  return (
    <div>
      <Outlet/>
    </div>
  )
}

export default Root