import React, { useEffect, useRef, useState } from 'react';
import './FormTextarea.scss';

export const FormTextarea = ({ label, placeholder, value, onChange, required, rows, maxLength }) => {
    const textareaRef = useRef(null);
    const [remainingChars, setRemainingChars] = useState(maxLength);

    useEffect(() => {
        setRemainingChars(maxLength - value.length);
    }, [value, maxLength]);

    return (
        <div className="form-group form-textarea">
            <textarea
                ref={textareaRef}
                className='form-group__input form-textarea__input'
                value={value}
                onChange={(e) => {
                    onChange(e);
                }}
                required={required}
                rows={rows}
                maxLength={maxLength}
                onFocus={(e) => e.target.nextSibling.classList.add('form-group__label--active')}
                onBlur={(e) => !e.target.value && e.target.nextSibling.classList.remove('form-group__label--active')}
            />
            {label && (
                <label className={`form-group__label ${value || document.activeElement === textareaRef.current ? 'form-group__label--active' : ''}`}>
                    {label}
                </label>
            )}
            {maxLength && (
                <span className='form-textarea__remaining-chars'>
                    {remainingChars}
                </span>
            )}
        </div>
    );
};