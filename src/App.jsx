import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Search from './pages/Search';
import CreateScan from './pages/CreateScan';
import RecipeDetail from './pages/RecipeDetail';
import CookMode from './pages/CookMode';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ShoppingList from './pages/ShoppingList';
import MealPlanner from './pages/MealPlanner';
import History from './pages/History';
import Achievements from './pages/Achievements';
import AIChef from './pages/AIChef';
import './styles/global.css';

function Shell() {
  const { toast } = useApp();
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/create" element={<CreateScan />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/cook/:id" element={<CookMode />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/shopping" element={<ShoppingList />} />
        <Route path="/planner" element={<MealPlanner />} />
        <Route path="/history" element={<History />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/ai-chef" element={<AIChef />} />
      </Routes>
      <BottomNav />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  );
}
