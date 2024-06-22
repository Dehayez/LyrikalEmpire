export const handlePlay = (beat, play, beats, setSelectedBeat, setBeats, currentBeat, setCurrentBeat, setIsPlaying, setHasBeatPlayed) => {
    setSelectedBeat(beat);
    setBeats(beats);
    if (!beat) {
      setCurrentBeat(null);
      setIsPlaying(false);
    } else if (currentBeat && currentBeat.id === beat.id) {
      setIsPlaying(play);
    } else {
      setCurrentBeat(beat);
      setIsPlaying(true);
      setHasBeatPlayed(true);
    }
  };
  
  export const handleNext = (repeat, shuffle, lastPlayedIndex, beats, currentBeat, setLastPlayedIndex, handlePlay, setIsPlaying, setRepeat) => {
    if (repeat === 'Repeat One') {
      setRepeat('Repeat');
    }
    let nextIndex;
    if (shuffle) {
      do {
        nextIndex = Math.floor(Math.random() * beats.length);
      } while (nextIndex === lastPlayedIndex && beats.length > 1);
    } else {
      const currentIndex = beats.findIndex(beat => beat.id === currentBeat.id);
      nextIndex = (currentIndex + 1) % beats.length;
    }
    setLastPlayedIndex(nextIndex);
    if (repeat === 'Disabled Repeat' && nextIndex === 0) {
      handlePlay(beats[nextIndex], true, beats);
      setTimeout(() => setIsPlaying(false), 1);
    } else {
      handlePlay(beats[nextIndex], true, beats);
    }
  };
  
  export const handlePrev = (repeat, beats, currentBeat, handlePlay) => {
    if (repeat === 'Repeat One') {
      handlePlay(currentBeat, true, beats);
      return;
    }
    const currentIndex = beats.findIndex(beat => beat.id === currentBeat.id);
    const prevIndex = (currentIndex - 1 + beats.length) % beats.length;
    handlePlay(beats[prevIndex], true, beats);
  };