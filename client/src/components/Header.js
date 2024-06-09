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
};

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.navGroup}>
        <a style={styles.navLink} href="/">Home</a>
        <a style={styles.navLink} href="/tracks">Tracks</a>
        <div style={styles.logo}>Logo</div>
        <a style={styles.navLink} href="/info">Info</a>
        <a style={styles.navLink} href="/contact">Contact</a>
      </div>
    </header>
  );
}

export default Header;