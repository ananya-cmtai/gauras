import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateCartItem } from '../../redux/cartSlice';
import { RootState } from '../../redux/store'; // apne store ka sahi path daal dena

export default function CartScreen() {
  type Coupon = {
  name: string;
  discountAmount: number;
  discountTitle:string // in percentage
};

  const dispatch = useDispatch();
 const router=useRouter();
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [couponModalVisible, setCouponModalVisible] = useState(false);
const [claimedCoupon, setClaimedCoupon] = useState<Coupon | null>(null);

const [settings, setSettings] = useState<{ gst: number; deliveryCharge: number; extraCharge: number; coupons: Coupon[] }>({
  gst: 0,
  deliveryCharge: 0,
  extraCharge: 0,
  coupons: [],
});


const [showAddressModal, setShowAddressModal] = useState(false);
const [addressInput, setAddressInput] = useState('');
 const cartItems = useSelector((state: RootState) => state.cart.items);
useEffect(() => {
  const fetchSettings = async () => {
    try {
      const res = await axios.get('https://gauras-backened.vercel.app/api/settings');

      setSettings(res.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };
  fetchSettings();
}, []);

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
        const address=user.address
        if(address){
       setAddressInput(address);
        }
      
      } catch (error) {
        // console.error('Failed to fetch profile:', error);
        Alert.alert('Error', 'Could not load profile');
      }
    };

    fetchProfile();
  }, []);

useEffect(() => {
  const saveCartToBackend = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await axios.post(
        'https://gauras-backened.vercel.app/api/cart/save',
        { items: cartItems },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error('Cart sync error:', err);
    }
  };


    saveCartToBackend();

}, [cartItems]);

 const subtotal = cartItems.reduce(
  (sum, item) => sum + (item.price || 0) * item.quantityPackets,
  0
);

const gstAmount = (subtotal * (settings.gst || 0)) / 100;
const deliveryCharge = settings.deliveryCharge || 0;
const extraCharge = settings.extraCharge || 0;

const finalTotal = subtotal + gstAmount + deliveryCharge + extraCharge;
// coupon discount is percentage off on total after gst and charges
const discountAmount = claimedCoupon
  ? ((subtotal * claimedCoupon.discountAmount) / 100)
  : 0;

const totalAfterDiscount = finalTotal - discountAmount;

  const updateQuantity = (productId: string, change: number) => {
    const item = cartItems.find(i => i.productId === productId);
    if (!item) return;

    const newPackets = item.quantityPackets + change;

    if (newPackets <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateCartItem({
        productId,
        quantity: item.quantity,  // quantity string hai, isko waise hi rakh rahe hain
        quantityPackets: newPackets,
      }));
    }
  };

  const removeItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

const total = cartItems.reduce(
  (sum, item) => sum + (item.price || 0) * item.quantityPackets,
  0
);


  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.imageUrl  || 'https://static.toiimg.com/photo/113458714.cms' }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{(parseFloat(item.price) || 0) * item.quantityPackets}</Text>
        <Text style={styles.itemQuantityText}>{item.quantity}</Text>
      </View>
      <View style={styles.itemControls}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.productId, -1)}
          >
            <Ionicons name="remove" size={16} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantityPackets}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.productId, 1)}
          >
            <Ionicons name="add" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.productId)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={64} color="#fecd54" />
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyText}>
        Add some delicious dairy products to get started
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
      </View> */}
      
      {cartItems.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.productId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cartList}
          />
<View style={styles.footer}>
  <TouchableOpacity onPress={() => setCouponModalVisible(true)}>
  {claimedCoupon ? (
    <View style={styles.claimedCouponContainer}>
      <View>
        <Text style={styles.couponAppliedText}>Coupon Applied: {claimedCoupon.name}</Text>
        <Text style={styles.couponDiscountText}>
          - {claimedCoupon.discountAmount}% (− ₹{discountAmount.toFixed(2)})
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeCouponButton}
        onPress={() => setClaimedCoupon(null)}
      >
        <Ionicons name="close-circle" size={22} color="#EF4444" />
      </TouchableOpacity>
    </View>
  ) : (
    <Text style={styles.applyCouponText}><Ionicons name="pricetag-outline" size={20} color="#0b380e" />
 Apply a Coupon</Text>
  )}
