import { useNavigate, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const handleClick = ()=>{
    navigate('/');
  }

  return (
    <div className="flex flex-col items-center justify-center h-dvh bg-gray-900 text-center px-4">
      <svg
        width="164px"
        height="164px"
        viewBox="0 -12.02 94.572 94.572"
        xmlns="http://www.w3.org/2000/svg"
        fill="#000000"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <g id="sad" transform="translate(-205.409 -53.014)">
            {" "}
            <path
              id="Path_14"
              data-name="Path 14"
              d="M206.832,87.785c.283-26.649,16.426-33.362,45.857-33.353,29.458.009,45.585,6.732,45.869,33.353.293,27.433-16.715,34.458-46.565,34.333C222.506,121.992,206.548,114.549,206.832,87.785Z"
              fill="#b9e2f8"
              fillRule="evenodd"
            ></path>{" "}
            <path
              id="Path_15"
              data-name="Path 15"
              d="M206.832,87.785c.015-1.428.078-2.8.184-4.11,1.853,22.4,17.57,28.84,44.977,28.957,27.8.116,44.46-5.971,46.38-28.97.106,1.319.17,2.69.185,4.123.293,27.433-16.714,34.458-46.565,34.333C222.506,121.992,206.548,114.55,206.832,87.785Z"
              fill="#1a1818"
              fillRule="evenodd"
              opacity="0.15"
            ></path>{" "}
            <path
              id="Path_16"
              data-name="Path 16"
              d="M205.413,87.774c.148-13.863,4.477-22.577,12.649-27.858,8.008-5.175,19.647-6.907,34.627-6.9s26.629,1.745,34.643,6.925c8.171,5.282,12.5,13.991,12.645,27.835.152,14.26-4.252,23.255-12.624,28.7-8.211,5.341-20.176,7.124-35.366,7.06-15.021-.064-26.638-2.02-34.54-7.422-8.051-5.5-12.181-14.431-12.034-28.34ZM219.6,62.308c-7.328,4.735-11.212,12.7-11.348,25.488-.136,12.855,3.571,21.031,10.8,25.971,7.377,5.043,18.483,6.871,32.949,6.932,14.66.062,26.125-1.606,33.808-6.6,7.52-4.893,11.474-13.128,11.334-26.3C297,75.02,293.123,67.056,285.8,62.319c-7.485-4.838-18.638-6.464-33.107-6.469C238.239,55.846,227.089,57.467,219.6,62.308Z"
              fill="#1a1818"
              fillRule="evenodd"
            ></path>{" "}
            <path
              id="Path_17"
              data-name="Path 17"
              d="M240.627,92.208a1.419,1.419,0,0,1-2.147-1.857,17.965,17.965,0,0,1,1.869-1.873,19.154,19.154,0,0,1,24.684,0,18.133,18.133,0,0,1,1.876,1.874,1.419,1.419,0,0,1-2.146,1.857,15.317,15.317,0,0,0-1.588-1.584,16.308,16.308,0,0,0-20.969,0A15.239,15.239,0,0,0,240.627,92.208Z"
              fill="#1a1818"
              fillRule="evenodd"
            ></path>{" "}
            <path
              id="Path_18"
              data-name="Path 18"
              d="M228.951,82.24a6.226,6.226,0,1,0-6.226-6.226A6.238,6.238,0,0,0,228.951,82.24Z"
              fill="#1a1818"
              fillRule="evenodd"
            ></path>{" "}
            <path
              id="Path_19"
              data-name="Path 19"
              d="M228.356,75.624a2,2,0,1,0-2-2A2,2,0,0,0,228.356,75.624Z"
              fill="#ffffff"
              fillRule="evenodd"
            ></path>{" "}
            <path
              id="Path_20"
              data-name="Path 20"
              d="M226.258,78.943a1.241,1.241,0,1,0-1.241-1.24A1.242,1.242,0,0,0,226.258,78.943Z"
              fill="#ffffff"
              fillRule="evenodd"
            ></path>{" "}
            <g id="Group_5" data-name="Group 5">
              {" "}
              <path
                id="Path_21"
                data-name="Path 21"
                d="M276.439,82.24a6.226,6.226,0,1,0-6.226-6.226A6.238,6.238,0,0,0,276.439,82.24Z"
                fill="#1a1818"
                fillRule="evenodd"
              ></path>{" "}
              <path
                id="Path_22"
                data-name="Path 22"
                d="M275.845,75.624a2,2,0,1,0-2-2A2,2,0,0,0,275.845,75.624Z"
                fill="#ffffff"
                fillRule="evenodd"
              ></path>{" "}
              <path
                id="Path_23"
                data-name="Path 23"
                d="M273.747,78.943a1.241,1.241,0,1,0-1.241-1.24A1.242,1.242,0,0,0,273.747,78.943Z"
                fill="#ffffff"
                fillRule="evenodd"
              ></path>{" "}
            </g>{" "}
            <path
              id="Path_24"
              data-name="Path 24"
              d="M231.978,88.89l-6.057,0a1.68,1.68,0,0,1-1.171-2.884,5.51,5.51,0,0,1,.471-.459,5.767,5.767,0,0,1,7.456,0,5.536,5.536,0,0,1,.568.568,1.678,1.678,0,0,1-1.267,2.773Z"
              fill="#eb505e"
              fillRule="evenodd"
            ></path>{" "}
            <path
              id="Path_25"
              data-name="Path 25"
              d="M279.468,88.892H273.41A1.68,1.68,0,0,1,272.247,86a5.581,5.581,0,0,1,.462-.449,5.77,5.77,0,0,1,7.458,0,5.471,5.471,0,0,1,.567.56,1.68,1.68,0,0,1-1.266,2.782Z"
              fill="#eb505e"
              fillRule="evenodd"
            ></path>{" "}
            <path
              id="Path_26"
              data-name="Path 26"
              d="M228.95,82.738c2.345,0,4.258-.717,4.258-1.6s-1.913-1.6-4.258-1.6-4.258.717-4.258,1.6S226.6,82.738,228.95,82.738Z"
              fill="#00a1ed"
              fillRule="evenodd"
            ></path>{" "}
            <path
              id="Path_27"
              data-name="Path 27"
              d="M276.439,82.738c2.345,0,4.258-.717,4.258-1.6s-1.913-1.6-4.258-1.6-4.259.717-4.259,1.6S274.093,82.738,276.439,82.738Z"
              fill="#00a1ed"
              fillRule="evenodd"
            ></path>{" "}
          </g>{" "}
        </g>
      </svg>
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
