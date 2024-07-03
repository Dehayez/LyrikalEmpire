import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getBeats, addBeat, getMoods } from './services';
import { Header, BeatList, AddBeatForm, AddBeatButton, AudioPlayer, Queue, Playlists, RightSidePanel, LeftSidePanel, History } from './components';
import { handlePlay, handlePrev } from './hooks';
import { ToastContainer, toast } from 'react-toastify';
import { IoCloseSharp, IoCheckmarkSharp } from "react-icons/io5";
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

function App() {
  const [refresh, setRefresh] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beats, setBeats] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [hasBeatPlayed, setHasBeatPlayed] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [queue, setQueue] = useState([]);
  const [customQueue, setCustomQueue] = useState(() => {
    const savedQueue = localStorage.getItem('customQueue');
    return savedQueue ? JSON.parse(savedQueue) : [];
  });
  const [allowHover, setAllowHover] = useState(true);
  const [viewState, setViewState] = useState(localStorage.getItem('lastView') || "queue");
  const [currentBeat, setCurrentBeat] = useState(() => JSON.parse(localStorage.getItem('currentBeat') || 'null'));
  const [selectedBeat, setSelectedBeat] = useState(() => JSON.parse(localStorage.getItem('selectedBeat') || 'null'));
  const [shuffle, setShuffle] = useState(() => JSON.parse(localStorage.getItem('shuffle') || 'false'));
  const [repeat, setRepeat] = useState(() => localStorage.getItem('repeat') || 'Disabled Repeat');
  const [isSidePanelInContent, setIsSidePanelInContent] = useState(false);
  const [isLeftDivVisible, setIsLeftDivVisible] = useState(false);
  const [isRightDivVisible, setIsRightDivVisible] = useState(false);
  const hoverRefLeft = useRef(false);
  const hoverRefRight = useRef(false);
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(() => JSON.parse(localStorage.getItem('isLeftPanelVisible') || 'false'));
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(() => JSON.parse(localStorage.getItem('isRightPanelVisible') || 'false'));
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState([]);
  const addBeatFormRef = useRef();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);

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

  const sortedBeats = useMemo(() => {
    let sortableBeats = [...beats];
    const tierOrder = ['G', 'S', 'A', 'B', 'C', 'D', 'E', 'F', ' '];
    if (sortConfig.key !== null) {
      sortableBeats.sort((a, b) => {
        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];
        const isEmptyA = valueA === '' || valueA === null;
        const isEmptyB = valueB === '' || valueB === null;

        if (isEmptyA && isEmptyB) return 0;
        if (isEmptyA) return 1;
        if (isEmptyB) return -1;

        if (sortConfig.key === 'tierlist') {
          let indexA = tierOrder.indexOf(valueA);
          let indexB = tierOrder.indexOf(valueB);
          indexA = indexA === -1 ? tierOrder.length : indexA;
          indexB = indexB === -1 ? tierOrder.length : indexB;
          return sortConfig.direction === 'ascending' ? indexA - indexB : indexB - indexA;
        }
        if (valueA < valueB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBeats;
  }, [beats, sortConfig]);

  useEffect(() => {
    localStorage.setItem('shuffle', shuffle);
    localStorage.setItem('repeat', repeat);
    localStorage.setItem('currentBeat', JSON.stringify(currentBeat));
    localStorage.setItem('selectedBeat', JSON.stringify(selectedBeat));
    localStorage.setItem('isLeftPanelVisible', isLeftPanelVisible);
    localStorage.setItem('isRightPanelVisible', isRightPanelVisible);
    localStorage.setItem('lastView', viewState);
    localStorage.setItem('customQueue', JSON.stringify(customQueue));
  }, [shuffle, repeat, currentBeat, selectedBeat, isLeftPanelVisible, isRightPanelVisible, viewState, customQueue]);

  useEffect(() => {
    const fetchBeats = async () => {
      const fetchedBeats = await getBeats();
      setBeats(fetchedBeats);
      if (fetchedBeats.length > 0 && !selectedBeat) {
        setSelectedBeat(fetchedBeats[0]);
      }
    };
    fetchBeats();
  }, [refresh]);

  useEffect(() => {
    logQueue(sortedBeats, shuffle, currentBeat);
  }, [sortedBeats, shuffle, currentBeat]);


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

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
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
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  // Clear files after submission
  const clearDroppedFiles = () => {
    setDroppedFiles([]);
  };

const autoSubmitFiles = async (files) => {
  setActiveUploads(activeUploads => activeUploads + files.length); 
  Array.from(files).forEach(async (file) => {
    const beat = {
      title: file.name.replace(/\.[^/.]+$/, ""),
    };
    try {
      const data = await addBeat(beat, file);
      setShowToast(true); 
      toast.dark(<div><strong>{beat.title}</strong> added successfully!</div>, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
          icon: <IoCheckmarkSharp size={24} />,
          className: "Toastify__toast--success",
      });
    } catch (error) {
    } finally {
      setActiveUploads(activeUploads => activeUploads - 1); 
    }
  });
};

useEffect(() => {
  if (activeUploads === 0 && showToast) {
    setRefresh(!refresh); 
  }
}, [activeUploads, showToast]); 

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

  const handleAdd = (newBeat) => {
    setRefresh(!refresh);
    const updatedBeats = [...beats, newBeat];
    setBeats(updatedBeats);
    if (shuffle) {
      const shuffledQueue = [...queue, newBeat];
      for (let i = shuffledQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
      }
      setQueue(shuffledQueue);
    } else {
      setQueue([...queue, newBeat]);
    }
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
  };

  const handlePrevWrapper = () => handlePrev(repeat, beats, currentBeat, handlePlayWrapper);

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
    setTimeout(() => {
      if (!hoverRefLeft.current) {
        setIsLeftDivVisible(false);
      }
    }, 200);
  };
  
  const handleMouseEnterRight = () => {
    if (!allowHover) return;
    hoverRefRight.current = true;
    setIsRightDivVisible(true);
  };
  
  const handleMouseLeaveRight = () => {
    hoverRefRight.current = false;
    setTimeout(() => {
      if (!hoverRefRight.current) {
        setIsRightDivVisible(false);
      }
    }, 200);
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
      <div className="invisible-hover-panel invisible-hover-panel--left" onMouseEnter={handleMouseEnterLeft} onMouseLeave={handleMouseLeaveLeft}></div>
      <div className="invisible-hover-panel invisible-hover-panel--right" onMouseEnter={handleMouseEnterRight} onMouseLeave={handleMouseLeaveRight}></div>
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
          <div className={`container__content__left ${isLeftPanelVisible ? 'container__content__left--pinned' : ''}`}>
            {isLeftPanelVisible || isLeftDivVisible ? (
              <LeftSidePanel
                isDivVisible={isLeftPanelVisible || (isLeftDivVisible && !isSidePanelInContent)}
                className={isLeftPanelVisible ? 'left-side-panel--pinned' : (isLeftDivVisible ? 'left-side-panel--hover' : '')}
                {...(isLeftDivVisible && !isLeftPanelVisible && { handleMouseEnter: handleMouseEnterLeft, handleMouseLeave: handleMouseLeaveLeft })}
              >
                <Playlists />
              </LeftSidePanel>
            ) : null}
          </div>
          <div className='container__content__middle'>
            <BeatList 
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
            />
            <AddBeatButton setIsOpen={setIsOpen} />
          </div>
          <div className={`container__content__right ${isRightPanelVisible ? 'container__content__right--pinned' : ''}`}>
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
                    currentBeat={currentBeat} 
                    onBeatClick={handleBeatClick} 
                    isShuffleEnabled={shuffle}
                    customQueue={customQueue}
                  />
                ) : (
                  <History
                    currentBeat={currentBeat} 
                    onBeatClick={handleBeatClick}  
                  />
                )}
              </div>
              </RightSidePanel>
            ) : null}
          </div>
        </div>
        <AddBeatForm 
          onAdd={handleAdd} 
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