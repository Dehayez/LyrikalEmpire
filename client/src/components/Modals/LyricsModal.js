import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import { IoCloseSharp, IoExpand, IoContract } from 'react-icons/io5';

import { isAuthPage, isMobileOrTablet } from '../../utils';
import { useLocalStorageSync } from '../../hooks';
import {
  getAssociationsByBeatId,
  addAssociationsToBeat,
} from '../../services/beatService';
import {
  getLyricsById,
  updateLyricsById,
  createLyrics,
} from '../../services/lyricsService';

import { IconButton } from '../Buttons';
import { FormTextarea } from '../Inputs';

import './LyricsModal.scss';

Modal.setAppElement('#root');

const MODAL_STYLE = {
  overlay: {
    backgroundColor: 'transparent',
    zIndex: 10,
    pointerEvents: 'none',
  },
  content: {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    height: '100%',
    width: '100%',
    margin: 'auto',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
};

const LyricsModal = ({ beatId, title, lyricsModal, setLyricsModal }) => {
  const location = useLocation();
  const isAuthRoute = useMemo(() => isAuthPage(location.pathname), [location.pathname]);
  const isMobile = useMemo(() => isMobileOrTablet(), []);

  const draggableRef = useRef(null);
  const modalRef = useRef(null);

  const [lyrics, setLyrics] = useState('');
  const [lyricsId, setLyricsId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState(() => {
    return JSON.parse(localStorage.getItem('dimensions')) || { width: 400, height: 300 };
  });
  const [position, setPosition] = useState(() => {
    return JSON.parse(localStorage.getItem('modalPosition')) || { x: 0, y: 0 };
  });
  const [preFullscreenState, setPreFullscreenState] = useState(null);
  const [lastNormalDimensions, setLastNormalDimensions] = useState(() => {
    return JSON.parse(localStorage.getItem('lastNormalDimensions')) || { width: 400, height: 300 };
  });

  const handleCancel = useCallback(() => setLyricsModal(false), [setLyricsModal]);

  useLocalStorageSync({ dimensions, position, lastNormalDimensions });

  useEffect(() => {
    if (!beatId) return;

    const fetchLyrics = async () => {
      try {
        const [assoc] = await getAssociationsByBeatId(beatId, 'lyrics');
        if (assoc?.lyrics_id) {
          const [lyricData] = await getLyricsById(assoc.lyrics_id);
          setLyrics(lyricData?.lyrics || '');
          setLyricsId(assoc.lyrics_id);
        } else {
          setLyrics('');
          setLyricsId(null);
        }
      } catch (err) {
        console.error('Failed to fetch lyrics:', err);
      }
    };

    fetchLyrics();
  }, [beatId]);

  const handleLyricsChange = async (e) => {
    const newLyrics = e.target.value;
    setLyrics(newLyrics);

    try {
      if (lyricsId) {
        await updateLyricsById(lyricsId, newLyrics);
      } else {
        const newId = await createLyrics(newLyrics);
        setLyricsId(newId);
        await addAssociationsToBeat(beatId, 'lyrics', newId);
      }
    } catch (err) {
      console.error('Failed to update/create lyrics:', err);
    }
  };

  const handleFullscreenToggle = useCallback(() => {
    if (isFullscreen) {
      // Exit fullscreen - restore to last normal dimensions
      setDimensions(lastNormalDimensions);
      setPosition(preFullscreenState?.position || { x: 0, y: 0 });
      setIsFullscreen(false);
      setPreFullscreenState(null);
    } else {
      // Enter fullscreen - save current state
      setPreFullscreenState({
        dimensions: { ...dimensions },
        position: { ...position }
      });
      setIsFullscreen(true);
    }
  }, [isFullscreen, preFullscreenState, dimensions, position, lastNormalDimensions]);

  const handleResize = useCallback((event, { size }) => {
    if (!isFullscreen) {
      const newDimensions = { width: size.width, height: size.height };
      setDimensions(newDimensions);
      setLastNormalDimensions(newDimensions);
    }
  }, [isFullscreen]);

  const handleDrag = useCallback((event, data) => {
    if (!isFullscreen) {
      setPosition({ x: data.x, y: data.y });
    }
  }, [isFullscreen]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        handleFullscreenToggle();
      }
    };

    if (lyricsModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [lyricsModal, isFullscreen, handleFullscreenToggle]);

  if (isAuthRoute) return null;

  const modalContent = (
    <div className="modal-content" ref={modalRef}>
      <IconButton className="modal__close-button" onClick={handleCancel}>
        <IoCloseSharp />
      </IconButton>
      <IconButton 
        className="modal__fullscreen-button" 
        onClick={handleFullscreenToggle}
        text={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <IoContract /> : <IoExpand />}
      </IconButton>
      <h2 className="modal__title">{title}</h2>
      <FormTextarea id="lyrics-modal__textarea" value={lyrics} onChange={handleLyricsChange} />
    </div>
  );

  return (
    <Modal
      className={`lyrics-modal ${isFullscreen ? 'lyrics-modal--fullscreen' : ''}`}
      isOpen={lyricsModal}
      onRequestClose={handleCancel}
      style={MODAL_STYLE}
      shouldCloseOnOverlayClick={false}
    >
      {isMobile ? (
        <div className="modal modal--mobile">
          {modalContent}
        </div>
      ) : (
        <Draggable 
          handle=".modal__title" 
          nodeRef={draggableRef}
          position={isFullscreen ? { x: 0, y: 0 } : position}
          onDrag={handleDrag}
          disabled={isFullscreen}
        >
          <div ref={draggableRef} className="modal">
            {isFullscreen ? (
              <div className="modal-content-fullscreen">
                {modalContent}
              </div>
            ) : (
              <ResizableBox
                width={dimensions.width}
                height={dimensions.height}
                onResize={handleResize}
                minConstraints={[300, 200]}
                maxConstraints={[window.innerWidth - 100, window.innerHeight - 100]}
              >
                {modalContent}
              </ResizableBox>
            )}
          </div>
        </Draggable>
      )}
    </Modal>
  );
};

export default LyricsModal;