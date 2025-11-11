import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // <-- add refreshing state

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return 'arrow-down';
      case 'debit':
        return 'arrow-up';
      default:
        return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return '#0b380e';
      case 'debit':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch('https://gauras-backened.vercel.app/api/wallet/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      // console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
         setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };
  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View
        style={[
          styles.transactionIcon,
          { backgroundColor: getTransactionColor(item.type) + '20' },
        ]}
      >
        <Ionicons
          name={getTransactionIcon(item.type)}
          size={20}
          color={getTransactionColor(item.type)}
        />
      </View>

      <View style={styles.transactionContent}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <Text
        style={[
          styles.transactionAmount,
          { color: getTransactionColor(item.type) },
        ]}
      >
        {item.type.toLowerCase() === 'credit' ? '+' : '-'}₹
        {item.amount.toFixed(2)}
      </Text>
    </View>
  );

  if (loading) {
    return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#0b380e" />
        </SafeAreaView>
    );
  }

 return (
  <SafeAreaView style={styles.container}>
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.transactionsList}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0b380e']} />
      }
      ListEmptyComponent={() => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#555' }}>No transactions available</Text>
        </View>
      )}
    />
  </SafeAreaView>
);

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  transactionsList: {
    padding: 20,
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});