import React, { useRef, useEffect } from 'react';
import './CodeInput.scss';

export const CodeInput = ({ value, onChange }) => {
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const newValue = [...value];
    newValue[index] = e.target.value;
    onChange(newValue);

    // Move to the next input if the current input is not empty
    if (e.target.value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleContainerClick = (e) => {
    e.preventDefault();
    const firstEmptyIndex = value.findIndex(val => val === '');
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const newValue = [...value];
    for (let i = 0; i < newValue.length; i++) {
      if (paste[i]) {
        newValue[i] = paste[i];
      }
    }
    onChange(newValue);
  };

  useEffect(() => {
    const firstEmptyIndex = value.findIndex(val => val === '');
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex].focus();
    }
  }, [value]);

  return (
    <div className="code-input" onClick={handleContainerClick}>
      {value.map((val, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          value={val}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          ref={(el) => (inputRefs.current[index] = el)}
          className="code-input__box"
        />
      ))}
    </div>
  );
};