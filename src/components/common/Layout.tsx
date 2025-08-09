import React from 'react';
import Box from '@mui/material/Box';
import Header from './Header';
import Navigation from '../navigation/Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header />
      <Navigation />
      {children}
    </Box>
  );
};

export default Layout;