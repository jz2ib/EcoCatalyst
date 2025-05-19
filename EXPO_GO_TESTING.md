# Testing EcoCatalyst with Expo Go

This guide explains how to test the EcoCatalyst app on a basic Android phone using Expo Go.

## Prerequisites
- A basic Android phone (Android 5.0 or newer recommended)
- Install Expo Go from Google Play Store on your phone
- Both your development machine and phone connected to the same WiFi network
- Firebase credentials (if available) or configured for placeholder values

## Setup Steps

### On Development Machine
1. Start the Expo development server:
   ```
   cd ~/repos/EcoCatalyst/apps/mobile/EcoCatalystApp
   npm start
   ```
2. A QR code will be displayed in the terminal
3. Keep the development server running during testing

### On Android Phone
1. Open Expo Go app
2. Scan the QR code from your terminal
3. The app will load on your device
4. If it doesn't connect, make sure both devices are on the same network

## Troubleshooting
- If you encounter connection issues, try using the "tunnel" connection method:
  ```
  npm start -- --tunnel
  ```
- If the app fails to load, check the Expo server logs for errors
- For network issues, ensure no firewall is blocking the connection

## Testing Procedure
Follow the test cases in MANUAL_TESTING.md to verify app functionality:
1. Authentication Flow
2. Product Scanner
3. Carbon Footprint Tracker
4. Diet Chatbot
5. Gamification features
