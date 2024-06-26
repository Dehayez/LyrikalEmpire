import { useState, useEffect } from 'react';

export const useHandleBeatClick = (beats, tableRef) => {
  const [selectedBeats, setSelectedBeats] = useState([]);
  const [lastSelectedBeatIndex, setLastSelectedBeatIndex] = useState(null);

  const handleBeatClick = (beat, e) => {
    const clickedBeatIndex = beats.findIndex(b => b.id === beat.id);
    processSelection(clickedBeatIndex, e);
  };

  const processSelection = (clickedBeatIndex, e) => {
    if (e.shiftKey && lastSelectedBeatIndex !== null) {
      const start = Math.min(clickedBeatIndex, lastSelectedBeatIndex);
      const end = Math.max(clickedBeatIndex, lastSelectedBeatIndex);
      let selectedBeatsRange = beats.slice(start, end + 1);

      setSelectedBeats(prevBeats => {
        const newSelectedBeats = [...prevBeats];
        selectedBeatsRange.forEach(beat => {
          if (!newSelectedBeats.map(b => b.id).includes(beat.id)) {
            newSelectedBeats.push(beat);
          }
        });
        return newSelectedBeats;
      });
    } else if (!e.ctrlKey && !e.metaKey) {
      setSelectedBeats([beats[clickedBeatIndex]]);
    } else {
      setSelectedBeats(prevBeats => {
        if (prevBeats.map(b => b.id).includes(beats[clickedBeatIndex].id)) {
          return prevBeats.filter(b => b.id !== beats[clickedBeatIndex].id);
        } else {
          return [...prevBeats, beats[clickedBeatIndex]];
        }
      });
    }

    setLastSelectedBeatIndex(clickedBeatIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.shiftKey) return;
      let newIndex = null;
      if (e.key === 'ArrowUp' && lastSelectedBeatIndex > 0) {
        newIndex = lastSelectedBeatIndex - 1;
      } else if (e.key === 'ArrowDown' && lastSelectedBeatIndex < beats.length - 1) {
        newIndex = lastSelectedBeatIndex + 1;
      }
      if (newIndex !== null) {
        processSelection(newIndex, e);
        e.preventDefault(); // Prevent scrolling
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lastSelectedBeatIndex, beats]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedBeats([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tableRef]);

  return { selectedBeats, handleBeatClick, setSelectedBeats };
};