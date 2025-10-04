import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SubscriptionPage: React.FC = () => {
  const [packetCount, setPacketCount] = useState(1);
  const [subscriptionType, setSubscriptionType] = useState<'daily' | 'alternate' | 'weekly'>('daily');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // single day for weekly now
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
const [showAddressModal, setShowAddressModal] = useState(false);
const [addressInput, setAddressInput] = useState('');
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
 const router=useRouter();
  const { name, price, description, imageUrl, quantity, dailyPrice, alternatePrice, weeklyPrice, productId } = useLocalSearchParams<{
    name?: string;
    price?: string;
    description?: string;
    imageUrl?: string;
    quantity?: string;
    dailyPrice?: string;
    alternatePrice?: string;
    weeklyPrice?: string;
    productId?: string;
  }>();

  const [product, setProduct] = useState<null | {
    name: string;
    pricePerLitre: number;
    descriptionPoints: string[];
    image: string;
    packetSize: string;
    dailyPrice: number;
    alternatePrice: number;
    weeklyPrice: number;
    _id: string;
  }>(null);

  useEffect(() => {
    if (name && price && description && imageUrl && quantity && dailyPrice && alternatePrice && weeklyPrice && productId) {
      try {
        const parsedDescription = JSON.parse(description);
        const parsedPrice = parseFloat(price);
        const parsedDailyPrice = parseFloat(dailyPrice);
        const parsedAlternatePrice = parseFloat(alternatePrice);
        const parsedWeeklyPrice = parseFloat(weeklyPrice);

        setProduct({
          name: String(name),
          pricePerLitre: parsedPrice,
          descriptionPoints: parsedDescription,
          packetSize: quantity,
          image: imageUrl,
          dailyPrice: parsedDailyPrice,
          alternatePrice: parsedAlternatePrice,
          weeklyPrice: parsedWeeklyPrice,
          _id: productId
        });
      } catch (err) {
        Alert.alert('Error', 'Failed to load product details.');
      }
    }
  }, [name, price, description, imageUrl, quantity, dailyPrice, alternatePrice, weeklyPrice, productId]);

  const onChangeDate = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setStartDate(date);
    }
  };

  const selectDay = (day: string) => {
    setSelectedDay(prev => (prev === day ? null : day));
  };

  const getPriceByType = () => {
    switch (subscriptionType) {
      case 'daily': return product?.dailyPrice ?? 0;
      case 'alternate': return product?.alternatePrice ?? 0;
      case 'weekly': return product?.weeklyPrice ?? 0;
      default: return 0;
    }
  };

  const handleSubscribe = async () => {
    if (!product) {
      Alert.alert('Error', 'Product details not loaded');
      return;
    }

    if (subscriptionType === 'weekly' && !selectedDay) {
      Alert.alert('Error', 'Please select one day for weekly subscription');
      return;
    }

    const total = getPriceByType() * packetCount;

    const payload = {
      subscriptionType: subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1),  // Daily / Alternate / Weekly
      productId: product._id,
      numberPacket: packetCount,
      startDate: startDate.toISOString(),
      address: addressInput,  // you can add input for address
      total,
      ...(subscriptionType === 'weekly' && { deliveryDays: selectedDay })  // single string now
    };
router.push({
  pathname: '/razorpaywebviewsubscribe',
  params: {
    amount: total,
    payload: JSON.stringify(payload),  // <-- serialize here
  },
});

   
  };

  const handleSubscribeWallet = async () => {
    if (!product) {
      Alert.alert('Error', 'Product details not loaded');
      return;
    }

    if (subscriptionType === 'weekly' && !selectedDay) {
      Alert.alert('Error', 'Please select one day for weekly subscription');
      return;
    }

    const total = getPriceByType() * packetCount;

    const payload = {
      subscriptionType: subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1),  // Daily / Alternate / Weekly
      productId: product._id,
      numberPacket: packetCount,
      startDate: startDate.toISOString(),
      address: addressInput,  // you can add input for address
      total,
      ...(subscriptionType === 'weekly' && { deliveryDays: selectedDay })  // single string now
    };
