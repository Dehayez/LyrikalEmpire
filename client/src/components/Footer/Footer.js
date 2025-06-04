import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from '../../assets/icons';
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
    <footer className="footer">
      {!isAuthPage && (
        <PanelToggle
          isPanelVisible={isLeftPanelVisible}
          isDivVisible={isLeftDivVisible}
          isHovered={isLeftHovered}
          setHovered={setIsLeftHovered}
          handleMouseEnter={handleMouseEnterLeft}
          handleMouseLeave={handleMouseLeaveLeft}
          handleClick={() => handleClickPanel('left')}
          position="left"
        />
      )}

      {isDashboard && (
        <>
          <NavigationButtons />
          <Breadcrumb />
        </>
      )}

      <div className="footer__nav-group" onClick={handleHomepageClick}>
        <Link to="/">
            <IconButton bottomLabel="Home">
                <Home/>
            </IconButton>
        </Link>
      </div>

      {!isAuthPage && (
        <PanelToggle
          isPanelVisible={isRightPanelVisible}
          isDivVisible={isRightDivVisible}
          isHovered={isRightHovered}
          setHovered={setIsRightHovered}
          handleMouseEnter={handleMouseEnterRight}
          handleMouseLeave={handleMouseLeaveRight}
          handleClick={() => handleClickPanel('right')}
          position="right"
        />
      )}
    </footer>
  );
};

export default Footer;