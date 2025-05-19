import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Typography, { TypographyProps } from '../Typography';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('../../../theme/ThemeProvider', () => ({
  useAppTheme: jest.fn(() => ({
    theme: {
      colors: {
        textPrimary: '#000000',
      },
      typography: {
        fontSize: {
          h1: 96,
          h2: 60,
          h3: 48,
          h4: 34,
          h5: 24,
          h6: 20,
          subtitle1: 16,
          subtitle2: 14,
          body1: 16,
          body2: 14,
          button: 14,
          caption: 12,
          overline: 10,
        },
        lineHeight: {
          h1: 112,
          h2: 72,
          h3: 56,
          h4: 40,
          h5: 32,
          h6: 28,
          subtitle1: 24,
          subtitle2: 20,
          body1: 24,
          body2: 20,
          button: 16,
          caption: 16,
          overline: 16,
        },
        fontFamily: {
          regular: 'System',
          medium: 'System-Medium',
        },
      },
    },
  })),
}));

describe('Typography Component', () => {
  const defaultProps: TypographyProps = {
    children: 'Test text',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<Typography {...defaultProps} />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('text')).toBeTruthy();
  });

  it('renders with h1 variant', () => {
    render(<Typography {...defaultProps} variant="h1" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('renders with h2 variant', () => {
    render(<Typography {...defaultProps} variant="h2" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('renders with h3 variant', () => {
    render(<Typography {...defaultProps} variant="h3" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('renders with h4 variant', () => {
    render(<Typography {...defaultProps} variant="h4" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('renders with h5 variant', () => {
    render(<Typography {...defaultProps} variant="h5" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('renders with h6 variant', () => {
    render(<Typography {...defaultProps} variant="h6" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('renders with subtitle1 variant', () => {
    render(<Typography {...defaultProps} variant="subtitle1" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('text')).toBeTruthy();
  });

  it('renders with subtitle2 variant', () => {
    render(<Typography {...defaultProps} variant="subtitle2" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('text')).toBeTruthy();
  });

  it('renders with body1 variant', () => {
    render(<Typography {...defaultProps} variant="body1" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('text')).toBeTruthy();
  });

  it('renders with body2 variant', () => {
    render(<Typography {...defaultProps} variant="body2" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('text')).toBeTruthy();
  });

  it('renders with button variant', () => {
    render(<Typography {...defaultProps} variant="button" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('text')).toBeTruthy();
  });

  it('renders with caption variant', () => {
    render(<Typography {...defaultProps} variant="caption" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('text')).toBeTruthy();
  });

  it('renders with overline variant', () => {
    render(<Typography {...defaultProps} variant="overline" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
    expect(screen.getByRole('text')).toBeTruthy();
  });

  it('renders with custom color', () => {
    render(<Typography {...defaultProps} color="#FF0000" />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
  });

  it('renders with center alignment', () => {
    render(<Typography {...defaultProps} center />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
  });

  it('renders with bold text', () => {
    render(<Typography {...defaultProps} bold />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
  });

  it('renders with italic text', () => {
    render(<Typography {...defaultProps} italic />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
  });

  it('applies custom style', () => {
    render(<Typography {...defaultProps} style={{ marginTop: 10 }} />);
    
    expect(screen.getByText('Test text')).toBeTruthy();
  });
});
