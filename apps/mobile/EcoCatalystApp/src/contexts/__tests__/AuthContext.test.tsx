import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../AuthContext';

declare const jest: any;
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;
declare const beforeEach: (fn: () => void) => void;
declare const afterEach: (fn: () => void) => void;

const mockOnAuthStateChanged = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockUpdateProfile = jest.fn();
const mockGetAuth = jest.fn();

mockOnAuthStateChanged.mockImplementation((auth, callback) => {
  callback(null);
  return () => {};
});

mockCreateUserWithEmailAndPassword.mockImplementation(() => 
  Promise.resolve({
    user: { uid: 'new-uid', email: 'new@example.com' }
  })
);

mockSignInWithEmailAndPassword.mockImplementation(() => 
  Promise.resolve({
    user: { uid: 'test-uid', email: 'test@example.com' }
  })
);

mockSignOut.mockImplementation(() => Promise.resolve());
mockSendPasswordResetEmail.mockImplementation(() => Promise.resolve());
mockUpdateProfile.mockImplementation(() => Promise.resolve());
mockGetAuth.mockImplementation(() => ({}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  updateProfile: mockUpdateProfile,
  getAuth: mockGetAuth
}));

jest.mock('../../services/firebase', () => ({
  auth: {},
  database: {},
  app: {},
  storage: {},
  analytics: {}
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial authentication state', () => {
    let contextValue;
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.user).toBeNull();
    expect(contextValue.isLoading).toBe(false);
    expect(typeof contextValue.login).toBe('function');
    expect(typeof contextValue.register).toBe('function');
    expect(typeof contextValue.logout).toBe('function');
    expect(typeof contextValue.resetPassword).toBe('function');
  });
  
  it('handles login successfully', async () => {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    let contextValue;
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    await act(async () => {
      await contextValue.login('test@example.com', 'password');
    });
    
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password'
    );
  });
  
  it('handles registration successfully', async () => {
    const { createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
    let contextValue;
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    await act(async () => {
      await contextValue.register('new@example.com', 'password', 'Test User');
    });
    
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'new@example.com',
      'password'
    );
    expect(updateProfile).toHaveBeenCalled();
  });
  
  it('handles logout successfully', async () => {
    const { signOut } = require('firebase/auth');
    let contextValue;
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    await act(async () => {
      await contextValue.logout();
    });
    
    expect(signOut).toHaveBeenCalled();
  });
  
  it('handles password reset successfully', async () => {
    const { sendPasswordResetEmail } = require('firebase/auth');
    let contextValue;
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    await act(async () => {
      await contextValue.resetPassword('test@example.com');
    });
    
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com'
    );
  });
});
