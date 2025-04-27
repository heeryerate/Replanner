import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PlayArrow } from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleStartTrip = () => {
    // Check if there's a current trip in progress
    const currentTrip = localStorage.getItem('currentTrip');
    if (currentTrip) {
      navigate('/trip');
    } else {
      navigate('/new-plan');
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            maxWidth: 600,
            width: '100%',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to Replanner
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Your intelligent travel companion that helps you explore and navigate your journey
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleStartTrip}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              },
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            Start Your Trip!
          </Button>
          <Typography variant="body2" color="text.secondary">
            Choose a plan from your history or create a new one to begin your adventure
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage; 