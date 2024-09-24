import React from "react";
import CrossIconSmall from "./svgs/crossIconSmall.svg?react";
import FileViewer from "@codesmith-99/react-file-preview";

function FilePanel({ filesArr, setFilesArr }) {
  const eligibleImagesPreviewTypes = ["jpeg", "jpg", "png", "gif", "webp"];
  const handleDeleteFile = (file) => {
    let newFilesArr = filesArr.filter((item) => item != file);
    setFilesArr(newFilesArr);
  };
  return (
    <div className="h-fit w-full absolute bottom-0 bg-[#222323] p-1 flex flex-row flex-wrap border-y-2 border-black ">
      {filesArr.map((item) => {
        let extension = item.name.split(".").pop();
        return (
          <div key={item}>
            <div
              className="w-[70px] h-[70px] p-1 overflow-hidden relative"
              id="file-viewer-container"
            >
              {eligibleImagesPreviewTypes.includes(extension) &&
              item.previewURL ? (
                <>
                  <FileViewer src={item.previewURL} fileName={item.name} />
                  <button
                    className="absolute top-1 right-1 bg-[#222323] rounded-full"
                    onClick={() => handleDeleteFile(item)}
                  >
                    <CrossIconSmall />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex justify-center items-center">
                  <img src="/images/fileIcon.png" />
                  <div className="absolute text-gray-800 text-[10px]">
                    {"." + extension}
                  </div>
                  <button
                    className="absolute top-1 right-1 bg-[#222323] rounded-full"
                    onClick={() => handleDeleteFile(item)}
                  >
                    <CrossIconSmall />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FilePanel;
