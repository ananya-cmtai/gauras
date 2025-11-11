import { setCart } from '@/redux/cartSlice';
import { setFavourites } from '@/redux/favouriteSlice';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
  urlLiveLink :string;
}

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const bannerRef = useRef<FlatList>(null);
const blinkAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(blinkAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(blinkAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ])
  ).start();
}, []);

  const [homeData, setHomeData] = useState<HomeData>({
    banners: [],
    featuredSections: [],
    urlLiveLink:"",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Fetch Cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const res = await axios.get(
          'https://gauras-backened.vercel.app/api/cart/get',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.items) dispatch(setCart(res.data.items));
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };
    fetchCart();
  }, [dispatch]);

  // Fetch Favourites
  useEffect(() => {
    const fetchFavourite = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const res = await axios.get(
          'https://gauras-backened.vercel.app/api/favourite/get',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.items) dispatch(setFavourites(res.data.items));
      } catch (err) {
        console.error('Failed to load favourite:', err);
      }
    };
    fetchFavourite();
  }, [dispatch]);

  // Fetch Home Data
  const fetchHomeData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch('https://gauras-backened.vercel.app/api/home', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch home data');

      const data = await res.json();
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

  // Pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  // Banner Auto Scroll
  useEffect(() => {
    if (!homeData.banners.length) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % homeData.banners.length;
        bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [homeData.banners]);

  // Render functions
  const renderBanner = ({ item }: { item: Banner }) => (
    <View style={styles.bannerItem}>
      <Image
        source={{ uri: item.imageUrl || 'https://static.toiimg.com/photo/113458714.cms' }}
        style={styles.bannerImage}
      />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.description}</Text>
      </View>
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard item={item} isTablet={isTablet} />
  );

  // Loading or error states
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

  return (
    <SafeAreaView style={{ backgroundColor: '#0b380e', flex: 1 }} edges={['top']}> {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
          <Ionicons name="person-circle" size={32} color="#fecd54" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0b380e']} />
        }
      >
        {/* LIVE Button (only shows if urlLiveLink is available) */}


        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerRef}
            data={homeData.banners}
            renderItem={renderBanner}
            keyExtractor={(item) => item._id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          />
        </View>
{homeData.urlLiveLink ? (
  <TouchableOpacity
    style={styles.liveContainer}
    onPress={() => Linking.openURL(homeData.urlLiveLink)}
    activeOpacity={0.8}
  >
    <View style={styles.liveDotContainer}>
      <Animated.View style={[styles.liveDot, { opacity: blinkAnim }]} />
    </View>
    <Text style={styles.liveText}>LIVE</Text>
  </TouchableOpacity>
) : null}
        {/* Featured Sections */}
        {homeData.featuredSections.map((section) => (
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
              contentContainerStyle={{ paddingHorizontal: 20 }}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              nestedScrollEnabled
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, backgroundColor: '#fff' },
  bannerContainer: { height: 200, marginBottom: 24 },
  bannerItem: { width: width, height: 200, position: 'relative' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  bannerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  bannerSubtitle: { fontSize: 16, color: '#fff' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0b380e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#0b380e', borderBottomWidth: 1, borderBottomColor: '#0b380e' },
  logoImage: { width: 150, height: 40, marginRight: 8 },
  profileButton: { padding: 4 },
  liveContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'center',
  backgroundColor: '#ff0000',
  borderRadius: 20,
  paddingVertical: 6,
  paddingHorizontal: 14,
  marginVertical: 10,
  elevation: 5,
  shadowColor: '#ff0000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},
liveDotContainer: {
  marginRight: 8,
},
liveDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#fff',
},
liveText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
  letterSpacing: 1,
},

});
