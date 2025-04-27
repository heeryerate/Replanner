import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
} from '@mui/material';

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardHeader
          title="Welcome to Replanner"
          titleTypographyProps={{ variant: 'h3', align: 'center' }}
        />
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Plan Your Perfect Trip
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Create personalized travel plans based on your preferences and budget.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/new-plan')}
              sx={{ mt: 2 }}
            >
              Create New Plan
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MainPage; 