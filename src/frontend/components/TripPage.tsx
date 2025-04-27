import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  CheckCircle,
  RadioButtonUnchecked,
  ArrowBack,
  Map as MapIcon,
  DirectionsWalk,
  DirectionsCar,
  Train,
  DirectionsBus,
  Flight,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Destination {
  id: string;
  name: string;
  location: string;
  openHours: string;
  category: string;
  preferences: string[];
  summary: string;
  coordinates?: [number, number] | null;
}

interface TripPlan {
  destinations: Destination[];
  totalCost: number;
  transportation: string;
}

const TripPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<TripPlan | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load the current trip plan from localStorage
    const loadTripPlan = () => {
      try {
        const savedTrip = localStorage.getItem('currentTrip');
        if (savedTrip) {
          setCurrentPlan(JSON.parse(savedTrip));
        } else {
          setError('No trip plan found. Please create a plan first.');
        }
      } catch (err) {
        setError('Error loading trip plan. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTripPlan();
  }, []);

  const getTransportationIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <DirectionsCar />;
      case 'train':
        return <Train />;
      case 'bus':
        return <DirectionsBus />;
      case 'flight':
        return <Flight />;
      default:
        return <DirectionsWalk />;
    }
  };

  const handleNext = () => {
    if (currentPlan && currentStep < currentPlan.destinations.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Save trip completion status
    const completedTrips = JSON.parse(localStorage.getItem('completedTrips') || '[]');
    completedTrips.push({
      ...currentPlan,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem('completedTrips', JSON.stringify(completedTrips));
    
    // Navigate back to history
    navigate('/history');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          variant="outlined"
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  if (!currentPlan) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Your Trip
          </Typography>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            variant="outlined"
          >
            Back
          </Button>
        </Box>

        <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
          {currentPlan.destinations.map((destination, index) => (
            <Step key={destination.id}>
              <StepLabel>
                {destination.name}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Destination: {currentPlan.destinations[currentStep].name}
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LocationOn />
                </ListItemIcon>
                <ListItemText
                  primary="Location"
                  secondary={currentPlan.destinations[currentStep].location}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTime />
                </ListItemIcon>
                <ListItemText
                  primary="Opening Hours"
                  secondary={currentPlan.destinations[currentStep].openHours}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Description"
                  secondary={currentPlan.destinations[currentStep].summary}
                />
              </ListItem>
            </List>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {currentPlan.destinations[currentStep].preferences.map((pref, index) => (
                <Chip
                  key={index}
                  label={pref}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={currentStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Previous
          </Button>
          {currentStep === currentPlan.destinations.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleComplete}
            >
              Complete Trip
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next Destination
            </Button>
          )}
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Trip Summary
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              {getTransportationIcon(currentPlan.transportation)}
            </ListItemIcon>
            <ListItemText
              primary="Transportation"
              secondary={currentPlan.transportation}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTime />
            </ListItemIcon>
            <ListItemText
              primary="Estimated Duration"
              secondary={`${currentPlan.destinations.length * 2} hours`}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocationOn />
            </ListItemIcon>
            <ListItemText
              primary="Total Destinations"
              secondary={currentPlan.destinations.length}
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default TripPage; 