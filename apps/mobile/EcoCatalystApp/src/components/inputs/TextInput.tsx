import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface TextInputProps extends RNTextInputProps {
  /**
   * Label text for the input
   */
  label: string;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  
  /**
   * Whether the input is required
   * @default false
   */
  required?: boolean;
  
  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Additional styles for the container
   */
  containerStyle?: ViewStyle;
  
  /**
   * Additional styles for the input
   */
  inputStyle?: TextStyle;
  
  /**
   * Additional styles for the label
   */
  labelStyle?: TextStyle;
  
  /**
   * Left icon name from MaterialIcons
   */
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  
  /**
   * Right icon name from MaterialIcons
   */
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  
  /**
   * Function to call when right icon is pressed
   */
  onRightIconPress?: () => void;
}

/**
 * TextInput component that follows Material Design guidelines and WCAG 2.1 AA accessibility standards
 */
const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  containerStyle,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const isPassword = secureTextEntry && !isPasswordVisible;
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  const showRightIcon = rightIcon || secureTextEntry;
  const rightIconName = secureTextEntry 
    ? (isPasswordVisible ? 'visibility' : 'visibility-off') 
    : rightIcon;
  
  const handleRightIconPress = () => {
    if (secureTextEntry) {
      togglePasswordVisibility();
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[
        styles.label,
        isFocused && styles.focusedLabel,
        error && styles.errorLabel,
        disabled && styles.disabledLabel,
        labelStyle
      ]}>
        {label}{required && <Text style={styles.requiredAsterisk}>*</Text>}
      </Text>
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focusedInputContainer,
        error && styles.errorInputContainer,
        disabled && styles.disabledInputContainer,
      ]}>
        {leftIcon && (
          <MaterialIcons
            name={leftIcon}
            size={20}
            color={error ? '#FF5252' : isFocused ? '#4CAF50' : '#757575'}
            style={styles.leftIcon}
          />
        )}
        
        <RNTextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            showRightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9E9E9E"
          editable={!disabled}
          secureTextEntry={isPassword}
          accessibilityLabel={label}
          accessibilityHint={helperText}
          accessibilityState={{ 
            disabled: disabled
          }}
          {...rest}
        />
        
        {showRightIcon && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            disabled={disabled}
            style={styles.rightIconContainer}
            accessibilityLabel={
              secureTextEntry 
                ? `${isPasswordVisible ? 'Hide' : 'Show'} password` 
                : `${label} icon button`
            }
          >
            <MaterialIcons
              name={rightIconName as keyof typeof MaterialIcons.glyphMap}
              size={20}
              color={error ? '#FF5252' : isFocused ? '#4CAF50' : '#757575'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text 
          style={[
            styles.helperText,
            error && styles.errorText
          ]}
          accessibilityLabel={error || helperText}
          accessibilityRole="alert"
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 6,
    fontWeight: '500',
  },
  focusedLabel: {
    color: '#4CAF50',
  },
  errorLabel: {
    color: '#FF5252',
  },
  disabledLabel: {
    color: '#9E9E9E',
  },
  requiredAsterisk: {
    color: '#FF5252',
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  focusedInputContainer: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  errorInputContainer: {
    borderColor: '#FF5252',
  },
  disabledInputContainer: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#212121',
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  rightIconContainer: {
    padding: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    color: '#FF5252',
  },
});

export default TextInput;
