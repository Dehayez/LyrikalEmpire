import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { IoPersonSharp } from "react-icons/io5";

import { isMobileOrTablet, getInitialState, isAuthPage } from './utils';
import { useSort, useDragAndDrop, useLocalStorageSync, useAudioPlayer, usePanels } from './hooks';
import { useBeat, useUser } from './contexts';
import ProtectedRoute from './routes/ProtectedRoute';
import userService from './services/userService';

import { DashboardPage, BeatsPage, PlaylistsPage, GenresPage, MoodsPage, KeywordsPage, FeaturesPage, LoginPage, RegisterPage, ConfirmEmailPage, RequestPasswordResetPage, ResetPasswordPage, ProfilePage } from './pages';
import { Header, BeatList, AddBeatForm, AddBeatButton, AudioPlayer, Footer, Queue, Playlists, RightSidePanel, LeftSidePanel, History, PlaylistDetail, LyricsModal, IconButton } from './components';
import NotFound from './components/NotFound';

import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

function App() {
  const location = useLocation();
  const isAuthRoute = isAuthPage(location.pathname);
  const { beats, setBeats, setRefreshBeats, currentBeats } = useBeat();
  const navigate = useNavigate();
  const { user } = useUser();
  const { username } = user;
  const { isDraggingOver, droppedFiles, clearDroppedFiles } = useDragAndDrop(setRefreshBeats, user.id);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewState, setViewState] = useState(() => getInitialState('lastView', 'queue'));
  const [currentBeat, setCurrentBeat] = useState(() => getInitialState('currentBeat', null));
  const [selectedBeat, setSelectedBeat] = useState(() => getInitialState('selectedBeat', null));
  const { sortedItems: sortedBeats, sortConfig } = useSort(beats);
  const [queue, setQueue] = useState([]);
  const [customQueue, setCustomQueue] = useState(() => getInitialState('customQueue', []));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [shuffle, setShuffle] = useState(() => getInitialState('shuffle', false));
  const [repeat, setRepeat] = useState(() => getInitialState('repeat', 'Disabled Repeat'));
  const [lyricsModal, setLyricsModal] = useState(getInitialState('lyricsModal', false));

  useEffect(() => {
    // Initialize token refresh mechanism
    userService.startTokenRefresh();
    
    // Set initial authentication state
    setIsAuthenticated(userService.isAuthenticated());
    
    // Listen for authentication events
    const handleTokenExpired = () => {
      setIsAuthenticated(false);
      // You might want to redirect to login page or show a modal
      console.log('Authentication expired - please login again');
    };
    
    // Add event listener for token expiration
    window.addEventListener('auth:tokenExpired', handleTokenExpired);
    
    // Cleanup function
    return () => {
      window.removeEventListener('auth:tokenExpired', handleTokenExpired);
    };
  }, []);

  const {
    isLeftPanelVisible,
    isRightPanelVisible,
    isLeftDivVisible,
    isRightDivVisible,
    handleMouseEnterLeft,
    handleMouseLeaveLeft,
    handleMouseEnterRight,
    handleMouseLeaveRight,
    toggleSidePanel,
    closeSidePanel,
  } = usePanels();
  
  useLocalStorageSync({ shuffle, repeat, currentBeat, selectedBeat, isLeftPanelVisible, isRightPanelVisible, viewState, customQueue, sortConfig, lyricsModal });
  
