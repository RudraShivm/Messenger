import { useNavigate, useRouteError } from "react-router-dom";
import SadFaceIcon from "../components/svgs/sadFaceIcon.svg?react";
export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/home");
  };

  return (
    <div className="flex flex-col items-center justify-center h-dvh bg-gray-900 text-center px-4">
      <SadFaceIcon />
      <h1 className="text-4xl font-bold text-white mb-4">Oops!</h1>
      <p className="text-lg text-gray-300 mb-2">
        Sorry, an unexpected error has occurred.
      </p>
      <p className="text-md text-gray-400 italic">
        <i>{error.statusText || error.message}</i>
      </p>
      <button
        className="rounded-xl mx-1 my-4 bg-[#B9E2F8] hover:bg-[#01211c] hover:scale-105 hover:cursor-pointer transition delay-75 px-2 py-1"
        onClick={handleClick}
      >
        Go to Home
      </button>
    </div>
  );
}
