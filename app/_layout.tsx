// app/_layout.tsx

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
export default function RootLayout() {
 useEffect(() => {
    // Enable verbose logging for debugging (remove in production)
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    // Initialize with your OneSignal App ID
    OneSignal.initialize('b89d1dd3-2345-42e3-8b9e-745d49029c4a');
    // Use this method to prompt for push notifications.
    // We recommend removing this method after testing and instead use In-App Messages to prompt for notification permission.
    OneSignal.Notifications.requestPermission(false);
  }, []); 
  return (
    <Provider store={store}>
      <Stack  screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signuploginscreen" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Provider>
  );
}
