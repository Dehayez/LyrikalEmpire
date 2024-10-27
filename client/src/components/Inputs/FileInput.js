import React, { useRef, useEffect } from 'react';
import { IoCloudUploadSharp } from 'react-icons/io5';
import './FileInput.scss';

export const FileInput = ({ fileName, onChange, fileObject, labelRef }) => {
    const fileInputRef = useRef(null);

    const handleChange = (event) => {
        onChange(event);
        if (labelRef.current) {
            labelRef.current.blur();
        }
    };

    useEffect(() => {
        if (fileObject && fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(fileObject);
            fileInputRef.current.files = dataTransfer.files;
            handleChange({ target: { files: dataTransfer.files } });
        }
    }, [fileObject]);

    return (
        <div className="form-group">
            <div className="file-input">
                <div className="file-input__wrapper">
                    <label htmlFor="file" className="file-input__label no-margin" tabIndex="0" ref={labelRef}>
                        <IoCloudUploadSharp /> Upload file
                    </label>
                    <input type="file" id="file" className="file-input__input" onChange={handleChange} required accept="audio/*" ref={fileInputRef} />
                    <span id="file-name" className="file-input__name">{fileName}</span>
                </div>
            </div>
        </div>
    );
};