import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  removeFromCart,
  updateCartItem,
} from '../../redux/cartSlice';
import {
  removeFromFavourites,
} from '../../redux/favouriteSlice';
import { RootState } from '../../redux/store';

export default function FavoritesScreen() {
  const dispatch = useDispatch();

  const favourites = useSelector((state: RootState) => state.favourites.items);
  const cartItems = useSelector((state: RootState) => state.cart.items);
useEffect(() => {
  const saveFavouriteToBackend = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await axios.post(
        'https://gauras-backened.vercel.app/api/favourite/save',
        { items: favourites },
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


    saveFavouriteToBackend();
  
}, [favourites]);

  const getCartItem = (productId: string) =>
    cartItems.find(item => item.productId === productId);

  const handleAddToCart = (item: any) => {
   dispatch(
  addToCart({
    productId: item.productId,
    name: item.name,
    imageUrl: item.imageUrl,
    quantity: item.quantity ?? '',
    quantityPackets: 1,
    price: item.price ?? 0,
  })
);

  };

const handleIncrement = (productId: string) => {
  const cartItem = getCartItem(productId);
  if (cartItem) {
    dispatch(
      updateCartItem({
        productId,
        quantity: cartItem.quantity, // ✅ FIX: Add this
        quantityPackets: cartItem.quantityPackets + 1,
      })
    );
  }
};


const handleDecrement = (productId: string) => {
  const cartItem = getCartItem(productId);
  if (cartItem) {
    const newPackets = cartItem.quantityPackets - 1;
    if (newPackets <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(
        updateCartItem({
          productId,
          quantity: cartItem.quantity, // ✅ FIX: Add this
          quantityPackets: newPackets,
        })
      );
    }
  }
};

  const handleRemoveFavourite = (productId: string) => {
    dispatch(removeFromFavourites(productId));
  };

  const renderFavorite = ({ item }: { item: any }) => {
    const cartItem = getCartItem(item.productId);

    return (
      <View style={styles.favoriteCard}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl  || 'https://static.toiimg.com/photo/113458714.cms'}} style={styles.favoriteImage} />
        ) : (
          <View
            style={[
              styles.favoriteImage,
              {
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#E5E7EB',
              },
            ]}
          >
            <Text>No Image</Text>
          </View>
        )}

        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteName}>{item.name}</Text>
          <Text style={styles.favoritePrice}>₹{item.price ?? '-'}</Text>
          <Text style={styles.favoriteQuantity}>{item.quantity ?? ''}</Text>

          <View style={styles.favoriteActions}>
            {cartItem ? (
              <>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecrement(item.productId)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <View style={[styles.quantityButton, { backgroundColor: '#0b380e' }]}>
                  <Text style={[styles.quantityButtonText, { color: 'white' }]}>
                    {cartItem.quantityPackets}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncrement(item.productId)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFavourite(item.productId)}
            >
              <Ionicons name="heart" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#fecd54" />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyText}>
        Start adding products to your favorites to see them here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View> */}

      {favourites.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={favourites}
          renderItem={renderFavorite}
          keyExtractor={item => item.productId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.favoritesList}
        />
      )}
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
  favoritesList: {
    padding: 20,
    gap: 16,
  },
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  favoriteImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  favoritePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b380e',
    marginBottom: 2,
  },
  favoriteQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  favoriteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#0b380e',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeButton: {
    padding: 8,
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
});
