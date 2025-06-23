// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

export default function Navbar() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/recipes" className="font-bold text-xl text-green-700 dark:text-green-400">NutriPlan</Link>
        <div className="space-x-4">
          <Link to="/recipes" className="hover:underline">Recipes</Link>
          {token && (
            <>
              <Link to="/planner" className="hover:underline">Meal Planner</Link>
              <Link to="/favorites" className="hover:underline">Favorites</Link>
              <Link to="/grocery-list" className="hover:underline">Grocery List</Link>
              <Link to="/add-recipe" className="hover:underline">Add Recipe</Link>
              <Link to="/profile" className="hover:underline">Profile</Link>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          )}
          {!token && (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}