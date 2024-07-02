import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getBeats } from './services';
import { Header, BeatList, AddBeatForm, AddBeatButton, AudioPlayer, Queue, Playlists, RightSidePanel, LeftSidePanel, History } from './components';
import { handlePlay, handlePrev } from './hooks';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

function App() {
  const [refresh, setRefresh] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beats, setBeats] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [hasBeatPlayed, setHasBeatPlayed] = useState(false);
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

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files);
    // Automatically submit files here instead of setting them to state
    // For example, call a function to handle the file upload
    autoSubmitFiles(files);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

// Clear files after submission
const clearDroppedFiles = () => {
  setDroppedFiles([]);
};

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

// Function to automatically submit files
const autoSubmitFiles = (files) => {
  // Implement file submission logic here
  console.log('Automatically submitting files:', files);
};


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

  const updateHistory = (playedBeat) => {
    const history = JSON.parse(localStorage.getItem('playedBeatsHistory') || '[]');
    const updatedHistory = [playedBeat, ...history].slice(0, 100);
    localStorage.setItem('playedBeatsHistory', JSON.stringify(updatedHistory));
  };

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
  
  // Fetch and update beats
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

  // Queue management
  useEffect(() => {
    logQueue(sortedBeats, shuffle, currentBeat);
  }, [sortedBeats, shuffle, currentBeat]);

  // UI Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelector('.App').classList.remove('App--hidden');
    }, 400); 

    return () => clearTimeout(timer);
  }, []);

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

  const addToCustomQueue = (beatOrBeats) => {
    setCustomQueue((prevQueue) => [
      ...prevQueue,
      ...(Array.isArray(beatOrBeats) ? beatOrBeats : [beatOrBeats]),
    ]);
  };


  return (
    <div className="App App--hidden">
          {isDraggingOver && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontSize: '24px',
      }}>
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
        <AddBeatForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} droppedFiles={droppedFiles} clearDroppedFiles={clearDroppedFiles} />
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