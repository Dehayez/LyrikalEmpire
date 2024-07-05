import React from 'react';
import { IoCloudUploadSharp } from "react-icons/io5";
import './Inputs.scss';

export const FileInput = ({ fileName, onChange }) => (
    <div className="form-group">
        <label>Audio</label>
        <div className="file-input">
            <div className="file-input__wrapper">
                <label htmlFor="file" className="file-input__label no-margin" tabIndex="0">
                    <IoCloudUploadSharp /> Upload File
                </label>
                <input type="file" id="file" className="file-input__input" onChange={onChange} required accept="audio/*" />
                <span id="file-name" className="file-input__name">{fileName}</span>
            </div>
        </div>
    </div>
);