import { useState, useEffect } from 'react';

export const useHandleBeatClick = (beats, tableRef) => {
  const [selectedBeats, setSelectedBeats] = useState([]);
  const [lastSelectedBeatIndex, setLastSelectedBeatIndex] = useState(null);

  const handleBeatClick = (beat, e) => {
    const clickedBeatIndex = beats.findIndex(b => b.id === beat.id);
  
    if (e.shiftKey && lastSelectedBeatIndex !== null) {
      let start = Math.min(clickedBeatIndex, lastSelectedBeatIndex);
      let end = Math.max(clickedBeatIndex, lastSelectedBeatIndex);
      let selectedBeats = beats.slice(start, end + 1);
  
      if (clickedBeatIndex < lastSelectedBeatIndex) {
        selectedBeats = selectedBeats.reverse();
      }
  
      setSelectedBeats(prevBeats => {
        const newSelectedBeats = [...prevBeats];
        selectedBeats.forEach(beat => {
          if (!newSelectedBeats.map(b => b.id).includes(beat.id)) {
            newSelectedBeats.push(beat);
          }
        });
        return newSelectedBeats;
      });
    } else if (!e.ctrlKey && !e.metaKey) {
      setSelectedBeats([beat]);
    } else {
      setSelectedBeats(prevBeats => {
        if (prevBeats.map(b => b.id).includes(beat.id)) {
          return prevBeats.filter(b => b.id !== beat.id);
        } else {
          return [...prevBeats, beat];
        }
      });
    }
  
    setLastSelectedBeatIndex(clickedBeatIndex);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedBeats([]);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return { selectedBeats, handleBeatClick, setSelectedBeats };
};