// src/pages/GroceryList.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { format, startOfWeek, addDays } from 'date-fns';
import { jsPDF } from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export default function GroceryList() {
  const { token } = useSelector((state) => state.auth);
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [groupByStore, setGroupByStore] = useState(false);

  useEffect(() => {
    if (!token) return;
    async function fetchGroceryList() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(
          `${API_URL}/grocery-list?startDate=${weekStartDate.toISOString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGroceryList(res.data.items || []);
      } catch (e) {
        setError('Failed to load grocery list.');
      } finally {
        setLoading(false);
      }
    }
    fetchGroceryList();
  }, [token, weekStartDate]);

  if (!token) return <p>Please log in to view your grocery list.</p>;
  if (loading) return <p>Loading grocery list...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (groceryList.length === 0) return <p>No items in grocery list for this week.</p>;

  // Group items by store if toggled, otherwise flat list
  const groupedItems = groupByStore
    ? groceryList.reduce((acc, item) => {
        const store = item.store || 'Others';
        if (!acc[store]) acc[store] = [];
        acc[store].push(item);
        return acc;
      }, {})
    : null;

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('NutriPlan Grocery List', 14, 20);
    doc.setFontSize(12);
    doc.text(`Week of ${format(weekStartDate, 'MMM dd, yyyy')}`, 14, 30);

    let y = 40;
    if (groupByStore) {
      for (const [store, items] of Object.entries(groupedItems)) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFont(undefined, 'bold');
        doc.text(store, 14, y);
        doc.setFont(undefined, 'normal');
        y += 6;
        items.forEach((item) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(`- ${item.name} (${item.quantity} ${item.unit || ''})`, 18, y);
          y += 6;
        });
        y += 4;
      }
    } else {
      groceryList.forEach((item) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`- ${item.name} (${item.quantity} ${item.unit || ''})`, 14, y);
        y += 6;
      });
    }
    doc.save(`GroceryList_${format(weekStartDate, 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h1 className="text-3xl font-bold mb-4">Weekly Grocery List</h1>

      <div className="mb-4 flex justify-between items-center">
        <button
          className="bg-gray-300 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          onClick={() => setWeekStartDate((d) => addDays(d, -7))}
        >
          Previous Week
        </button>
        <h2 className="text-xl font-semibold">Week of {format(weekStartDate, 'MMM dd, yyyy')}</h2>
        <button
          className="bg-gray-300 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          onClick={() => setWeekStartDate((d) => addDays(d, 7))}
        >
          Next Week
        </button>
      </div>

      <label className="block mb-4 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={groupByStore}
          onChange={() => setGroupByStore((v) => !v)}
          className="mr-2"
        />
        Group items by store
      </label>

      {groupByStore ? (
        Object.entries(groupedItems).map(([store, items]) => (
          <div key={store} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{store}</h3>
            <ul className="list-disc pl-5 space-y-1">
              {items.map((item, i) => (
                <li key={i}>
                  {item.name} - {item.quantity} {item.unit}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {groceryList.map((item, i) => (
            <li key={i}>
              {item.name} - {item.quantity} {item.unit} {item.store ? `(${item.store})` : ''}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={exportToPDF}
        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Export as PDF
      </button>
    </div>
  );
} 