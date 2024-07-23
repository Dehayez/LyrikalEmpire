import React from 'react';
import { IoAlertCircleOutline } from 'react-icons/io5';
import './Warning.scss';

const Warning = ({ message }) => (
    <div className="warning">
        <IoAlertCircleOutline className="warning__icon"/>
        <p className="warning__text">{message}</p>
    </div>
);

export default Warning;