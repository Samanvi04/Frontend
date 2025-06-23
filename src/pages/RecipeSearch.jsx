// src/pages/RecipeSearch.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes } from '../redux/slices/recipesSlice';
import { Link, useSearchParams } from 'react-router-dom';

const dietaryOptions = ['vegan', 'vegetarian', 'keto', 'gluten-free', 'paleo', 'dairy-free'];

export default function RecipeSearch() {
  const dispatch = useDispatch();
  const { list, loading, error, total, page } = useSelector((state) => state.recipes);
  const [searchParams, setSearchParams] = useSearchParams();

  // Local filters state
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [ingredients, setIngredients] = useState(
    searchParams.get('ingredients') ? searchParams.get('ingredients').split(',') : []
  );
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || '');
  const [dietaryTags, setDietaryTags] = useState(
    searchParams.get('dietaryTags') ? searchParams.get('dietaryTags').split(',') : []
  );
  const [cookTime, setCookTime] = useState(searchParams.get('cookTime') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');

  const [pageState, setPageState] = useState(Number(page) || 1);

  useEffect(() => {
    const filters = {
      query,
      ingredients,
      cuisine,
      dietaryTags,
      cookTime,
      difficulty,
      page: pageState,
    };
    dispatch(fetchRecipes(filters));

    // Sync URL params
    const paramsObj = {};
    if (query) paramsObj.query = query;
    if (ingredients.length) paramsObj.ingredients = ingredients.join(',');
    if (cuisine) paramsObj.cuisine = cuisine;
    if (dietaryTags.length) paramsObj.dietaryTags = dietaryTags.join(',');
    if (cookTime) paramsObj.cookTime = cookTime;
    if (difficulty) paramsObj.difficulty = difficulty;
    if (pageState !== 1) paramsObj.page = String(pageState);

    setSearchParams(paramsObj);
  }, [query, ingredients, cuisine, dietaryTags, cookTime, difficulty, pageState, dispatch, setSearchParams]);

  // Ingredient input management
  const [ingredientInput, setIngredientInput] = useState('');

  const addIngredient = () => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };
  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter((i) => i !== ing));
  };

  const toggleDietaryTag = (tag) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter((t) => t !== tag));
    } else {
      setDietaryTags([...dietaryTags, tag]);
    }
  };

  // Pagination controls
  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Browse Recipes</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPageState(1);
          dispatch(fetchRecipes({ query, ingredients, cuisine, dietaryTags, cookTime, difficulty, page: 1 }));
        }}
        className="mb-6 bg-white dark:bg-gray-800 p-4 rounded shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search recipes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <div>
            <label className="block mb-1 font-semibold">Ingredients</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                placeholder="Add ingredient"
                className="p-2 flex-grow border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="bg-green-200 text-green-800 px-2 py-0.5 rounded cursor-pointer"
                  onClick={() => removeIngredient(ing)}
                  title="Click to remove"
                >
                  {ing} &times;
                </span>
              ))}
            </div>
          </div>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Cuisines</option>
            <option value="italian">Italian</option>
            <option value="mexican">Mexican</option>
            <option value="indian">Indian</option>
            <option value="chinese">Chinese</option>
            <option value="american">American</option>
            <option value="french">French</option>
            {/* Add more cuisines as needed */}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <div>
            <span className="mr-2 font-semibold">Dietary:</span>
            {dietaryOptions.map((tag) => (
              <label key={tag} className="mr-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dietaryTags.includes(tag)}
                  onChange={() => toggleDietaryTag(tag)}
                  className="mr-1"
                />
                {tag}
              </label>
            ))}
          </div>
          <select
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            className="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Cook Time</option>
            <option value="15">Up to 15 mins</option>
            <option value="30">Up to 30 mins</option>
            <option value="60">Up to 1 hour</option>
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Difficulty</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>
          <button
            type="submit"
            className="ml-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Search
          </button>
        </div>
      </form>

      {loading && <p>Loading recipes...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && list.length === 0 && <p>No recipes found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {list.map((recipe) => (
          <Link
            key={recipe._id}
            to={`/recipes/${recipe._id}`}
            className="bg-white dark:bg-gray-800 rounded shadow hover:shadow-lg transition-shadow overflow-hidden"
          >
            <img
              src={recipe.imageUrl || '/placeholder.jpg'}
              alt={recipe.title}
              className="w-full h-40 object-cover"
              loading="lazy"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{recipe.title}</h3>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                {recipe.dietaryTags?.map((tag) => (
                  <span
                    key={tag}
                    className="bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-100 rounded px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>⭐ {recipe.rating?.toFixed(1) || 'N/A'}</span>
                <span>{recipe.cookTime} mins</span>
                <span>{recipe.difficulty}</span>
              </div>
              <div className="mt-2 flex gap-3 text-xs font-mono text-gray-700 dark:text-gray-300">
                <span>⚡️ {recipe.nutrition?.calories || '?'} kcal</span>
                <span>🥩 {recipe.nutrition?.protein || '?'} g</span>
                <span>🍞 {recipe.nutrition?.carbs || '?'} g</span>
                <span>🥑 {recipe.nutrition?.fat || '?'} g</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setPageState((p) => Math.max(p - 1, 1))}
            disabled={pageState === 1}
            className="px-3 py-1 rounded border border-gray-400 disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages).keys()].map((num) => {
            const p = num + 1;
            return (
              <button
                key={p}
                onClick={() => setPageState(p)}
                className={`px-3 py-1 rounded border ${
                  p === pageState ? 'border-green-600 bg-green-600 text-white' : 'border-gray-400'
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPageState((p) => Math.min(p + 1, totalPages))}
            disabled={pageState === totalPages}
            className="px-3 py-1 rounded border border-gray-400 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}