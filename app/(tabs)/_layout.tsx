import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
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
          title: 'Products',headerShown: true,
    headerStyle: {
      backgroundColor: '#0b380e', // ✅ your desired background color
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
          title: 'Favorites',headerShown: true,
 headerStyle: {
      backgroundColor: '#0b380e', // ✅ your desired background color
    },
headerTintColor: '#fecd54',
headerTitleStyle: { color: '#fecd54' },

          tabBarIcon: ({ size, color }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',headerShown: true,
 headerStyle: {
      backgroundColor: '#0b380e', // ✅ your desired background color
    },
headerTintColor: '#fecd54',
headerTitleStyle: { color: '#fecd54' },

          tabBarIcon: ({ size, color }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}