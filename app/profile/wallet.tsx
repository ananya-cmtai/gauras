import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalAlert from './modelalert';

export default function WalletScreen() {
  const [walletBalance,setWalletBalance]=useState(0);
   const router=useRouter();
   const [loading, setLoading] = useState(true);
   const [amount,setAmount]=useState('');
     const [refreshing, setRefreshing] = useState(false); 
       const fetchProfile = async () => {
      // setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const res = await axios.get(`https://gauras-backened.vercel.app/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data.user;
        const wallet=user.wallet.balance
        if(wallet){
          setWalletBalance(wallet);
        }
      
      } catch (error) {
        // console.error('Failed to fetch profile:', error);
        Alert.alert('Error', 'Could not load profile');
      }finally{
        setLoading(false); 
           setRefreshing(false);
      }
    };
      useEffect(() => {
  

    fetchProfile();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

 const payWithRazorpay = () => {
  if(amount ===''){
    openModalAlertFunction("Please select amount firstly! ")
  }else{
  router.push({
    pathname: '/razorpaywebviewwallet',
    params: {
     amount:amount
    },
  });
}
  };
    const [messageAlert, setMessageAlert] = useState<string>('');
    const [openModalAlert, setOpenModalAlert] = useState<boolean>(false);
  
    const openModalAlertFunction = (value: string) => {
      setOpenModalAlert(true);
      setMessageAlert(value);
    };
    if (loading) {
  return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color="#0b380e" />
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}   refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0b380e']} />
        }>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>
          <Text style={styles.balanceAmount}>₹{walletBalance.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addMoneyButton} onPress={payWithRazorpay}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.amountButtons}>
            {['100', '500', '1000', '2000'].map((amount) => (
              <TouchableOpacity key={amount} style={styles.amountButton} onPress={()=>setAmount(amount)}>
                <Text style={styles.amountButtonText}>{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#0b380e" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Secure Payments</Text>
              <Text style={styles.featureDescription}>
                Your money is safe with bank-level security
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="flash" size={24} color="#F59E0B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Instant Transactions</Text>
              <Text style={styles.featureDescription}>
                Lightning-fast payments and refunds
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="gift" size={24} color="#EF4444" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Cashback Rewards</Text>
              <Text style={styles.featureDescription}>
                Earn rewards on every purchase
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
       <ModalAlert
        visible={openModalAlert}
        onClose={() => setOpenModalAlert(false)}
        messageAlert={messageAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flexGrow: 1,
  },
  balanceCard: {
    backgroundColor: '#0b380e',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#DCFCE7',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addMoneyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b380e',
  },
  quickActions: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  amountButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  amountButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  features: {
    margin: 20,
    marginTop: 0,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});