import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
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
const [showDetailsModal, setShowDetailsModal] = useState(false);

  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find((p) => p.productId === item._id)
  );
  const favourites = useSelector((state: RootState) => state.favourites.items);
  const cartItemsAll = useSelector((state: RootState) => state.cart.items);

  const [selectedQuantity, setSelectedQuantity] = useState<string>(
    Array.isArray(item.quantity) ? item.quantity[0] : item.quantity
  );


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
// 🖼️ Auto-move modal carousel
// State
const [carouselIndex, setCarouselIndex] = useState<number>(0);
const modalFlatListRef = useRef<FlatList>(null);

// Auto-scroll modal carousel
useEffect(() => {
  if (!showDetailsModal || imageArray.length <= 1) return;

  const interval = setInterval(() => {
    setCarouselIndex(prev => {
      const nextIndex = (prev + 1) % imageArray.length;
      modalFlatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      return nextIndex;
    });
  }, 3000);

  return () => clearInterval(interval);
}, [showDetailsModal, imageArray.length]);

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
    <>
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
  <TouchableOpacity onPress={() => setShowDetailsModal(true)} activeOpacity={0.9}>
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
</TouchableOpacity>

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
    <Modal
  visible={showDetailsModal}
  animationType="slide"
  transparent
  onRequestClose={() => setShowDetailsModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => setShowDetailsModal(false)}
      >
        <Ionicons name="close" size={24} color="#333" />
      </TouchableOpacity>

  <View style={{ height: 250, marginBottom: 10 }}>
<FlatList
  ref={modalFlatListRef}
  data={imageArray}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  keyExtractor={(_, i) => i.toString()}
  renderItem={({ item: img }) => (
    <Image
      source={{ uri: img }}
      style={{
        width: Dimensions.get('window').width - 64,
        height: 250,
        borderRadius: 10,
        resizeMode: 'cover',
      }}
    />
  )}
  onViewableItemsChanged={({ viewableItems }) => {
    if (viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
      setCarouselIndex(viewableItems[0].index);
    }
  }}
  viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
/>

  {/* Carousel dots */}
  <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 6 }}>
    {imageArray.map((_: string, i: number) => (
  <View
    key={i}
    style={{
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: i === carouselIndex ? COLORS.primary : '#ccc',
      marginHorizontal: 3,
    }}
  />
))}

  </View>
</View>



      <Text style={styles.modalProductName}>{item.name}</Text>
      <Text style={styles.modalPrice}>₹{getSelectedPrice()}</Text>

      {item.description && (
        <View style={styles.modalDescriptionBox}>
          {Array.isArray(item.description)
            ? item.description.map((d: string, i: number) => (
                <Text key={i} style={styles.modalDescriptionText}>
                  • {d}
                </Text>
              ))
            : <Text style={styles.modalDescriptionText}>{item.description}</Text>}
        </View>
      )}

      {Array.isArray(item.quantity) && (
        <View style={styles.modalQuantityContainer}>
          {item.quantity.map((q: string, index: number) => {
            const isDisabled = cartItem && cartItem.quantity !== q;
            const isSelected = selectedQuantity === q;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalQuantityOption,
                  isSelected && styles.modalQuantitySelected,
                  isDisabled && { opacity: 0.5 },
                ]}
                onPress={() => !isDisabled && setSelectedQuantity(q)}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    styles.modalQuantityText,
                    isSelected && styles.modalQuantityTextSelected,
                  ]}
                >
                  {q}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

    
    </View>
  </View>
</Modal>
</>
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
 modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
modalContent: {
  backgroundColor: COLORS.white,
  borderRadius: 14,
  width: '100%',
  maxHeight: '90%',
  padding: 16,
},
modalCloseButton: {
  alignSelf: 'flex-end',
  marginBottom: 10,
},
modalImage: {
  width: '100%',
  height: 200,
  borderRadius: 10,
  resizeMode: 'cover',
  marginBottom: 10,
},
modalProductName: {
  fontSize: 18,
  fontWeight: '700',
  color: COLORS.textDark,
  marginBottom: 5,
},
modalPrice: {
  fontSize: 16,
  fontWeight: 'bold',
  color: COLORS.primary,
  marginBottom: 10,
},
modalDescriptionBox: {
  backgroundColor: COLORS.light,
  borderRadius: 8,
  padding: 10,
  marginBottom: 15,
},
modalDescriptionText: {
  color: COLORS.textGray,
  fontSize: 13,
  marginBottom: 4,
},
modalQuantityContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginBottom: 15,
},
modalQuantityOption: {
  paddingVertical: 5,
  paddingHorizontal: 10,
  backgroundColor: COLORS.light,
  borderRadius: 6,
  marginRight: 8,
  marginBottom: 8,
},
modalQuantitySelected: {
  backgroundColor: COLORS.primary,
},
modalQuantityText: {
  color: COLORS.textGray,
  fontSize: 13,
},
modalQuantityTextSelected: {
  color: COLORS.white,
  fontWeight: '600',
},
modalButtonsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
modalCartButton: {
  flex: 1,
  backgroundColor: COLORS.light,
  padding: 10,
  borderRadius: 8,
  alignItems: 'center',
  marginRight: 8,
},
modalSubscribeButton: {
  flex: 1,
  backgroundColor: COLORS.primary,
  padding: 10,
  borderRadius: 8,
  alignItems: 'center',
},
modalButtonText: {
  color: COLORS.white,
  fontWeight: '600',
},

  counterText: { fontSize: 14, fontWeight: '700', color: COLORS.textGray },
});

export default ProductCard; 
