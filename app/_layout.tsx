// app/_layout.tsx
import SignupLoginScreen from './signuploginscreen';

export default function RootLayout() {
  return (
    // <Provider store={store}>
    //   <Stack initialRouteName="signuploginscreen" screenOptions={{ headerShown: false }}>
    //     <Stack.Screen name="signuploginscreen" />
    //   </Stack>
    //   <StatusBar style="auto" />
    // </Provider>
    <SignupLoginScreen/>
  );
}
