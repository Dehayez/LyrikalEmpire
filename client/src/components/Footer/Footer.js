import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, HomeFill } from '../../assets/icons';
import { isMobileOrTablet } from '../../utils';
import { IconButton, NavigationButtons } from '../Buttons';
import { Breadcrumb } from '../Breadcrumb';
import { PanelToggle } from '../PanelToggle';

import './Footer.scss';

const Footer = ({
  isLeftPanelVisible,
  isRightPanelVisible,
  toggleSidePanel,
  handleMouseEnterLeft,
  handleMouseLeaveLeft,
  handleMouseEnterRight,
  handleMouseLeaveRight,
  isLeftDivVisible,
  isRightDivVisible,
  isAuthPage,
  closeSidePanel,
  lyricsModal,
}) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);

  const handleClickPanel = (panel) => {
    if (isMobileOrTablet()) {
      if (panel === 'left' && isRightPanelVisible) toggleSidePanel('right');
      if (panel === 'right' && isLeftPanelVisible) toggleSidePanel('left');
    }
    toggleSidePanel(panel);
  };

  const handleHomepageClick = () => {
    if (isMobileOrTablet()) closeSidePanel('both');
  };

  return (
    <footer className={`footer ${lyricsModal ? 'footer--lyrics-modal-open' : ''}`}>
        {!isAuthPage && (
            <PanelToggle
              className="footer__item footer__item--left"
              isPanelVisible={isLeftPanelVisible}
              isDivVisible={isLeftDivVisible}
              isHovered={isLeftHovered}
              setHovered={setIsLeftHovered}
              handleMouseEnter={handleMouseEnterLeft}
              handleMouseLeave={handleMouseLeaveLeft}
              handleClick={() => handleClickPanel('left')}
              position="left"
              active={isLeftPanelVisible}
            />
        )}

        {isDashboard && (
            <>
            <NavigationButtons />
            <Breadcrumb />
            </>
        )}

        <div className="footer__item" onClick={handleHomepageClick}>
            <Link to="/">
              <IconButton active={location.pathname === '/' && !isLeftPanelVisible && !isRightPanelVisible}>
                {location.pathname === '/' && !isLeftPanelVisible && !isRightPanelVisible ? <HomeFill /> : <Home />}
              </IconButton>
            </Link>
        </div>

        {!isAuthPage && (
            <PanelToggle
              className="footer__item footer__item--right"
              isPanelVisible={isRightPanelVisible}
              isDivVisible={isRightDivVisible}
              isHovered={isRightHovered}
              setHovered={setIsRightHovered}
              handleMouseEnter={handleMouseEnterRight}
              handleMouseLeave={handleMouseLeaveRight}
              handleClick={() => handleClickPanel('right')}
              position="right"
              active={isRightPanelVisible} 
            />
        )}
    </footer>
  );
};

export default Footer;