</TouchableOpacity>

  <View style={styles.totalContainer}>
    <Text style={styles.totalLabel}>Subtotal</Text>
    <Text style={styles.totalAmount}>₹{subtotal.toFixed(2)}</Text>
  </View>

  <View style={styles.totalContainer}>
    <Text style={styles.totalLabel}>GST ({settings.gst}%)</Text>
    <Text style={styles.totalAmount}>₹{gstAmount.toFixed(2)}</Text>
  </View>

  <View style={styles.totalContainer}>
    <Text style={styles.totalLabel}>Delivery Charge</Text>
    <Text style={styles.totalAmount}>₹{deliveryCharge.toFixed(2)}</Text>
  </View>

  <View style={styles.totalContainer}>
    <Text style={styles.totalLabel}>Extra Charge</Text>
    <Text style={styles.totalAmount}>₹{extraCharge.toFixed(2)}</Text>
  </View>

<View style={styles.totalContainer}>
  <Text style={styles.totalLabel}>Discount</Text>
  <Text style={styles.totalAmount}>- ₹{discountAmount.toFixed(2)}</Text>
</View>

<View style={[styles.totalContainer, { borderTopWidth: 1, borderTopColor: '#ccc', marginTop: 10, paddingTop: 10 }]}>
  <Text style={[styles.totalLabel, { fontSize: 20, fontWeight: 'bold' }]}>Total Amount</Text>
  <Text style={[styles.totalAmount, { fontSize: 20, fontWeight: 'bold' }]}>₹{totalAfterDiscount.toFixed(2)}</Text>
</View>


  <TouchableOpacity
    style={styles.checkoutButton}
    onPress={() => setShowAddressModal(true)}
  >
    <Text style={styles.checkoutButtonText}>Add Address</Text>
  </TouchableOpacity>
 

</View>

        </>
      )}
      <Modal
  visible={showPaymentModal}
  animationType="slide"
  transparent
  onRequestClose={() => setShowPaymentModal(false)}
>
  <Pressable style={styles.modalOverlay} onPress={() => setShowPaymentModal(false)}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Choose Payment Method</Text>

      <TouchableOpacity style={styles.paymentButton} onPress={() => {
        setShowPaymentModal(false);
         router.push({
    pathname: '/walletpaymentpage',
    params: {
         amount:totalAfterDiscount.toFixed(2),
     address:addressInput
    },
  });
     
     
      }}>
        <Text style={styles.paymentIcon}>💰</Text>
        <Text style={styles.paymentText}>Pay with Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.paymentButton, styles.paymentOnline]} onPress={() => {
        setShowPaymentModal(false);
          router.push({
    pathname: '/razorpaywebview',
    params: {
      amount:totalAfterDiscount.toFixed(2),
     address:addressInput
    },
  });
    
      }}>
        <Text style={styles.paymentIcon}>💳</Text>
        <Text style={styles.paymentText}>Pay Online</Text>
      </TouchableOpacity>
    </View>
  </Pressable>
</Modal>
<Modal
  visible={showAddressModal}
  animationType="slide"
  transparent
  onRequestClose={() => setShowAddressModal(false)}
>
  <Pressable style={styles.modalOverlay} onPress={() => setShowAddressModal(false)}>
    <View style={styles.addressModalContent}>
      <Text style={styles.modalTitle}>Add Delivery Address</Text>

      <TextInput
        style={styles.addressInput}
        placeholder={"Enter your address"}
        placeholderTextColor="#999"
        multiline
        value={addressInput}
        onChangeText={setAddressInput}
      />
      { addressInput.length ==0?
<TouchableOpacity
        style={styles.saveAddressButton}
       
      >
        <Text style={styles.saveAddressButtonText}>Fill Address Firstly...</Text>
      </TouchableOpacity>:
      <TouchableOpacity
        style={styles.saveAddressButton}
        onPress={() => {
          setShowAddressModal(false);
          setShowPaymentModal(true);
          // Alert.alert("Address Saved", addressInput); // replace with logic
          // optionally: setUserAddress(addressInput);
        }}
      >
        <Text style={styles.saveAddressButtonText}>Proceed to Checkout</Text>
      </TouchableOpacity>}
    </View>
  </Pressable>
