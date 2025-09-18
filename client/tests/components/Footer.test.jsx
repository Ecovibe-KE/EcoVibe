/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Footer from '../../components/Footer'; 


describe('Footer component', () => {
  test('renders landing page footer content', () => {
    render(<Footer pageType="landing" />);
    // Adjust text to match your actual Footer content for landing
    expect(screen.getByText(/copyright/i)).toBeInTheDocument();
  });

  test('renders client page footer content', () => {
    render(<Footer pageType="client" />);
    // Adjust text to match your actual Footer content for client
    expect(screen.getByText(/client/i)).toBeInTheDocument();
  });

  test('renders safely when pageType is unknown', () => {
    render(<Footer pageType="unknown" />);
    // Should render without crashing; fallback to landing-like content
    expect(screen.getByText(/copyright/i)).toBeInTheDocument();
  });
});
