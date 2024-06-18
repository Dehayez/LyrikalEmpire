import { useState } from 'react';

export const useHandleBeatClick = (beats) => {
  const [selectedBeats, setSelectedBeats] = useState([]);
  const [lastSelectedBeatIndex, setLastSelectedBeatIndex] = useState(null);

  const handleBeatClick = (beat, e) => {
    const clickedBeatIndex = beats.findIndex(b => b.id === beat.id);
  
    if (e.shiftKey && lastSelectedBeatIndex !== null) {
      const start = Math.min(clickedBeatIndex, lastSelectedBeatIndex);
      const end = Math.max(clickedBeatIndex, lastSelectedBeatIndex);
      const selectedBeats = beats.slice(start, end + 1);
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

  return { selectedBeats, handleBeatClick, setSelectedBeats };
};