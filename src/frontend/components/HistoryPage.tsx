import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  useMediaQuery,
  useTheme,
  Tooltip,
  ListItemButton,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  DirectionsCar,
  Train,
  DirectionsBus,
  Flight,
  AttachMoney,
  Delete,
  Edit,
  Share,
  ArrowBack,
  Map as MapIcon,
  List as ListIcon,
  PlayArrow,
  TravelExplore,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useLoadScript, Polyline, Libraries } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../config';

interface SavedPlan {
  id: string;
  date: string;
  plan: {
    destinations: Array<{
      id: string;
      name: string;
      location: string;
      openHours: string;
      category: string;
      preferences: string[];
      summary: string;
      coordinates?: [number, number] | null;
    }>;
    totalCost: number;
    transportation: string;
  };
}

// Define libraries as a static constant outside the component
const LIBRARIES: Libraries = ['places', 'marker', 'geocoding'];

interface MapViewProps {
  coordinates: Array<{ lat: number; lng: number }>;
  isLoaded: boolean;
  loadError: Error | undefined | null;
}

const MapView: React.FC<MapViewProps> = ({ coordinates, isLoaded, loadError }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || coordinates.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    // Create new markers
    coordinates.forEach((coord, index) => {
      const markerDiv = document.createElement('div');
      markerDiv.style.width = '20px';
      markerDiv.style.height = '20px';
      markerDiv.style.backgroundColor = '#FF0000';
      markerDiv.style.border = '2px solid #FFFFFF';
      markerDiv.style.borderRadius = '50%';
      markerDiv.style.display = 'flex';
      markerDiv.style.alignItems = 'center';
      markerDiv.style.justifyContent = 'center';
      markerDiv.style.color = '#FFFFFF';
      markerDiv.style.fontWeight = 'bold';
      markerDiv.style.fontSize = '12px';
      markerDiv.textContent = (index + 1).toString();

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: coord,
        content: markerDiv,
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach(coord => bounds.extend(coord));
    mapRef.current.fitBounds(bounds);
  }, [isLoaded, coordinates]);

  if (loadError) {
    return (
      <Alert severity="error">
        Error loading Google Maps: {loadError.message}
      </Alert>
    );
  }

  if (!isLoaded) {
    return (
      <Alert severity="info">
        Loading Google Maps...
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '600px', width: '100%', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '600px' }}
        center={coordinates[0]}
        zoom={13}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          mapId: '367c8f17c8155296'
        }}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        {/* Draw the route line */}
        {coordinates.length > 1 && (
          <Polyline
            path={coordinates}
            options={{
              strokeColor: '#FF0000',
              strokeWeight: 5,
              strokeOpacity: 1,
              geodesic: false,
            }}
          />
        )}
      </GoogleMap>
    </Box>
  );
};

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [mapError, setMapError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
    version: 'weekly',
    language: 'en',
    region: 'US'
  });

  useEffect(() => {
    console.log('Google Maps API Key:', GOOGLE_MAPS_API_KEY);
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('API key is missing from config');
      setMapError('Google Maps API key is missing. Please check your .env file.');
      return;
    }

    if (loadError) {
      console.error('Google Maps loading error:', loadError);
      setMapError('Failed to load Google Maps. Please check your API key and internet connection.');
    }
  }, [loadError]);

  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    if (!window.google) return null;
    
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ address });
      
      if (response.results.length > 0) {
        const location = response.results[0].geometry.location;
        return [location.lat(), location.lng()];
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const updatePlanCoordinates = async (plan: SavedPlan): Promise<SavedPlan> => {
    setIsGeocoding(true);
    try {
      const updatedDestinations = await Promise.all(
        plan.plan.destinations.map(async (dest) => {
          if (dest.coordinates) return dest;
          
          const coords = await geocodeAddress(dest.location);
          return {
            ...dest,
            coordinates: coords || undefined
          };
        })
      );

      const updatedPlan = {
        ...plan,
        plan: {
          ...plan.plan,
          destinations: updatedDestinations
        }
      };

      // Update the plan in localStorage
      const updatedPlans = savedPlans.map(p => 
        p.id === plan.id ? updatedPlan : p
      );
      localStorage.setItem('savedPlans', JSON.stringify(updatedPlans));
      setSavedPlans(updatedPlans);

      return updatedPlan;
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    const loadSavedPlans = () => {
      const plans = localStorage.getItem('savedPlans');
      if (plans) {
        setSavedPlans(JSON.parse(plans));
      }
    };
    loadSavedPlans();
  }, []);

  const handlePlanSelect = async (plan: SavedPlan) => {
    setSelectedPlan(plan);
    
    // Check if any destinations need coordinates
    const needsCoordinates = plan.plan.destinations.some(dest => !dest.coordinates);
    if (needsCoordinates) {
      const updatedPlan = await updatePlanCoordinates(plan);
      setSelectedPlan(updatedPlan);
    }
  };

  const handleDeleteClick = (planId: string) => {
    setPlanToDelete(planId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (planToDelete) {
      const updatedPlans = savedPlans.filter(plan => plan.id !== planToDelete);
      setSavedPlans(updatedPlans);
      localStorage.setItem('savedPlans', JSON.stringify(updatedPlans));
      setSnackbarMessage('Plan deleted successfully');
      setSnackbarOpen(true);
      
      // If the deleted plan was selected, clear the selection
      if (selectedPlan?.id === planToDelete) {
        setSelectedPlan(null);
      }
    }
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };

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
        return <DirectionsCar />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'map' : 'list');
  };

  const handleStartTrip = (plan: SavedPlan) => {
    // Save the selected plan to localStorage for the trip
    localStorage.setItem('currentTrip', JSON.stringify(plan.plan));
    navigate('/trip');
  };

  const renderMap = (plan: SavedPlan) => {
    if (!isLoaded) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (mapError) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {mapError}
        </Alert>
      );
    }

    const coordinates = plan.plan.destinations
      .filter(dest => dest.coordinates)
      .map(dest => ({
        lat: dest.coordinates![0],
        lng: dest.coordinates![1]
      }));

    if (coordinates.length === 0) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No valid coordinates found for this plan. Please try saving the plan again.
        </Alert>
      );
    }

    return (
      <MapView
        coordinates={coordinates}
        isLoaded={isLoaded}
        loadError={loadError}
      />
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Saved Travel Plans
      </Typography>

      <Grid container spacing={3}>
        {/* Left side - Plans List */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
            {savedPlans.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TravelExplore sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No saved plans yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate and save plans to see them here
                </Typography>
              </Box>
            ) : (
              <List>
                {savedPlans.map((plan) => (
                  <ListItem
                    key={plan.id}
                    sx={{
                      mb: 2,
                      backgroundColor: selectedPlan?.id === plan.id ? 'action.selected' : 'background.paper',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemButton
                      onClick={() => handlePlanSelect(plan)}
                      sx={{ py: 2 }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">
                              {new Date(plan.date).toLocaleDateString()}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip
                                icon={<AttachMoney />}
                                label={`$${plan.plan.totalCost}`}
                                color="primary"
                                size="small"
                              />
                              <Chip
                                icon={getTransportationIcon(plan.plan.transportation)}
                                label={plan.plan.transportation}
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {plan.plan.destinations.map(dest => dest.name).join(' → ')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Start Trip">
                        <IconButton
                          onClick={() => handleStartTrip(plan)}
                          color="success"
                        >
                          <PlayArrow />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Plan">
                        <IconButton
                          onClick={() => handleDeleteClick(plan.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Right side - Map View */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: 'calc(100vh - 200px)' }}>
            {selectedPlan ? (
              <Box sx={{ height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {new Date(selectedPlan.date).toLocaleDateString()}
                </Typography>
                {renderMap(selectedPlan)}
              </Box>
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <MapIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a plan to view on map
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this plan? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HistoryPage; 