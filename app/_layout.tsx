// app/_layout.tsx

import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import OneSignal from 'react-native-onesignal';

import { Provider } from 'react-redux';
import { store } from '../redux/store';

const ONESIGNAL_APP_ID = 'b89d1dd3-2345-42e3-8b9e-745d49029c4a';

async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Notification permission is required to receive notifications.');
      return false;
    }
  }
  // iOS permissions will be handled by OneSignal's promptForPushNotificationsWithUserResponse
  return true;
}

export default function RootLayout() {
  useEffect(() => {
    async function setupNotifications() {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) return;

      const oneSignal = OneSignal as any;  // Typecast to avoid TS errors

      oneSignal.setAppId(ONESIGNAL_APP_ID);

      if (Platform.OS === 'ios') {
        oneSignal.promptForPushNotificationsWithUserResponse();
      }

      oneSignal.setNotificationOpenedHandler((notification: any) => {
        console.log('Notification opened:', notification);
      });

      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Expo Notification received:', notification);
      });

      // Cleanup subscription on unmount
      return () => subscription.remove();
    }

    setupNotifications();
  }, []);

  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signuploginscreen" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Provider>
  );
}
