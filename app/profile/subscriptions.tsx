import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubscriptionsScreen() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [skippedDates, setSkippedDates] = useState<{ [key: string]: any }>({});
const [saving, setSaving] = useState(false);
  const [weeklyModalVisible, setWeeklyModalVisible] = useState(false);
const DAYS_OF_WEEK = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const [weeklyDates, setWeeklyDates] = useState<string[]>([]);
  const [selectedWeeklyDate, setSelectedWeeklyDate] = useState<string | null>(null);
  const [alreadySkippedDates, setAlreadySkippedDates] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
       const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch('https://gauras-backened.vercel.app/api/subscriptions', {
        headers: {
         Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      // console.error('Error fetching subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscriptions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#0b380e';
      case 'Expired':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };
  // Compute delivery dates between startDate and renewalDate (expiry) for a weekly subscription
const computeDeliveryDatesBetween = (subscription: any): string[] => {
  if (!subscription.startDate || !subscription.deliveryDays) return [];

  const deliveryDayName = subscription.deliveryDays; // e.g. "Saturday"
  const deliveryDayIndex = DAYS_OF_WEEK.indexOf(deliveryDayName); // 6 for Saturday

  if (deliveryDayIndex === -1) return [];

  const start = new Date(subscription.startDate);
  start.setHours(0, 0, 0, 0); // Normalize time

  // Clone start
  const firstDelivery = new Date(start);

  const currentDay = firstDelivery.getDay(); // 0-6

  // Calculate how many days to add to reach next deliveryDay
  const daysToAdd = (deliveryDayIndex - currentDay + 7) % 7;

  // Move to first delivery day (same day or next one)
  firstDelivery.setDate(firstDelivery.getDate() + daysToAdd);

  // Now add 4 weekly dates
  const dates: string[] = [];
  for (let i = 0; i < 4; i++) {
    const deliveryDate = new Date(firstDelivery);
    deliveryDate.setDate(firstDelivery.getDate() + i * 7);
    dates.push(deliveryDate.toISOString().split('T')[0]);
  }

  return dates;
};


 const openWeeklySkipModal = (subscription: any) => {
  const dates = computeDeliveryDatesBetween(subscription);
  setWeeklyDates(dates);
  setSelectedWeeklyDate(null);
  setSelectedSubscription(subscription);

  // Initialize alreadySkippedDates from subscription.skippedDates
  if (subscription.skippedDates && subscription.skippedDates.length > 0) {
    const skipped = subscription.skippedDates.map((d: string) => d.split('T')[0]);
    setAlreadySkippedDates(skipped);
  } else {
    setAlreadySkippedDates([]);
  }

  setWeeklyModalVisible(true);
};

  const submitWeeklySkip = async () => {
    if (!selectedWeeklyDate || !selectedSubscription) {
      Alert.alert('Select a date first');
      return;
    }
    setSaving(true);
    const token = await AsyncStorage.getItem('userToken');
    try {
      const resp = await fetch(
        `https://gauras-backened.vercel.app/api/subscriptions/${selectedSubscription._id}/skip-dates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ skippedDates: [selectedWeeklyDate] }),
        }
      );
      const json = await resp.json();
      if (resp.ok) {
        Alert.alert('Success', 'Date skipped');
        setWeeklyModalVisible(false);
        fetchSubscriptions();
      } else {
        Alert.alert('Error', json.message || 'Could not skip');
      }
    } catch (err) {
      // console.error(err);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };


  const handleDatePress = (day: any) => {
    const dateString = day.dateString;
    const newSkippedDates = { ...skippedDates };

    if (newSkippedDates[dateString]) {
      delete newSkippedDates[dateString];
    } else {
      newSkippedDates[dateString] = { selected: true, selectedColor: '#EF4444' };
    }

    setSkippedDates(newSkippedDates);
  };

  const saveSkippedDates = async () => {
    if (!selectedSubscription) return;
  setSaving(true);
    const skippedDatesArray = Object.keys(skippedDates);
   const token = await AsyncStorage.getItem('userToken');
    try {
      
      const response = await fetch(
        `https://gauras-backened.vercel.app/api/subscriptions/${selectedSubscription._id}/skip-dates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ skippedDates: skippedDatesArray }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Skipped dates updated!');
        setShowCalendar(false);
        fetchSubscriptions(); // Refresh subscriptions to get updated data
      } else {
        Alert.alert('Failed', result.message || 'Failed to update skipped dates');
      }
    } catch (error) {
      // console.error('Error saving skipped dates:', error);
      Alert.alert('Error', 'Error saving skipped dates');
    }finally{
        setSaving(false);
    }
  };

  const renderSubscription = (subscription: any) => {
    return (
      <View key={subscription._id} style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
       
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(subscription.status) },
            ]}
          >
            <Text style={styles.statusText}>{subscription.status}</Text>
          </View>
        </View>
<View style={styles.productInfoRow}>
  {subscription.productId?.imageUrl && (
    <Image
      source={{ uri: subscription.productId.imageUrl[0]  || 'https://static.toiimg.com/photo/113458714.cms' }}
      style={styles.productImage}
      resizeMode="cover"
    />
  )}
  <View style={styles.productTextWrapper}>
    <Text style={styles.productName}>
      {subscription.productId?.name || 'Product Name'}
    </Text>
    <Text style={styles.productQuantity}>
      {subscription.productId?.quantity ? `${subscription.productId.quantity} ml` : ''}
    </Text>
  </View>
</View>


        <View style={styles.subscriptionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{subscription.numberPacket}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frequency:</Text>
            <Text style={styles.detailValue}>{subscription.subscriptionType}</Text>
          </View>
          { subscription.subscriptionType==="Weekly"?
           <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frequency:</Text>
            <Text style={styles.detailValue}>{subscription.deliveryDays}</Text>
          </View>:<></>}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expiry Date:</Text>
            <Text style={styles.detailValue}>{formatDate(subscription.renewalDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Started:</Text>
            <Text style={styles.detailValue}>{formatDate(subscription.startDate)}</Text>
          </View>
        </View>

        <View style={styles.subscriptionActions}>
             {(subscription.subscriptionType === 'Daily'  || subscription.subscriptionType === 'Alternate')
 && (
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => {
              setSelectedSubscription(subscription);
              setShowCalendar(true);

              // Initialize skippedDates state from subscription
              if (subscription.skippedDates) {
                const initialSkippedDates: { [key: string]: any } = {};
                subscription.skippedDates.forEach((date: string) => {
                  const d = new Date(date).toISOString().split('T')[0];
                  initialSkippedDates[d] = { selected: true, selectedColor: '#EF4444' };
                });
                setSkippedDates(initialSkippedDates);
              } else {
                setSkippedDates({});
              }
            }}
          >
            <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
            <Text style={styles.calendarButtonText}>Manage Skip Dates</Text>
          </TouchableOpacity>)}
             {subscription.subscriptionType.toLowerCase() === 'weekly' && (
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => openWeeklySkipModal(subscription)}
          >
            <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
            <Text style={styles.calendarButtonText}>Skip a Delivery Day</Text>
          </TouchableOpacity>
        )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}   refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0b380e']} />
        } contentContainerStyle={{  paddingBottom:100,flexGrow:1}} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#0b380e" size="large"/>
        ) : subscriptions.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No subscriptions found.</Text>
        ) : (
          subscriptions.map(renderSubscription)
        )}
        
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCalendar(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCalendar(false)}
            >
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Manage Skip Dates</Text>
            <View style={styles.closeButton} />
          </View>

          <View style={styles.calendarContainer}>
            <Text style={styles.calendarInstructions}>
              Tap on dates to skip deliveries. Red dates are already skipped.
            </Text>

            <Calendar
              onDayPress={handleDatePress}
              markedDates={skippedDates}
              theme={{
                todayTextColor: '#0b380e',
                selectedDayBackgroundColor: '#0b380e',
                selectedDayTextColor: '#FFFFFF',
                arrowColor: '#0b380e',
                monthTextColor: '#1F2937',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
              }}
              minDate={new Date().toISOString().split('T')[0]}
              style={styles.calendar}
            />

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Skipped Delivery</Text>
              </View>
            </View>
          </View>

        <TouchableOpacity
  style={[styles.saveButton, saving && { opacity: 0.6 }]}
  onPress={saveSkippedDates}
  disabled={saving}
