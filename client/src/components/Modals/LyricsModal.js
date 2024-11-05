import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import { IconButton } from '../Buttons';
import { FormTextarea } from '../Inputs';
import { IoCloseSharp } from 'react-icons/io5';
import { isAuthPage } from '../../utils';
import { useLocalStorageSync } from '../../hooks';
import { getAssociationsByBeatId, addAssociationsToBeat } from '../../services/beatService';
import { getLyricsById, updateLyricsById, createLyrics } from '../../services/lyricsService';
import './LyricsModal.scss';

Modal.setAppElement('#modal-root');

const modalStyle = {
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
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
};

const LyricsModal = ({ beatId, title, lyricsModal, setLyricsModal }) => {
  const location = useLocation();
  const isAuthRoute = isAuthPage(location.pathname);
  const draggableRef = useRef(null);
  const modalRef = useRef(null);
  const [lyrics, setLyrics] = useState('');
  const [lyricsId, setLyricsId] = useState(null);
  const [dimensions, setDimensions] = useState(() => {
    const savedDimensions = localStorage.getItem('dimensions');
    return savedDimensions ? JSON.parse(savedDimensions) : { width: 400, height: 300 };
  });

  const handleCancel = () => {
    setLyricsModal(false);
  };

  const updateDimensions = useCallback(() => {
    if (modalRef.current) {
      const { offsetWidth, offsetHeight } = modalRef.current;
      setDimensions({ width: offsetWidth, height: offsetHeight });
    }
  }, []);

  useEffect(() => {
    updateDimensions(); 

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    const observeModal = () => {
      if (modalRef.current instanceof Element) {
        resizeObserver.observe(modalRef.current);
      } else {
        console.warn('modalRef.current is null or not an Element');
      }
    };

    const timeoutId = setTimeout(observeModal, 0);

    return () => {
      clearTimeout(timeoutId);
      if (modalRef.current instanceof Element) {
        resizeObserver.unobserve(modalRef.current);
      } 
      resizeObserver.disconnect();
    };
  }, [updateDimensions]);

  useLocalStorageSync({ dimensions });

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const data = await getAssociationsByBeatId(beatId, 'lyrics');
        if (data && data.length > 0 && data[0].lyrics_id) {
          const lyricData = await getLyricsById(data[0].lyrics_id);
          if (lyricData && lyricData.length > 0 && lyricData[0].lyrics) {
            setLyrics(lyricData[0].lyrics);
            setLyricsId(data[0].lyrics_id);
          } else {
            setLyrics('');
            setLyricsId(null);
          }
        } else {
          setLyrics('');
          setLyricsId(null);
        }
      } catch (error) {
        console.error('Failed to fetch lyrics:', error);
      }
    };

    if (beatId) {
      fetchLyrics();
    }
  }, [beatId]);

  const handleLyricsChange = async (e) => {
    const newLyrics = e.target.value;
    setLyrics(newLyrics);

    try {
      if (lyricsId) {
        await updateLyricsById(lyricsId, newLyrics);
      } else {
        const createdLyricsId = await createLyrics(newLyrics);
        setLyricsId(createdLyricsId);
        await addAssociationsToBeat(beatId, 'lyrics', createdLyricsId);
      }
    } catch (error) {
      console.error('Failed to update or create lyrics:', error);
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const formGroupInput = document.querySelector('.lyrics-modal .form-group__input');
      console.log('formGroupInput:', formGroupInput);
      if (formGroupInput) {
        formGroupInput.style.minHeight = `${dimensions.height - 70}px`;
        observer.disconnect();
      }
    });
  
    observer.observe(document.body, { childList: true, subtree: true });
  
    return () => observer.disconnect();
  }, []);

  return (
    (isAuthRoute) ? null :
      <Modal 
        className="lyrics-modal"
        isOpen={lyricsModal} 
        onRequestClose={handleCancel} 
        style={{ ...modalStyle, width: dimensions.width, height: dimensions.height }}
        shouldCloseOnOverlayClick={false}
      >
        <Draggable handle=".modal__title" nodeRef={draggableRef}>
          <div ref={draggableRef} className='modal'>
            <ResizableBox
              width={dimensions.width}
              height={dimensions.height}
              onResizeStop={(e, data) => {
                setDimensions({ width: data.size.width, height: data.size.height });
              }}
            >
              <div className='modal-content' ref={modalRef}>
                <IconButton className="modal__close-button" onClick={handleCancel}>
                  <IoCloseSharp />
                </IconButton>
                <h2 className='modal__title'>{title}</h2>
                <FormTextarea value={lyrics} onChange={handleLyricsChange}/>
              </div>
            </ResizableBox>
          </div>
        </Draggable>
      </Modal>
  );
};

export default LyricsModal;