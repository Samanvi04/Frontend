// src/pages/Favorites.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFavorites } from '../redux/slices/favoritesSlice';
import { Link, useNavigate } from 'react-router-dom';

export default function Favorites() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { favorites, loading, error } = useSelector((state) => state.favorites);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchFavorites());
  }, [dispatch, token, navigate]);

  if (!token) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Your Favorite Recipes</h1>
      {loading && <p>Loading favorites...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && favorites.length === 0 && <p>You have no favorite recipes yet.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((recipe) => (
          <Link
            key={recipe._id}
            to={`/recipes/${recipe._id}`}
            className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={recipe.imageUrl || '/placeholder.jpg'}
              alt={recipe.title}
              className="w-full h-40 object-cover"
              loading="lazy"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">{recipe.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}