import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';

export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'button'
  | 'caption'
  | 'overline';

export interface TypographyProps extends TextProps {
  /**
   * The text content to display
   */
  children: React.ReactNode;
  
  /**
   * Typography variant
   * @default 'body1'
   */
  variant?: TypographyVariant;
  
  /**
   * Text color
   * @default '#212121'
   */
  color?: string;
  
  /**
   * Whether the text should be centered
   * @default false
   */
  center?: boolean;
  
  /**
   * Whether the text should be bold
   * @default false
   */
  bold?: boolean;
  
  /**
   * Whether the text should be italic
   * @default false
   */
  italic?: boolean;
  
  /**
   * Additional styles for the text
   */
  style?: TextStyle;
}

/**
 * Typography component that follows Material Design guidelines and WCAG 2.1 AA accessibility standards
 */
const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color = '#212121',
  center = false,
  bold = false,
  italic = false,
  style,
  ...rest
}) => {
  const textStyles = [
    styles[variant],
    { color },
    center && styles.center,
    bold && styles.bold,
    italic && styles.italic,
    style,
  ];
  
  const getAccessibilityRole = () => {
    if (variant.startsWith('h')) {
      return 'header';
    }
    return 'text';
  };
  
  return (
    <Text 
      style={textStyles} 
      accessibilityRole={getAccessibilityRole()}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '300',
    letterSpacing: 0,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: 0.15,
  },
  h5: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  h6: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  subtitle1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 1.25,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  center: {
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
});

export default Typography;
