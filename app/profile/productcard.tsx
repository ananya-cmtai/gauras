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
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, updateCartItem } from '../../redux/cartSlice';
import { addToFavourites, removeFromFavourites } from '../../redux/favouriteSlice';
import { RootState } from '../../redux/store';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  item: any;
  isTablet: boolean;
}

const COLORS = {
  primary: '#0b380e',
  light: '#F3F4F6',
  textDark: '#1F2937',
  textGray: '#374151',
  white: '#fff',
  heart: 'red',
};

const ProductCard: React.FC<Props> = ({ item, isTablet }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find((p) => p.productId === item._id)
  );
  const favourites = useSelector((state: RootState) => state.favourites.items);
  const cartItemsAll = useSelector((state: RootState) => state.cart.items);

  const [selectedQuantity, setSelectedQuantity] = useState<string>(
    Array.isArray(item.quantity) ? item.quantity[0] : item.quantity
  );
  const [carouselIndex, setCarouselIndex] = useState(0);

  const imageArray = Array.isArray(item.imageUrl)
    ? item.imageUrl
    : [item.imageUrl || 'https://static.toiimg.com/photo/113458714.cms'];

  const cardWidth = isTablet ? (screenWidth - 64) / 3 : screenWidth / 2 - 16;

  // 🔁 Sync with backend
  useEffect(() => {
    const syncData = async (url: string, data: any) => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;
        await axios.post(url, { items: data }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error('Sync error:', err);
      }
    };
    syncData('https://gauras-backened.vercel.app/api/favourite/save', favourites);
  }, [favourites]);

  useEffect(() => {
    const syncData = async (url: string, data: any) => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;
        await axios.post(url, { items: data }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error('Sync error:', err);
      }
    };
    syncData('https://gauras-backened.vercel.app/api/cart/save', cartItemsAll);
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
          imageUrl: imageArray[0],
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
        imageUrl: imageArray[0],
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
  // Auto-scroll carousel
useEffect(() => {
  if (imageArray.length <= 1) return; // agar sirf 1 image hai, auto-scroll na kare

  const interval = setInterval(() => {
    let nextIndex = carouselIndex + 1;
    if (nextIndex >= imageArray.length) nextIndex = 0;

    setCarouselIndex(nextIndex);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  }, 3000); // 3 second interval

  return () => clearInterval(interval); // cleanup
}, [carouselIndex, imageArray.length]);


  const handleSubscribe = () => {
    router.push({
      pathname: '/subscriptionpage',
      params: {
        productId: item._id,
        name: item.name,
        price: JSON.stringify(item.price),
        description: JSON.stringify(item.description),
        imageUrl: JSON.stringify(imageArray),
        quantity: JSON.stringify(item.quantity),
        dailyPrice: JSON.stringify(item.dailyPrice),
        weeklyPrice: JSON.stringify(item.weeklyPrice),
        alternatePrice: JSON.stringify(item.alternatePrice),
      },
    });
  };

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCarouselIndex(viewableItems[0].index);
  }).current;

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      {/* ❤️ Favourite Icon */}
      <TouchableOpacity style={styles.wishlistIcon} onPress={toggleFavourites}>
        <Ionicons
          name={isInFavourites ? 'heart' : 'heart-outline'}
          size={22}
          color={isInFavourites ? COLORS.heart : COLORS.textGray}
        />
      </TouchableOpacity>

      {/* 🖼️ Product Image Carousel */}
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={imageArray}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          renderItem={({ item: img }) => (
            <Image source={{ uri: img }} style={[styles.productImage, { width: cardWidth }]} />
          )}
        />
      
      </View>
  {imageArray.length > 1 && (
          <View style={styles.dotsContainer}>
            {imageArray.map((_: string, i: number) => (
              <View key={i} style={[styles.dot, i === carouselIndex && styles.activeDot]} />
            ))}
          </View>
        )}
      {/* 🧾 Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{item.name || 'Unnamed Product'}</Text>
        <Text style={styles.productPrice}>₹{getSelectedPrice()}</Text>

        {Array.isArray(item.quantity) && (
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
                  onPress={() => !isDisabled && setSelectedQuantity(q)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[styles.quantityText, isSelected && styles.quantityTextSelected]}
                  >
                    {q}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 🛒 Buttons */}
        <View style={styles.actionsContainer}>
          {cartItem ? (
            <>
              <TouchableOpacity style={styles.counterButton} onPress={handleDecrement}>
                <Text style={styles.counterText}>−</Text>
              </TouchableOpacity>
              <View style={[styles.counterButton, styles.counterMiddle]}>
                <Text style={[styles.counterText, { color: COLORS.white }]}>
                  {cartItem.quantityPackets}
                </Text>
              </View>
              <TouchableOpacity style={styles.counterButton} onPress={handleIncrement}>
                <Text style={styles.counterText}>＋</Text>
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
card: {
  backgroundColor: COLORS.white,
  borderRadius: 14,
  margin: 8,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
  // remove fixed height here
},

  wishlistIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 50,
    padding: 5,
  },
carouselWrapper: {
  width: '100%',
  height: 200,  
  overflow: 'hidden',
  position: 'relative',
},
productImage: {
  width: '100%',
  height:200,
  resizeMode: 'cover',
},

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
  },
  activeDot: { backgroundColor: COLORS.primary },
  infoContainer: { padding: 10 },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  quantityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  quantityOption: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.light,
    borderRadius: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  quantityOptionSelected: { backgroundColor: COLORS.primary },
  quantityText: { fontSize: 12, color: COLORS.textGray },
  quantityTextSelected: { color: COLORS.white, fontWeight: '600' },
  actionsContainer: { flexDirection: 'row', alignItems: 'center' },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.light,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  addButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.textGray },
  subscribeButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  subscribeButtonText: { fontSize: 11, fontWeight: '600', color: COLORS.white },
  counterButton: {
    flex: 1,
    backgroundColor: COLORS.light,
    borderRadius: 6,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 3,
  },
  counterMiddle: { backgroundColor: COLORS.primary },
  counterText: { fontSize: 14, fontWeight: '700', color: COLORS.textGray },
});

export default ProductCard; 
