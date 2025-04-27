import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewPlan from '../NewPlan';

// Mock the fetch function
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NewPlan Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <NewPlan />
      </BrowserRouter>
    );
  };

  it('renders the form with all required fields', () => {
    renderComponent();
    
    expect(screen.getByRole('spinbutton', { name: /budget/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate plan/i })).toBeInTheDocument();
  });

  it('validates budget input to be non-negative', () => {
    renderComponent();
    
    const budgetInput = screen.getByRole('spinbutton', { name: /budget/i });
    fireEvent.change(budgetInput, { target: { value: '-100' } });
    
    expect(budgetInput).toHaveValue(-100);
  });

  it('handles form submission and successful plan generation', async () => {
    const mockResponse = {
      destinations: [
        {
          name: 'Test Destination',
          location: 'Test Location',
          openHours: '9:00 AM - 5:00 PM',
          cost: 50
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    renderComponent();

    // Fill in the form
    fireEvent.change(screen.getByRole('spinbutton', { name: /budget/i }), { target: { value: '100' } });
    
    // Select transportation method
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    const option = screen.getByRole('option', { name: /walking/i });
    fireEvent.click(option);

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /generate plan/i }));

    // Check loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for the response
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/generate-plans',
        expect.any(Object)
      );
    });

    // Check if the plan was saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'savedPlans',
      expect.any(String)
    );

    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    renderComponent();

    // Fill in the form
    fireEvent.change(screen.getByRole('spinbutton', { name: /budget/i }), { target: { value: '100' } });
    
    // Select transportation method
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    const option = screen.getByRole('option', { name: /walking/i });
    fireEvent.click(option);

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /generate plan/i }));

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('displays generated destinations when available', async () => {
    const mockResponse = {
      destinations: [
        {
          name: 'Test Destination',
          location: 'Test Location',
          openHours: '9:00 AM - 5:00 PM',
          cost: 50
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    renderComponent();

    // Fill in and submit the form
    fireEvent.change(screen.getByRole('spinbutton', { name: /budget/i }), { target: { value: '100' } });
    
    // Select transportation method
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    const option = screen.getByRole('option', { name: /walking/i });
    fireEvent.click(option);
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /generate plan/i }));

    // Wait for the destinations to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Destination')).toBeInTheDocument();
      expect(screen.getByText('Test Location')).toBeInTheDocument();
      expect(screen.getByText(/open hours/i)).toBeInTheDocument();
      expect(screen.getByText(/\$50/i)).toBeInTheDocument();
    });
  });
}); 