import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { googlesignin, signin, signup } from "../actions/auth";
import { useGoogleLogin } from "@react-oauth/google";
import UploadIcon from "../components/svgs/upload.svg?react";
import GoogleIcon from "../components/svgs/googleIcon.svg?react";
function Auth() {
  const [signUp, setSignUp] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile_picture: "",
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setAnimationClass("fade-in");
    const timer = setTimeout(() => setAnimationClass(""), 1000); // Remove the class after the animation duration
    return () => clearTimeout(timer);
  }, [signUp]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (signUp) {
      dispatch(signup(formData, navigate));
    } else {
      dispatch(signin(formData, navigate));
    }
  };

  const googleSuccess = async (response) => {
    const { code } = response;

    try {
      dispatch(googlesignin(code, navigate));
      // navigate("/home");
    } catch (error) {
      console.error(error);
    }
  };
  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: googleSuccess,
    redirect_uri: `${window.location.origin}/home`,
    // onError
  });

  return (
    <div className="flex justify-center lg:justify-end items-center min-h-dvh w-screen bg-hero-bg">
      <div className="h-dvh w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 2xl:w-1/3 flex justify-center items-center">
        <div
          className={`container bg-[#222323] ${
            signUp ? "h-5/6 " : "h-1/2"
          }  pb-4 rounded-xl lg:h-full lg:rounded-l-lg lg:rounded-r-none flex flex-col justify-center`}
        >
          <p
            className={`font-sans font-bold text-4xl text-white text-center pt-8 pb-2 mb-8 ${animationClass}`}
          >
            {signUp ? "Sign Up Form" : "Login Form"}
          </p>
          <form
            onSubmit={handleSubmit}
            method="post"
            className="flex flex-col justify-center lg:justify-start items-center text-white"
          >
            {signUp && (
              <>
                <input
                  type="text"
                  name="name"
                  id="name"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-[1px] outline-none text-white border-gray-400 rounded-xl bg-transparent py-2.5 w-11/12 sm:w-9/12 my-2 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 md:text-base"
                  placeholder="Name"
                  required
                />
                <textarea
                  name="about"
                  id="about"
                  rows="3"
                  onChange={(e) =>
                    setFormData({ ...formData, about: e.target.value })
                  }
                  className="border-[1px] outline-none text-white border-gray-400 rounded-xl bg-transparent py-2.5 w-11/12 sm:w-9/12 my-2 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 md:text-base"
                  placeholder="Profile caption..."
                />
              </>
            )}
            <input
              type="email"
              name="email"
              id="email"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border-[1px] outline-none text-white border-gray-400 rounded-xl bg-transparent py-2.5 w-11/12 sm:w-9/12 my-2 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 md:text-base"
              placeholder="Email"
              required
            />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border-[1px] outline-none text-white border-gray-400 rounded-xl bg-transparent py-2.5 w-11/12 sm:w-9/12 my-2 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 md:text-base"
              required
            />
            {signUp && (
              <>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="Confirm password"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="border-[1px] outline-none text-white border-gray-400 rounded-xl bg-transparent py-2.5 w-11/12 sm:w-9/12 my-2 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 md:text-base"
                  required
                />
                {imagePreviewUrl ? (
                  <div className="flex flex-row justify-center relative group h-[148px]">
                    <img
                      src={imagePreviewUrl}
                      alt="Profile Preview"
                      className="w-5/6 opacity-100 object-cover group-hover:opacity-80 transition-opacity duration-300 ease-in-out py-2"
                    />
                    <button
                      className="absolute top-1/2 left-1/2 bg-purple-600 py-1 px-3 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out transform -translate-x-1/2 -translate-y-1/2"
                      onClick={() => setImagePreviewUrl("")}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full hover:cursor">
                    <label
                      htmlFor="dropzone-file"
                      className="border-[1px] outline-none text-white border-gray-400 rounded-xl bg-transparent py-2.5 w-11/12 sm:w-9/12 my-2 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 md:text-base"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold text-base">
                            Upload profile picture
                          </span>
                        </p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                )}
              </>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r to-indigo-500 via-purple-500 from-pink-500 text-white text-lg font-bold text-sans py-2.5 w-11/12 h-12 sm:w-9/12 rounded-xl mt-4"
            >
              {signUp ? "Sign Up" : "Login"}
            </button>
            <div className="text-center mt-1 w-full flex flex-col items-center">
              {!signUp && (
                <button
                  className="text-white py-2.5 w-11/12 bg-white hover:bg-black flex justify-center items-center sm:w-9/12 my-1 h-12 rounded-xl "
                  onClick={login}
                >
                  <GoogleIcon />
                </button>
              )}
              <button
                onClick={() => setSignUp(!signUp)}
                className="text-blue-400 underline my-1"
              >
                {signUp
                  ? "Already have an account? Login"
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Auth;
