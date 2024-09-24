import React, { useState } from "react";
import UploadIcon from "./svgs/upload.svg?react";
function SingleImageUploadComponent({ formData, setFormData }) {
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
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
  return (
    <>
      {imagePreviewUrl ? (
        <div className="flex flex-row justify-center relative group h-[148px] ">
          <img
            src={imagePreviewUrl}
            alt="Profile Preview"
            className="w-full opacity-100 object-cover group-hover:opacity-80 transition-opacity duration-300 ease-in-out py-2"
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
            className="border-[1px] outline-none  border-gray-400 rounded-xl bg-transparent py-2.5 w-full my-2 pl-4 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 md:text-base"
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
  );
}

export default SingleImageUploadComponent;
