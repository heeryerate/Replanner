import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  Snackbar,
  Drawer,
  ListItemButton,
  ListItemIcon as MuiListItemIcon,
  ListItemText as MuiListItemText,
  AppBar,
  Toolbar,
  Grid,
  FormControl,
  InputLabel,
  FormHelperText,
  useTheme,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  useMediaQuery,
  Popover,
  InputAdornment,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  DirectionsCar,
  Train,
  DirectionsBus,
  Flight,
  AttachMoney,
  Save,
  History,
  Home,
  Menu as MenuIcon,
  Close,
  TravelExplore,
  List as ListIcon,
  ViewList,
  PlayArrow,
  Delete,
  Edit,
  Share,
  ArrowBack,
  Map as MapIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NewPlan.css';
import { GOOGLE_MAPS_API_KEY } from '../config';
import { GoogleMap, useLoadScript, Polyline, Libraries } from '@react-google-maps/api';

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

// Update the LIBRARIES constant to include all required libraries
const LIBRARIES: Libraries = ['places', 'marker', 'geocoding', 'drawing', 'visualization'];

interface MapViewProps {
  plans: TripPlan[];
  isLoaded: boolean;
  loadError: Error | undefined | null;
}

const MapView: React.FC<MapViewProps> = ({ plans, isLoaded, loadError }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const theme = useTheme();

  const colors = [
    '#FF0000', // Red
    '#0000FF', // Blue
    '#00FF00', // Green
  ];

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    // Create markers and paths for each plan
    plans.forEach((plan, planIndex) => {
      const coordinates = plan.destinations
        .filter(dest => dest.coordinates)
        .map(dest => ({
          lat: dest.coordinates![0],
          lng: dest.coordinates![1]
        }));

      // Create markers for each destination
      coordinates.forEach((coord, index) => {
        const markerDiv = document.createElement('div');
        markerDiv.style.width = '20px';
        markerDiv.style.height = '20px';
        markerDiv.style.backgroundColor = colors[planIndex];
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

      // Draw path for this plan
      if (coordinates.length > 1) {
        new google.maps.Polyline({
          path: coordinates,
          map: mapRef.current,
          strokeColor: colors[planIndex],
          strokeWeight: 3,
          strokeOpacity: 0.8,
        });
      }
    });

    // Fit bounds to show all markers
    const bounds = new google.maps.LatLngBounds();
    plans.forEach(plan => {
      plan.destinations.forEach(dest => {
        if (dest.coordinates) {
          bounds.extend({ lat: dest.coordinates[0], lng: dest.coordinates[1] });
        }
      });
    });
    mapRef.current.fitBounds(bounds);
  }, [isLoaded, plans]);

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
        center={{ lat: 0, lng: 0 }}
        zoom={2}
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
      />
    </Box>
  );
};

