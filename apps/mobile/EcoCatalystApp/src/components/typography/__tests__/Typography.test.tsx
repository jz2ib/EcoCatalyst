import React from 'react';
import { render } from '@testing-library/react-native';
import Typography from '../Typography';

declare const jest: any;
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;

const mockTheme = {
  colors: {
    textPrimary: '#000000',
    textSecondary: '#757575',
    primary: '#2196F3',
    error: '#F44336',
  },
  typography: {
    fontSize: {
      h1: 32,
      h2: 28,
      h3: 24,
      h4: 20,
      h5: 16,
      h6: 14,
      body1: 16,
      body2: 14,
      caption: 12,
    },
    lineHeight: {
      h1: 40,
      h2: 36,
      h3: 32,
      h4: 28,
      h5: 24,
      h6: 20,
      body1: 24,
      body2: 20,
      caption: 16,
    },
    fontFamily: {
      regular: 'System',
      medium: 'System-Medium',
      bold: 'System-Bold',
    },
  },
};

jest.mock('../../../theme/ThemeProvider', () => ({
  useAppTheme: () => ({
    theme: mockTheme,
    fontScale: (size) => size,
  }),
  ThemeProvider: ({ children }) => children,
}));

describe('Typography Component', () => {
  it('renders text correctly', () => {
    const { getByText } = render(
      <Typography>Hello World</Typography>
    );
    
    expect(getByText('Hello World')).toBeTruthy();
  });
  
  it('renders with different variants', () => {
    const { rerender, getByText } = render(
      <Typography variant="h1">Heading 1</Typography>
    );
    
    expect(getByText('Heading 1')).toBeTruthy();
    
    rerender(
      <Typography variant="body1">Body Text</Typography>
    );
    
    expect(getByText('Body Text')).toBeTruthy();
  });
  
  it('applies custom styles', () => {
    const { getByText } = render(
      <Typography style={{ color: 'red' }}>Custom Style</Typography>
    );
    
    const textElement = getByText('Custom Style');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ color: 'red' })
    );
  });
  
  it('applies different colors', () => {
    const { getByText } = render(
      <Typography color="primary">Primary Color</Typography>
    );
    
    const textElement = getByText('Primary Color');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ color: '#2196F3' })
    );
  });
  
  it('applies accessibility props', () => {
    const { getByText } = render(
      <Typography 
        accessibilityLabel="Accessible text"
        accessibilityHint="This is a hint"
      >
        Accessible Text
      </Typography>
    );
    
    const textElement = getByText('Accessible Text');
    expect(textElement.props.accessibilityLabel).toBe('Accessible text');
    expect(textElement.props.accessibilityHint).toBe('This is a hint');
  });
});
