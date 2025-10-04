// slices/favouritesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavouriteItem {
  productId: string;
  name: string;
  imageUrl: string;

  price:number;
  quantity:string;
}

interface FavouritesState {
  items: FavouriteItem[];
}

const initialState: FavouritesState = {
  items: [],
};

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    addToFavourites(state, action: PayloadAction<FavouriteItem>) {
      const exists = state.items.some(item => item.productId === action.payload.productId);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromFavourites(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.productId !== action.payload);
    },
    clearFavourites(state) {
      state.items = [];
    },
    setFavourites(state, action: PayloadAction<FavouriteItem[]>) {
          state.items = action.payload;
        },
  },
});

export const {
  addToFavourites,
  removeFromFavourites,
  clearFavourites,setFavourites
} = favouritesSlice.actions;

export default favouritesSlice.reducer;
