import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { weekDays } from '../data/mockData';

export default function MealPlanner() {
  const { state, getRecipe, allRecipes, setMealPlanDay, generateWeek, addToShoppingList } = useApp();
  const navigate = useNavigate();

  function addWeekToShoppingList() {
    const items = [];
    weekDays.forEach((d) => {
      const r = getRecipe(state.mealPlan[d]);
      if (r) items.push(...r.ingredients);
    });
    if (items.length) addToShoppingList(items);
  }

  return (
    <div className="screen">
      <div className="back-row" style={{ padding: 0, marginBottom: 6 }}>
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h1 style={{ marginLeft: 12 }}>Meal Plan</h1>
      </div>

      <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={generateWeek}>
        ✨ Generate My Week
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
