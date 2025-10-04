import { RootState } from '@/redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import ModalAlert from './profile/modelalert';

const WalletSubscribePaymentPage: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {amount,payload}=useLocalSearchParams();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const amountPay = cartItems.reduce(
    (sum, item) => sum + (item.price|| 0) * item.quantityPackets, 
    0
  );
  const [descriptionText,setDescriptionText]=useState("");
    const [messageAlert, setMessageAlert] = useState<string>('');
    const [openModalAlert, setOpenModalAlert] = useState<boolean>(false);
  
    const openModalAlertFunction = (value: string) => {
      setOpenModalAlert(true);
      setMessageAlert(value);
    };
 

const numericAmount = parseFloat(typeof amount === 'string' ? amount : String(amount));


  // Fetch wallet balance from your backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const res = await axios.get('https://gauras-backened.vercel.app/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data.user;
        const wallet = user.wallet?.balance ?? 0;
        setWalletBalance(wallet);
      } catch (error) {
        // console.error('Failed to fetch profile:', error);
        Alert.alert('Error', 'Could not load wallet balance');
      }
    };

    fetchProfile();
  }, []);

  // Mock orderPlace function (replace with real implementation)
  const orderPlace = async () => {
    // console.log('Order placed with wallet payment.');
  };
  

const subscriptionDone = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('userToken');

    if (!userId || !token) {
      Alert.alert('Error', 'User not logged in');
      router.push('/');
      return;
    }

    if (!numericAmount) {
      Alert.alert('SELECT CORRECT AMOUNT');
      router.push('/');
      return;
    }

    if (!payload) {
      Alert.alert('Subscription data missing');
      router.push('/');
      return;
    }

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(payload as string);
    } catch (e) {
      Alert.alert('Invalid subscription data');
      return;
    }

    const orderData = {
      ...parsedPayload
      ,paymentMode:"Wallet"
    };

    // console.log('Sending subscription order data:', orderData);

    const response = await axios.post(
      'https://gauras-backened.vercel.app/api/subscriptions',
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 201 || response.status === 200) {
            const data = response.data;
         await deductWallet({ orderId: data._id });
    //   Alert.alert('Success', 'Your subscription has been placed!');
       openModalAlertFunction('Your subscription has been placed!');
      router.push('/');
    } else {
    //   Alert.alert('Error', 'Something went wrong. Try again.');
       openModalAlertFunction('Something went wrong. Try again.');
      router.push('/');
    }
  } catch (error: any) {
    // console.error('subscription placement error:', error?.response?.data || error.message);
    // Alert.alert('Error', 'Failed to place subscription. Please try again.');
     openModalAlertFunction('Something went wrong. Try again.');
    router.push('/');
  }
};
  // Deduct wallet amount API call
  const deductWallet = async ({ orderId }: { orderId: string }) => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('User not authenticated');

      const response = await axios.post(
        'https://gauras-backened.vercel.app/api/wallet/deduct',
        {
          amount: numericAmount,
          description : descriptionText || "Payment For Cart Order",
          orderId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
   
          openModalAlertFunction("Payment successful \nYour Order has been placed sucessfully!")
        // Alert.alert('Success', 'Payment successful');
        router.replace('/'); // Navigate to success or home screen
      } else {
        // throw new Error('Failed to deduct from wallet');
          openModalAlertFunction("Please try again!");
            router.replace('/');
      }
    } catch (err: any) {
      // Alert.alert('Error', err.message || 'Payment failed');
      openModalAlertFunction("Please try again!");
        router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = () => {
    if (numericAmount > walletBalance) {
      Alert.alert('Insufficient Balance', 'Please add funds to your wallet.');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Do you want to pay ₹${numericAmount.toFixed(2)} from your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: subscriptionDone },
      ]
    );
  };

  return (
    <>
    <View style={styles.container}>
      <Text style={styles.title}>Pay with Wallet</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Wallet Balance</Text>
        <Text style={styles.value}>₹{walletBalance.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Amount to Pay</Text>
        <Text style={[styles.value, { color: '#d32f2f' }]}>₹{numericAmount.toFixed(2)}</Text>
      </View>

     <View style={styles.card}>
  <Text style={styles.label}>Description</Text>
  <TextInput
    style={styles.textInput}
    value={descriptionText}
    onChangeText={setDescriptionText}
    placeholder="Enter description"
    multiline
  />
</View>

      {loading ? (
        <ActivityIndicator size="large" color="#0b380e" style={{ marginTop: 30 }} />
      ) : (
        <TouchableOpacity style={styles.payButton} onPress={confirmPayment}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      )}
    </View>
    <ModalAlert
        visible={openModalAlert}
        onClose={() => setOpenModalAlert(false)}
        messageAlert={messageAlert}
      />
    </>
  );
};

export default WalletSubscribePaymentPage;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0b380e',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  payButton: {
    backgroundColor: '#0b380e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  textInput: {
  minHeight: 60,
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 8,
  padding: 10,
  fontSize: 16,
  backgroundColor: '#fff',
},

});