const handlePlayWrapper = (beat, play, beats, shouldUpdateQueue = false) => {
  if (shouldUpdateQueue) {
    logQueue(beats, shuffle, beat);
  }
  handlePlay(beat, play, beats, setSelectedBeat, setBeats, currentBeat, setCurrentBeat, setIsPlaying);
  updateHistory(beat);
  if (window.electron) {
    window.electron.setActivity(beat.title);
  }
};

  const handlePrevWrapper = () => handlePrev(currentBeats, currentBeat, handlePlayWrapper, repeat, setRepeat);

 const handleNextWrapper = () => {
  if (customQueue.length > 0) {
    const nextCustomBeat = customQueue[0];
    handlePlayWrapper(nextCustomBeat, true, currentBeats);
    setCustomQueue(customQueue.slice(1));
  } else {
    const currentIndex = queue.findIndex(beat => beat.id === currentBeat.id);
    const nextIndex = currentIndex + 1 < queue.length ? currentIndex + 1 : 0;
    const nextBeat = queue[nextIndex];
    handlePlayWrapper(nextBeat, true, currentBeats);
  }
  if (repeat === 'Repeat One') {
    setRepeat('Repeat');
  }
};

  const {
    handlePlay,
    handlePrev,
    handleNext,
  } = useAudioPlayer({
    currentBeat,
    setCurrentBeat,
    isPlaying,
    setIsPlaying,
    onNext: handleNextWrapper,
    onPrev: handlePrevWrapper,
    shuffle,
    setShuffle,
    repeat,
    setRepeat,
  });

  
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

  const addToCustomQueue = (beatOrBeats) => {
    setCustomQueue((prevQueue) => [
      ...prevQueue,
      ...(Array.isArray(beatOrBeats) ? beatOrBeats : [beatOrBeats]),
    ]);
  };

  const logQueue = (beats, shuffle, currentBeat) => {
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

  const updateHistory = (playedBeat) => {
    const history = getInitialState('playedBeatsHistory', []);
    const updatedHistory = [playedBeat, ...history].slice(0, 100);
    localStorage.setItem('playedBeatsHistory', JSON.stringify(updatedHistory));
  };

  const handleBeatClick = (beat) => {
    setCurrentBeat(beat);
    setIsPlaying(true);
  };

  const toggleView = (view) => {
    setViewState(view);
    localStorage.setItem('lastView', view);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelector('.app').classList.remove('app--hidden');
    }, 400); 
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentBeat && isPlaying) {
      document.title = `${currentBeat.title} - Lyrikal Empire`;
    } else {
      document.title = 'Lyrikal Empire';
    }
  }, [currentBeat, isPlaying]);

  useEffect(() => {
    if (currentBeat && window.electron) {
      console.log(`Calling setActivity with songTitle: ${currentBeat.title}`);
      window.electron.setActivity(currentBeat.title);
    } else if (window.electron) {
      window.electron.setActivity();
    }
  }, [currentBeat]);

  useEffect(() => {
  if (queue.length === 0 && currentBeat && currentBeats && currentBeats.length > 0) {
    logQueue(currentBeats, shuffle, currentBeat);
  }
}, [queue.length, currentBeat, currentBeats, shuffle]);

  return (
      <div className="app app--hidden">
        {isDraggingOver && (
          <div className='app__overlay'>
            Drop files to upload
          </div>
        )}
        {/* {!isMobileOrTablet() && !isAuthRoute && (
          <>
            <div className="invisible-hover-panel invisible-hover-panel--left" onMouseEnter={handleMouseEnterLeft} onMouseLeave={handleMouseLeaveLeft}></div>
            <div className="invisible-hover-panel invisible-hover-panel--right" onMouseEnter={handleMouseEnterRight} onMouseLeave={handleMouseLeaveRight}></div>
          </>
        )} */}
        <ToastContainer />
        {currentBeat && (
          <LyricsModal 
            beatId={currentBeat.id} 
            title={currentBeat.title} 
            lyricsModal={lyricsModal}
            setLyricsModal={setLyricsModal}
          />
        )}
       {!isMobileOrTablet() && (
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
            isAuthPage={isAuthRoute}
            closeSidePanel={closeSidePanel}
          />
        )}
        <div className="container">
          <div className='container__content'>
            <div className={`container__content__left ${isMobileOrTablet() && isLeftPanelVisible ? 'container__content__left--mobile' : ''} ${isLeftPanelVisible ? 'container__content__left--pinned' : ''}`}>
              {!isAuthRoute && (isLeftPanelVisible || isLeftDivVisible) ? (
                <LeftSidePanel
                  isDivVisible={isLeftPanelVisible || isLeftDivVisible}
                  className={isLeftPanelVisible ? 'left-side-panel--pinned' : (isLeftDivVisible ? 'left-side-panel--hover' : '')}
                  {...(isLeftDivVisible && !isLeftPanelVisible && { handleMouseEnter: handleMouseEnterLeft, handleMouseLeave: handleMouseLeaveLeft })}
                >
                  <Playlists isPlaying={isPlaying} closeSidePanel={closeSidePanel} />
                </LeftSidePanel>
              ) : null}
            </div>
            <div className={`container__content__middle ${isMobileOrTablet() ? 'container__content__middle--mobile' : ''} ${isMobileOrTablet() && (isRightPanelVisible || isLeftPanelVisible) ? 'container__content__middle--hide' : ''}`}>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute element={
                  <>
                    <BeatList 
                      onPlay={handlePlayWrapper} 
                      selectedBeat={selectedBeat} 
                      isPlaying={isPlaying} 
                      currentBeat={currentBeat} 
                      addToCustomQueue={addToCustomQueue}
                      onBeatClick={handleBeatClick} 
                      onUpdateBeat={updateBeat}
                      onUpdate={onUpdate}
                    />
                    <AddBeatButton setIsOpen={setIsOpen} />
                  </>
                } />
              } />
              <Route path="/playlists/:id" element={
                <ProtectedRoute element={
                  <PlaylistDetail
                    onPlay={handlePlayWrapper} 
                    selectedBeat={selectedBeat} 
                    isPlaying={isPlaying} 
                    currentBeat={currentBeat} 
                    sortedBeats={sortedBeats} 
                    addToCustomQueue={addToCustomQueue}
                    onBeatClick={handleBeatClick}  
                    onUpdate={onUpdate}
                  />
                } />
              } />
              <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
              <Route path="/dashboard/beats" element={<ProtectedRoute element={<BeatsPage />} />} />
              <Route path="/dashboard/playlists" element={<ProtectedRoute element={<PlaylistsPage />} />} />
              <Route path="/dashboard/genres" element={<ProtectedRoute element={<GenresPage />} />} />
              <Route path="/dashboard/moods" element={<ProtectedRoute element={<MoodsPage />} />} />
              <Route path="/dashboard/keywords" element={<ProtectedRoute element={<KeywordsPage />} />} />
              <Route path="/dashboard/features" element={<ProtectedRoute element={<FeaturesPage />} />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/confirm-email" element={<ConfirmEmailPage />} />
              <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
            <div className={`container__content__right ${isMobileOrTablet() && isRightPanelVisible ? 'container__content__right--mobile' : ''} ${isRightPanelVisible ? 'container__content__right--pinned' : ''}`}>
              {!isAuthRoute && (isRightPanelVisible || isRightDivVisible) ? (
                <RightSidePanel
                  isDivVisible={isRightPanelVisible || isRightDivVisible}
                  className={isRightPanelVisible ? 'right-side-panel--pinned' : (isRightDivVisible ? 'right-side-panel--hover' : '')}
                  {...(isRightDivVisible && !isRightPanelVisible && { handleMouseEnter: handleMouseEnterRight, handleMouseLeave: handleMouseLeaveRight })}
                >
                <div>
                  <div className='view-toggle-container'>
                    <div className='view-toggle-container__left'>
                      <h3 onClick={() => toggleView("queue")} className={`view-toggle-container__title ${viewState === "queue" ? 'view-toggle-container__title--active' : ''}`}>Queue</h3>
                      <h3 onClick={() => toggleView("history")} className={`view-toggle-container__title ${viewState === "history" ? 'view-toggle-container__title--active' : ''}`}>History</h3>
                    </div>
                    <div className='view-toggle-container__right'>
                       <IconButton
                          className='beat-list__action-button--profile'
                          onClick={() => navigate('/profile')}
                          text={username}
                          tooltipPosition='left'
                          ariaLabel={`Go to ${username}'s Profile`}
                        >
                          <IoPersonSharp />
                        </IconButton>
                    </div>
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
        {!isAuthRoute &&
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
            lyricsModal={lyricsModal}
            setLyricsModal={setLyricsModal}
          />
        }
       {isMobileOrTablet() && (
          <Footer 
            isLeftPanelVisible={isLeftPanelVisible} 
            isRightPanelVisible={isRightPanelVisible} 
            toggleSidePanel={toggleSidePanel}
            handleMouseEnterLeft={handleMouseEnterLeft} 
            handleMouseLeaveLeft={handleMouseLeaveLeft} 
            handleMouseEnterRight={handleMouseEnterRight}
            handleMouseLeaveRight={handleMouseLeaveRight}
            isLeftDivVisible={isLeftDivVisible}
            isRightDivVisible={isRightDivVisible}
            isAuthPage={isAuthRoute}
            closeSidePanel={closeSidePanel}
          />
        )}
      </div>
  );
}

export default App;