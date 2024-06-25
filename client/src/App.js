import React, { useState, useEffect, useRef } from 'react';
import { getBeats } from './services';
import { Header, BeatList, AddBeatForm, AddBeatButton, AudioPlayer, Queue, SidePanel, RightSidePanel, LeftSidePanel } from './components';
import { handlePlay, handleNext, handlePrev } from './hooks';
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
  const [currentBeat, setCurrentBeat] = useState(() => {
    const savedCurrentBeat = localStorage.getItem('currentBeat');
    return savedCurrentBeat !== null && savedCurrentBeat !== "undefined" ? JSON.parse(savedCurrentBeat) : null;
  });
  const [selectedBeat, setSelectedBeat] = useState(() => {
    const savedBeat = localStorage.getItem('selectedBeat');
    return savedBeat !== null && savedBeat !== "undefined" ? JSON.parse(savedBeat) : null;
  });
  const [shuffle, setShuffle] = useState(() => {
    const savedShuffle = localStorage.getItem('shuffle');
    return savedShuffle !== null && savedShuffle !== "undefined" ? JSON.parse(savedShuffle) : false;
  });
  const [repeat, setRepeat] = useState(() => {
    const savedRepeat = localStorage.getItem('repeat');
    return savedRepeat !== null && savedRepeat !== "undefined" ? savedRepeat : 'Disabled Repeat';
  });

  useEffect(() => {
    localStorage.setItem('shuffle', shuffle);
    localStorage.setItem('repeat', repeat);
    localStorage.setItem('currentBeat', JSON.stringify(currentBeat));
    localStorage.setItem('selectedBeat', JSON.stringify(selectedBeat));
  }, [shuffle, repeat, currentBeat, selectedBeat]);

  useEffect(() => {
    const fetchBeats = async () => {
      const fetchedBeats = await getBeats();
      setBeats(fetchedBeats);
      if (fetchedBeats.length > 0 && !selectedBeat) {
        setSelectedBeat(fetchedBeats[0]);
      }
    };
    fetchBeats();
  }, []);

  useEffect(() => {
    logQueue(beats, shuffle, currentBeat);
  }, [beats, shuffle, currentBeat]);

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

  const handlePlayWrapper = (beat, play, beats) => handlePlay(beat, play, beats, setSelectedBeat, setBeats, currentBeat, setCurrentBeat, setIsPlaying, setHasBeatPlayed);
  const handleNextWrapper = () => {
    const currentIndex = queue.findIndex(beat => beat.id === currentBeat.id);
    const nextIndex = currentIndex + 1 < queue.length ? currentIndex + 1 : 0;
    const nextBeat = queue[nextIndex];
    handlePlayWrapper(nextBeat, true, beats);
  };
  const handlePrevWrapper = () => handlePrev(repeat, beats, currentBeat, handlePlayWrapper);

  const handleQueueUpdateAfterDelete = (deletedBeatId) => {
    const updatedQueue = queue.filter(beat => beat.id !== deletedBeatId);
    const updatedBeats = beats.filter(beat => beat.id !== deletedBeatId);
    setQueue(updatedQueue);
    setBeats(updatedBeats);
  
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
  const [isSidePanelInContent, setIsSidePanelInContent] = useState(false);
  const [isLeftDivVisible, setIsLeftDivVisible] = useState(false);
  const [isRightDivVisible, setIsRightDivVisible] = useState(false);
  const hoverRefLeft = useRef(false); 
  const hoverRefRight = useRef(false);

  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(() => {
    return JSON.parse(localStorage.getItem('isLeftPanelVisible')) || false;
  });
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(() => {
    return JSON.parse(localStorage.getItem('isRightPanelVisible')) || false;
  });

  useEffect(() => {
    localStorage.setItem('isLeftPanelVisible', isLeftPanelVisible);
  }, [isLeftPanelVisible]);

  useEffect(() => {
    localStorage.setItem('isRightPanelVisible', isRightPanelVisible);
  }, [isRightPanelVisible]);

    const handleMouseEnterLeft = () => {
      hoverRefLeft.current = true;
      setIsLeftDivVisible(true);
    };
  
    const handleMouseLeaveLeft = () => {
      hoverRefLeft.current = false;
      setTimeout(() => {
        if (!hoverRefLeft.current) {
          setIsLeftDivVisible(false);
        }
      }, 300);
    };
  
    const handleMouseEnterRight = () => {
      hoverRefRight.current = true;
      setIsRightDivVisible(true);
    };
  
    const handleMouseLeaveRight = () => {
      hoverRefRight.current = false;
      setTimeout(() => {
        if (!hoverRefRight.current) {
          setIsRightDivVisible(false);
        }
      }, 300);
    };
  
    const toggleSidePanel = (panel) => {
      if (panel === 'left') {
        setIsLeftPanelVisible(!isLeftPanelVisible);
        setIsLeftDivVisible(!isLeftPanelVisible);
      } else if (panel === 'right') {
        setIsRightPanelVisible(!isRightPanelVisible);
        setIsRightDivVisible(!isRightPanelVisible);
      }
    };
  
  return (
    <div className="App">
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
          <div className='container__content__left'>
          {isLeftPanelVisible || isLeftDivVisible ? (
            <LeftSidePanel
              isDivVisible={isLeftPanelVisible || (isLeftDivVisible && !isSidePanelInContent)}
              className={isLeftPanelVisible ? 'left-side-panel--pinned' : (isLeftDivVisible ? 'left-side-panel--hover' : '')}
              {...(isLeftDivVisible && !isLeftPanelVisible && { handleMouseEnter: handleMouseEnterLeft, handleMouseLeave: handleMouseLeaveLeft })}
            />
          ) : null}
          </div>

          <div className='container__content__middle'>
            <BeatList key={refresh} onPlay={handlePlayWrapper} selectedBeat={selectedBeat} isPlaying={isPlaying} handleQueueUpdateAfterDelete={handleQueueUpdateAfterDelete} />
          </div>

          <div className='container__content__right'>
          {isRightPanelVisible || isRightDivVisible ? (
            <RightSidePanel
              isDivVisible={isRightPanelVisible || (isRightDivVisible && !isSidePanelInContent)}
              className={isRightPanelVisible ? 'right-side-panel--pinned' : (isRightDivVisible ? 'right-side-panel--hover' : '')}
              {...(isRightDivVisible && !isRightPanelVisible && { handleMouseEnter: handleMouseEnterRight, handleMouseLeave: handleMouseLeaveRight })}
            />
          ) : null}
          </div>

        </div>

        <AddBeatButton setIsOpen={setIsOpen} />
        <AddBeatForm onAdd={handleAdd} isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
      <AudioPlayer currentBeat={currentBeat} setCurrentBeat={setCurrentBeat} isPlaying={isPlaying} setIsPlaying={setIsPlaying} onNext={handleNextWrapper} onPrev={handlePrevWrapper} volume={volume} setVolume={setVolume} shuffle={shuffle} setShuffle={setShuffle} repeat={repeat} setRepeat={setRepeat} queue={queue}/>
      <div className="buffer"/>
    </div>
  );
}

export default App;