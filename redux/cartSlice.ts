// slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  price :number;
  name: string;
  imageUrl: string;
  quantity: string;
  quantityPackets: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const exists = state.items.find(item => item.productId === action.payload.productId);
      if (exists) {
        exists.quantityPackets += action.payload.quantityPackets;
      
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.productId !== action.payload);
    },
    updateCartItem(state, action: PayloadAction<{
      productId: string;
      quantity: string;
      quantityPackets: number;
    }>) {
      const item = state.items.find(i => i.productId === action.payload.productId);
      if (item) {
   
        item.quantityPackets = action.payload.quantityPackets;
      }
    },
    clearCart(state) {
      state.items = [];
    },
     setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,setCart
} = cartSlice.actions;

export default cartSlice.reducer;
