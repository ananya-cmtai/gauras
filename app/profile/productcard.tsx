// components/ProductCard.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, updateCartItem } from '../../redux/cartSlice';
import { addToFavourites, removeFromFavourites } from '../../redux/favouriteSlice';
import { RootState } from '../../redux/store';

interface Props {
  item: any;
  isTablet: boolean;
}
  interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  quantity: string;          // or number depending on your app
  quantityPackets: number;
  price: number;
}

const ProductCard: React.FC<Props> = ({ item, isTablet }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find((p) => p.productId === item._id)
  );

  const favourites = useSelector((state: RootState) => state.favourites.items);
  const cartItemsAll = useSelector((state: RootState) => state.cart.items);
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
      console.error('Favourite sync error:', err);
    }
  };

  
    saveFavouriteToBackend();
  
}, [favourites]);
useEffect(() => {
  const saveCartToBackend = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await axios.post(
        'https://gauras-backened.vercel.app/api/cart/save',
        { items: cartItemsAll },
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
  
}, [cartItemsAll]);
  const isInFavourites = useSelector((state: RootState) =>
    state.favourites.items.some(fav => fav.productId === item._id)
  );

  const toggleFavourites = () => {
    if (isInFavourites) {
      dispatch(removeFromFavourites(item._id));
    } else {
      dispatch(addToFavourites({
        productId: item._id,
        name: item.name,
        imageUrl: item.imageUrl,
     
        quantity:item.quantity,
        price:item.price,
      }));
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      productId: item._id,
      name: item.name,
      imageUrl: item.imageUrl,
   
      quantity: item.quantity,  // e.g. "500g"
      quantityPackets: 1,
      price: item.price,
    }));
  };

  const handleIncrement = () => {
    if (cartItem) {
    dispatch(updateCartItem({
  productId: cartItem.productId,
  quantity: cartItem.quantity, // ✅ Add this
  quantityPackets: cartItem.quantityPackets + 1,
}));

    }
  };


  const handleSubscribe = () => {
  // Convert description array to a JSON string
  const descriptionString = JSON.stringify(item.description);

  router.push({
    pathname: '/subscriptionpage',
    params: {
      productId: item._id,
      name: item.name,
      price: item.price.toString(),
      description: descriptionString,
      imageUrl:item.imageUrl,
      quantity:item.quantity,
      dailyPrice:item.dailyPrice,
      weeklyPrice:item.weeklyPrice,
      alternatePrice:item.alternatePrice
       // Pass the description as a JSON string
    },
  });

  // Optionally show an alert on subscription
  // Alert.alert('Subscribed!', 'You have successfully subscribed.');
};


 
  const handleDecrement = () => {
    if (cartItem) {
      const newPackets = cartItem.quantityPackets - 1;
      if (newPackets <= 0) {
        dispatch(removeFromCart(cartItem.productId));
      } else {
       dispatch(updateCartItem({
  productId: cartItem.productId,
  quantity: cartItem.quantity, // ✅ Add this
  quantityPackets: newPackets,
}));

      }
    }
  };

  return (
    <View style={[styles.productCard, isTablet && styles.productCardTablet]}>
      
      {/* Heart icon in top-right corner */}
      <TouchableOpacity style={styles.wishlistIcon} onPress={toggleFavourites}>
        <Ionicons 
          name={isInFavourites ? "heart" : "heart-outline"} 
          size={24} 
          color={isInFavourites ? "red" : "#666"} 
        />
      </TouchableOpacity>

      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl  || 'https://static.toiimg.com/photo/113458714.cms' }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.imagePlaceholder]}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name || 'Unnamed Product'}</Text>
        <Text style={styles.productPrice}>₹{item.price ?? '-'}</Text>
        <Text style={styles.productQuantity}>{item.quantity ?? ''}</Text>

        <View style={styles.productActions}>
          {cartItem ? (
            <>
              <TouchableOpacity style={styles.addButton} onPress={handleDecrement}>
                <Text style={styles.addButtonText}>-</Text>
              </TouchableOpacity>
              <View style={[styles.addButton, { backgroundColor: '#0b380e' }]}>
                <Text style={[styles.addButtonText, { color: 'white' }]}>
                  {cartItem.quantityPackets}
                </Text>
              </View>
              <TouchableOpacity style={styles.addButton} onPress={handleIncrement}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 150,
    margin: 8,
    flex: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  productCardTablet: {
    maxWidth: (800 - 200 - 40) / 3 - 16,
  },
  wishlistIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 4,
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0b380e',
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  productActions: {
    flexDirection: 'row',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  subscribeButton: {
    flex: 1,
    backgroundColor: '#0b380e',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 6,
  },
  subscribeButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProductCard;