</Modal>
<Modal
  visible={couponModalVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setCouponModalVisible(false)}
>
  <Pressable style={styles.modalOverlay} onPress={() => setCouponModalVisible(false)}>
    <View style={styles.couponModalContent}>
      <Text style={styles.modalTitle}>Available Coupons</Text>

      {settings.coupons.length === 0 ? (
        <Text style={{textAlign:'center', marginVertical: 20}}>No coupons available</Text>
      ) : (
        settings.coupons.map((coupon) => {
          const isClaimed = claimedCoupon?.name === coupon.name;
          return (
            <View key={coupon.name} style={styles.couponItem}>
              <View>
                <Text style={styles.couponName}>{coupon.name}</Text>
                <Text style={styles.couponDiscount}>{coupon.discountAmount}% off</Text>
              </View>
              <TouchableOpacity
                style={[styles.couponButton, isClaimed ? styles.couponRemoveButton : styles.couponClaimButton]}
                onPress={() => {
                  if (isClaimed) {
                    setClaimedCoupon(null);  // Remove coupon
                  } else {
                    setClaimedCoupon(coupon); // Claim coupon
                  }
                }}
              >
                <Text style={styles.couponButtonText}>{isClaimed ? 'Remove' : 'Claim'}</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  </Pressable>
</Modal>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cartList: {
    padding: 20,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b380e',
    marginBottom: 2,
  },
  itemQuantityText: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemControls: {
    alignItems: 'center',
    gap: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantity: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0b380e',
  },
  checkoutButton: {
    backgroundColor: '#0b380e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fecd54',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'flex-end',
},

modalContent: {
  backgroundColor: '#fff',
  paddingVertical: 24,
  paddingHorizontal: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 10,
},

modalTitle: {
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 20,
  textAlign: 'center',
  color: '#333',
},

paymentButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#E0F7EC',
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderRadius: 12,
  marginBottom: 14,
},

paymentOnline: {
  backgroundColor: '#E3F2FD',
},

paymentIcon: {
  fontSize: 24,
  marginRight: 12,
},

paymentText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
},
addAddressButton: {
  backgroundColor: '#0b380e',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignSelf: 'flex-start',
  marginTop: 20,
},

addAddressButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
},

addressModalContent: {
  backgroundColor: '#fff',
  paddingVertical: 24,
  paddingHorizontal: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 10,
},

addressInput: {
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 10,
  padding: 12,
  fontSize: 16,
  textAlignVertical: 'top',
  height: 100,
  marginBottom: 20,
  color: '#333',
},

saveAddressButton: {
  backgroundColor: '#0b380e',
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: 'center',
},

saveAddressButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},
applyCouponButton: {
  backgroundColor: '#0b380e',
  paddingVertical: 12,
  marginHorizontal: 20,
  borderRadius: 12,
  marginBottom: 16,
  alignItems: 'center',
},
applyCouponButtonText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 16,
},

couponModalContent: {
  backgroundColor: '#fff',
  paddingVertical: 24,
  paddingHorizontal: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 10,
  maxHeight: '60%',
},

couponItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},

couponName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1F2937',
},

couponDiscount: {
  fontSize: 14,
  color: '#4B5563',
},

couponButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
},

couponClaimButton: {
  backgroundColor: '#0b380e',
},

couponRemoveButton: {
  backgroundColor: '#EF4444',
},

couponButtonText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 14,
},
claimedCouponContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#E0F7EC',
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 14,
  marginHorizontal: 20,
  marginBottom: 12,
},

couponAppliedText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#0b380e',
},

couponDiscountText: {
  fontSize: 14,
  color: '#10B981',
  marginTop: 4,
},

removeCouponButton: {
  marginLeft: 10,
  padding: 4,
},

applyCouponText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#0b380e',
  marginHorizontal: 20,
  marginBottom: 12,
},

});