// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store } from '../redux/store'; // Adjust path if needed

export default function RootLayout() {
  // useFrameworkReady();

  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signuploginscreen" />
      </Stack>
      <StatusBar style="auto" />
    </Provider>
  );
}
