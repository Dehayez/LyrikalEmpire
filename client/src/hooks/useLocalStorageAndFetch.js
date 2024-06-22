import { useState, useEffect } from 'react';
import { getBeats } from '../services';

export const useLocalStorageAndFetch = () => {
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
      if (fetchedBeats.length > 0 && !selectedBeat) {
        setSelectedBeat(fetchedBeats[0]);
      }
    };
    fetchBeats();
  }, [selectedBeat]);

  return { currentBeat, setCurrentBeat, selectedBeat, setSelectedBeat, shuffle, setShuffle, repeat, setRepeat };
};