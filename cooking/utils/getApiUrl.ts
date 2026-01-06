import { Platform } from 'react-native';

export function getApiUrl(): string {
  // For mobile/web, use your computer's IP address
  // IMPORTANT: Replace with your actual IP address
  // Find it using: ipconfig (Windows) or ifconfig (Mac/Linux)
  // Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet)
  // Example: 192.168.1.105, 192.168.0.100, 10.0.2.2 (for Android emulator), etc.
  const YOUR_IP = '192.168.100.35'; // Correct IP address found

  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // For Android Emulator, use 10.0.2.2 to access localhost
  if (Platform.OS === 'android' && __DEV__) {
    // Uncomment the line below if using Android emulator:
    // return 'http://10.0.2.2:5000/api';
  }

  // For mobile (iOS/Android physical device), use your computer's IP
  return `http://${YOUR_IP}:5000/api`;
}


