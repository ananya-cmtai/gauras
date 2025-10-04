// store.ts
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import favouritesReducer from './favouriteSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    favourites: favouritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
