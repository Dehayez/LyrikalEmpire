import React from 'react';
import { toast } from 'react-toastify';
import { IoCheckmarkSharp, IoCloseSharp, IoCloudUploadSharp } from "react-icons/io5";

export const createUploadToast = (fileName) => {
  const toastId = toast.dark(
    <div>
      <strong>Uploading:</strong> {fileName}
    </div>,
    {
      autoClose: false,
      closeOnClick: false,
      pauseOnFocusLoss: false,
      icon: <IoCloudUploadSharp size={24} />,
      className: "Toastify__toast--success",
      progress: 0,
    }
  );

  return toastId;
};

export const updateUploadToast = (toastId, fileName, percentage) => {
    toast.update(toastId, {
      render: (
        <div>
          <strong>Uploading:</strong> {fileName} ({percentage}%)
        </div>
      ),
      progress: percentage / 100, 
    });
  };

export const completeUploadToast = (toastId, title) => {
  toast.update(toastId, {
    render: (
      <div>
        <strong>{title}</strong> uploaded successfully!
      </div>
    ),
    type: toast.TYPE.SUCCESS,
    icon: <IoCheckmarkSharp size={24} />,
    autoClose: 3000,
    progress: 1,
  });
};

export const errorUploadToast = (errorMessage) => {
  toast.dark(
    <div>
      <strong>Error:</strong> {errorMessage}
    </div>,
    {
      autoClose: 5000,
      pauseOnFocusLoss: false,
      icon: <IoCloseSharp size={24} />,
      className: "Toastify__toast--warning",
    }
  );
};