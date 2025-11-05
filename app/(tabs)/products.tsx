import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl, ScrollView,
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
interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: string;
  category?: string;
  description?: [string] ;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [selectedCategory, setSelectedCategory] = useState('All');

  const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
 const dispatch = useDispatch();
    const fetchProducts = async () => {
      try {
           const token = await AsyncStorage.getItem('userToken');
          
         const response = await fetch(`https://gauras-backened.vercel.app/api/products/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // 🛡️ Bearer Token
          },
        });

        const data = await response.json();
      // console.log(data);
        let productList = [];
        // Adjust based on your API shape:
        if (data.products && Array.isArray(data.products)) {
          productList = data.products;
        } else if (Array.isArray(data)) {
          productList = data;
        } else {
          // maybe it's object with items
          productList = [];
        }

        setProducts(productList);

        // Get unique categories
  // Map categories
const cats = productList
  .map((item: Product) => item.category)
  .filter((cat: string | undefined | null) => cat !== null && cat !== undefined && cat !== '')
  .filter((cat: string, index: number, self: string[]) => self.indexOf(cat) === index);

        const formatted = ['All', ...cats].map((name, idx) => ({
          id: idx.toString(),
          name,
        }));

        setCategories(formatted);
      } catch (error) {
        // console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
         setRefreshing(false);
      }
    };

  useEffect(() => {
 
    fetchProducts();
  }, []);

    const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

const renderCategory = ({ item }: { item: Category }) => (
  <TouchableOpacity
    style={[
      styles.categoryItem,
      selectedCategory === item.name && styles.categoryItemActive,
    ]}
    onPress={() => setSelectedCategory(item.name)}
  >
    <Text
      style={[
        styles.categoryText,
        selectedCategory === item.name && styles.categoryTextActive,
      ]}
    >
      {item.name}
    </Text>
  </TouchableOpacity>
);

const renderProduct = ({ item }: { item: Product }) => (
  <ProductCard item={item} isTablet={isTablet} />
);




  if (loading) {
    return (
      <SafeAreaView style={styles.containerLoading}>
       <ActivityIndicator color="#0b380e" size="large"/>
      </SafeAreaView>
    );
  }

  // Tablet layout
  if (isTablet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Products</Text>
        </View>
        <ScrollView style={styles.tabletContent}        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0b380e']} />
        }>
          <View style={styles.categoriesSidebar}>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              // vertical by default
              contentContainerStyle={styles.categoriesList}
            />
          </View>
          <View style={styles.productsGrid}>
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item, index) =>
                item.id ? item.id.toString() : index.toString()
              }
              numColumns={3}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
         
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Mobile layout
  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
      </View> */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
 <FlatList
  data={filteredProducts}
  renderItem={renderProduct}
  keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
  numColumns={2} 
  columnWrapperStyle={{ alignItems: 'flex-start' }} // important!
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.productsList}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#0b380e']}
    />
  }
/>

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerLoading:{
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent:"center",
    alignItems:"center"
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
  tabletContent: {
    flexGrow: 1,
    flexDirection: 'row',
  },
  categoriesSidebar: {
    width: 200,
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingVertical: 20,
  },
  productsGrid: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 10,
    marginVertical: 4,
  },
  categoryItemActive: {
    backgroundColor: '#0b380e',
  },
  categoryText: {
    
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#fecd54',
  },
  productsList: {
    // paddingHorizontal: 20,
    paddingBottom: 20,

  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 8,
    flex: 1,
    overflow: 'hidden',
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // elevation for Android
    elevation: 5,
  },
  productCardTablet: {
    maxWidth: (width - 200 - 40) / 3 - 16, // adjust based on sidebar + padding etc
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
    marginRight: 6,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#fecd54',
  },
});
