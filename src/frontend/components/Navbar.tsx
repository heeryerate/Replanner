import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  Home,
  AddCircle,
  History,
} from '@mui/icons-material';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: 2,
        '& .MuiButton-root': {
          color: '#1976d2',
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
        },
        '& .MuiButton-root:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
        },
        '& .MuiButton-root.Mui-selected': {
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
        }
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: '#1976d2',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          Replanner
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{ 
              backgroundColor: isActive('/') ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
            }}
          >
            Home
          </Button>
          <Button
            startIcon={<AddCircle />}
            onClick={() => navigate('/new-plan')}
            sx={{ 
              backgroundColor: isActive('/new-plan') ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
            }}
          >
            New Plan
          </Button>
          <Button
            startIcon={<History />}
            onClick={() => navigate('/history')}
            sx={{ 
              backgroundColor: isActive('/history') ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
            }}
          >
            History
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 