import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabValue = () => {
    switch (location.pathname) {
      case '/create':
        return 0;
      case '/preview':
        return 1;
      case '/myforms':
        return 2;
      default:
        return 0;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/create');
        break;
      case 1:
        navigate('/preview');
        break;
      case 2:
        navigate('/myforms');
        break;
    }
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs 
        value={getTabValue()} 
        onChange={handleTabChange}
        centered
      >
        <Tab label="Create" />
        <Tab label="Preview" />
        <Tab label="My Forms" />
      </Tabs>
    </Box>
  );
};

export default Navigation;