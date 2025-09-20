/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Footer from '../../components/Footer';
import userEvent from '@testing-library/user-event';

describe('Footer component', () => {
  test('renders landing page footer content', () => {
    render(<Footer pageType="landing" />);

    // Footer text
    expect(screen.getByText(/EcoVibe Kenya/i)).toBeInTheDocument();

    // Legal links
    const privacyLink = screen.getByText(/Privacy Policy/i);
    const termsLink = screen.getByText(/Terms and Conditions/i);
    expect(privacyLink).toBeInTheDocument();
    expect(termsLink).toBeInTheDocument();
    expect(privacyLink).toHaveClass('legal-link');
    expect(termsLink).toHaveClass('legal-link');

    // Nav links
    const quickLinks = screen.getByText(/Quick Links/i);
    const blogsLink = screen.getByText(/Blogs/i);
    const loginLink = screen.getByText(/Login/i);
    expect(quickLinks).toBeInTheDocument();
    expect(blogsLink).toBeInTheDocument();
    expect(loginLink).toBeInTheDocument();
    expect(quickLinks).toHaveClass('nav-link');
    expect(blogsLink).toHaveClass('nav-link');
    expect(loginLink).toHaveClass('nav-link');

    // Social icons (Instagram/LinkedIn)
    const instagramLink = screen.getByRole('link', { name: /instagram/i });
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com');
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com');
    expect(instagramLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
  });

  test('does not render footer for unknown pageType', () => {
    render(<Footer pageType="client" />);
    expect(screen.queryByText(/EcoVibe Kenya/i)).not.toBeInTheDocument();
  });

  test('does not render footer for pageType="unknown"', () => {
    render(<Footer pageType="unknown" />);
    expect(screen.queryByText(/EcoVibe Kenya/i)).not.toBeInTheDocument();
  });
});
