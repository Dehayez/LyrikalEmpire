import { createUploadToast, updateUploadToast, completeUploadToast, errorUploadToast } from './toastUtils';
import { addBeat } from '../services';

export const uploadBeatWithToast = async (beat, file, userId, setRefreshBeats) => {
  const startTime = Date.now();
  const toastId = createUploadToast(file.name);

  try {
    await addBeat(beat, file, userId, (percentage) => {
        updateUploadToast(toastId, file.name, percentage);
      });

    completeUploadToast(toastId, beat.title);

    if (setRefreshBeats) {
      setRefreshBeats((prev) => !prev);
    }
  } catch (error) {
    let errorMessage = 'An error occurred during the upload. Please try again later.';
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = 'Bad Request: Please check the file and try again.';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in to upload your beat.';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Not Found: The requested resource could not be found.';
          break;
        case 500:
          errorMessage = 'Server Error: Something went wrong on our end. Please try again later.';
          break;
        default:
          errorMessage = error.response.data?.error || errorMessage;
      }
    } else if (error.request) {
      errorMessage = 'No response from the server. Please check your internet connection and try again.';
    }

    errorUploadToast(errorMessage);
    throw error;
  }
};