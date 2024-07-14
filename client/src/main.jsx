import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, redirect, RouterProvider, useNavigate } from "react-router-dom";
import Root from "./routes/Root";
import Auth from "./routes/Auth";
import Home from "./routes/Home";
import { store } from "./store/store";
import { Provider } from "react-redux";
import SearchUser from "./routes/SearchUser";
import ChatBox from "./routes/ChatBox";
import ErrorPage from "./routes/ErrorPage";
import { loader } from "./routes/Home";
import { GoogleOAuthProvider } from '@react-oauth/google';
import RedirectInvite from "./routes/RedirectInvite";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            path: "/auth",
            element: <Auth />,
          },
          {
            path: "/home",
            element: <Home />,
            loader: loader,
            children: [
              {
                errorElement: <ErrorPage />,
                children: [
                  {
                    path: "searchUser",
                    element: <SearchUser />,
                  },
                  {
                    path: "chat/:chatObjId/:chatId",
                    element: <ChatBox />,
                    children: [
                      {
                        path: "searchUser",
                        element: <SearchUser />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path:'/invite/:inviteId',
    element: <RedirectInvite/>
  }
  
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId="452303055581-q5kpv4je3fnbmvqfj9o10m2r8djqbnqs.apps.googleusercontent.com">
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
    </GoogleOAuthProvider>
);
