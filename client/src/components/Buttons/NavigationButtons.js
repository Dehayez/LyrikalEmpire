import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import { IconButton } from '../Buttons';
import './NavigationButtons.scss';

const NavigationButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="navigation-buttons">
        <IconButton className="navigation-button" onClick={() => navigate(-1)}>
            <IoChevronBackSharp fontSize={24} />
        </IconButton>
        <IconButton className="navigation-button" onClick={() => navigate(1)}>
            <IoChevronForwardSharp fontSize={24} />
        </IconButton>
    </div>
  );
};

export default NavigationButtons;