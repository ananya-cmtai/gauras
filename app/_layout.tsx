// app/_layout.tsx
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
export default function RootLayout() {
  useEffect(()=>{
    GoogleSignin.configure({
      iosClientId:"780294728867-en6gv616ud5dgkeqds81saoaqutmbau2.apps.googleusercontent.com",
      webClientId:"780294728867-0jfp89u6r2pneh1747f2c5gjkq5pp5r4.apps.googleusercontent.com",
     profileImageSize:150
    });
  });
  return (
    <Provider store={store}>
      <Stack initialRouteName="signuploginscreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signuploginscreen" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Provider>
  );
}
