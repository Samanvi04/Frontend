// src/pages/RecipeDetails.js
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipeById, clearSelectedRecipe } from '../redux/slices/recipesSlice';
import axios from 'axios';
import { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedRecipe: recipe, loading, error } = useSelector((state) => state.recipes);
  const { token, user } = useSelector((state) => state.auth);

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    dispatch(fetchRecipeById(id));
    return () => {
      dispatch(clearSelectedRecipe());
    };
  }, [dispatch, id]);

  // Check if recipe is favorited by user (fetch favorites or check by API)
  useEffect(() => {
    async function checkFavorite() {
      if (!token) return setIsFavorited(false);
      try {
        const res = await axios.get(`${API_URL}/users/me/favorites`, { headers: { Authorization: `Bearer ${token}` } });
        setIsFavorited(res.data.favorites.some((fav) => fav._id === id));
      } catch {
        setIsFavorited(false);
      }
    }
    checkFavorite();
  }, [token, id]);

  const toggleFavorite = async () => {
    if (!token) {
      alert('You need to log in to favorite recipes');
      return navigate('/login');
    }
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await axios.delete(`${API_URL}/users/me/favorites/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/users/me/favorites`, { recipeId: id }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setIsFavorited(!isFavorited);
    } catch (e) {
      alert('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading || !recipe) return <p>Loading recipe...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={recipe.imageUrl || '/placeholder.jpg'}
          alt={recipe.title}
          className="rounded w-full md:w-96 object-cover"
        />
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
            {recipe.dietaryTags?.map((tag) => (
              <span
                key={tag}
                className="bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-100 rounded px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
            <span>⏱ {recipe.cookTime} mins</span>
            <span>Difficulty: {recipe.difficulty}</span>
            {recipe.rating && <span>⭐ {recipe.rating.toFixed(1)}</span>}
          </div>

          <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className={`mb-4 px-4 py-2 rounded ${
              isFavorited ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {favoriteLoading ? 'Updating...' : isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Ingredients</h2>
            <ul className="list-disc pl-5 space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>
                  {ing.quantity} {ing.unit} {ing.name}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-2xl font-semibold mb-2">Instructions</h2>
            <ol className="list-decimal pl-5 space-y-2">
              {recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="mt-6">
            <h2 className="text-2xl font-semibold mb-2">Nutritional Information (per serving)</h2>
            {recipe.nutrition ? (
              <ul className="flex gap-8 text-sm font-mono">
                <li>Calories: {recipe.nutrition.calories} kcal</li>
                <li>Protein: {recipe.nutrition.protein} g</li>
                <li>Carbs: {recipe.nutrition.carbs} g</li>
                <li>Fat: {recipe.nutrition.fat} g</li>
              </ul>
            ) : (
              <p>Nutrition data not available.</p>
            )}
          </section>
        </div>
      </div>
      <div className="mt-8">
        <Link to="/recipes" className="text-green-600 dark:text-green-400 hover:underline">
          &larr; Back to recipe list
        </Link>
      </div>
    </div>
  );
}