const PlanGenerator: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [budget, setBudget] = useState<string>('5000');
  const [transportation, setTransportation] = useState<string>('car');
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<string[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<Destination[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'detailed' | 'concise' | 'map'>('detailed');
  const [newDestination, setNewDestination] = useState('');
  const [hoveredDestination, setHoveredDestination] = useState<Destination | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isAddingDestination, setIsAddingDestination] = useState(false);
  const [hoveredChip, setHoveredChip] = useState<Destination | null>(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
    version: 'weekly', // Use weekly version for latest features and bug fixes
  });

  // Add debug logging for state changes
  useEffect(() => {
    console.log('Destination Options updated:', destinationOptions);
  }, [destinationOptions]);

  useEffect(() => {
    console.log('Selected Destination IDs updated:', selectedDestinationIds);
  }, [selectedDestinationIds]);

  // Set default destinations when component mounts
  useEffect(() => {
    console.log('Component mounted, setting default destinations');
    const defaultDestinations: Destination[] = [
      {
        id: '1',
        name: 'Eiffel Tower',
        location: 'Paris, France',
        openHours: '9:00 AM - 12:45 AM',
        category: 'Landmark',
        preferences: ['Historical', 'Architecture'],
        summary: 'Iconic iron tower offering panoramic views of Paris'
      },
      {
        id: '2',
        name: 'Louvre Museum',
        location: 'Paris, France',
        openHours: '9:00 AM - 6:00 PM',
        category: 'Museum',
        preferences: ['Art', 'History'],
        summary: 'World\'s largest art museum and historic monument'
      },
      {
        id: '3',
        name: 'Notre-Dame Cathedral',
        location: 'Paris, France',
        openHours: '8:00 AM - 6:45 PM',
        category: 'Landmark',
        preferences: ['Historical', 'Architecture'],
        summary: 'Medieval Catholic cathedral with Gothic architecture'
      },
      {
        id: '4',
        name: 'Arc de Triomphe',
        location: 'Paris, France',
        openHours: '10:00 AM - 11:00 PM',
        category: 'Landmark',
        preferences: ['Historical', 'Architecture'],
        summary: 'Iconic triumphal arch honoring those who fought for France'
      }
    ];

    console.log('Setting default destinations:', defaultDestinations);
    setDestinationOptions(defaultDestinations);
    // Only select Eiffel Tower (id: '1') and Louvre Museum (id: '2')
    setSelectedDestinationIds(['1', '2']);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    console.log('Current state before submission:');
    console.log('Selected Destination IDs:', selectedDestinationIds);
    console.log('Destination Options:', destinationOptions);
    
    // Validate form
    if (!budget || Number(budget) <= 0 || !transportation || selectedDestinationIds.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        budget: Number(budget),
        transportation,
        destination_ids: selectedDestinationIds
      };

      console.log('Sending request data:', requestData);

      const response = await axios.post('http://localhost:5002/api/generate-plans', requestData);

      if (response.data.success) {
        setPlans(response.data.plans);
      } else {
        setError(response.data.message || 'Failed to generate plans');
      }
    } catch (err) {
      console.error('Error generating plans:', err);
      setError('Failed to generate plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDestination = (dest: Destination) => {
    if (!selectedDestinationIds.includes(dest.id)) {
      setSelectedDestinationIds(prev => [...prev, dest.id]);
    }
    setNewDestination('');
    setIsAddingDestination(false);
    setAnchorEl(null);
  };

  const handleAddDestination = () => {
    if (newDestination.trim()) {
      const newDest: Destination = {
        id: Date.now().toString(),
        name: newDestination,
        location: newDestination,
        openHours: '9:00 AM - 5:00 PM',
        category: 'Custom',
        preferences: [],
        summary: 'Custom destination added by user',
      };
      setDestinationOptions(prev => [...prev, newDest]);
      setSelectedDestinationIds(prev => [...prev, newDest.id]);
      setNewDestination('');
      setIsAddingDestination(false);
      setAnchorEl(null);
    }
  };

  const handleRemoveDestination = (destinationId: string) => {
    setSelectedDestinationIds(prev => prev.filter(id => id !== destinationId));
    // Regenerate plans when destinations change
    handleRegenerate();
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

  const handleSavePlan = async (plan: TripPlan) => {
    try {
      if (!GOOGLE_MAPS_API_KEY) {
        setSnackbarMessage('Google Maps API key is missing. Please check your .env file.');
        setSnackbarOpen(true);
        return;
      }

      // Get existing plans
      const savedPlans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
      
      // Geocode all destinations
      const geocodedDestinations = await Promise.all(
        plan.destinations.map(async (dest) => {
          try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(dest.location)}&key=${GOOGLE_MAPS_API_KEY}`
            );
            
            if (response.data.results && response.data.results.length > 0) {
              const location = response.data.results[0].geometry.location;
              return {
                ...dest,
                coordinates: [location.lat, location.lng] as [number, number]
              };
            }
            return dest;
          } catch (error) {
            console.error('Geocoding error for destination:', dest.location, error);
            return dest;
          }
        })
      );

      // Create new plan with geocoded destinations
      const newPlan = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        plan: {
          ...plan,
          destinations: geocodedDestinations
        },
      };

      // Save to localStorage
      savedPlans.unshift(newPlan);
      localStorage.setItem('savedPlans', JSON.stringify(savedPlans));
      
      setSnackbarMessage('Plan saved successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving plan:', error);
      setSnackbarMessage('Error saving plan. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleStartTrip = (plan: TripPlan) => {
    // Save the selected plan to localStorage for the trip
    localStorage.setItem('currentTrip', JSON.stringify(plan));
    navigate('/trip');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'History', icon: <History />, path: '/history' },
  ];

  const renderPlanCard = (plan: TripPlan, index: number) => {
    if (activeView !== 'detailed') return null;

    return (
      <Card
        key={index}
        sx={{
          mb: 3,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Plan {index + 1}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Save Plan">
                  <IconButton
                    onClick={() => handleSavePlan(plan)}
                    color="primary"
                  >
                    <Save />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Start Trip">
                  <IconButton
                    onClick={() => handleStartTrip(plan)}
                    color="success"
                  >
                    <PlayArrow />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          }
          subheader={
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                icon={<AttachMoney />}
                label={`$${plan.totalCost}`}
                color="primary"
                size="small"
              />
              <Chip
                icon={getTransportationIcon(plan.transportation)}
                label={plan.transportation}
                variant="outlined"
                size="small"
              />
            </Box>
          }
        />
        <CardContent>
          <List>
            {plan.destinations.map((dest, destIndex) => (
              <React.Fragment key={destIndex}>
                <ListItem
                  sx={{
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" color="primary">
                        {dest.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {dest.summary}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {dest.location}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {dest.openHours}
                            </Typography>
                          </Box>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                {destIndex < plan.destinations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Regenerate Plan
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderConciseView = () => {
    if (plans.length === 0) return null;

    return (
      <Paper elevation={2} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                {plans.map((plan, index) => (
                  <TableCell key={index} align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">Plan {index + 1}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Save Plan">
                            <IconButton
                              size="small"
                              onClick={() => handleSavePlan(plan)}
                              color="primary"
                            >
                              <Save fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Start Trip">
                            <IconButton
                              size="small"
                              onClick={() => handleStartTrip(plan)}
                              color="success"
                            >
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          icon={<AttachMoney />}
                          label={`$${plan.totalCost}`}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          icon={getTransportationIcon(plan.transportation)}
                          label={plan.transportation}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: Math.max(...plans.map(plan => plan.destinations.length)) }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell component="th" scope="row">
                    {rowIndex + 1}
                  </TableCell>
                  {plans.map((plan, planIndex) => (
                    <TableCell key={planIndex} align="center">
                      {plan.destinations[rowIndex] ? (
                        <Typography variant="body1">
                          {plan.destinations[rowIndex].name}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleSubmit}
            disabled={loading}
          >
            Regenerate Plans
          </Button>
        </Box>
      </Paper>
    );
  };

  const fuzzyMatch = (query: string, text: string): boolean => {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    let queryIndex = 0;
    let textIndex = 0;

    while (queryIndex < queryLower.length && textIndex < textLower.length) {
      if (queryLower[queryIndex] === textLower[textIndex]) {
        queryIndex++;
      }
      textIndex++;
    }
    return queryIndex === queryLower.length;
  };

  const filteredDestinations = destinationOptions
    .filter(dest => !selectedDestinationIds.some(selected => selected === dest.id))
    .filter(dest => 
      dest.name.toLowerCase().includes(newDestination.toLowerCase()) ||
      dest.location.toLowerCase().includes(newDestination.toLowerCase())
    );

  const handleBoxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsAddingDestination(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewDestination(value);
    if (value.trim()) {
      setAnchorEl(e.currentTarget);
      setIsAddingDestination(true);
    } else {
      setIsAddingDestination(false);
      setAnchorEl(null);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>, destination: Destination) => {
    setHoveredDestination(destination);
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setHoveredDestination(null);
    setAnchorEl(null);
  };

  const handleChipDelete = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    setHoveredChip(null);
    handleRemoveDestination(value);
  };

  const handleChipMouseEnter = (e: React.MouseEvent, dest: Destination) => {
    // Only show popover if not clicking delete button
    if (!(e.target as HTMLElement).closest('.MuiChip-deleteIcon')) {
      setHoveredChip(dest);
    }
  };

  const handleRegenerate = async () => {
    if (!budget || Number(budget) <= 0 || !transportation || selectedDestinationIds.length === 0) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentDestinations = selectedDestinationIds
        .map(id => destinationOptions.find(dest => dest.id === id))
        .filter((dest): dest is Destination => dest !== undefined);

      if (currentDestinations.length === 0) {
        throw new Error('No valid destinations selected');
      }

      const requestData = {
        budget: Number(budget),
        transportation,
        destination_ids: currentDestinations.map(dest => dest.id)
      };

      const response = await axios.post('http://localhost:5002/api/generate-plans', requestData);

      if (response.data.success) {
        setPlans(response.data.plans);
      } else {
        setError(response.data.message || 'Failed to generate plans');
      }
    } catch (err) {
      console.error('Error generating plans:', err);
      setError('Failed to generate plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Left side - Form */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Create New Travel Plan
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Fill in your preferences to generate a personalized travel itinerary
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 3 } }}>
              <TextField
                fullWidth
                label="Budget (USD)"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
                InputProps={{
                  startAdornment: <AttachMoney sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                helperText="Enter your total budget for the trip"
                sx={{ mb: 3 }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Transportation</InputLabel>
                <Select
                  value={transportation}
                  onChange={(e) => setTransportation(e.target.value as string)}
                  required
                  label="Transportation"
                >
                  <MenuItem value="car">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar />
                      <Typography>Car</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="train">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Train />
                      <Typography>Train</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="bus">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsBus />
                      <Typography>Bus</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="flight">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Flight />
                      <Typography>Flight</Typography>
                    </Box>
                  </MenuItem>
                </Select>
                <FormHelperText>Select your preferred mode of transportation</FormHelperText>
              </FormControl>

              <TextField
                fullWidth
                label="Add New Destination"
                value={newDestination}
                onChange={handleInputChange}
                onFocus={(e) => {
                  if (newDestination.trim()) {
                    setAnchorEl(e.currentTarget);
                    setIsAddingDestination(true);
                  }
                }}
                onBlur={(e) => {
                  // Only close if clicking outside the popover
                  if (!e.relatedTarget?.closest('.MuiPopover-root')) {
                    setIsAddingDestination(false);
                    setAnchorEl(null);
                  }
                }}
                InputProps={{
                  startAdornment: <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleAddDestination}
                        disabled={!newDestination.trim()}
                        edge="end"
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel shrink>Selected Destinations</InputLabel>
                <Box
                  sx={{
                    minHeight: 56,
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    borderRadius: 1,
                    p: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    '&:hover': {
                      borderColor: 'text.primary',
                    },
                    position: 'relative',
                    '&:focus-within': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                    mt: 1,
                  }}
                >
                  {selectedDestinationIds.map((value) => {
                    const dest = destinationOptions.find(d => d.id === value);
                    return (
                      <Chip
                        key={value}
                        label={dest?.name}
                        onDelete={(e) => handleChipDelete(e, value)}
                        onMouseEnter={(e) => dest && handleChipMouseEnter(e, dest)}
                        onMouseLeave={() => setHoveredChip(null)}
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                          '& .MuiChip-label': {
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading || !(budget && Number(budget) > 0 && transportation && selectedDestinationIds.length > 0) || isLoadingDestinations}
                size="large"
                sx={{ 
                  py: 1.5,
                  mt: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Generating Plans...
                  </>
                ) : (
                  'Generate Travel Plan'
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Generated Plans */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2">
                Generated Plans
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Detailed View">
                  <IconButton 
                    onClick={() => setActiveView('detailed')}
                    color={activeView === 'detailed' ? 'primary' : 'default'}
                  >
                    <ListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Concise View">
                  <IconButton 
                    onClick={() => setActiveView('concise')}
                    color={activeView === 'concise' ? 'primary' : 'default'}
                  >
                    <ViewList />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Map View">
                  <IconButton 
                    onClick={() => setActiveView('map')}
                    color={activeView === 'map' ? 'primary' : 'default'}
                  >
                    <MapIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {plans.length > 0 ? (
              <Box sx={{ height: 'calc(100vh - 300px)' }}>
                {activeView === 'detailed' && (
                  <List sx={{ height: '100%', overflow: 'auto' }}>
                    {plans.map((plan, index) => renderPlanCard(plan, index))}
                  </List>
                )}
                
                {activeView === 'concise' && (
                  <Box sx={{ height: '100%', overflow: 'auto' }}>
                    {renderConciseView()}
                  </Box>
                )}
                
                {activeView === 'map' && (
                  <Box sx={{ height: '100%' }}>
                    {!isLoaded ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : loadError ? (
                      <Alert severity="error">
                        Error loading Google Maps: {loadError.message}
                      </Alert>
                    ) : (
                      <MapView
                        plans={plans}
                        isLoaded={isLoaded}
                        loadError={loadError}
                      />
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px',
                }}
              >
                <TravelExplore sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No plans generated yet
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Fill in the form and click "Generate Travel Plan" to create your itinerary
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

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

      {/* Destination Details Popover */}
      <Popover
        open={Boolean(hoveredChip)}
        anchorEl={document.querySelector('.MuiChip-root:hover')}
        onClose={() => setHoveredChip(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          pointerEvents: 'none',
          '& .MuiPopover-paper': {
            pointerEvents: 'auto',
          },
        }}
      >
        {hoveredChip && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              {hoveredChip.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn fontSize="small" />
              <Typography variant="body2">
                {hoveredChip.location}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccessTime fontSize="small" />
              <Typography variant="body2">
                {hoveredChip.openHours}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {hoveredChip.summary}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {hoveredChip.preferences.map((pref, index) => (
                <Chip
                  key={index}
                  label={pref}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </Popover>

      {/* Destination Selection Popover */}
      <Popover
        open={isAddingDestination && Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => {
          setIsAddingDestination(false);
          setAnchorEl(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            width: anchorEl ? anchorEl.offsetWidth : 'auto',
            maxHeight: 200,
          },
        }}
      >
        <List 
          sx={{ 
            width: '100%',
            maxHeight: 200,
            overflow: 'auto',
            py: 0,
          }}
        >
          {filteredDestinations.map((dest) => (
            <ListItemButton
              key={dest.id}
              onClick={() => handleSelectDestination(dest)}
              sx={{
                py: 0.5,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2">
                    {dest.name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn fontSize="small" sx={{ fontSize: 14 }} />
                    <Typography variant="caption" color="text.secondary">
                      {dest.location}
                    </Typography>
                  </Box>
                }
                sx={{
                  my: 0,
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                  },
                  '& .MuiListItemText-secondary': {
                    fontSize: '0.75rem',
                  },
                }}
              />
            </ListItemButton>
          ))}
          {filteredDestinations.length === 0 && newDestination.trim() && (
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    No matches found
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    Press Enter to add as new destination
                  </Typography>
                }
                sx={{
                  my: 0,
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                  },
                  '& .MuiListItemText-secondary': {
                    fontSize: '0.75rem',
                  },
                }}
              />
            </ListItem>
          )}
        </List>
      </Popover>
    </Container>
  );
};

export default PlanGenerator; 