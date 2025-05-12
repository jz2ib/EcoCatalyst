import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

export interface CardProps extends TouchableOpacityProps {
  /**
   * Content to render inside the card
   */
  children: React.ReactNode;
  
  /**
   * Whether the card is pressable
   * @default false
   */
  pressable?: boolean;
  
  /**
   * Elevation level (0-5)
   * @default 1
   */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  
  /**
   * Additional styles for the card container
   */
  style?: ViewStyle;
  
  /**
   * Border radius size
   * @default 'medium'
   */
  borderRadius?: 'small' | 'medium' | 'large' | 'none';
  
  /**
   * Whether to add padding inside the card
   * @default true
   */
  withPadding?: boolean;
}

/**
 * Card component that follows Material Design guidelines and WCAG 2.1 AA accessibility standards
 */
const Card: React.FC<CardProps> = ({
  children,
  pressable = false,
  elevation = 1,
  style,
  borderRadius = 'medium',
  withPadding = true,
  onPress,
  ...rest
}) => {
  const cardStyles = [
    styles.card,
    styles[`elevation${elevation}`],
    styles[`radius${borderRadius.charAt(0).toUpperCase() + borderRadius.slice(1)}`],
    withPadding && styles.withPadding,
    style,
  ];
  
  if (pressable && onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={cardStyles} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginVertical: 8,
  },
  withPadding: {
    padding: 16,
  },
  elevation0: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  elevation1: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  elevation2: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
  },
  elevation3: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  elevation4: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  elevation5: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
  radiusNone: {
    borderRadius: 0,
  },
  radiusSmall: {
    borderRadius: 4,
  },
  radiusMedium: {
    borderRadius: 8,
  },
  radiusLarge: {
    borderRadius: 16,
  },
});

export default Card;
