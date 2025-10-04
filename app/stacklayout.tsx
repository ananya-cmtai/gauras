// StackLayout.tsx
import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="products" options={{ title: 'Products' }} />
      <Stack.Screen name="subscriptionpage" options={{ title: 'Subscribe' }} />
         <Stack.Screen name="cart" options={{ title: 'Cart' }} />
         <Stack.Screen name="razorpaywebview" options={{ title: '' }} />
           <Stack.Screen name="wallet" options={{ title: 'Wallet' }} />
             <Stack.Screen name="walletpaymentpage" options={{ title: 'Wallet Payment' }} />
               <Stack.Screen name="walletsubscribepaymentpage" options={{ title: 'Wallet Payment' }} />
              <Stack.Screen name="razorpaywebviewwallet" options={{ title: '' }} />
      <Stack.Screen name="razorpaywebviewsubscribe" options={{ title: '' }} />
            
    </Stack>
  );
}
