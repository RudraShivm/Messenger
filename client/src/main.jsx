import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/Root";
import Auth from "./routes/Auth";
import Home from "./routes/Home";
import { getStore } from "./store/store";
import { Provider } from "react-redux";
import AddPanel from "./routes/AddPanel";
import ChatBox from "./routes/ChatBox";
import ErrorPage from "./routes/ErrorPage";
import { loader } from "./routes/Home";
import { createGroupPanelLoader } from "./routes/CreateGroupPanel";
import { GoogleOAuthProvider } from "@react-oauth/google";
import RedirectInvite from "./routes/RedirectInvite";
import InvitePanel from "./routes/InvitePanel";
import CreateGroupPanel from "./routes/CreateGroupPanel";
import DetailsPanel from "./routes/DetailsPanel";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/auth",
        element: <Auth />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/home",
        element: <Home />,
        errorElement: <ErrorPage />,
        loader: loader,
        children: [
          {
            errorElement: <ErrorPage />,
            children: [
              {
                path: "addPanel",
                element: <AddPanel />,
                children: [
                  {
                    path: "invitePanel",
                    element: <InvitePanel />,
                  },
                  {
                    path: "createGroup",
                    element: <CreateGroupPanel />,
                    loader: createGroupPanelLoader,
                  },
                ],
              },
              {
                path: "chat/:chatObjId/:chatId",
                element: <ChatBox />,
                children: [
                  {
                    path: "detailsPanel",
                    element: <DetailsPanel />,
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
    path: "/invite/:inviteId",
    element: <RedirectInvite />,
  },
]);

getStore().then((store) => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENTID}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </GoogleOAuthProvider>
  );
});
