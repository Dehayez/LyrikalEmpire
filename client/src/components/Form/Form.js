import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';

import { FormInput } from '../Inputs';
import { Button } from '../Buttons';
import './Form.scss';

const Form = ({ title, onClose, onSubmit, placeholder }) => {
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
                        <FormInput type="text" id="input" placeholder={placeholder} min={2} maxLength={30} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                        <div className="form__buttons">
                            <Button type='transparent' onClick={onClose}>Cancel</Button>
                            <Button type='primary'>Submit</Button>
                        </div>
                    </form>
                </div>
            </Draggable>
        </div>
    );
};

export default Form;