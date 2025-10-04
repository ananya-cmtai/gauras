import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OrderItem {
  productName: string;
  quantityPacket: number;
  quantity:string;
}
interface Order {
  _id: string;
  status: string;
  createdAt: string;     // rename date to createdAt
  totalAmount: number;
  products: OrderItem[];  // rename items to products
}


export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
   const fetchOrders = async () => {
    try {
      // 👇 सबसे पहले AsyncStorage से userId लो
    const storedUserId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');

      if (!storedUserId || !token) {
        console.warn('User ID or token not found');
        return;
      }

      setUserId(storedUserId);

      // 👇 अब API call करो
      const response = await axios.get(
       `https://gauras-backened.vercel.app/api/orders/user/${storedUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data)
      setOrders(response.data);
    } catch (error) {
      // console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

useEffect(() => {
 
  fetchOrders();
}, []);
 const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return '#0b380e';
      case 'Processing':
        return '#3B82F6';
      case 'Shipped':
        return '#F59E0B';
      case 'Cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };
const formatDateTime = (isoDate: string) => {
  const date = new Date(isoDate);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleString('en-IN', options); // or use 'en-US' if preferred
};

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

   <Text style={styles.orderDate}>
  {formatDateTime(item.createdAt)}
</Text>


      <View style={styles.orderItems}>
      {(item.products ?? []).map((orderItem, index) => (
  <View key={index} style={styles.orderItem}>
    <Text style={styles.itemName}>{orderItem.productName}({orderItem.quantity})</Text>
    <Text style={styles.itemQuantity}>Qty: {orderItem.quantityPacket}</Text>
  </View>
))}

      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>Total: ₹{item.totalAmount}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0b380e" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ordersList}
          refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0b380e']} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  ordersList: {
    padding: 20,
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
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
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderFooter: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0b380e',
  },
});
