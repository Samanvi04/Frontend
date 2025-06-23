// src/pages/MealPlanner.js
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { format, addDays, startOfWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

function generateWeekDays(startDate) {
  return [...Array(7).keys()].map((i) => addDays(startDate, i));
}

export default function MealPlanner() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [plannedMeals, setPlannedMeals] = useState({}); // { date: { mealType: recipe } }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [draggingRecipe, setDraggingRecipe] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    async function fetchPlanner() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_URL}/planner?startDate=${weekStartDate.toISOString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlannedMeals(res.data.plannedMeals || {});
      } catch (e) {
        setError('Failed to load meal plan for the week.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchRecipes() {
      try {
        const res = await axios.get(`${API_URL}/recipes?limit=20`);
        setAvailableRecipes(res.data.recipes || []);
      } catch {
        // fail silently, recipe list can be empty
      }
    }

    fetchPlanner();
    fetchRecipes();
  }, [token, navigate, weekStartDate]);

  const weekDays = generateWeekDays(weekStartDate);

  const savePlanner = async (newPlannedMeals) => {
    try {
      await axios.post(
        `${API_URL}/planner`,
        {
          startDate: weekStartDate.toISOString(),
          plannedMeals: newPlannedMeals,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (e) {
      setError('Failed to save meal plan.');
    }
  };

  const onDragEnd = async (result) => {
    setDraggingRecipe(null);
    const { destination, source, draggableId } = result;
    if (!destination) return; // dropped outside

    // draggableId format: recipe-{recipeId}
    const recipeId = draggableId.split('recipe-')[1];
    // destination.droppableId format: date-mealType
    const [date, mealType] = destination.droppableId.split('-');

    // Remove item from available recipes if dragged from recipe list, or from planner if rearranged
    if (source.droppableId === 'available-recipes') {
      // Add recipe to plannedMeals
      const newPlanned = { ...plannedMeals };
      if (!newPlanned[date]) newPlanned[date] = {};
      newPlanned[date][mealType] = availableRecipes.find((r) => r._id === recipeId);
      setPlannedMeals(newPlanned);
      await savePlanner(newPlanned);
    } else if (source.droppableId.startsWith('date-')) {
      // Rearranging meal from one slot to another or same slot
      const [sourceDate, sourceMealType] = source.droppableId.split('-');
      if (sourceDate === date && sourceMealType === mealType) return; // no change

      const newPlanned = { ...plannedMeals };
      if (!newPlanned[date]) newPlanned[date] = {};
      if (newPlanned[sourceDate]?.[sourceMealType]?._id === recipeId) {
        // Move recipe from source slot to destination slot
        newPlanned[date][mealType] = newPlanned[sourceDate][sourceMealType];
        delete newPlanned[sourceDate][sourceMealType];
        setPlannedMeals(newPlanned);
        await savePlanner(newPlanned);
      }
    }
  };

  const removeMeal = async (date, mealType) => {
    const newPlanned = { ...plannedMeals };
    if (newPlanned[date]?.[mealType]) {
      delete newPlanned[date][mealType];
      setPlannedMeals(newPlanned);
      await savePlanner(newPlanned);
    }
  };

  if (loading) return <p>Loading meal planner...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Drag-and-Drop Meal Planner Calendar</h1>
      <div className="mb-4 flex justify-between items-center space-x-4">
        <button
          onClick={() => setWeekStartDate((d) => addDays(d, -7))}
          className="bg-gray-300 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          Previous Week
        </button>
        <h2 className="text-xl font-semibold">
          Week of {format(weekStartDate, 'MMM dd, yyyy')}
        </h2>
        <button
          onClick={() => setWeekStartDate((d) => addDays(d, 7))}
          className="bg-gray-300 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          Next Week
        </button>
      </div>

      <DragDropContext
        onDragEnd={onDragEnd}
        onDragStart={(start) => {
          setDraggingRecipe(start.draggableId);
        }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Available Recipes panel */}
          <Droppable droppableId="available-recipes" isDropDisabled={true}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded shadow p-4 max-h-[600px] overflow-auto"
              >
                <h3 className="text-lg font-semibold mb-2">Available Recipes</h3>
                {availableRecipes.length === 0 && <p>No recipes available.</p>}
                {availableRecipes.map((recipe, idx) => (
                  <Draggable key={recipe._id} draggableId={`recipe-${recipe._id}`} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        className={`p-2 mb-2 bg-green-100 dark:bg-green-700 rounded cursor-grab border ${
                          snapshot.isDragging ? 'shadow-lg' : 'border-green-400 dark:border-green-300'
                        }`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        title={recipe.title}
                      >
                        <div className="font-semibold">{recipe.title}</div>
                        <div className="text-xs italic">{recipe.cuisine}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Meal planner grid */}
          <div className="w-full md:w-3/4 overflow-x-auto">
            <div className="grid grid-cols-8 gap-2">
              <div className="bg-gray-200 dark:bg-gray-700 rounded p-2 font-semibold sticky top-0 z-10"></div>
              {weekDays.map((date) => (
                <div
                  key={date.toISOString()}
                  className="bg-gray-200 dark:bg-gray-700 rounded p-2 text-center font-semibold sticky top-0 z-10"
                >
                  {format(date, 'EEE dd')}
                </div>
              ))}

              {/* Rows for meal types */}
              {mealTypes.map((mealType) => (
                <React.Fragment key={mealType}>
                  <div className="bg-gray-300 dark:bg-gray-600 rounded p-2 font-semibold flex items-center justify-center sticky left-0 z-10">
                    {mealType}
                  </div>
                  {weekDays.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const plannedRecipe = plannedMeals[dateStr]?.[mealType];
                    return (
                      <Droppable key={`${dateStr}-${mealType}`} droppableId={`${dateStr}-${mealType}`}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`min-h-[80px] p-1 border rounded bg-white dark:bg-gray-800 cursor-pointer ${
                              snapshot.isDraggingOver ? 'bg-green-100 dark:bg-green-900 border-green-600' : ''
                            }`}
                          >
                            {plannedRecipe ? (
                              <Draggable draggableId={`recipe-${plannedRecipe._id}`} index={0}>
                                {(provided, snapshot) => (
                                  <div
                                    className="bg-green-200 dark:bg-green-600 rounded p-1 text-sm cursor-grab flex justify-between items-center"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <span title={plannedRecipe.title}>{plannedRecipe.title}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeMeal(dateStr, mealType)}
                                      className="ml-2 text-red-700 font-bold"
                                      aria-label={`Remove ${mealType} meal on ${dateStr}`}
                                    >
                                      &times;
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs select-none">Drop recipe here</span>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>
      <p className="mt-4 text-xs italic text-gray-500 dark:text-gray-400">
        * Drag recipes from the left list into the calendar slots to plan your meals.
      </p>
    </div>
  );
}