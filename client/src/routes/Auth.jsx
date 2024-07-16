import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { googlesignin, signin, signup } from "../actions/auth";
import { useGoogleLogin } from "@react-oauth/google";
function Auth() {
  const [signUp, setSignUp] = useState(false);
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
  async function fetchUserData(access_token) {
    const userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
    try {
      const response = await fetch(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  const googleSuccess = async (responseToken) => {
    const { access_token } = responseToken;
    const userData = await fetchUserData(access_token);
    console.log(`userData` + JSON.stringify(userData));
    try {
      dispatch(
        googlesignin(
          userData.sub,
          userData.name,
          userData.picture,
          userData.email,
          access_token,
          navigate
        )
      );
      navigate("/home");
    } catch (error) {
      console.log(error);
    }
  };
  const login = useGoogleLogin({
    onSuccess: googleSuccess,
    redirect_uri: "http://localhost:5173/home",
  });

  return (
    <div className="flex justify-center items-center min-h-dvh w-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div
        className={`container bg-[#222323] ${
          signUp ? "h-5/6" : "h-1/2"
        } w-11/12 pb-4 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 2xl:w-1/3 rounded-xl`}
      >
        <p className="font-sans font-bold text-3xl text-white text-center pt-8 pb-2 h-1/6">
          {signUp ? "Sign Up Form" : "Login Form"}
        </p>
        <form
          onSubmit={handleSubmit}
          method="post"
          className="flex flex-col justify-center items-center text-white h-5/6"
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
                  setFormData({ ...formData, confirmPassword: e.target.value })
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
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
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
              <button className="text-white py-2.5 w-11/12 bg-white hover:bg-black flex justify-center items-center sm:w-9/12 my-1 h-12 rounded-xl " onClick={login}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="32"
                    height="32"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    ></path>
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    ></path>
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                  </svg>
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
  );
}

export default Auth;
