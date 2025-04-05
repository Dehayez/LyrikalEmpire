import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoCloseSharp } from "react-icons/io5";
import { isAuthPage, uploadBeatWithToast } from '../utils';

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
      if (file.type === 'audio/aiff') {
        errorUploadToast('AIF files are not supported');
        setActiveUploads((activeUploads) => activeUploads - 1);
        return;
      }
  
      try {
        const duration = await getAudioDuration(file);
        const beat = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          duration: duration,
        };
  
        await uploadBeatWithToast(beat, file, user_id, setRefreshBeats);
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