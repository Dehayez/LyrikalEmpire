import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { IoCloseSharp, IoCheckmarkSharp } from "react-icons/io5";

import { isMobileOrTablet, sortBeats } from './utils';
import { addBeat } from './services';
import { handlePlay, handlePrev } from './hooks';
import { useBeat } from './contexts';

import { Header, BeatList, AddBeatForm, AddBeatButton, AudioPlayer, Queue, Playlists, RightSidePanel, LeftSidePanel, History, PlaylistDetail } from './components';
import NotFound from './components/NotFound';

import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

function App() {
  const { beats, setBeats } = useBeat();

  const [refresh, setRefresh] = useState(false);
  const [viewState, setViewState] = useState(localStorage.getItem('lastView') || "queue");
  
  const [currentBeat, setCurrentBeat] = useState(() => JSON.parse(localStorage.getItem('currentBeat') || 'null'));
  const [selectedBeat, setSelectedBeat] = useState(() => {const item = localStorage.getItem('selectedBeat');return item && item !== "undefined" ? JSON.parse(item) : null;});
  const [sortConfig, setSortConfig] = useState(() => {const savedSortConfig = localStorage.getItem('sortConfig'); return savedSortConfig ? JSON.parse(savedSortConfig) : { key: null, direction: 'ascending' };});
  const sortedBeats = useMemo(() => {
    return sortBeats(beats, sortConfig);
  }, [beats, sortConfig]);
  
  const [queue, setQueue] = useState([]);
  const [customQueue, setCustomQueue] = useState(() => {const savedQueue = localStorage.getItem('customQueue');return savedQueue ? JSON.parse(savedQueue) : [];});

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasBeatPlayed, setHasBeatPlayed] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [allowHover, setAllowHover] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const hoverRefLeft = useRef(false);
  const hoverRefRight = useRef(false);
  const [isSidePanelInContent, setIsSidePanelInContent] = useState(false);
  const [isLeftDivVisible, setIsLeftDivVisible] = useState(false);
  const [isRightDivVisible, setIsRightDivVisible] = useState(false);
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(() => JSON.parse(localStorage.getItem('isLeftPanelVisible') || 'false'));
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(() => JSON.parse(localStorage.getItem('isRightPanelVisible') || 'false'));
  
  const [volume, setVolume] = useState(1.0);
  const [shuffle, setShuffle] = useState(() => JSON.parse(localStorage.getItem('shuffle') || 'false'));
  const [repeat, setRepeat] = useState(() => localStorage.getItem('repeat') || 'Disabled Repeat');
  
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [activeUploads, setActiveUploads] = useState(0);

  useEffect(() => { logQueue(sortedBeats, shuffle, currentBeat); }, [beats, sortConfig, shuffle, currentBeat]);

  useEffect(() => {
    localStorage.setItem('shuffle', shuffle);
    localStorage.setItem('repeat', repeat);
    localStorage.setItem('currentBeat', JSON.stringify(currentBeat));
    localStorage.setItem('selectedBeat', JSON.stringify(selectedBeat));
    localStorage.setItem('isLeftPanelVisible', isLeftPanelVisible);
    localStorage.setItem('isRightPanelVisible', isRightPanelVisible);
    localStorage.setItem('lastView', viewState);
    localStorage.setItem('customQueue', JSON.stringify(customQueue));
    localStorage.setItem('sortConfig', JSON.stringify(sortConfig));
  }, [shuffle, repeat, currentBeat, selectedBeat, isLeftPanelVisible, isRightPanelVisible, viewState, customQueue, sortConfig]);
  
  useEffect(() => {
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragleave', handleDragLeave);
    
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragleave', handleDragLeave);
    };
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelector('.app').classList.remove('app--hidden');
    }, 400); 
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (activeUploads === 0 && showToast) {
      setRefresh(!refresh); 
    }
  }, [activeUploads, showToast]); 

  const updateBeat = (id, newData) => {
    setBeats(currentBeats =>
      currentBeats.map(beat => beat.id === id ? { ...beat, ...newData } : beat)
    );
  };

  const onUpdate = (id, field, value) => {
    setBeats(prevBeats =>
      prevBeats.map(beat =>
        beat.id === id ? { ...beat, [field]: value } : beat
      )
    );
  };

  function logQueue(beats, shuffle, currentBeat) {
    let queue = [...beats];
    if (shuffle) {
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
    }
    if (currentBeat) {
      const currentBeatIndex = queue.findIndex(beat => beat.id === currentBeat.id);
  
      if (currentBeatIndex > 0) {
        const currentAndNext = queue.splice(currentBeatIndex);
        queue = [...currentAndNext, ...queue];
      }
    }
    setQueue(queue);
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const isFileDrag = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
      if (isFileDrag) {
        setIsDraggingOver(true);
      }
    }
  }

  function handleDrop(e) {
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
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDraggingOver(false);
  }

  const clearDroppedFiles = () => {
    setDroppedFiles([]);
  };

  const getAudioDuration = (file) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      });
      audio.onerror = () => reject(new Error('Failed to load audio metadata'));
    });
  };
  
  const autoSubmitFiles = async (files) => {
    setActiveUploads(activeUploads => activeUploads + files.length);
    files.forEach(async (file) => {
      try {
        const duration = await getAudioDuration(file);
        const beat = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          duration: duration,
        };
        const data = await addBeat(beat, file);
        setShowToast(true);
        toast.dark(<div><strong>{beat.title}</strong> added successfully!</div>, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
          icon: <IoCheckmarkSharp size={24} />,
          className: "Toastify__toast--success",
        });
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
  };

  const updateHistory = (playedBeat) => {
    const history = JSON.parse(localStorage.getItem('playedBeatsHistory') || '[]');
    const updatedHistory = [playedBeat, ...history].slice(0, 100);
    localStorage.setItem('playedBeatsHistory', JSON.stringify(updatedHistory));
  };

  const onSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : sortConfig.direction === 'descending' ? null : 'ascending';
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  const handlePlayWrapper = (beat, play, beats) => {
    handlePlay(beat, play, beats, setSelectedBeat, setBeats, currentBeat, setCurrentBeat, setIsPlaying, setHasBeatPlayed);
    updateHistory(beat);
  };

  const handleNextWrapper = () => {
    if (customQueue.length > 0) {
      const nextCustomBeat = customQueue[0];
      handlePlayWrapper(nextCustomBeat, true, beats);
      setCustomQueue(customQueue.slice(1));
    } else {
      const currentIndex = queue.findIndex(beat => beat.id === currentBeat.id);
      const nextIndex = currentIndex + 1 < queue.length ? currentIndex + 1 : 0;
      const nextBeat = queue[nextIndex];
      handlePlayWrapper(nextBeat, true, beats);
    }
    if (repeat === 'Repeat One') {
      setRepeat('Repeat');
    }
  };

  const handlePrevWrapper = () => handlePrev(beats, currentBeat, handlePlayWrapper, repeat, setRepeat);

  const handleQueueUpdateAfterDelete = (deletedBeatId) => {
    const updatedQueue = queue.filter(beat => beat.id !== deletedBeatId);
    const updatedBeats = beats.filter(beat => beat.id !== deletedBeatId);
    setQueue(updatedQueue);
    setBeats(updatedBeats);
    setRefresh(!refresh);
  
    if (currentBeat && currentBeat.id === deletedBeatId) {
      const nextBeatIndex = updatedQueue.length > 0 ? 0 : -1;
      const nextBeat = nextBeatIndex !== -1 ? updatedQueue[nextBeatIndex] : null;
  
      if (nextBeat) {
        setCurrentBeat(nextBeat);
      } else {
        setCurrentBeat(null);
        setIsPlaying(false);
      }
    }
  };

  const handleMouseEnterLeft = () => {
    if (!allowHover) return;
    hoverRefLeft.current = true;
    setIsLeftDivVisible(true);
  };
  
  const handleMouseLeaveLeft = () => {
    hoverRefLeft.current = false;
      if (!hoverRefLeft.current) {
        setIsLeftDivVisible(false);
      }
  };
  
  const handleMouseEnterRight = () => {
    if (!allowHover) return;
    hoverRefRight.current = true;
    setIsRightDivVisible(true);
  };
  
  const handleMouseLeaveRight = () => {
    hoverRefRight.current = false;
      if (!hoverRefRight.current) {
        setIsRightDivVisible(false);
      }
  };
  
  const toggleSidePanel = (panel) => {
    if (panel === 'left') {
      setIsLeftPanelVisible(!isLeftPanelVisible);
      setIsLeftDivVisible(!isLeftPanelVisible);
    } else if (panel === 'right') {
      setIsRightPanelVisible(!isRightPanelVisible);
      setIsRightDivVisible(!isRightPanelVisible);
    }
    setAllowHover(false);
    setTimeout(() => {
      setAllowHover(true);
    }, 200);
  };

  const handleBeatClick = (beat) => {
    setCurrentBeat(beat);
    setIsPlaying(true);
  };

  const toggleView = (view) => {
    setViewState(view);
    localStorage.setItem('lastView', view);
  };

  const addToCustomQueue = (beatOrBeats) => {
    setCustomQueue((prevQueue) => [
      ...prevQueue,
      ...(Array.isArray(beatOrBeats) ? beatOrBeats : [beatOrBeats]),
    ]);
  };

  return (
      <div className="app app--hidden">
        {isDraggingOver && (
          <div className='app__overlay'>
            Drop files to upload
          </div>
        )}
        {!isMobileOrTablet() && (
          <>
            <div className="invisible-hover-panel invisible-hover-panel--left" onMouseEnter={handleMouseEnterLeft} onMouseLeave={handleMouseLeaveLeft}></div>
            <div className="invisible-hover-panel invisible-hover-panel--right" onMouseEnter={handleMouseEnterRight} onMouseLeave={handleMouseLeaveRight}></div>
          </>
        )}
        <ToastContainer />
        <Header 
          isLeftPanelVisible={isLeftPanelVisible} 
          isRightPanelVisible={isRightPanelVisible} 
          toggleSidePanel={toggleSidePanel}
          handleMouseEnterLeft={handleMouseEnterLeft} 
          handleMouseLeaveLeft={handleMouseLeaveLeft} 
          handleMouseEnterRight={handleMouseEnterRight}
          handleMouseLeaveRight={handleMouseLeaveRight}
          isLeftDivVisible={isLeftDivVisible}
          isRightDivVisible={isRightDivVisible}
        />
        <div className="container">
          <div className='container__content'>
            <div className={`container__content__left ${isMobileOrTablet() && isLeftPanelVisible ? 'container__content__left--mobile' : ''} ${isLeftPanelVisible ? 'container__content__left--pinned' : ''}`}>
              {isLeftPanelVisible || isLeftDivVisible ? (
                <LeftSidePanel
                  isDivVisible={isLeftPanelVisible || (isLeftDivVisible && !isSidePanelInContent)}
                  className={isLeftPanelVisible ? 'left-side-panel--pinned' : (isLeftDivVisible ? 'left-side-panel--hover' : '')}
                  {...(isLeftDivVisible && !isLeftPanelVisible && { handleMouseEnter: handleMouseEnterLeft, handleMouseLeave: handleMouseLeaveLeft })}
                >
                  <Playlists isPlaying={isPlaying} />
                </LeftSidePanel>
              ) : null}
            </div>
            <div className={`container__content__middle ${isMobileOrTablet() ? 'container__content__middle--mobile' : ''} ${isMobileOrTablet() && (isRightPanelVisible || isLeftPanelVisible) ? 'container__content__middle--hide' : ''}`}>
            <Routes>
            <Route path="/" element={
              <>
               <BeatList 
                key={refresh} 
                onPlay={handlePlayWrapper} 
                selectedBeat={selectedBeat} 
                isPlaying={isPlaying} 
                handleQueueUpdateAfterDelete={handleQueueUpdateAfterDelete} 
                currentBeat={currentBeat} 
                onSort={onSort} 
                sortConfig={sortConfig}
                addToCustomQueue={addToCustomQueue}
                onBeatClick={handleBeatClick} 
                onUpdateBeat={updateBeat}
                onUpdate={onUpdate}
              />
              <AddBeatButton setIsOpen={setIsOpen} />
              </>
            } />
              <Route path="/playlists/:id" element={
                <PlaylistDetail
                key={refresh} 
                onPlay={handlePlayWrapper} 
                selectedBeat={selectedBeat} 
                isPlaying={isPlaying} 
                handleQueueUpdateAfterDelete={handleQueueUpdateAfterDelete} 
                currentBeat={currentBeat} 
                sortedBeats={sortedBeats} 
                onSort={onSort} 
                sortConfig={sortConfig}
                addToCustomQueue={addToCustomQueue}
                onBeatClick={handleBeatClick}  
                onUpdate={onUpdate}
                />} 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <div className={`container__content__right ${isMobileOrTablet() && isRightPanelVisible ? 'container__content__right--mobile' : ''} ${isRightPanelVisible ? 'container__content__right--pinned' : ''}`}>
              {isRightPanelVisible || isRightDivVisible ? (
                <RightSidePanel
                  isDivVisible={isRightPanelVisible || (isRightDivVisible && !isSidePanelInContent)}
                  className={isRightPanelVisible ? 'right-side-panel--pinned' : (isRightDivVisible ? 'right-side-panel--hover' : '')}
                  {...(isRightDivVisible && !isRightPanelVisible && { handleMouseEnter: handleMouseEnterRight, handleMouseLeave: handleMouseLeaveRight })}
                >
                <div>
                  <div className='view-toggle-container'>
                    <h3 onClick={() => toggleView("queue")} className={`view-toggle-container__title ${viewState === "queue" ? 'view-toggle-container__title--active' : ''}`}>Queue</h3>
                    <h3 onClick={() => toggleView("history")} className={`view-toggle-container__title ${viewState === "history" ? 'view-toggle-container__title--active' : ''}`}>History</h3>
                  </div>
                  {viewState === "queue" ? (
                    <Queue 
                      queue={queue} 
                      setQueue={setQueue}
                      currentBeat={currentBeat} 
                      onBeatClick={handleBeatClick} 
                      isShuffleEnabled={shuffle}
                      customQueue={customQueue}
                      setCustomQueue={setCustomQueue}
                      addToCustomQueue={addToCustomQueue}
                    />
                  ) : (
                    <History
                      currentBeat={currentBeat} 
                      onBeatClick={handleBeatClick}  
                      addToCustomQueue={addToCustomQueue}
                    />
                  )}
                </div>
                </RightSidePanel>
              ) : null}
            </div>
          </div>
          <AddBeatForm 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            droppedFiles={droppedFiles} 
            clearDroppedFiles={clearDroppedFiles} 
          />
        </div>
        <AudioPlayer 
          currentBeat={currentBeat} 
          setCurrentBeat={setCurrentBeat} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
          onNext={handleNextWrapper} 
          onPrev={handlePrevWrapper} 
          volume={volume} 
          setVolume={setVolume} 
          shuffle={shuffle} 
          setShuffle={setShuffle} 
          repeat={repeat} 
          setRepeat={setRepeat}
        />
      </div>
  );
}

export default App;