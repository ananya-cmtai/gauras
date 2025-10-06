// app/_layout.tsx

import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { Provider } from 'react-redux';
import { store } from '../redux/store';
export default function RootLayout() {
 useEffect(() => {
    // Request notification permissions when the app loads
    const requestNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        console.log('Notification permissions granted!');
      } else {
        console.log('Notification permissions denied!');
      }
    };

    requestNotificationPermission();

    // Optional: Subscribe to notification events if needed
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Clean up the subscription when the component is unmounted
    return () => subscription.remove();
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
