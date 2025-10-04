import { setCart } from '@/redux/cartSlice';
import { setFavourites } from '@/redux/favouriteSlice';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import ProductCard from '../profile/productcard';
const { width } = Dimensions.get('window');
const isTablet = width > 768;

interface Banner {
  _id: string;
  imageUrl: string;
  title: string;
  description: string;
}

interface Product {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: string;
  description?: string;
}

interface FeaturedSection {
  _id: string;
  title: string;
  products: Product[];
}

interface HomeData {
  banners: Banner[];
  featuredSections: FeaturedSection[];
}


export default function HomeScreen() {
  const router = useRouter();
  const bannerRef = useRef<FlatList>(null);
  const [refreshing, setRefreshing] = useState(false);
const [homeData, setHomeData] = useState<HomeData | null>(null);

  const [loading, setLoading] = useState(true);
  
const dispatch = useDispatch();

useEffect(() => {
  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await axios.get('https://gauras-backened.vercel.app/api/cart/get', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.items) {
        dispatch(setCart(res.data.items));
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  fetchCart();
}, []);
useEffect(() => {
  const fetchFavourite = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await axios.get('https://gauras-backened.vercel.app/api/favourite/get', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.items) {
        dispatch(setFavourites(res.data.items));
      }
    } catch (err) {
      console.error('Failed to load favourite:', err);
    }
  };

  fetchFavourite();
}, []);
  const fetchHomeData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('https://gauras-backened.vercel.app/api/home', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setHomeData(data);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
         setRefreshing(false);
    }
  };
useEffect(() => {


  fetchHomeData();
}, []);
  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0b380e" />
      </View>
    );
  }

  if (!homeData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Error loading home data</Text>
      </View>
    );
  }

  const banners = homeData.banners || [];
  const featuredSections = homeData.featuredSections || [];

 const renderBanner = ({ item }: { item: Banner }) => (
  <View style={styles.bannerItem}>
    <Image source={{ uri: item.imageUrl || 'https://static.toiimg.com/photo/113458714.cms' }} style={styles.bannerImage} />
    <View style={styles.bannerOverlay}>
      <Text style={styles.bannerTitle}>{item.title}</Text>
      <Text style={styles.bannerSubtitle}>{item.description}</Text>
    </View>
  </View>
);
const renderProduct = ({ item }: { item: Product }) => (
  <ProductCard item={item} isTablet={isTablet} />
);


  return (
    <SafeAreaView style={{backgroundColor:"#0b380e",flex:1}}>
  
    <View style={styles.header}>
  <Image
    source={require('../../assets/images/logo.png')} // Adjust path if necessary
    style={styles.logoImage}
    resizeMode="cover"
  />
  
  <TouchableOpacity
    style={styles.profileButton}
    onPress={() => router.push('/profile')}
  >
    <Ionicons name="person-circle" size={32} color="#fecd54" />
  </TouchableOpacity>
</View>

<View style={{height:"100%"}}>
      <ScrollView style={styles.content}  contentContainerStyle={{ paddingBottom: 20,}} showsVerticalScrollIndicator={false} 
             refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0b380e']} />
        }
      >
        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerRef}
            data={banners}
            renderItem={renderBanner}
            keyExtractor={(item) => item._id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.bannerCarousel}
          />
        </View>

        {/* Dynamically render featured sections */}
 {featuredSections.map((section: FeaturedSection) => (
  <View style={styles.section} key={section._id}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
    <FlatList
      data={section.products}
      renderItem={renderProduct}
      keyExtractor={(item) => item._id}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.productList}
    />
  </View>
))}

      </ScrollView>
</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // height:"100%",
    // backgroundColor: '#0b380e',
  },

  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0b380e',
  },

  content: {
    flexGrow: 1,
    backgroundColor:"#ffff"
  },
  bannerContainer: {
    height: 200,
    marginBottom: 24,
  },
  bannerCarousel: {
    height: 200,
  },
  bannerItem: {
    width: width,
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0b380e',
  },
  seeAll: {
    fontSize: 14,
    color: '#0b380e',
    fontWeight: '500',
  },
  productList: {
    paddingLeft: 20,
  },
  productCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
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
    gap: 8,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
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
  },
  subscribeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
    header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    backgroundColor:"#0b380e",
    borderBottomColor: '#0b380e',
  },
  logoImage: {
    width: 150,
    height: 40,
    marginRight: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0b380e',
    flex: 1, // so text takes remaining space between logo and profile icon
  },
  profileButton: {
    padding: 4,
  },
});