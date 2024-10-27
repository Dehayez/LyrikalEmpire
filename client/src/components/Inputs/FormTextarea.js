import React, { useEffect, useRef, useState } from 'react';
import './FormTextarea.scss';

export const FormTextarea = ({ label, placeholder, value, onChange, required, rows, maxLength }) => {
    const textareaRef = useRef(null);
    const [remainingChars, setRemainingChars] = useState(maxLength);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'inherit';
            textarea.style.height = `${textarea.scrollHeight}px`; 
        }
        setRemainingChars(maxLength - value.length);
    }, [value, maxLength]);

    return (
        <div className="form-group form-textarea">
            <label>{label}</label>
            <textarea
                ref={textareaRef}
                className='form-group__input form-textarea__input'
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e);
                }}
                required={required}
                rows={rows}
                maxLength={maxLength}
            />
            {maxLength && (
                <span className='form-textarea__remaining-chars'>
                    {remainingChars}
                </span>
            )}
        </div>
    );
};