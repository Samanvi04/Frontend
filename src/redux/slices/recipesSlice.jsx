// src/redux/slices/recipesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const initialState = {
  list: [],
  total: 0,
  page: 1,
  loading: false,
  error: null,
  selectedRecipe: null,
};

// Search recipes async thunk
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async (filters, thunkAPI) => {
    try {
      // filters: { query, ingredients, cuisine, dietaryTags, cookTime, difficulty, page }
      const params = new URLSearchParams();

      if (filters.query) params.append('query', filters.query);
      if (filters.ingredients?.length) params.append('ingredients', filters.ingredients.join(','));
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      if (filters.dietaryTags?.length) params.append('dietaryTags', filters.dietaryTags.join(','));
      if (filters.cookTime) params.append('cookTime', filters.cookTime);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.page) params.append('page', filters.page);

      const response = await axios.get(`${API_URL}/recipes/search?${params.toString()}`);

      return { recipes: response.data.recipes, total: response.data.total, page: filters.page };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recipes'
      );
    }
  }
);

// Fetch recipe by id
export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchRecipeById',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/recipes/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recipe details'
      );
    }
  }
);

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    clearSelectedRecipe(state) {
      state.selectedRecipe = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.recipes;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecipeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRecipe = action.payload;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedRecipe } = recipesSlice.actions;
export default recipesSlice.reducer;