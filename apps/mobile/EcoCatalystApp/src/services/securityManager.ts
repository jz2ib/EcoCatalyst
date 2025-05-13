import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import errorHandler, { ErrorType, ErrorSeverity } from './errorHandling';

/**
 * Service for managing app security
 */
class SecurityManager {
  private static instance: SecurityManager;
  private isInitialized = false;
  
  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }
  
  /**
   * Initialize the security manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.checkForVulnerabilities();
      
      this.isInitialized = true;
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : String(error),
        ErrorType.UNKNOWN,
        ErrorSeverity.HIGH,
        { method: 'initialize' }
      );
    }
  }
  
  /**
   * Check for common security vulnerabilities
   */
  private async checkForVulnerabilities(): Promise<void> {
    if (await this.isDeviceRooted()) {
      console.warn('Security warning: Device appears to be rooted or jailbroken');
    }
    
    if (__DEV__) {
      console.warn('Security warning: App is running in development mode');
    }
  }
  
  /**
   * Check if the device is rooted or jailbroken
   * This is a basic implementation - in a real app, you would use a library like react-native-device-info
   */
  private async isDeviceRooted(): Promise<boolean> {
    return false;
  }
  
  /**
   * Sanitize user input to prevent injection attacks
   * @param input The input to sanitize
   * @returns The sanitized input
   */
  public sanitizeInput(input: string): string {
    if (!input) return input;
    
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    return sanitized;
  }
  
  /**
   * Validate an email address
   * @param email The email to validate
   * @returns Whether the email is valid
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate a password
   * @param password The password to validate
   * @returns An object with validation results
   */
  public validatePassword(password: string): {
    isValid: boolean;
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  } {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    
    return {
      isValid,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    };
  }
  
  /**
   * Securely store sensitive data
   * In a real app, you would use a library like react-native-keychain
   * @param key The key to store the data under
   * @param value The data to store
   */
  public async secureStore(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`secure_${key}`, value);
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : String(error),
        ErrorType.UNKNOWN,
        ErrorSeverity.HIGH,
        { method: 'secureStore', key }
      );
      throw error;
    }
  }
  
  /**
   * Retrieve securely stored data
   * In a real app, you would use a library like react-native-keychain
   * @param key The key to retrieve
   * @returns The retrieved data
   */
  public async secureRetrieve(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`secure_${key}`);
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : String(error),
        ErrorType.UNKNOWN,
        ErrorSeverity.HIGH,
        { method: 'secureRetrieve', key }
      );
      throw error;
    }
  }
  
  /**
   * Remove securely stored data
   * In a real app, you would use a library like react-native-keychain
   * @param key The key to remove
   */
  public async secureRemove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`secure_${key}`);
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : String(error),
        ErrorType.UNKNOWN,
        ErrorSeverity.HIGH,
        { method: 'secureRemove', key }
      );
      throw error;
    }
  }
}

export const securityManager = SecurityManager.getInstance();

export default securityManager;
