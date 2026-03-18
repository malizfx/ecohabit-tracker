
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Navigation from './components/Navigation';
import { UserProfile, HabitLog, DailyTip, Badge } from './types';
import { getEcoTip } from './services/geminiService';
import {
  initNativeApp,
  configureStatusBar,
  registerBackButton,
  unregisterBackButton,
  hapticSuccess,
  hapticWarning,
} from './services/nativeService';
import { isToday, isYesterday } from './utils/formatTime';

/* ── Lazy-loaded pages (code splitting) ─────────────── */
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const LogHabit = React.lazy(() => import('./components/LogHabit'));
const Challenges = React.lazy(() => import('./components/Challenges'));
const Profile = React.lazy(() => import('./components/Profile'));
const ImpactStats = React.lazy(() => import('./components/ImpactStats'));

/* ── Loading fallback (matches bg, no flicker) ──────── */
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

/* ── Constants ──────────────────────────────────────── */
const INITIAL_BADGES: Badge[] = [
  { id: 'b1', name: 'Seedling', icon: '🌱', unlocked: true, description: 'Started your journey' },
  { id: 'b2', name: 'Cycle Pro', icon: '🚲', unlocked: false, description: '10 transport habits' },
  { id: 'b3', name: 'Sun Power', icon: '☀️', unlocked: true, description: 'First energy habit' },
  { id: 'b4', name: 'Earth Hero', icon: '🌍', unlocked: false, description: 'Save 100kg CO2' },
];

const TAB_HISTORY_KEY = 'dashboard'; // default "home" tab

const App: React.FC = () => {
  /* ── State ────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transitionKey, setTransitionKey] = useState(0); // forces re-mount for page-enter animation
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('eco_dark') === 'true';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('eco_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return {
      name: 'Alex Rivera',
      avatar: 'https://picsum.photos/seed/alex/200',
      totalCO2Saved: 24.5,
      streak: 5,
      badges: INITIAL_BADGES,
      goals: ['Reduce transport emissions', 'Eat more plant-based'],
    };
  });

  const [logs, setLogs] = useState<HabitLog[]>(() => {
    const saved = localStorage.getItem('eco_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return [];
  });

  const [tip, setTip] = useState<DailyTip | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  /* ── Persist on change ────────────────────────────── */
  useEffect(() => {
    localStorage.setItem('eco_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('eco_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('eco_dark', String(isDarkMode));
    // Apply dark-bg class to html for flash prevention
    document.documentElement.classList.toggle('dark-bg', isDarkMode);
    // Update theme-color meta tag
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDarkMode ? '#0f172a' : '#f9fafb');
    // Update native status bar
    configureStatusBar(isDarkMode);
  }, [isDarkMode]);

  /* ── Init: location, tip, native plugins ──────────── */
  useEffect(() => {
    // Native setup
    initNativeApp(isDarkMode);

    // Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { } // silent fail
      );
    }

    // Daily tip
    loadTip();
  }, []);

  /* ── Android back button handling ─────────────────── */
  useEffect(() => {
    registerBackButton(() => {
      if (activeTab === 'log') {
        // Close the LogHabit overlay → go back to dashboard
        handleTabChange('dashboard');
      } else if (activeTab !== 'dashboard') {
        // Navigate back to home
        handleTabChange('dashboard');
      }
      // If already on dashboard, let Android handle (minimize app)
    });

    return () => unregisterBackButton();
  }, [activeTab]);

  /* ── Tab switching with transition ────────────────── */
  const handleTabChange = useCallback((tab: string) => {
    if (tab === activeTab) return;
    setTransitionKey(k => k + 1); // trigger page-enter animation
    setActiveTab(tab);
  }, [activeTab]);

  /* ── Load daily eco tip ───────────────────────────── */
  const loadTip = async () => {
    const dailyTip = await getEcoTip(location);
    setTip(dailyTip);
  };

  /* ── Handle new habit log with PROPER streak logic ── */
  const handleNewLog = useCallback((newLog: HabitLog) => {
    setLogs(prev => [newLog, ...prev]);

    setUser(prev => {
      // Smart streak: only increment once per day, reset if skipped a day
      const alreadyLoggedToday = logs.some(l => isToday(l.timestamp));
      let newStreak = prev.streak;

      if (!alreadyLoggedToday) {
        const loggedYesterday = logs.some(l => isYesterday(l.timestamp));
        newStreak = loggedYesterday || prev.streak === 0 ? prev.streak + 1 : 1;
      }

      return {
        ...prev,
        totalCO2Saved: prev.totalCO2Saved + newLog.co2Saved,
        streak: newStreak,
      };
    });

    hapticSuccess(); // native vibration on success
    setTransitionKey(k => k + 1);
    setActiveTab('dashboard');
  }, [logs]);

  /* ── Render active page ───────────────────────────── */
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} logs={logs} tip={tip} location={location} />;
      case 'challenges':
        return <Challenges />;
      case 'profile':
        return (
          <Profile
            user={user}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(d => !d)}
          />
        );
      case 'log':
        return <LogHabit onLog={handleNewLog} onClose={() => handleTabChange('dashboard')} />;
      case 'stats':
        return <ImpactStats user={user} logs={logs} />;
      default:
        return <Dashboard user={user} logs={logs} tip={tip} location={location} />;
    }
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-md mx-auto min-h-screen min-h-[100dvh] flex flex-col">
        {/* Page content with transition */}
        <Suspense fallback={<PageLoader />}>
          <div key={transitionKey} className={activeTab === 'log' ? 'slide-up-enter' : 'page-enter'}>
            {renderContent()}
          </div>
        </Suspense>

        {/* Bottom nav — hidden on LogHabit overlay */}
        {activeTab !== 'log' && (
          <Navigation currentTab={activeTab} setTab={handleTabChange} />
        )}
      </div>
    </div>
  );
};

export default App;
