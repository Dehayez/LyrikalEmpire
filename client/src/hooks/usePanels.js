import { useState, useRef, useEffect } from 'react';
import { getInitialState } from '../utils';

export const usePanels = () => {
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(() => getInitialState('isLeftPanelVisible', false));
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(() => getInitialState('isRightPanelVisible', false));
  const [isLeftDivVisible, setIsLeftDivVisible] = useState(false);
  const [isRightDivVisible, setIsRightDivVisible] = useState(false);
  const [allowHover, setAllowHover] = useState(true);
  const hoverRefLeft = useRef(false);
  const hoverRefRight = useRef(false);

  const handleMouseEnterLeft = () => {
    if (!allowHover) return;
    hoverRefLeft.current = true;
    setIsLeftDivVisible(true);
  };

  const handleMouseLeaveLeft = () => {
    hoverRefLeft.current = false;
    if (!hoverRefLeft.current) {
      setIsLeftDivVisible(false);
    }
  };

  const handleMouseEnterRight = () => {
    if (!allowHover) return;
    hoverRefRight.current = true;
    setIsRightDivVisible(true);
  };

  const handleMouseLeaveRight = () => {
    hoverRefRight.current = false;
    if (!hoverRefRight.current) {
      setIsRightDivVisible(false);
    }
  };

  const toggleSidePanel = (panel) => {
    if (panel === 'left') {
      setIsLeftPanelVisible(!isLeftPanelVisible);
      setIsLeftDivVisible(!isLeftPanelVisible);
    } else if (panel === 'right') {
      setIsRightPanelVisible(!isRightPanelVisible);
      setIsRightDivVisible(!isRightPanelVisible);
    } else if (panel === 'both') {
      setIsLeftPanelVisible(!isLeftPanelVisible);
      setIsLeftDivVisible(!isLeftPanelVisible);
      setIsRightPanelVisible(!isRightPanelVisible);
      setIsRightDivVisible(!isRightPanelVisible);
    }
    setAllowHover(false);
    setTimeout(() => {
      setAllowHover(true);
    }, 200);
  };

  const closeSidePanel = (panel) => {
    if (panel === 'left' && isLeftPanelVisible) {
      setIsLeftPanelVisible(false);
      setIsLeftDivVisible(false);
      console.log('left');
    } else if (panel === 'right' && isRightPanelVisible) {
      setIsRightPanelVisible(false);
      setIsRightDivVisible(false);
    } else if (panel === 'both') {
      setIsLeftPanelVisible(false);
      setIsLeftDivVisible(false);
      setIsRightPanelVisible(false);
      setIsRightDivVisible(false);
    }
    setAllowHover(false);
    setTimeout(() => {
      setAllowHover(true);
    }, 200);
  };

  return {
    isLeftPanelVisible,
    isRightPanelVisible,
    isLeftDivVisible,
    isRightDivVisible,
    handleMouseEnterLeft,
    handleMouseLeaveLeft,
    handleMouseEnterRight,
    handleMouseLeaveRight,
    toggleSidePanel,
    closeSidePanel,
  };
};