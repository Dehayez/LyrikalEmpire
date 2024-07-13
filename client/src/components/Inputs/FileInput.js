import React, { useRef } from 'react';
import { IoCloudUploadSharp } from 'react-icons/io5';

export const FileInput = ({ fileName, onChange }) => {
    const labelRef = useRef(null);

    const handleChange = (event) => {
        onChange(event);
        if (labelRef.current) {
            labelRef.current.blur();
        }
    };

    return (
        <div className="form-group">
            <label>Audio</label>
            <div className="file-input">
                <div className="file-input__wrapper">
                    <label htmlFor="file" className="file-input__label no-margin" tabIndex="0" ref={labelRef}>
                        <IoCloudUploadSharp /> Upload File
                    </label>
                    <input type="file" id="file" className="file-input__input" onChange={handleChange} required accept="audio/*" />
                    <span id="file-name" className="file-input__name">{fileName}</span>
                </div>
            </div>
        </div>
    );
};