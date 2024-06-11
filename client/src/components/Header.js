import React from 'react';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 0',
    width: '100%',
  },
  navGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  navLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  navLogo: {
    width: '30px',
  }
};

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.navGroup}>
        <a style={styles.navLink} href="/">Home</a>
        <a style={styles.navLink} href="/tracks">Tracks</a>
        <img style={styles.navLogo} src="/android-chrome-192x192.png" alt="Logo" />
        <a style={styles.navLink} href="/info">Info</a>
        <a style={styles.navLink} href="/contact">Contact</a>
      </div>
    </header>
  );
}

export default Header;