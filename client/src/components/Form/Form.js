import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';

import Button from '../Buttons';
import './Form.scss';

const Form = ({ title, item, onClose, onSubmit }) => {
    const [inputValue, setInputValue] = useState('');
    const draggableRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                handleSubmit(event);
            } else if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputValue);
    };

    return (
        <div className="form__overlay" onClick={onClose}>
            <Draggable handle=".form__title" nodeRef={draggableRef}>
                <div className="form__form" onClick={(e) => e.stopPropagation()} ref={draggableRef}>
                    <h2 className='form__title'>{title}</h2>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="input">{`Enter ${item}`}</label>
                        <input type="text" id="input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                        <div className="form__actions">
                            <Button type="submit" text='Submit'/>
                            <Button onClick={onClose} text='Cancel'/>
                        </div>
                    </form>
                </div>
            </Draggable>
        </div>
    );
};

export default Form;