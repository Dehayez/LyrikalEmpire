import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoCloseSharp, IoCheckmarkSharp } from "react-icons/io5";
import { addBeat } from '../services';
import { isAuthPage } from '../utils/isAuthPage';

export const useDragAndDrop = (setRefreshBeats) => {
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

  const autoSubmitFiles = useCallback(async (files) => {
    setActiveUploads(activeUploads => activeUploads + files.length);
    files.forEach(async (file) => {
      try {
        const duration = await getAudioDuration(file);
        const beat = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          duration: duration,
        };
        await addBeat(beat, file);
        setShowToast(true);
        toast.dark(<div><strong>{beat.title}</strong> added successfully!</div>, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
          icon: <IoCheckmarkSharp size={24} />,
          className: "Toastify__toast--success",
        });
        setRefreshBeats(prev => !prev);
      } catch (error) {
        toast.dark(
          <div><strong>Error:</strong> {error.message}</div>, {
            autoClose: 5000,
            pauseOnFocusLoss: false,
            icon: <IoCloseSharp size={24} />,
            className: "Toastify__toast--warning",
          }
        );
      } finally {
        setActiveUploads(activeUploads => activeUploads - 1);
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

      autoSubmitFiles(audioFiles);

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
  }, [autoSubmitFiles]);

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