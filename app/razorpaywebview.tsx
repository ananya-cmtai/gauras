import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalAlert from './profile/modelalert'; // Ensure this is a properly typed component

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { clearCart } from '@/redux/cartSlice';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';
const { height: screenHeight } = Dimensions.get('window');
 const router =useRouter();
type PaymentResponse = {
  success: boolean;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
};

type RouteParams = {
  amount: number;
  onPaymentComplete: (response: PaymentResponse) => void;
};

type Props = NativeStackScreenProps<any, any> & {
  route: {
    params: RouteParams;
  };
};

const RazorpayWebView: React.FC<Props> = () => {
 
  const { address } = useLocalSearchParams();
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
   const [razorpay_payment_id, setrazorpay_payment_id] = useState<string>('');
     const [razorpay_order_id, setrazorpay_order_id] = useState<string>('');
  const [razorpay_signature, setrazorpay_signature] = useState<string>('');
  const [order, setOrder] = useState<{ id: string } | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [messageAlert, setMessageAlert] = useState<string>('');
  const [openModalAlert, setOpenModalAlert] = useState<boolean>(false);

  const openModalAlertFunction = (value: string) => {
    setOpenModalAlert(true);
    setMessageAlert(value);
  };
    const cartItems = useSelector((state: RootState) => state.cart.items);
const amount = cartItems.reduce(
  (sum, item) => sum + (item.price || 0) * item.quantityPackets,
  0
);


  // 🔐 Fetch token once
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          openModalAlertFunction('User is not authenticated!');
          return;
        }
        setUserToken(token);
      } catch (error) {
        openModalAlertFunction('Failed to retrieve authentication!');
      }
    };

    if (!userToken) {
      fetchToken();
    }
  }, [userToken]);

  // 🧾 Create Razorpay order
useEffect(() => {
  if (userToken) {
    fetch('https://gauras-backened.vercel.app/api/orders/razorpay/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ total: amount}),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          // console.error('Server responded with error:', data);
          openModalAlertFunction(
            data?.message || 'Failed to create order!\nPlease try again!'
          );
          return;
        }

        if (data && data.id) {
          setOrder(data);
          // console.log('Razorpay order created:', data);
        } else {
          openModalAlertFunction('Order creation failed. No order ID returned.');
        }
      })
      .catch((err) => {
        // console.error('Error creating Razorpay order:', err);
        openModalAlertFunction('Failed to create order! Please check your internet connection.');
      });
  }
}, [userToken, amount]);

useEffect(() => {
  // console.log("RazorpayWebView screen mounted!");
}, []);

  // 👤 Get user info
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedName = await AsyncStorage.getItem('currentUserName');
        const storedEmail = await AsyncStorage.getItem('currentUserEmail');
        const storedPhone = await AsyncStorage.getItem('currentUserPhone');

        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
        if (storedPhone) setPhone(storedPhone);
      } catch (error) {
        // console.error('Failed to load user data:', error);
      }
    };

    fetchUserDetails();
  }, []);

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const dispatch = useDispatch();
const placeOrder = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('userToken');

    if (!userId || !token) {
      Alert.alert('Error', 'User not logged in');
      router.push('/cart');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Add some items to place order.');
      router.push('/cart');
      return;
    }

    const products = cartItems.map((item) => ({
      productId: item.productId,
      quantityPacket: item.quantityPackets,
      quantity: item.quantity,
      productName: item.name,
    }));

    const orderData = {
      userId,
      products,
      totalAmount: amount,
      deliveryAddress: address,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,paymentMode:"Razorpay"
    };

    const response = await axios.post(
      'https://gauras-backened.vercel.app/api/orders/',
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 201 || response.status === 200) {
      Alert.alert('Success', 'Your order has been placed!');
      dispatch(clearCart());
      router.push('/cart');
    } else {
      Alert.alert('Error', 'Something went wrong. Try again.');
      router.push('/cart');
    }
  } catch (error: any) {
    // console.error('Order placement error:', error?.response?.data || error.message);
    Alert.alert('Error', 'Failed to place order. Please try again.');
    router.push('/cart');
  }
};




const handleMessage = async (event: WebViewMessageEvent) => {
  try {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.status === 'success') {
      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      } = data.response;

      if (!razorpay_order_id || !razorpay_signature || !razorpay_payment_id) {
        openModalAlertFunction('Invalid payment response. Please try again.');
        return;
      }

      // ✅ Pass data directly
      await placeOrder({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
    } else {
      openModalAlertFunction('Payment was cancelled or failed.');
      router.push('/cart');
    }
  } catch (error) {
    // console.error('Error parsing payment response:', error);
    openModalAlertFunction('Error parsing payment response.');
  }
};


  return (
    <>
      <WebView
  originWhitelist={['*']}
  source={{
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body>
          <script>
            function waitForRazorpay() {
              if (typeof Razorpay !== "undefined") {
                var options = {
                  "key": "rzp_test_h7fC45pYvbeKRH",
                  "amount": "${amount * 100}",
                  "currency": "INR",
                  "order_id": "${order.id}",
                  "name": "Milan Juice",
                  "description": "Order Payment",
                  "handler": function (response) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', response }));
                  },
                  "modal": {
                    "ondismiss": function () {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' }));
                    }
                  },
                  "prefill": {
                    "email": "${email}",
                    "contact": "${phone}",
                    "name": "${name}"
                  },
                  "theme": {
                    "color": "#F37254"
                  }
                };
                var rzp1 = new Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'failed', response: response.error.description }));
                });
                rzp1.open();
              } else {
                setTimeout(waitForRazorpay, 100);
              }
            }
            waitForRazorpay();
          </script>
        </body>
      </html>
    `,
  }}
  onMessage={handleMessage}
  startInLoadingState
  renderLoading={() => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  )}
/>

      <ModalAlert
        visible={openModalAlert}
        onClose={() => setOpenModalAlert(false)}
        messageAlert={messageAlert}
      />
    </>
  );
};

export default RazorpayWebView;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