>
  <Text style={styles.saveButtonText}>
    {saving ? 'Saving...' : 'Save Changes'}
  </Text>
</TouchableOpacity>

        </SafeAreaView>
      </Modal>
      <Modal
        visible={weeklyModalVisible}
        animationType="slide"
        onRequestClose={() => setWeeklyModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitleWeekly}>Select a delivery date to skip</Text>
          <ScrollView contentContainerStyle={styles.datesListContainer}>
        { weeklyDates.map(dateStr => {
  const isAlreadySkipped = alreadySkippedDates.includes(dateStr);
  const isSelected = selectedWeeklyDate === dateStr;

  return (
    <TouchableOpacity
      key={dateStr}
      style={[
        styles.weeklyDateBox,
        isSelected && styles.weeklyDateBoxSelected,
        isAlreadySkipped && styles.weeklyDateBoxSkipped,
      ]}
      onPress={() => {
        if (!isAlreadySkipped) setSelectedWeeklyDate(dateStr);
      }}
      disabled={isAlreadySkipped}
      activeOpacity={isAlreadySkipped ? 1 : 0.8} // disable opacity change on disabled
    >
      <Text
        style={[
          styles.weeklyDateText,
          isSelected && styles.weeklyDateTextSelected,
          isAlreadySkipped && styles.weeklyDateTextSkipped,
        ]}
      >
        {formatDate(dateStr)}
      </Text>
    </TouchableOpacity>
  );
})}

            {weeklyDates.length === 0 && (
              <Text style={{ alignSelf:'center', marginTop:20 }}>No delivery days in that period</Text>
            )}
          </ScrollView>
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            disabled={saving}
            onPress={submitWeeklySkip}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Submitting...' : 'Skip Selected Date'}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
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
    padding: 20,
    paddingBottom:100
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productInfoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
},

