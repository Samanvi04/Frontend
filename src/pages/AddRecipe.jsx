// src/pages/AddRecipe.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const cuisines = ['italian', 'mexican', 'indian', 'chinese', 'american', 'french'];
const dietaryTagsOptions = ['vegan', 'vegetarian', 'keto', 'gluten-free', 'paleo', 'dairy-free'];

export default function AddRecipe() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const [instructions, setInstructions] = useState(['']);
  const [cuisine, setCuisine] = useState('');
  const [dietaryTags, setDietaryTags] = useState([]);
  const [allergens, setAllergens] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sharingPublic, setSharingPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const addIngredientField = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };
  const removeIngredientField = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };
  const updateIngredient = (index, field, value) => {
    setIngredients(
      ingredients.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const addInstruction = () => setInstructions([...instructions, '']);
  const updateInstruction = (index, value) => {
    setInstructions(instructions.map((step, i) => (i === index ? value : step)));
  };
  const removeInstruction = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const toggleDietaryTag = (tag) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter((t) => t !== tag));
    } else {
      setDietaryTags([...dietaryTags, tag]);
    }
  };

  const toggleAllergen = (allergen) => {
    if (allergens.includes(allergen)) {
      setAllergens(allergens.filter((a) => a !== allergen));
    } else {
      setAllergens([...allergens, allergen]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      // Upload image first if present
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const imageRes = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        imageUrl = imageRes.data.imageUrl;
      }

      // Validate fields
      if (!title.trim()) throw new Error('Title is required');
      if (ingredients.length === 0 || ingredients.some((ing) => !ing.name.trim()))
        throw new Error('At least one ingredient with name is required');
      if (instructions.length === 0 || instructions.some((step) => !step.trim()))
        throw new Error('At least one instruction step is required');
      if (!cuisine) throw new Error('Cuisine type is required');

      // Submit recipe
      const payload = {
        title: title.trim(),
        ingredients: ingredients.map((ing) => ({
          name: ing.name.trim(),
          quantity: ing.quantity.trim(),
          unit: ing.unit.trim(),
        })),
        instructions: instructions.map((step) => step.trim()),
        cuisine,
        dietaryTags,
        allergens,
        imageUrl,
        isPublic: sharingPublic,
      };

      await axios.post(`${API_URL}/recipes`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Recipe submitted successfully!');
      // Reset form
      setTitle('');
      setIngredients([{ name: '', quantity: '', unit: '' }]);
      setInstructions(['']);
      setCuisine('');
      setDietaryTags([]);
      setAllergens([]);
      clearImage();
      setSharingPublic(true);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Failed to submit recipe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Add & Share Custom Recipe</h1>
      {message && (
        <p className={`mb-4 font-semibold ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1" htmlFor="title">
            Recipe Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <section>
          <label className="block font-semibold mb-1">Ingredients</label>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Name"
                className="flex-grow p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Quantity"
                className="w-24 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                value={ing.quantity}
                onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
              />
              <input
                type="text"
                placeholder="Unit"
                className="w-20 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredientField(idx)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 rounded"
                  aria-label="Remove ingredient"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredientField}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
          >
            Add Ingredient
          </button>
        </section>

        <section>
          <label className="block font-semibold mb-1">Instructions</label>
          {instructions.map((step, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-start">
              <textarea
                rows="3"
                className="flex-grow p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                value={step}
                onChange={(e) => updateInstruction(idx, e.target.value)}
                required
              />
              {instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(idx)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 rounded mt-1"
                  aria-label="Remove instruction step"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
          >
            Add Step
          </button>
        </section>

        <div>
          <label className="block font-semibold mb-1" htmlFor="cuisine">
            Cuisine Type
          </label>
          <select
            id="cuisine"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Select Cuisine</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="font-semibold mb-2">Dietary Tags</legend>
          <div className="flex flex-wrap gap-4">
            {dietaryTagsOptions.map((tag) => (
              <label key={tag} className="cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dietaryTags.includes(tag)}
                  onChange={() => toggleDietaryTag(tag)}
                  className="mr-2"
                />
                {tag}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-semibold mb-2">Allergens</legend>
          <input
            type="text"
            placeholder="Comma separated allergens (e.g., nuts, shellfish)"
            value={allergens.join(', ')}
            onChange={(e) =>
              setAllergens(
                e.target.value
                  .split(',')
                  .map((a) => a.trim())
                  .filter(Boolean)
              )
            }
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </fieldset>

        <div>
          <label className="font-semibold mb-2 block">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <div className="mt-2 relative max-w-xs">
              <img
                src={imagePreview}
                alt="Recipe preview"
                className="rounded shadow max-h-48 object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 hover:bg-red-700"
                aria-label="Remove image"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="cursor-pointer select-none flex items-center space-x-3">
            <input
              type="checkbox"
              checked={sharingPublic}
              onChange={() => setSharingPublic((p) => !p)}
            />
            <span>Make recipe public</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Recipe'}
        </button>
      </form>
    </div>
  );
}