import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import Toast, { ToastProps } from '../Toast';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('../../../theme/ThemeProvider', () => ({
  useAppTheme: jest.fn(() => ({
    theme: {
      colors: {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',
        onPrimary: '#FFFFFF',
        border: '#E0E0E0',
      },
      spacing: {
        xs: 4,
        s: 8,
        m: 16,
      },
      shape: {
        borderRadius: {
          medium: 8,
        },
      },
      elevation: {
        large: 'large',
      },
      typography: {
        fontSize: {
          body2: 14,
        },
        fontFamily: {
          regular: 'System',
        },
      },
    },
  })),
}));

jest.mock('react-native/Libraries/Animated/Animated', () => {
  return {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
    })),
    View: 'Animated.View',
    timing: jest.fn(() => ({
      start: jest.fn((callback?: () => void) => {
        if (callback) callback();
      }),
    })),
  };
});

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

describe('Toast Component', () => {
  const defaultProps: ToastProps = {
    message: 'Test message',
    visible: true,
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<Toast {...defaultProps} />);
    
    expect(screen.getByText('Test message')).toBeTruthy();
    expect(screen.getByLabelText('Dismiss')).toBeTruthy();
  });

  it('renders with success type', () => {
    render(<Toast {...defaultProps} type="success" />);
    
    expect(screen.getByText('Test message')).toBeTruthy();
  });

  it('renders with error type', () => {
    render(<Toast {...defaultProps} type="error" />);
    
    expect(screen.getByText('Test message')).toBeTruthy();
  });

  it('renders with warning type', () => {
    render(<Toast {...defaultProps} type="warning" />);
    
    expect(screen.getByText('Test message')).toBeTruthy();
  });

  it('renders with info type', () => {
    render(<Toast {...defaultProps} type="info" />);
    
    expect(screen.getByText('Test message')).toBeTruthy();
  });

  it('calls onDismiss when close button is pressed', () => {
    render(<Toast {...defaultProps} />);
    
    fireEvent.press(screen.getByLabelText('Dismiss'));
    
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after duration', () => {
    jest.useFakeTimers();
    
    render(<Toast {...defaultProps} duration={1000} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    
    jest.useRealTimers();
  });

  it('renders at top position when specified', () => {
    render(<Toast {...defaultProps} position="top" />);
    
    expect(screen.getByText('Test message')).toBeTruthy();
  });

  it('renders at bottom position by default', () => {
    render(<Toast {...defaultProps} />);
    
    expect(screen.getByText('Test message')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { rerender } = render(<Toast {...defaultProps} visible={false} />);
    
    rerender(<Toast {...defaultProps} visible={false} />);
    
    expect(defaultProps.onDismiss).not.toHaveBeenCalled();
  });
});
