// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import recipesReducer from './slices/recipesSlice';
import favoritesReducer from './slices/favoritesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipesReducer,
    favorites: favoritesReducer,
  },
});

export default store;