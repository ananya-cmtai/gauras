import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ProfileScreen() {
  const router = useRouter();

  const menuItems = [
    {
      id: '1',
      title: 'My Orders',
      icon: 'receipt-outline',
      route: '/profile/orders',
    },
    {
      id: '2',
      title: 'Update Profile',
      icon: 'person-outline',
      route: '/profile/update',
    },
    {
      id: '3',
      title: 'Wallet',
      icon: 'wallet-outline',
      route: '/profile/wallet',
    },
    {
      id: '4',
      title: 'Transactions',
      icon: 'card-outline',
      route: '/profile/transactions',
    },
    {
      id: '5',
      title: 'Active Subscriptions',
      icon: 'sync-outline',
      route: '/profile/subscriptions',
    },
    {
      id: '6',
      title: 'Favorites',
      icon: 'heart-outline',
      route: '/(tabs)/favorites',
    },
    {
      id: '7',
      title: 'Cart',
      icon: 'cart-outline',
      route: '/(tabs)/cart',
    },
  ];
 const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    referCode: '',
  });
  useEffect(()=>{
      const fetchProfile = async () => {
      // setLoading(true);
      try {
       const name = await AsyncStorage.getItem('currentUserName');
      const email = await AsyncStorage.getItem('currentUserEmail');
      const phone = await AsyncStorage.getItem('currentUserPhone');

      setProfile({
        name: name || '',
        email: email || '',
        phone: phone || '',
        address: '',
        referCode:''
    
      });
  } catch (error) {
        // console.error('Failed to fetch profile:', error);
        Alert.alert('Error', 'Could not load profile');
      }
    };

    fetchProfile();
 

  },[]);
    useEffect(() => {
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
        if(user.name){
    await AsyncStorage.setItem('currentUserName',user.name);
        }
  if(user.email){
     await AsyncStorage.setItem('currentUserEmail',user.email);
  }
    if(user.phone){
     await AsyncStorage.setItem('currentUserPhone',user.phone);
    }

        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          referCode :user.referCode
        });
      } catch (error) {
        // console.error('Failed to fetch profile:', error);
        Alert.alert('Error', 'Could not load profile');
      }
    };

    fetchProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
           <Ionicons name="person-circle-outline" size={80} color="#6B7280" />

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <Text style={styles.profilePhone}>{profile.phone}</Text>
            </View>
          </View>
        </View>
{/* Referral Code Section */}
<View style={styles.referralContainer}>
  <Text style={styles.referralLabel}>Your Referral Code:</Text>
  <View style={styles.referralCodeBox}>
    <Text style={styles.referralCodeText}>{profile.referCode || 'N/A'}</Text>
    <TouchableOpacity
      style={styles.copyButton}
      onPress={async () => {
        if (profile.referCode) {
          await Clipboard.setStringAsync(profile.referCode);
          Alert.alert('Copied!', 'Referral code copied to clipboard.');
        }
      }}
    >
      <Ionicons name="copy-outline" size={20} color="#0b380e" />
    </TouchableOpacity>
  </View>
</View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color="#0b380e"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
       <TouchableOpacity
  style={styles.logoutButton}
  onPress={async () => {
    await AsyncStorage.clear();
   
    router.replace('/signuploginscreen'); 
  }}
>
  <Ionicons name="log-out-outline" size={24} color="#EF4444" />
  <Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    paddingTop:0,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 16,
    color: '#6B7280',
  },
  menuContainer: {
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  referralContainer: {
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6',
  backgroundColor: '#f9fafb',
  marginBottom: 12,
},
referralLabel: {
  fontSize: 16,
  color: '#4B5563',
  marginBottom: 6,
},
referralCodeBox: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#E5E7EB',
  padding: 12,
  borderRadius: 8,
},
referralCodeText: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#111827',
},
copyButton: {
  padding: 6,
},

});