// src/App.js
import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RecipeSearch from './pages/RecipeSearch';
import RecipeDetails from './pages/RecipeDetails';
import MealPlanner from './pages/MealPlanner';
import Favorites from './pages/Favorites';
import GroceryList from './pages/GroceryList';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AddRecipe from './pages/AddRecipe';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/recipes" replace />} />
              <Route path="/recipes" element={<RecipeSearch />} />
              <Route path="/recipes/:id" element={<RecipeDetails />} />
              <Route path="/planner" element={<MealPlanner />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/grocery-list" element={<GroceryList />} />
              <Route path="/add-recipe" element={<AddRecipe />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;