import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders EstateVal AI branding and navigation', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const brandElements = screen.getAllByText(/EstateVal AI/i);
  expect(brandElements.length).toBeGreaterThan(0);

  const runValuationBtn = screen.getByRole('link', { name: /Run Valuation/i });
  expect(runValuationBtn).toBeInTheDocument();
});
