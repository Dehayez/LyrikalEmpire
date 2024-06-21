import { useCallback } from 'react';

export const useBpmHandlers = (handleUpdate, beatId, setBpm) => {
const handleBpmKeyDown = useCallback((e) => {
    switch (e.key) {
        case 'Enter':
        e.target.blur();
        break;
        case 'Backspace':
        case 'Tab':
        case 'ArrowLeft':
        case 'ArrowRight':
        break;
        default:
        if (!/^[\d.,]+$/.test(e.key)) {
            e.preventDefault();
        }
    }
    }, []);

  const handleBpmBlurUpdate = useCallback((e) => {
    if (e.target.value === '') {
      handleUpdate(beatId, 'bpm', null);
      return;
    }
    let bpm = parseFloat(e.target.value.replace(',', '.'));
    bpm = Math.round(bpm);
    if (isNaN(bpm) || bpm <= 0 || bpm > 240) {
      alert('Please enter a valid BPM (1-240) or leave it empty.');
      e.target.focus();
    } else {
      e.target.value = bpm;
      handleUpdate(beatId, 'bpm', bpm);
    }
  }, [handleUpdate, beatId]);

  const handleBpmChange = useCallback((event) => {
    const newValue = event.target.value;
    if (/^[\d.,]*$/.test(newValue) && newValue.length <= 11) {
      setBpm(newValue);
    }
  }, [setBpm]);

  const handleBpmBlurSet = useCallback((e) => {
    if (e.target.value === '') {
      setBpm(null);
      handleUpdate(beatId, 'bpm', null);
      return;
    }

    let bpm = parseFloat(e.target.value.replace(',', '.'));
    bpm = Math.round(bpm);
    if (isNaN(bpm) || bpm <= 0 || bpm > 240) {
      alert('Please enter a valid BPM (1-240) or leave it empty.');
      e.target.focus();
    } else {
      e.target.value = bpm;
      setBpm(bpm);
      handleUpdate(beatId, 'bpm', bpm);
    }
  }, [handleUpdate, beatId, setBpm]);

  return { handleBpmBlurUpdate, handleBpmChange, handleBpmBlurSet, handleBpmKeyDown };
};