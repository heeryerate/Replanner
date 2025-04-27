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
  Chip,
  Autocomplete,
  Rating,
  Divider,
  ButtonGroup,
} from '@mui/material';

interface Destination {
  id: string;
  name: string;
  location: string;
  openHours: string;
  category: string;
  preferences: string[];
  personalRating?: number;
  summary?: string;
}

interface Plan {
  budget: number;
  transportation: string;
  destinations: Destination[];
}

const NewPlan: React.FC = () => {
  const [plan, setPlan] = useState<Plan>({
    budget: 0,
    transportation: '',
    destinations: [],
  });

  // Mock destinations data - in a real app, this would come from an API
  const availableDestinations: Destination[] = [
    {
      id: '1',
      name: 'Eiffel Tower',
      location: 'Paris, France',
      openHours: '9:00 AM - 11:45 PM',
      category: 'Landmark',
      preferences: ['Historical', 'Scenic', 'Popular'],
      summary: 'Iconic iron lattice tower offering panoramic views of Paris',
    },
    {
      id: '2',
      name: 'Louvre Museum',
      location: 'Paris, France',
      openHours: '9:00 AM - 6:00 PM',
      category: 'Museum',
      preferences: ['Art', 'Historical', 'Cultural'],
      summary: 'World\'s largest art museum and historic monument',
    },
    // Add more destinations as needed
  ];

  const handleBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlan((prev) => ({
      ...prev,
      budget: Number(event.target.value),
    }));
  };

  const handleTransportationChange = (event: SelectChangeEvent<string>) => {
    setPlan((prev) => ({
      ...prev,
      transportation: event.target.value,
    }));
  };

  const handleDestinationSelect = (event: React.SyntheticEvent, value: Destination[]) => {
    setPlan((prev) => ({
      ...prev,
      destinations: value,
    }));
  };

  const handleRatingChange = (destinationId: string, newValue: number | null) => {
    setPlan((prev) => ({
      ...prev,
      destinations: prev.destinations.map(dest => 
        dest.id === destinationId 
          ? { ...dest, personalRating: newValue || 0 }
          : dest
      ),
    }));
  };

  const handleSummaryChange = (destinationId: string, newSummary: string) => {
    setPlan((prev) => ({
      ...prev,
      destinations: prev.destinations.map(dest => 
        dest.id === destinationId 
          ? { ...dest, summary: newSummary }
          : dest
      ),
    }));
  };

  const handleStartPlan = () => {
    // TODO: Implement plan starting logic
    console.log('Starting plan:', plan);
  };

  const handleSavePlan = () => {
    // TODO: Implement plan saving logic
    console.log('Saving plan:', plan);
  };

  const isFormComplete = plan.budget > 0 && 
                        plan.transportation !== '' && 
                        plan.destinations.length > 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Plan
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Budget"
              type="number"
              value={plan.budget}
              onChange={handleBudgetChange}
              InputProps={{
                startAdornment: <Typography>$</Typography>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Transportation</InputLabel>
              <Select
                value={plan.transportation}
                onChange={handleTransportationChange}
                label="Transportation"
              >
                <MenuItem value="flight">Flight</MenuItem>
                <MenuItem value="train">Train</MenuItem>
                <MenuItem value="bus">Bus</MenuItem>
                <MenuItem value="car">Car</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={availableDestinations}
              getOptionLabel={(option) => option.name}
              value={plan.destinations}
              onChange={handleDestinationSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Destinations"
                  placeholder="Search destinations"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography>{option.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.location}
                    </Typography>
                  </Box>
                </li>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>

          {plan.destinations.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Selected Destinations
              </Typography>
              <Grid container spacing={2}>
                {plan.destinations.map((destination) => (
                  <Grid item xs={12} sm={6} md={4} key={destination.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{destination.name}</Typography>
                        <Typography color="text.secondary">
                          {destination.location}
                        </Typography>
                        <Typography variant="body2">
                          Hours: {destination.openHours}
                        </Typography>
                        <Typography variant="body2">
                          Category: {destination.category}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {destination.preferences.map((pref) => (
                            <Chip
                              key={pref}
                              label={pref}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Personal Rating
                          </Typography>
                          <Rating
                            value={destination.personalRating || 0}
                            onChange={(event, newValue) => 
                              handleRatingChange(destination.id, newValue)
                            }
                          />
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Personal Summary
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={destination.summary || ''}
                            onChange={(e) => 
                              handleSummaryChange(destination.id, e.target.value)
                            }
                            placeholder="Add your personal notes about this destination"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleStartPlan}
                size="large"
                disabled={!isFormComplete}
              >
                Start Plan
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSavePlan}
                size="large"
                disabled={!isFormComplete}
              >
                Save to History
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default NewPlan; 