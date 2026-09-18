import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import './styles/global.css';
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboard } from './hooks/useKeyboard';

function AuthGuard({ children }) {
  const { state } = useApp();
  if (!state.account?.loggedIn) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function Shell() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isKeyboardOpen = useKeyboard();

  useEffect(() => {
    const backListener = CapacitorApp.addListener('backButton', (data) => {
      if (window.history.length > 1) {
        navigate(-1);
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [navigate]);

  if (!state.hasCompletedOnboarding) {
    return <Onboarding />;
  }

  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="app-shell">
      <div key={location.pathname} className="page-transition">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
          <Route path="/search" element={<AuthGuard><Search /></AuthGuard>} />
          <Route path="/create" element={<AuthGuard><CreateScan /></AuthGuard>} />
          <Route path="/recipe/:id" element={<AuthGuard><RecipeDetail /></AuthGuard>} />
          <Route path="/cook/:id" element={<AuthGuard><CookMode /></AuthGuard>} />
          <Route path="/saved" element={<AuthGuard><Saved /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="/shopping" element={<AuthGuard><ShoppingList /></AuthGuard>} />
          <Route path="/planner" element={<AuthGuard><MealPlanner /></AuthGuard>} />
          <Route path="/history" element={<AuthGuard><History /></AuthGuard>} />
          <Route path="/achievements" element={<AuthGuard><Achievements /></AuthGuard>} />
          <Route path="/ai-chef" element={<AuthGuard><AIChef /></AuthGuard>} />
        </Routes>
      </div>
      {/* Masquer la BottomNav si on est sur Auth OU si le clavier est ouvert */}
      {!isAuthPage && !isKeyboardOpen && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ShellWrapper />
      </HashRouter>
    </AppProvider>
  );
}

function ShellWrapper() {
  return <Shell />;
}
