import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import NewPlan from './components/NewPlan';
import HistoryPage from './components/HistoryPage';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new-plan" element={<NewPlan />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/trip" element={<div>Trip Page (Coming Soon)</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 