router.push({
  pathname: '/walletsubscribepaymentpage',
  params: {
    amount: total,
    payload: JSON.stringify(payload),  // <-- serialize here
  },
});

   
  };

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F7' }}>
        <Text style={{ fontSize: 16, color: '#888' }}>Loading product details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F7F7' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerText}>New Subscription</Text>

        <View style={styles.productCard}>
          <Image source={{ uri: product.image  || 'https://static.toiimg.com/photo/113458714.cms' }} style={styles.productImage} />
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>₹{product.pricePerLitre} / Litre</Text>
          <Text style={styles.packetSize}>{product.packetSize}</Text>
        </View>

        <View style={styles.descriptionBox}>
          {product.descriptionPoints.map((point, index) => (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{point}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.subHeaderText}>Subscription Type</Text>
 


<View style={styles.pricePostersContainer}>

  {/* Daily */}
  <LinearGradient
    colors={['#43cea2', '#185a9d']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.posterCard}
  >
    <Text style={styles.posterIcon}>🌞</Text>
    <View>
      <Text style={styles.posterTitle}>Daily Subscription</Text>
      <Text style={styles.posterPrice}>₹{product.dailyPrice} -/-</Text>
    </View>
  </LinearGradient>

  {/* Alternate */}
  <LinearGradient
    colors={['#f7971e', '#ffd200']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.posterCard}
  >
    <Text style={styles.posterIcon}>📆</Text>
    <View>
      <Text style={styles.posterTitle}>Alternate Day</Text>
      <Text style={styles.posterPrice}>₹{product.alternatePrice} -/-</Text>
    </View>
  </LinearGradient>

  {/* Weekly */}
  <LinearGradient
    colors={['#ff512f', '#dd2476']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.posterCard}
  >
    <Text style={styles.posterIcon}>🗓️</Text>
    <View>
      <Text style={styles.posterTitle}>Weekly Plan</Text>
      <Text style={styles.posterPrice}>₹{product.weeklyPrice} -/-</Text>
    </View>
  </LinearGradient>

</View>


        <View style={styles.radioGroup}>
          {['daily', 'alternate', 'weekly'].map(type => {
            const isSelected = subscriptionType === type;
            return (
              <TouchableOpacity
                key={type}
                style={styles.radioOption}
                onPress={() => {
                  setSubscriptionType(type as any);
                  if (type !== 'weekly') {
                    setSelectedDay(null); // reset selected day if switching away from weekly
                  }
                }}
              >
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {subscriptionType === 'weekly' && (
          <>
            <Text style={styles.subHeaderText}>Select Delivery Day</Text>
            <View style={styles.dayCheckboxContainer}>
              {DAYS_OF_WEEK.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCheckbox,
                    selectedDay === day && styles.dayCheckboxSelected
                  ]}
                  onPress={() => selectDay(day)}
                >
                  <Text style={[
                    styles.dayCheckboxText,
                    selectedDay === day && styles.dayCheckboxTextSelected
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.subHeaderText}>Number of Packets</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.qtyButton} onPress={() => setPacketCount(prev => Math.max(1, prev - 1))}>
            <Text style={styles.qtyButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{packetCount}</Text>
          <TouchableOpacity style={styles.qtyButton} onPress={() => setPacketCount(prev => prev + 1)}>
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subHeaderText}>Start Date</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerButtonText}>{startDate.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onChangeDate}
          />
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#0b380e" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity
            style={styles.subscribeButton}
          //  onPress={() => setShowPaymentModal(true)}
            onPress={() => setShowAddressModal(true)}

          >
            <Text style={styles.subscribeButtonText}>Add Address</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
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
        placeholder="Enter your address"
        placeholderTextColor="#999"
        multiline
        value={addressInput}
        onChangeText={setAddressInput}
      />
{ addressInput.length ==0 ?
      <TouchableOpacity
        style={styles.saveAddressButton}
       
      >
        <Text style={styles.saveAddressButtonText}>Fill Address Firstly...</Text>
      </TouchableOpacity>
      :
      <TouchableOpacity
        style={styles.saveAddressButton}
        onPress={() => {
          setShowAddressModal(false);
       setShowPaymentModal(true)
          // Alert.alert("Address Saved", addressInput); // replace with logic
          // optionally: setUserAddress(addressInput);
        }}
      >
        <Text style={styles.saveAddressButtonText}>Subscribe Now</Text>
      </TouchableOpacity>
      }
    </View>
  </Pressable>
</Modal>

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
         handleSubscribeWallet();
        // Add wallet logic here
        // alert('Wallet payment selected');
      }}>
        <Text style={styles.paymentIcon}>💰</Text>
        <Text style={styles.paymentText}>Pay with Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.paymentButton, styles.paymentOnline]} onPress={() => {
        setShowPaymentModal(false);
     handleSubscribe();
      }}>
        <Text style={styles.paymentIcon}>💳</Text>
        <Text style={styles.paymentText}>Pay Online</Text>
      </TouchableOpacity>
    </View>
  </Pressable>
</Modal>

    </SafeAreaView>
  );
};

export default SubscriptionPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F7F7F7',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0b380e',
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0b380e',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#555',
    marginBottom: 2,
  },
  packetSize: {
    fontSize: 14,
    color: '#888',
  },
  descriptionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
    marginRight: 8,
    color: '#0b380e',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginVertical: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#0b380e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: '#007A46',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007A46',
  },
  radioLabel: {
    fontSize: 16,
    color: '#0b380e',
  },
  radioLabelSelected: {
    fontWeight: '700',
  },
  dayCheckboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCheckbox: {
    borderWidth: 1,
    borderColor: '#0b380e',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  dayCheckboxSelected: {
    backgroundColor: '#0b380e',
  },
  dayCheckboxText: {
    color: '#0b380e',
    fontSize: 14,
  },
  dayCheckboxTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
  },
  qtyButton: {
    backgroundColor: '#0b380e',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  qtyButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  qtyText: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderColor: '#0b380e',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerButtonText: {
    color: '#0b380e',
    fontSize: 16,
  },
  subscribeButton: {
    backgroundColor: '#0b380e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },pricePosterWrapper: {
  marginVertical: 20,
},
pricePostersContainer: {
  marginTop: 20,
  marginBottom: 30,
  gap: 12,
},

posterCard: {
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5,
},

posterIcon: {
  fontSize: 34,
  marginRight: 16,
  textShadowColor: 'rgba(0,0,0,0.2)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
},

posterTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#fff',
  marginBottom: 4,
  letterSpacing: 0.5,
},

posterPrice: {
  fontSize: 20,
  fontWeight: '900',
  color: '#fff',
  letterSpacing: 1,
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

});
