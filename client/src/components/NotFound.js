import React from 'react';
import Button from './Buttons/Button';

const NotFound = () => {
  const handleGoHome = () => {
    window.location.replace('/');
  };

  return (
    <div>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Button text="Go Home" onClick={handleGoHome} />
    </div>
  );
};

export default NotFound;