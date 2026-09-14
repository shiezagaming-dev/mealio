import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ShoppingList() {
  const { state, toggleShoppingItem, clearCheckedShopping, addToShoppingList } = useApp();
  const [manual, setManual] = useState('');
  const navigate = useNavigate();

  const checkedCount = state.shoppingList.filter((i) => i.checked).length;

  function addManual() {
    if (!manual.trim()) return;
    addToShoppingList([{ name: manual.trim(), qty: 1, unit: '' }]);
    setManual('');
  }

  return (
    <div className="screen">
      <div className="back-row" style={{ padding: 0, marginBottom: 6 }}>
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h1 style={{ marginLeft: 12 }}>Shopping List</h1>
      </div>

      <div className="section" style={{ display: 'flex', gap: 8 }}>
        <input className="input" placeholder="Add an item" value={manual} onChange={(e) => setManual(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addManual()} />
        <button className="btn btn-primary" onClick={addManual}>Add</button>
      </div>

      <div className="section">
        {state.shoppingList.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">🛒</div>
            <p>Your list is empty. Add ingredients from any recipe.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: '4px 16px' }}>
            {state.shoppingList.map((item) => (
              <div key={item.id} className={`checkbox-row ${item.checked ? 'checked' : ''}`} onClick={() => toggleShoppingItem(item.id)}>
                <span className={`checkbox ${item.checked ? 'checked' : ''}`}>{item.checked ? '✓' : ''}</span>
                <span className="label grow">{item.name}{item.qty ? ` — ${item.qty}${item.unit ? ' ' + item.unit : ''}` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {checkedCount > 0 && (
        <button className="btn btn-secondary btn-block" style={{ marginTop: 14 }} onClick={clearCheckedShopping}>
          Clear {checkedCount} checked item{checkedCount > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
