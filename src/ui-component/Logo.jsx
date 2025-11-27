import React from 'react';
import iconLogo from 'assets/images/logoTracker.png'; // Make sure path is correct

const Logo = () => {
  return (
    <img
      src={iconLogo}
      alt="Activity Tracker Logo"
      style={{ width: '120px', height: 'auto' }}
    />
  );
};

export const IconLogo = () => {
  return (
    <img
      src={iconLogo}
      alt="Small Logo"
      style={{ width: '40px', height: 'auto' }}
    />
  );
};

export default Logo;
