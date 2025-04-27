import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  SelectChangeEvent,
} from '@mui/material';

interface TripOption {
  id: string;
  destination: string;
  transportation: string;
  accommodation: string;
  duration: string;
  cost: number;
}

const TripPlanner: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState('');
  const [preferences, setPreferences] = useState({
    budget: '',
    duration: '',
    transportation: '',
    accommodation: '',
  });
  const [tripOptions, setTripOptions] = useState<TripOption[]>([]);

  const handlePreferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async () => {
    // TODO: Implement API call to get trip options
    // For now, we'll use mock data
    const mockOptions: TripOption[] = [
      {
        id: '1',
        destination: 'Paris',
        transportation: 'Flight',
        accommodation: 'Hotel',
        duration: '5 days',
        cost: 1200,
      },
      {
        id: '2',
        destination: 'Rome',
        transportation: 'Train',
        accommodation: 'Airbnb',
        duration: '4 days',
        cost: 900,
      },
    ];
    setTripOptions(mockOptions);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Trip Replanner
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Current Location"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Budget"
              name="budget"
              value={preferences.budget}
              onChange={handlePreferenceChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duration"
              name="duration"
              value={preferences.duration}
              onChange={handlePreferenceChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Transportation</InputLabel>
              <Select
                name="transportation"
                value={preferences.transportation}
                onChange={handleSelectChange}
                label="Transportation"
              >
                <MenuItem value="flight">Flight</MenuItem>
                <MenuItem value="train">Train</MenuItem>
                <MenuItem value="bus">Bus</MenuItem>
                <MenuItem value="car">Car</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Accommodation</InputLabel>
              <Select
                name="accommodation"
                value={preferences.accommodation}
                onChange={handleSelectChange}
                label="Accommodation"
              >
                <MenuItem value="hotel">Hotel</MenuItem>
                <MenuItem value="airbnb">Airbnb</MenuItem>
                <MenuItem value="hostel">Hostel</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              fullWidth
            >
              Find Options
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Available Options
          </Typography>
          <Grid container spacing={2}>
            {tripOptions.map((option) => (
              <Grid item xs={12} sm={6} md={4} key={option.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{option.destination}</Typography>
                    <Typography>Transport: {option.transportation}</Typography>
                    <Typography>Stay: {option.accommodation}</Typography>
                    <Typography>Duration: {option.duration}</Typography>
                    <Typography>Cost: ${option.cost}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default TripPlanner; 