
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Playground from '../../src/components/Playground';

describe('Playground Component', () => {
  test('renders playground component', () => {
    render(<Playground />);
    expect(screen.getByText(/playground/i)).toBeInTheDocument();
  });
});