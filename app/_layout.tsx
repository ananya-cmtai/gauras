// app/_layout.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import { store } from '../redux/store';



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,  // nayi property
    shouldShowList: true,    // nayi property
  }),
});


async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Notification permission is required to receive notifications.');
      return false;
    }
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) {
      alert('Firebase notification permission denied.');
      return false;
    }
  }
  return true;
}

export default function RootLayout() {
    const router = useRouter();
    
  useEffect(() => {
    async function setupFirebaseNotifications() {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) return;

      // 🔥 Get FCM Token
      const token = await messaging().getToken();
      console.log('🔥 Firebase FCM Token:', token);

      // 🔹 Foreground message listener
      const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
        console.log('📩 Foreground Firebase message:', remoteMessage);
        Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification?.title ?? 'New Message',
            body: remoteMessage.notification?.body ?? 'You have a new notification',
          },
          trigger: null,
        });
      });

      // 🔹 When app opened from background by tapping a notification
      const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('App opened from background by notification:', remoteMessage);
      });

      // 🔹 When app opened from quit state
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('App opened from quit state by notification:', remoteMessage);
          }
        });

      return () => {
        unsubscribeOnMessage();
        unsubscribeOpened();
      };
    }

    setupFirebaseNotifications();
  }, []);
useEffect(() => {
  const checkToken = async () => {
    const token = await AsyncStorage.getItem('userToken');
    console.log('RootLayout token:', token); // Debug
    if (token && token.length > 0) {
      router.replace('/(tabs)');
    } else {
      router.replace('/signuploginscreen');
    }
  };
  checkToken();
}, []);


  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Screen name="signuploginscreen" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Provider>
  );
}
