import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',       // Non-critical errors that don't affect core functionality
  MEDIUM = 'MEDIUM', // Errors that affect some functionality but app can continue
  HIGH = 'HIGH',     // Critical errors that prevent core functionality
  FATAL = 'FATAL',   // Errors that crash the app
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  timestamp: number;
  context?: Record<string, any>;
  stack?: string;
}

const ERROR_LOGS_STORAGE_KEY = 'ecocatalyst_error_logs';

const MAX_STORED_ERRORS = 100;

/**
 * Handles application errors, logs them, and shows appropriate UI feedback
 */
class ErrorHandlingService {
  private errors: AppError[] = [];
  private isInitialized = false;

  /**
   * Initialize the error handling service
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;
      
      const storedErrors = await AsyncStorage.getItem(ERROR_LOGS_STORAGE_KEY);
      if (storedErrors) {
        this.errors = JSON.parse(storedErrors);
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize error handling service:', error);
    }
  }

  /**
   * Handle an error
   * @param error The error to handle
   * @param showAlert Whether to show an alert to the user
   * @returns The handled error
   */
  async handleError(
    error: Error | string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>,
    showAlert: boolean = true
  ): Promise<AppError> {
    await this.initialize();
    
    const appError: AppError = {
      type,
      severity,
      message: typeof error === 'string' ? error : error.message,
      timestamp: Date.now(),
      context,
      stack: typeof error === 'string' ? undefined : error.stack,
    };
    
    console.error('App Error:', appError);
    
    this.errors.unshift(appError);
    
    if (this.errors.length > MAX_STORED_ERRORS) {
      this.errors = this.errors.slice(0, MAX_STORED_ERRORS);
    }
    
    try {
      await AsyncStorage.setItem(ERROR_LOGS_STORAGE_KEY, JSON.stringify(this.errors));
    } catch (storageError) {
      console.error('Failed to store error log:', storageError);
    }
    
    if (showAlert) {
      this.showErrorAlert(appError);
    }
    
    if (appError.severity === ErrorSeverity.HIGH || appError.severity === ErrorSeverity.FATAL) {
      this.reportCriticalError(appError);
    }
    
    return appError;
  }

  /**
   * Handle a network error
   * @param error The network error
   * @param context Additional context
   * @param showAlert Whether to show an alert
   * @returns The handled error
   */
  async handleNetworkError(
    error: Error | string,
    context?: Record<string, any>,
    showAlert: boolean = true
  ): Promise<AppError> {
    return this.handleError(
      error,
      ErrorType.NETWORK,
      ErrorSeverity.MEDIUM,
      context,
      showAlert
    );
  }

  /**
   * Handle an authentication error
   * @param error The authentication error
   * @param context Additional context
   * @param showAlert Whether to show an alert
   * @returns The handled error
   */
  async handleAuthError(
    error: Error | string,
    context?: Record<string, any>,
    showAlert: boolean = true
  ): Promise<AppError> {
    return this.handleError(
      error,
      ErrorType.AUTHENTICATION,
      ErrorSeverity.HIGH,
      context,
      showAlert
    );
  }

  /**
   * Get all stored errors
   * @returns Array of stored errors
   */
  async getErrors(): Promise<AppError[]> {
    await this.initialize();
    return [...this.errors];
  }

  /**
   * Clear all stored errors
   */
  async clearErrors(): Promise<void> {
    this.errors = [];
    await AsyncStorage.removeItem(ERROR_LOGS_STORAGE_KEY);
  }

  /**
   * Show an error alert to the user
   * @param error The error to show
   */
  private showErrorAlert(error: AppError): void {
    let title = 'Error';
    let message = error.message;
    
    switch (error.type) {
      case ErrorType.NETWORK:
        title = 'Network Error';
        message = `${error.message}\nPlease check your internet connection and try again.`;
        break;
      case ErrorType.AUTHENTICATION:
        title = 'Authentication Error';
        message = `${error.message}\nPlease sign in again.`;
        break;
      case ErrorType.PERMISSION:
        title = 'Permission Error';
        message = `${error.message}\nPlease grant the required permissions.`;
        break;
      case ErrorType.VALIDATION:
        title = 'Validation Error';
        message = error.message;
        break;
      case ErrorType.SERVER:
        title = 'Server Error';
        message = `${error.message}\nPlease try again later.`;
        break;
      default:
        title = 'Unexpected Error';
        message = `${error.message}\nPlease try again later.`;
    }
    
    Alert.alert(title, message);
  }

  /**
   * Report a critical error to analytics or crash reporting service
   * @param error The error to report
   */
  private reportCriticalError(error: AppError): void {
    console.error('CRITICAL ERROR:', error);
    
  }
}

export const errorHandler = new ErrorHandlingService();

/**
 * Higher-order function to wrap async functions with error handling
 * @param fn The async function to wrap
 * @param errorType The type of error
 * @param severity The severity of the error
 * @param context Additional context
 * @param showAlert Whether to show an alert
 * @returns The wrapped function
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorType: ErrorType = ErrorType.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: Record<string, any>,
  showAlert: boolean = true
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      await errorHandler.handleError(
        error instanceof Error ? error : String(error),
        errorType,
        severity,
        {
          ...context,
          functionName: fn.name,
          arguments: args,
        },
        showAlert
      );
      throw error;
    }
  };
}

export default errorHandler;
