import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Replanner
        </Typography>
        <Button
          color="inherit"
          component={Link}
          to="/"
          sx={{ mr: 2 }}
        >
          Home
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/new-plan"
          sx={{ mr: 2 }}
        >
          New Plan
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/history"
        >
          History
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 