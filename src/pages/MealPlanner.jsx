import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { weekDays } from '../data/mockData';
import { askAI } from '../data/aiService';

export default function MealPlanner() {
  const { state, getRecipe, allRecipes, setMealPlanDay, generateWeek, addToShoppingList } = useApp();
  const navigate = useNavigate();
  const [loadingAI, setLoadingAI] = useState(false);

  function addWeekToShoppingList() {
    const items = [];
    weekDays.forEach((d) => {
      const r = getRecipe(state.mealPlan[d]);
      if (r) items.push(...r.ingredients);
    });
    if (items.length) addToShoppingList(items);
  }

  async function smartGenerateWeek() {
    setLoadingAI(true);
    try {
      const pool = allRecipes().map(r => ({ id: r.id, name: r.name, cuisine: r.cuisine }));
      const prompt = `You are a meal planner. From this list of recipes: ${JSON.stringify(pool)}, 
      pick 7 varied recipes for a week (Monday to Sunday). Return ONLY a JSON object where keys are days 
      (Monday, Tuesday, etc.) and values are recipe IDs.`;
      
      const { text } = await askAI([{ role: 'user', content: prompt }]);
      const plan = JSON.parse(text);
      
      weekDays.forEach(day => {
        if (plan[day]) setMealPlanDay(day, plan[day]);
      });
    } catch (e) {
      generateWeek();
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <div className="screen">
      <div className="back-row" style={{ padding: 0, marginBottom: 6 }}>
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h1 style={{ marginLeft: 12 }}>Meal Plan</h1>
      </div>

      <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={smartGenerateWeek} disabled={loadingAI}>
        {loadingAI ? 'Planning your week...' : '✨ Smart Generate My Week'}
      </button>

      <div className="section">
        {weekDays.map((day) => {
          const recipe = getRecipe(state.mealPlan[day]);
          return (
            <div key={day} className="list-row">
              <div className="grow">
                <div className="title">{day}</div>
                {recipe ? (
                  <div className="sub" style={{ cursor: 'pointer' }} onClick={() => navigate(`/recipe/${recipe.id}`)}>
                    {recipe.emoji} {recipe.name}
                  </div>
                ) : (
                  <div className="sub">No meal planned</div>
                )}
              </div>
              <select
                className="input"
                style={{ width: 130, padding: '8px 10px', fontSize: 12 }}
                value={state.mealPlan[day] || ''}
                onChange={(e) => setMealPlanDay(day, e.target.value || null)}
              >
                <option value="">Replace…</option>
                {allRecipes().map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          );
        })}
      </div>

      <button className="btn btn-secondary btn-block" style={{ marginTop: 16 }} onClick={addWeekToShoppingList}>
        🛒 Add ingredients for this week
      </button>
    </div>
  );
}
