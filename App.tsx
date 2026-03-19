import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Navigation from './components/Navigation';
import { UserProfile, HabitLog, DailyTip, Badge } from './types';
import {
  initNativeApp,
  configureStatusBar,
  registerBackButton,
  unregisterBackButton,
  hapticSuccess,
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

/* ── Hardcoded eco tips (no AI required) ────────────── */
const ECO_TIPS: DailyTip[] = [
  {
    title: 'Switch to Reusable Bags',
    content: 'Bring a reusable bag when shopping. A single reusable bag can replace hundreds of plastic bags over its lifetime.',
    category: 'Waste',
  },
  {
    title: 'Shorten Your Shower',
    content: 'Cutting your shower by just 2 minutes saves up to 10 litres of water — small changes add up fast.',
    category: 'Water',
  },
  {
    title: 'Eat One Plant-Based Meal Today',
    content: 'Replacing one beef meal with a plant-based alternative saves roughly 2.5 kg of CO2 emissions.',
    category: 'Food',
  },
  {
    title: 'Unplug Idle Devices',
    content: 'Electronics on standby can account for up to 10% of your home energy bill. Unplug chargers and appliances when not in use.',
    category: 'Energy',
  },
  {
    title: 'Choose Active Transport',
    content: 'Walking or cycling instead of driving a 5 km trip saves about 1 kg of CO2 and improves your health too.',
    category: 'Transport',
  },
  {
    title: 'Start Composting',
    content: 'Food waste in landfills produces methane, a potent greenhouse gas. Composting turns scraps into nutrient-rich soil instead.',
    category: 'Waste',
  },
  {
    title: 'Line-Dry Your Laundry',
    content: 'Air-drying clothes instead of using a tumble dryer can save up to 2.4 kg of CO2 per load.',
    category: 'Energy',
  },
  {
    title: 'Buy Local Produce',
    content: 'Locally grown food travels shorter distances, reducing transport emissions and supporting your local economy.',
    category: 'Food',
  },
  {
    title: 'Turn Off Lights When Leaving',
    content: 'Simply switching off lights in empty rooms can reduce your household electricity use by around 15%.',
    category: 'Energy',
  },
  {
    title: 'Carry a Reusable Water Bottle',
    content: 'A reusable bottle eliminates the need for single-use plastic bottles — Kenyans discard millions of plastic bottles every week.',
    category: 'Waste',
  },
  {
    title: 'Use Cold Water for Laundry',
    content: 'Washing clothes in cold water uses up to 90% less energy than hot washes and is just as effective for most fabrics.',
    category: 'Energy',
  },
  {
    title: 'Plant a Tree or Support Reforestation',
    content: 'A single mature tree absorbs around 21 kg of CO2 per year. Consider planting one or donating to a local reforestation effort.',
    category: 'Nature',
  },
  {
    title: 'Reduce Meat Consumption',
    content: 'The livestock sector contributes roughly 14.5% of global greenhouse gas emissions. Even one meat-free day a week makes a difference.',
    category: 'Food',
  },
  {
    title: 'Use Public Transport',
    content: 'Taking a bus instead of driving alone can cut your per-trip emissions by up to 70%.',
    category: 'Transport',
  },
];

/**
 * Returns a consistent tip for the current calendar day.
 * The index is derived from the date so it stays the same
 * all day but rotates daily.
 */
const getDailyTip = (): DailyTip => {
  const today = new Date();
  const dayIndex =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  return ECO_TIPS[dayIndex % ECO_TIPS.length];
};

/* ── Constants ──────────────────────────────────────── */
const INITIAL_BADGES: Badge[] = [
  { id: 'b1', name: 'Seedling', icon: '🌱', unlocked: true, description: 'Started your journey' },
  { id: 'b2', name: 'Cycle Pro', icon: '🚲', unlocked: false, description: '10 transport habits' },
  { id: 'b3', name: 'Sun Power', icon: '☀️', unlocked: true, description: 'First energy habit' },
  { id: 'b4', name: 'Earth Hero', icon: '🌍', unlocked: false, description: 'Save 100kg CO2' },
];

const App: React.FC = () => {
  /* ── State ────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transitionKey, setTransitionKey] = useState(0);
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

  // Tip is derived synchronously — no async call needed
  const [tip] = useState<DailyTip>(getDailyTip);

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
    document.documentElement.classList.toggle('dark-bg', isDarkMode);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDarkMode ? '#0f172a' : '#f9fafb');
    configureStatusBar(isDarkMode);
  }, [isDarkMode]);

  /* ── Init: location, native plugins ──────────────── */
  useEffect(() => {
    initNativeApp(isDarkMode);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { } // silent fail
      );
    }
  }, []);

  /* ── Android back button handling ─────────────────── */
  useEffect(() => {
    registerBackButton(() => {
      if (activeTab === 'log' || activeTab !== 'dashboard') {
        handleTabChange('dashboard');
      }
    });
    return () => unregisterBackButton();
  }, [activeTab]);

  /* ── Tab switching with transition ────────────────── */
  const handleTabChange = useCallback((tab: string) => {
    if (tab === activeTab) return;
    setTransitionKey(k => k + 1);
    setActiveTab(tab);
  }, [activeTab]);

  /* ── Handle new habit log with PROPER streak logic ── */
  const handleNewLog = useCallback((newLog: HabitLog) => {
    setLogs(prev => [newLog, ...prev]);

    setUser(prev => {
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

    hapticSuccess();
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
        <Suspense fallback={<PageLoader />}>
          <div key={transitionKey} className={activeTab === 'log' ? 'slide-up-enter' : 'page-enter'}>
            {renderContent()}
          </div>
        </Suspense>

        {activeTab !== 'log' && (
          <Navigation currentTab={activeTab} setTab={handleTabChange} />
        )}
      </div>
    </div>
  );
};

export default App;