import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, updateCartItem } from '../../redux/cartSlice';
import { addToFavourites, removeFromFavourites } from '../../redux/favouriteSlice';
import { RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

interface Props {
  item: any;
  isTablet: boolean;
}

const ProductCard: React.FC<Props> = ({ item, isTablet }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find((p) => p.productId === item._id)
  );

  const [selectedQuantity, setSelectedQuantity] = useState<string>(
    Array.isArray(item.quantity) ? item.quantity[0] : item.quantity
  );

  const [carouselIndex, setCarouselIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const favourites = useSelector((state: RootState) => state.favourites.items);
  const cartItemsAll = useSelector((state: RootState) => state.cart.items);

  // ✅ Convert single image to array for consistency
  const imageArray = Array.isArray(item.imageUrl)
    ? item.imageUrl
    : [item.imageUrl || 'https://static.toiimg.com/photo/113458714.cms'];

  useEffect(() => {
    const saveFavouriteToBackend = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        await axios.post(
          'https://gauras-backened.vercel.app/api/favourite/save',
          { items: favourites },
          { headers: { Authorization: `Bearer ${token}` } }
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
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Cart sync error:', err);
      }
    };
    saveCartToBackend();
  }, [cartItemsAll]);

  const isInFavourites = useSelector((state: RootState) =>
    state.favourites.items.some((fav) => fav.productId === item._id)
  );

  const getSelectedPrice = () => {
    if (Array.isArray(item.quantity) && Array.isArray(item.price)) {
      const index = item.quantity.indexOf(selectedQuantity);
      return item.price[index] ?? item.price[0];
    }
    return Array.isArray(item.price) ? item.price[0] : item.price;
  };

  const toggleFavourites = () => {
    if (isInFavourites) {
      dispatch(removeFromFavourites(item._id));
    } else {
      dispatch(
        addToFavourites({
          productId: item._id,
          name: item.name,
          imageUrl: imageArray[0], // ✅ Only first image stored
          quantity: item.quantity,
          price: item.price,
        })
      );
    }
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: item._id,
        name: item.name,
        imageUrl: imageArray[0], // ✅ Only first image stored
        quantity: selectedQuantity,
        quantityPackets: 1,
        price: getSelectedPrice(),
      })
    );
  };

  const handleIncrement = () => {
    if (cartItem) {
      dispatch(
        updateCartItem({
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          quantityPackets: cartItem.quantityPackets + 1,
        })
      );
    }
  };

  const handleSelectQuantity = (q: string) => {
    setSelectedQuantity(q);
  };

  const handleSubscribe = () => {
    router.push({
      pathname: '/subscriptionpage',
      params: {
        productId: item._id,
        name: item.name,
        price: JSON.stringify(item.price),
        description: JSON.stringify(item.description),
        imageUrl: JSON.stringify(imageArray), // ✅ send all images
        quantity: JSON.stringify(item.quantity),
        dailyPrice: JSON.stringify(item.dailyPrice),
        weeklyPrice: JSON.stringify(item.weeklyPrice),
        alternatePrice: JSON.stringify(item.alternatePrice),
      },
    });
  };

  const handleDecrement = () => {
    if (cartItem) {
      const newPackets = cartItem.quantityPackets - 1;
      if (newPackets <= 0) {
        dispatch(removeFromCart(cartItem.productId));
      } else {
        dispatch(
          updateCartItem({
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            quantityPackets: newPackets,
          })
        );
      }
    }
  };

  // ✅ Carousel index update
  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCarouselIndex(viewableItems[0].index);
  }).current;

  return (
    <View style={[styles.productCard, isTablet && styles.productCardTablet]}>
      <TouchableOpacity style={styles.wishlistIcon} onPress={toggleFavourites}>
        <Ionicons
          name={isInFavourites ? 'heart' : 'heart-outline'}
          size={24}
          color={isInFavourites ? 'red' : '#666'}
        />
      </TouchableOpacity>

      {/* ✅ Product Image Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={imageArray}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_: string, idx: number) => idx.toString()}


          renderItem={({ item: img }) => (
            <Image source={{ uri: img }} style={styles.productImage} />
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        />
   {imageArray.length > 1 && (
  <View style={styles.dotsContainer}>
    {imageArray.map((_: string, i: number) => (
      <View
        key={i}
        style={[styles.dot, i === carouselIndex && styles.activeDot]}
      />
    ))}
  </View>
)}

      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name || 'Unnamed Product'}</Text>
        <Text style={styles.productPrice}>₹{getSelectedPrice()}</Text>

        {Array.isArray(item.quantity) ? (
          <View style={styles.quantityContainer}>
            {item.quantity.map((q: string, index: number) => {
              const isDisabled = cartItem && cartItem.quantity !== q;
              const isSelected = selectedQuantity === q;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quantityOption,
                    isSelected && styles.quantityOptionSelected,
                    isDisabled && { opacity: 0.5 },
                  ]}
                  onPress={() => !isDisabled && handleSelectQuantity(q)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[
                      styles.quantityText,
                      isSelected && styles.quantityTextSelected,
                    ]}
                  >
                    {q}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.productQuantity}>{item.quantity}</Text>
        )}

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
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
              >
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
    flexGrow: 1,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  carouselContainer: {
    position: 'relative',
  },
  productImage: {
    width: 150,
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#0b380e',
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
  quantityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  quantityOption: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  quantityOptionSelected: {
    backgroundColor: '#0b380e',
  },
  quantityText: {
    fontSize: 12,
    color: '#374151',
  },
  quantityTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ProductCard;
