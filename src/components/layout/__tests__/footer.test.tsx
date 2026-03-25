import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '../footer';
import { FooterSection } from '../footer-section';

// Mock Next.js components
jest.mock('next/link', () => {
  return function Link({ children, href, ...props }: unknown) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Footer Component', () => {
  it('renders main footer content', () => {
    render(<Footer />);
    
    // Check main sections
    expect(screen.getByText('BKK Honest')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('displays copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} BKK Honest. All rights reserved.`)).toBeInTheDocument();
  });

  it('contains key navigation links', () => {
    render(<Footer />);
    
    expect(screen.getByText('About BKK Honest')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Community Guidelines')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('displays social media links', () => {
    render(<Footer />);
    
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
  });

  it('shows Bangkok branding elements', () => {
    render(<Footer />);
    
    expect(screen.getByText('Made in Bangkok')).toBeInTheDocument();
    expect(screen.getByText('Keep Bangkok honest')).toBeInTheDocument();
    expect(screen.getByText('กรุงเทพฯ')).toBeInTheDocument();
  });

  it('includes community engagement elements', () => {
    render(<Footer />);
    
    expect(screen.getByText('Submit a Spot')).toBeInTheDocument();
    expect(screen.getByText('Report a Scam')).toBeInTheDocument();
    expect(screen.getByText(/Powered by.*honest contributors/)).toBeInTheDocument();
    expect(screen.getByText(/#BKKHonest/)).toBeInTheDocument();
  });

  it('has proper external links', () => {
    render(<Footer />);
    
    const instagramLink = screen.getByRole('link', { name: /Instagram/ });
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/bkkhonest');
    expect(instagramLink).toHaveAttribute('target', '_blank');
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('FooterSection Component', () => {
  it('renders title and children correctly', () => {
    render(
      <FooterSection title="Test Section">
        <p>Test content</p>
      </FooterSection>
    );
    
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FooterSection title="Test" className="custom-class">
        <div>Content</div>
      </FooterSection>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});