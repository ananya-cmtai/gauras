import { Stack } from 'expo-router/stack';

export default function ProfileStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Profile',headerTitleStyle: { color: '#fecd54' } ,headerTintColor: '#fecd54' , headerStyle: {
      backgroundColor: '#0b380e', // ✅ your desired background color
    },}} />
      <Stack.Screen name="orders" options={{ title: 'My Orders' ,headerTitleStyle: { color: '#fecd54' } ,headerTintColor: '#fecd54' , headerStyle: {
      backgroundColor: '#0b380e', // ✅ your desired background color
    },}} />
      <Stack.Screen name="update" options={{ title: 'Update Profile',headerTitleStyle: { color: '#fecd54' } ,headerTintColor: '#fecd54' , headerStyle: {
      backgroundColor: '#0b380e', // ✅ your desired background color
    }, }} />
      <Stack.Screen name="wallet" options={{ title: 'Wallet',headerTitleStyle: { color: '#fecd54' } ,headerTintColor: '#fecd54' , headerStyle: {
      backgroundColor: '#0b380e', // ✅ your desired background color
    }, }} />
      <Stack.Screen name="transactions" options={{ title: 'Transactions',headerTitleStyle: { color: '#fecd54' } ,headerTintColor: '#fecd54' , headerStyle: {
      backgroundColor: '#0b380e', // ✅ your desired background color
    }, }} />
      <Stack.Screen name="subscriptions" options={{ title: 'Active Subscriptions' ,headerTitleStyle: { color: '#fecd54' } ,headerTintColor: '#fecd54' , headerStyle: {
      backgroundColor: '#0b380e', // ✅ your desired background color
    },}} />
    </Stack>
  );
}