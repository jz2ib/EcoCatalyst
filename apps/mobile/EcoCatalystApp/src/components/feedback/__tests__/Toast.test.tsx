import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Toast from '../Toast';
import { Animated } from 'react-native';

declare const jest: any;
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;
declare const beforeEach: (fn: () => void) => void;
declare const afterEach: (fn: () => void) => void;

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: function(props) {
    return null;
  }
}));

jest.mock('react-native', () => {
  const React = require('react');
  
  const View = ({ children, style, ...props }) => <div {...props}>{children}</div>;
  const Text = ({ children, style, ...props }) => <span {...props}>{children}</span>;
  const TouchableOpacity = ({ children, onPress, ...props }) => (
    <button onClick={onPress} {...props}>{children}</button>
  );
  
  const AnimatedView = ({ children, style, ...props }) => <div {...props}>{children}</div>;
  
  const mockValue = {
    setValue: jest.fn(),
    interpolate: jest.fn(() => ({ interpolate: jest.fn() }))
  };
  
  return {
    View,
    Text,
    TouchableOpacity,
    StyleSheet: {
      create: styles => styles
    },
    Animated: {
      View: AnimatedView,
      Value: jest.fn(() => mockValue),
      timing: jest.fn(() => ({
        start: jest.fn(callback => callback && callback())
      }))
    }
  };
});

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
    textPrimary: 'black',
    textSecondary: 'gray',
    onPrimary: 'white',
    border: '#E0E0E0',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
  },
  shape: {
    borderRadius: {
      small: 4,
      medium: 8,
    },
  },
  typography: {
    fontSize: {
      body1: 16,
      body2: 14,
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
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    large: {
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
    },
  },
};

jest.mock('../../../theme/ThemeProvider', () => ({
  useAppTheme: () => ({
    theme: mockTheme,
    horizontalScale: (size) => size,
    verticalScale: (size) => size,
    moderateScale: (size) => size,
    fontScale: (size) => size,
  }),
  ThemeProvider: ({ children }) => children,
}));

jest.useFakeTimers();

describe('Toast Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('renders correctly with message', () => {
    const { getByText } = render(
      <Toast
        visible={true}
        message="Test Message"
        onDismiss={() => {}}
      />
    );
    
    expect(getByText('Test Message')).toBeTruthy();
  });
  
  it('calls onDismiss when close button is pressed', () => {
    const onDismissMock = jest.fn();
    const { getByLabelText } = render(
      <Toast
        visible={true}
        message="Test Message"
        onDismiss={onDismissMock}
      />
    );
    
    fireEvent.press(getByLabelText('Dismiss'));
    expect(onDismissMock).toHaveBeenCalled();
  });
  
  it('renders with different types', () => {
    const { getByText, rerender } = render(
      <Toast
        visible={true}
        message="Error Message"
        type="error"
        onDismiss={() => {}}
      />
    );
    
    expect(getByText('Error Message')).toBeTruthy();
    
    rerender(
      <Toast
        visible={true}
        message="Success Message"
        type="success"
        onDismiss={() => {}}
      />
    );
    
    expect(getByText('Success Message')).toBeTruthy();
  });
  
  it('has proper accessibility attributes', () => {
    const { getByLabelText } = render(
      <Toast
        visible={true}
        message="Accessible Message"
        onDismiss={() => {}}
      />
    );
    
    expect(getByLabelText('Dismiss')).toBeTruthy();
  });
});
