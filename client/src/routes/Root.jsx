import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { WITHDRAW_ERROR } from "../constants/actionTypes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomToast = ({ message, buttonText, buttonFunc }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.authData?.user);
  // console.log(message, buttonText);
  return (
    <div className="flex flex-row items-center gap-2">
      <p className="text-zinc-50 2xl:text-md lg:text-md xs:text-md">
        {message}
      </p>
      {/* <button onClick={closeToast}>Close</button> */}
      <button
        className="bg-[#7628e2] px-[8px] py-[2px] 2xl:text-md lg:text-md xs:text-md rounded-lg"
        onClick={() => dispatch(buttonFunc(user._id, navigate))}
      >
        {buttonText}
      </button>
    </div>
  );
};

function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const errorObj = useSelector((state) => state.error?.errObj);
  const dispatch = useDispatch();
  const notify = () =>
    toast(
      <CustomToast
        message={errorObj.message}
        buttonText={errorObj.buttonText}
        buttonFunc={errorObj.buttonFunc}
      />
    );
  useEffect(() => {
    if (errorObj && errorObj.show) {
      notify();
      setTimeout(() => {
        dispatch({ type: WITHDRAW_ERROR });
      }, 5000);
    }
  }, [errorObj]);

  useEffect(() => {
    if (localStorage.getItem("profile")) {
      //redirect causes full page reload, thats why we need to specify the following condition
      if (!location.pathname.startsWith("/home/searchUser")) {
        navigate("/home");
      }
    } else {
      navigate("/auth");
    }
  }, []);

  return (
    <div>
      <Outlet />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default Root;
