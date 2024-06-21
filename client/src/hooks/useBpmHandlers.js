import { useState } from 'react';

export const useBpmHandlers = (handleUpdate, beat) => {
  const [bpm, setBpm] = useState('');

  const handleBpmChange = (e) => {
    const newValue = e.target.value;
    if (/^[\d.,]*$/.test(newValue) && newValue.length <= 11) {
      setBpm(newValue);
    }
  };

  const handleOnKeyDown = (e) => {
    const isCmdOrCtrl = e.metaKey || e.ctrlKey; // Cmd for Mac, Ctrl for others
    const isAllowedKey = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key);
    const isSelectAllShortcut = isCmdOrCtrl && e.key === 'a';
  
    if (!/^[\d.,]+$/.test(e.key) && !isAllowedKey && !isSelectAllShortcut) {
      e.preventDefault();
    }
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const handleBpmBlur = (e) => {
    if (e.target.value === '') {
      handleUpdate(beat.id, 'bpm', null);
      return;
    }
    let bpm = parseFloat(e.target.value.replace(',', '.'));
    bpm = Math.round(bpm);
    if (isNaN(bpm) || bpm <= 0 || bpm > 240) {
      alert('Please enter a valid BPM (1-240) or leave it empty.');
      e.target.focus();
    } else {
      e.target.value = bpm;
      handleUpdate(beat.id, 'bpm', bpm);
    }
  };

  return { bpm, handleBpmChange, handleOnKeyDown, handleBpmBlur };
};