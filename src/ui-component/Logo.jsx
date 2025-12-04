import React from 'react';
import iconLogo from 'assets/images/logo-icon.svg'; 

const Logo = () => {
  return (
    <img
      src={iconLogo}
      alt="Activity Tracker Logo"
      style={{ width: '80px', height: '60px' }}
    />
  );
};

export const IconLogo = () => {
  return (
    <img
      src={iconLogo}
      alt="Small Logo"
      style={{ width: '40px', height: '40px' }}
    />
  );
};

export default Logo;
