// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '../redux/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack initialRouteName="signuploginscreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signuploginscreen" />
      </Stack>
      <StatusBar style="auto" />
    </Provider>
  );
}
