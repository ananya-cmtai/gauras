import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux'; // ✅ if you're using Redux
import { RootState } from '../../redux/store';
export default function TabLayout() {
  // ✅ Get counts from Redux (or Context API)

  const favourites = useSelector((state: RootState) => state.favourites.items);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const cartCount = cartItems?.length || 0;
  const favouriteCount = favourites?.length || 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#fecd54',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#0b380e',
          borderTopWidth: 1,
          borderTopColor: '#0b380e',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0b380e',
          },
          headerTintColor: '#fecd54',
          headerTitleStyle: { color: '#fecd54' },
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0b380e',
          },
          headerTintColor: '#fecd54',
          headerTitleStyle: { color: '#fecd54' },
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
          tabBarBadge: favouriteCount > 0 ? favouriteCount : undefined, // ✅ Badge
          tabBarBadgeStyle: {
            backgroundColor: '#fecd54',
            color: '#0b380e',
            fontWeight: 'bold',
          },
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0b380e',
          },
          headerTintColor: '#fecd54',
          headerTitleStyle: { color: '#fecd54' },
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#fecd54',
            color: '#0b380e',
            fontWeight: 'bold',
          },
        }}
      />
    </Tabs>
  );
}
