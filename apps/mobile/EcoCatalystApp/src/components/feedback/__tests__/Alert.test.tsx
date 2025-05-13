import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Alert from '../Alert';

declare const jest: any;
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;

const mockTheme = {
  colors: {
    error: 'red',
    success: 'green',
    warning: 'orange',
    info: 'blue',
    onError: 'white',
    onSuccess: 'white',
    onWarning: 'black',
    onInfo: 'white',
    surface: 'white',
    onSurface: 'black',
    textPrimary: '#212121',
    textSecondary: '#757575',
    onPrimary: 'white',
    border: '#E0E0E0',
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
  },
  shape: {
    borderRadius: {
      small: 4,
      medium: 8,
      large: 16,
    },
  },
  typography: {
    fontSize: {
      h5: 18,
      body1: 16,
      button: 14,
    },
    fontFamily: {
      regular: 'System',
      medium: 'System',
    },
    lineHeight: {
      body1: 24,
    },
  },
  elevation: {
    none: 'none',
    small: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    medium: {
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    large: {
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 5.84,
    },
  },
};

jest.mock('../../../theme/ThemeProvider', () => ({
  useAppTheme: () => ({
    theme: mockTheme,
    horizontalScale: (size) => size,
    verticalScale: (size) => size,
    moderateScale: (size) => size,
  }),
  ThemeProvider: ({ children }) => children,
}));

describe('Alert Component', () => {
  it('renders correctly with title and message', () => {
    const { getByText } = render(
      <Alert
        visible={true}
        title="Test Title"
        message="Test Message"
        onDismiss={() => {}}
      />
    );
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Message')).toBeTruthy();
  });
  
  it('calls onDismiss when primary button is pressed', () => {
    const onDismissMock = jest.fn();
    const { getByText } = render(
      <Alert
        visible={true}
        title="Test Title"
        message="Test Message"
        onDismiss={onDismissMock}
        primaryButtonText="OK"
      />
    );
    
    fireEvent.press(getByText('OK'));
    expect(onDismissMock).toHaveBeenCalled();
  });
  
  it('renders with different types', () => {
    const { rerender, getByText, getByRole } = render(
      <Alert
        visible={true}
        title="Error"
        message="Error Message"
        type="error"
        onDismiss={() => {}}
      />
    );
    
    const errorTitle = getByText('Error');
    expect(errorTitle.props.style).toContainEqual(
      expect.objectContaining({ color: 'red' })
    );
    
    const errorButton = getByRole('button', { name: 'OK' });
    expect(errorButton.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: 'red' })
    );
    
    rerender(
      <Alert
        visible={true}
        title="Success"
        message="Success Message"
        type="success"
        onDismiss={() => {}}
      />
    );
    
    const successTitle = getByText('Success');
    expect(successTitle.props.style).toContainEqual(
      expect.objectContaining({ color: 'green' })
    );
    
    const successButton = getByRole('button', { name: 'OK' });
    expect(successButton.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: 'green' })
    );
  });
  
  it('is not rendered when visible is false', () => {
    const { queryByText } = render(
      <Alert
        visible={false}
        title="Test Title"
        message="Test Message"
        onDismiss={() => {}}
      />
    );
    
    expect(queryByText('Test Title')).toBeNull();
  });
});
