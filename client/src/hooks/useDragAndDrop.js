import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoCloseSharp, IoCheckmarkSharp } from "react-icons/io5";
import { addBeat } from '../services';
import { isAuthPage } from '../utils/isAuthPage';

export const useDragAndDrop = (setRefreshBeats, user_id) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [activeUploads, setActiveUploads] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const location = useLocation();

  const getAudioDuration = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      });
      audio.onerror = () => reject(new Error('Failed to load audio metadata'));
    });
  }, []);

  const autoSubmitFiles = useCallback(async (files, user_id) => {
    setActiveUploads((activeUploads) => activeUploads + files.length);
  
    files.forEach(async (file) => {
      try {
        if (file.type === 'audio/aiff') {
          throw new Error('AIF files are not supported');
        }
  
        const duration = await getAudioDuration(file);
        const beat = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          duration: duration,
        };
  
        console.log(`Starting upload for ${file.name}...`);
        const startTime = Date.now();
  
        // Show initial toast with 0% progress
        const toastId = toast.dark(
          <div>
            <strong>Uploading:</strong> {file.name}
          </div>,
          {
            autoClose: false,
            closeOnClick: false,
            pauseOnFocusLoss: false,
            icon: <IoCheckmarkSharp size={24} />,
            className: "Toastify__toast--info",
            progress: 0, // Start with 0% progress
          }
        );
  
        await addBeat(beat, file, user_id, (percentage) => {
          const elapsedTime = Date.now() - startTime;
  
          // Update the toast with the current progress
          toast.update(toastId, {
            render: (
              <div>
                <strong>Uploading:</strong> {file.name} ({percentage}%)
                <br />
                <small>Elapsed time: {elapsedTime}ms</small>
              </div>
            ),
            progress: percentage / 100, // Update the progress bar
          });
        });
  
        // Mark the toast as complete
        toast.update(toastId, {
          render: (
            <div>
              <strong>{beat.title}</strong> uploaded successfully!
            </div>
          ),
          type: toast.TYPE.SUCCESS,
          autoClose: 3000, // Close after 3 seconds
          progress: 1, // Set progress to 100%
        });
  
        setRefreshBeats((prev) => !prev);
      } catch (error) {
        // Show error toast
        toast.dark(
          <div>
            <strong>Error:</strong> {error.message}
          </div>,
          {
            autoClose: 5000,
            pauseOnFocusLoss: false,
            icon: <IoCloseSharp size={24} />,
            className: "Toastify__toast--warning",
          }
        );
      } finally {
        setActiveUploads((activeUploads) => activeUploads - 1);
      }
    });
  }, [getAudioDuration, setRefreshBeats]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const isFileDrag = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
      if (isFileDrag) {
        setIsDraggingOver(true);
      }
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const audioFiles = files.filter(file => file.type.startsWith('audio/'));
      const nonAudioFiles = files.filter(file => !file.type.startsWith('audio/'));

      autoSubmitFiles(audioFiles, user_id);

      if (nonAudioFiles.length > 0) {
        setShowToast(true);
        const message = nonAudioFiles.length === 1
          ? `<strong>${nonAudioFiles[0].name} is not uploaded</strong><br /> Only audio files are accepted`
          : `<strong>${nonAudioFiles.length} files are not uploaded</strong><br /> Only audio files are accepted`;

        toast.dark(
          <div dangerouslySetInnerHTML={{ __html: message }} />, {
            autoClose: 3000,
            pauseOnFocusLoss: false,
            icon: <IoCloseSharp size={24} />,
            className: "Toastify__toast--warning",
          }
        );
      }
    }
  }, [autoSubmitFiles, user_id]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  useEffect(() => {
    if (!isAuthPage(location.pathname)) {
      window.addEventListener('dragover', handleDragOver);
      window.addEventListener('drop', handleDrop);
      window.addEventListener('dragleave', handleDragLeave);
    }

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragleave', handleDragLeave);
    };
  }, [handleDragOver, handleDrop, handleDragLeave, location.pathname]);

  return {
    isDraggingOver,
    droppedFiles,
    setDroppedFiles,
    clearDroppedFiles: () => setDroppedFiles([]),
  };
};