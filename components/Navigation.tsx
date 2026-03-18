
import React from 'react';
import { Home, PlusSquare, Trophy, User, Leaf } from 'lucide-react';
import { hapticLight } from '../services/nativeService';

interface NavigationProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'challenges', icon: Trophy, label: 'Challenges' },
    { id: 'log', icon: PlusSquare, label: 'Log', center: true },
    { id: 'stats', icon: Leaf, label: 'Impact' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleTap = (tabId: string) => {
    if (tabId === currentTab) return;
    hapticLight();
    setTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-slate-700/50 flex justify-around items-center px-2 pt-2 z-50 nav-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        /* ── Center FAB button ── */
        if (tab.center) {
          return (
            <button
              key={tab.id}
              onClick={() => handleTap(tab.id)}
              aria-label="Log new habit"
              className="touch-fab bg-primary-500 text-white p-3.5 rounded-full shadow-lg shadow-primary-500/30 -mt-7"
            >
              <Icon size={26} strokeWidth={2.5} />
            </button>
          );
        }

        /* ── Regular tab ── */
        return (
          <button
            key={tab.id}
            onClick={() => handleTap(tab.id)}
            aria-label={tab.label}
            className={`touch-target touch-btn flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors duration-200 ${isActive
                ? 'text-primary-500'
                : 'text-gray-400 dark:text-gray-500'
              }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] font-semibold ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
              {tab.label}
            </span>
            {/* Active indicator dot */}
            <div className={`w-1 h-1 rounded-full transition-all duration-200 ${isActive ? 'bg-primary-500 scale-100' : 'bg-transparent scale-0'
              }`} />
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
