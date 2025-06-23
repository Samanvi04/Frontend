// src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const dietaryOptions = ['vegan', 'vegetarian', 'keto', 'gluten-free', 'paleo', 'dairy-free'];
const cuisines = ['italian', 'mexican', 'indian', 'chinese', 'american', 'french'];

export default function Profile() {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    dietaryPreferences: [],
    allergies: [],
    cuisineLikes: [],
    cuisineDislikes: [],
    fitnessGoals: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    async function fetchProfile() {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData({
          username: response.data.username,
          email: response.data.email,
          dietaryPreferences: response.data.dietaryPreferences || [],
          allergies: response.data.allergies || [],
          cuisineLikes: response.data.cuisineLikes || [],
          cuisineDislikes: response.data.cuisineDislikes || [],
          fitnessGoals: response.data.fitnessGoals || '',
        });
      } catch (e) {
        setMessage('Failed to load profile info');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token, navigate]);

  // Handlers
  const toggleArrayValue = (field, value) => {
    setProfileData((prev) => {
      const arr = prev[field];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter((v) => v !== value) };
      }
      return { ...prev, [field]: [...arr, value] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await axios.put(
        `${API_URL}/users/me`,
        {
          dietaryPreferences: profileData.dietaryPreferences,
          allergies: profileData.allergies,
          cuisineLikes: profileData.cuisineLikes,
          cuisineDislikes: profileData.cuisineDislikes,
          fitnessGoals: profileData.fitnessGoals,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('Profile saved successfully!');
    } catch (e) {
      setMessage('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      {message && (
        <p className="mb-4 text-green-600 dark:text-green-400 font-semibold">{message}</p>
      )}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Username</label>
        <input
          type="text"
          value={profileData.username}
          disabled
          className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Email</label>
        <input
          type="email"
          value={profileData.email}
          disabled
          className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed"
        />
      </div>

      <fieldset className="mb-4">
        <legend className="font-semibold mb-2">Dietary Preferences</legend>
        <div className="flex flex-wrap gap-4">
          {dietaryOptions.map((opt) => (
            <label key={opt} className="cursor-pointer select-none">
              <input
                type="checkbox"
                checked={profileData.dietaryPreferences.includes(opt)}
                onChange={() => toggleArrayValue('dietaryPreferences', opt)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-4">
        <legend className="font-semibold mb-2">Allergies</legend>
        <input
          type="text"
          placeholder="Comma separated (e.g. nuts, shellfish)"
          value={profileData.allergies.join(', ')}
          onChange={(e) =>
            setProfileData((prev) => ({
              ...prev,
              allergies: e.target.value
                .split(',')
                .map((a) => a.trim())
                .filter(Boolean),
            }))
          }
          className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
        />
      </fieldset>

      <fieldset className="mb-4">
        <legend className="font-semibold mb-2">Cuisine Likes</legend>
        <div className="flex flex-wrap gap-4">
          {cuisines.map((cuisine) => (
            <label key={cuisine} className="cursor-pointer select-none">
              <input
                type="checkbox"
                checked={profileData.cuisineLikes.includes(cuisine)}
                onChange={() => toggleArrayValue('cuisineLikes', cuisine)}
                className="mr-2"
              />
              {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-4">
        <legend className="font-semibold mb-2">Cuisine Dislikes</legend>
        <div className="flex flex-wrap gap-4">
          {cuisines.map((cuisine) => (
            <label key={cuisine} className="cursor-pointer select-none">
              <input
                type="checkbox"
                checked={profileData.cuisineDislikes.includes(cuisine)}
                onChange={() => toggleArrayValue('cuisineDislikes', cuisine)}
                className="mr-2"
              />
              {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Fitness Goals</label>
        <textarea
          value={profileData.fitnessGoals}
          onChange={(e) => setProfileData((prev) => ({ ...prev, fitnessGoals: e.target.value }))}
          rows="3"
          placeholder="E.g. Gain muscle, low carb, weight loss"
          className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}