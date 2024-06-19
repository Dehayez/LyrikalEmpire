import React from 'react';
import './Header.scss';

const Header = () => (
  <header className="header">
    <div className="header__nav-group">
      <a className="header__nav-link" href="/"></a>
      <a className="header__nav-link" href="/beats"></a>
      <img className="header__nav-logo" src="/android-chrome-192x192.png" alt="Logo" />
      <a className="header__nav-link" href="/info"></a>
      <a className="header__nav-link" href="/contact"></a>
    </div>
  </header>
);

export default Header;