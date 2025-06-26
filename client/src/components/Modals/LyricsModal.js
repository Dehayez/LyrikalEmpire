import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import { IoCloseSharp } from 'react-icons/io5';

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
  const [dimensions, setDimensions] = useState(() => {
    return JSON.parse(localStorage.getItem('dimensions')) || { width: 400, height: 300 };
  });

  const handleCancel = useCallback(() => setLyricsModal(false), [setLyricsModal]);

  const updateDimensions = useCallback(() => {
    if (modalRef.current) {
      const { offsetWidth, offsetHeight } = modalRef.current;
      setDimensions({ width: offsetWidth, height: offsetHeight });
    }
  }, []);

  useLocalStorageSync({ dimensions });

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

  useEffect(() => {
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    const modalEl = modalRef.current;

    const timeoutId = setTimeout(() => {
      if (modalEl instanceof Element) resizeObserver.observe(modalEl);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (modalEl instanceof Element) resizeObserver.unobserve(modalEl);
      resizeObserver.disconnect();
    };
  }, [updateDimensions]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const el = document.querySelector('.lyrics-modal .form-group__input');
      if (el) {
        el.style.minHeight = `${dimensions.height - 70}px`;
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [dimensions]);

  if (isAuthRoute) return null;

  return (
    <Modal
      className="lyrics-modal"
      isOpen={lyricsModal}
      onRequestClose={handleCancel}
      style={MODAL_STYLE}
      shouldCloseOnOverlayClick={false}
    >
      {isMobile ? (
        <div className="modal modal--mobile">
          <div className="modal-content" ref={modalRef}>
            <IconButton className="modal__close-button" onClick={handleCancel}>
              <IoCloseSharp />
            </IconButton>
            <h2 className="modal__title">{title}</h2>
            <FormTextarea value={lyrics} onChange={handleLyricsChange} />
          </div>
        </div>
      ) : (
        <Draggable handle=".modal__title" nodeRef={draggableRef}>
          <div ref={draggableRef} className="modal">
            <ResizableBox
              width={dimensions.width}
              height={dimensions.height}
            >
              <div className="modal-content" ref={modalRef}>
                <IconButton className="modal__close-button" onClick={handleCancel}>
                  <IoCloseSharp />
                </IconButton>
                <h2 className="modal__title">{title}</h2>
                <FormTextarea value={lyrics} onChange={handleLyricsChange} />
              </div>
            </ResizableBox>
          </div>
        </Draggable>
      )}
    </Modal>
  );
};

export default LyricsModal;