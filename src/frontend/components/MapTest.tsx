import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { GoogleMap, useLoadScript, Polyline, Libraries } from '@react-google-maps/api';

// Move libraries array outside the component
const LIBRARIES: Libraries = ['places', 'marker'];

const MapTest: React.FC = () => {
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyAR0RX3cykRgnYTMeJiBBNvGXLOxcQ4IwE',
    libraries: LIBRARIES,
    version: 'weekly',
    language: 'en',
    region: 'US'
  });

  // Hardcoded coordinates for Paris landmarks
  const coordinates = [
    { lat: 48.8584, lng: 2.2945 },  // Eiffel Tower
    { lat: 48.8606, lng: 2.3376 },  // Louvre Museum
    { lat: 48.8529, lng: 2.3499 },  // Notre-Dame Cathedral
    { lat: 48.8738, lng: 2.2950 },  // Arc de Triomphe
  ];

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

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
      <Typography variant="h6" gutterBottom>
        Google Maps Route Test
      </Typography>
      
      {mapError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mapError}
        </Alert>
      )}

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '600px' }}
        center={coordinates[0]} // Center on Eiffel Tower
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

export default MapTest; 