productImage: {
  width: 50,
  height: 50,
  borderRadius: 8,
  backgroundColor: '#F3F4F6',
},

productTextWrapper: {
  flexShrink: 1,
  alignItems: 'flex-end',
},
productName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1F2937',
},
productQuantity: {
  fontSize: 14,
  color: '#6B7280',
},


  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent:'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subscriptionDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  subscriptionActions: {
    gap: 12,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b380e',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },weeklyDateBoxSkipped: {
  backgroundColor: '#E5E7EB', // light gray background
  borderColor: '#9CA3AF', // medium gray border
  shadowOpacity: 0,
  elevation: 0,
},

weeklyDateTextSkipped: {
  color: '#6B7280', // gray text
  textDecorationLine: 'line-through',
},

  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
   modalTitleWeekly: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop:30,
    marginBottom:30,
   alignSelf:"center",
    color: '#0b380e',
  },
  calendarContainer: {
    flex: 1,
    padding: 20,
  },
  calendarInstructions: {
    marginBottom: 8,
    color: '#374151',
    fontSize: 14,
  },
  calendar: {
    borderRadius: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#0b380e',
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  // Weekly modal container with padding and background
  weeklyModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },

  // Modal title with margin bottom
  weeklyModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Scroll container for date buttons, flex wrap for better fit
  datesListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop:20,
    gap: 12, // works only in some react-native versions, else use margin on buttons
    paddingBottom: 20,
  },

  // Weekly date button container (already defined, keeping here for clarity)
  weeklyDateBox: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: '#F9FAFB', // very light gray
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB', // light border
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },

  weeklyDateBoxSelected: {
    backgroundColor: '#2563EB', // bright blue
    borderColor: '#1D4ED8',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  weeklyDateText: {
    color: '#374151', // dark gray
    fontWeight: '600',
    fontSize: 16,
  },

  weeklyDateTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // Submit button styling
  weeklySubmitButton: {
    backgroundColor: '#0b380e',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 40,
    shadowColor: '#0b380e',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  weeklySubmitButtonDisabled: {
    backgroundColor: '#A7F3D0', // lighter green when disabled
  },

  weeklySubmitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },

  // Message when no delivery dates
  noDatesText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 40,
  },

});
