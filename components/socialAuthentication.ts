// import { makeRedirectUri } from 'expo-auth-session';
// import * as Google from 'expo-auth-session/providers/google';
// import * as React from 'react';
// import Toast from 'react-native-toast-message';

// export const useGoogleLogin = () => {
//   // Google Auth Request setup
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     expoClientId: '780294728867-0jfp89u6r2pneh1747f2c5gjkq5pp5r4.apps.googleusercontent.com', // Web client ID from Google Cloud Console
//     iosClientId: '780294728867-en6gv616ud5dgkeqds81saoaqutmbau2.apps.googleusercontent.com',  // iOS client ID from Google Cloud Console
//     androidClientId: '780294728867-2jsqu484vujqtiosdrtev97a9j24s6l9.apps.googleusercontent.com', // Android client ID from Google Cloud Console
//     webClientId: '780294728867-0jfp89u6r2pneh1747f2c5gjkq5pp5r4.apps.googleusercontent.com', // Same as expoClientId
//     scopes: ['email'],
//     // Use Expo proxy redirect URI during development for easier setup
//     redirectUri: makeRedirectUri({ useProxy: true }),

//   });

//   React.useEffect(() => {
//     if (response?.type === 'success') {
//       const { authentication } = response;
//       console.log('Google login success, accessToken:', authentication?.accessToken);

//       Toast.show({
//         type: 'success',
//         text1: 'Google Login Success',
//         position: 'bottom',
//       });

//       // TODO: Use authentication.accessToken to fetch user info or authenticate with Firebase here

//     } else if (response?.type === 'error') {
//       Toast.show({
//         type: 'error',
//         text1: 'Google Login Failed',
//         position: 'bottom',
//       });
//     }
//   }, [response]);

//   const googleLogin = async () => {
//     if (!request) {
//       Toast.show({
//         type: 'error',
//         text1: 'Google Sign-in request not ready',
//         position: 'bottom',
//       });
//       return;
//     }

//     try {
//       await promptAsync();
//     } catch (error) {
//       console.error('Google login error:', error);
//       Toast.show({
//         type: 'error',
//         text1: 'Google Sign-in Failed',
//         position: 'bottom',
//       });
//     }
//   };

//   return { googleLogin };
// };
