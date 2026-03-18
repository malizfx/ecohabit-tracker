import React, { useState } from 'react';
import { Settings, Shield, Edit3, Award, Share2, Moon, Sun, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';
import { hapticLight } from '../services/nativeService';
import SettingsScreen from './SettingsScreen';

interface ProfileProps {
  user: UserProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, isDarkMode, onToggleDarkMode }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (isSettingsOpen) {
    return <SettingsScreen onBack={() => setIsSettingsOpen(false)} />;
  }

  const handleDarkModeToggle = () => {
    hapticLight();
    onToggleDarkMode();
  };

  return (
    <div className="space-y-5 content-safe scroll-native no-scrollbar px-5">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex justify-between items-center stagger-item">
        <span className="text-xs text-gray-500 dark:text-gray-400">v0.0.0</span>
        <h1 className="text-lg font-bold">Profile</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="touch-target touch-btn p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* ── Avatar & Name ──────────────────────────── */}
      <div className="flex flex-col items-center text-center stagger-item" style={{ animationDelay: '60ms' }}>
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-4xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
            {user.avatar ? (
              <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} loading="lazy" />
            ) : (
              '🧑‍🌾'
            )}
          </div>
          <button className="touch-btn absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full border-2 border-white dark:border-slate-800 shadow-md">
            <Edit3 size={14} />
          </button>
        </div>
        <h2 className="text-xl font-bold mt-4">{user.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Eco Warrior Level 12</p>
      </div>

      {/* ── Stats Grid ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 stagger-item" style={{ animationDelay: '120ms' }}>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-2xl font-black text-primary-500 count-pop">{user.totalCO2Saved.toFixed(0)}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">KG CO₂ Saved</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-2xl font-black text-orange-500 count-pop">{user.streak}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Day Streak</p>
        </div>
      </div>

      {/* ── Badges ──────────────────────────────────── */}
      <section className="stagger-item" style={{ animationDelay: '180ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2 text-sm">
            <Award className="text-yellow-500" size={18} /> Achievements
          </h3>
          <button className="touch-btn text-xs text-primary-500 font-bold px-2 py-1 -mr-2 rounded-lg">View All</button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {user.badges.map((badge) => (
            <div
              key={badge.id}
              className={`touch-btn aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all duration-200 ${badge.unlocked
                  ? 'bg-yellow-50 dark:bg-yellow-900/20'
                  : 'bg-gray-100 dark:bg-slate-800 grayscale opacity-60'
                }`}
            >
              <span className="text-2xl mb-1">{badge.icon}</span>
              <span className="text-[8px] font-bold text-gray-500 dark:text-gray-400 leading-tight">{badge.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Settings List ──────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-slate-700/50 stagger-item" style={{ animationDelay: '240ms' }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={handleDarkModeToggle}
          className="touch-btn w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="text-indigo-500" size={20} />
            ) : (
              <Sun className="text-amber-500" size={20} />
            )}
            <span className="text-sm font-semibold">Dark Mode</span>
          </div>
          <div className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${isDarkMode ? 'bg-primary-500' : 'bg-gray-300 dark:bg-slate-600'
            }`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`} />
          </div>
        </button>

        {/* Security */}
        <button className="touch-btn w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-500" size={20} />
            <span className="text-sm font-semibold">Security & Privacy</span>
          </div>
          <ChevronRight className="text-gray-300 dark:text-gray-600" size={18} />
        </button>

        {/* Invite Friends */}
        <button className="touch-btn w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Share2 className="text-purple-500" size={20} />
            <span className="text-sm font-semibold">Invite Friends</span>
          </div>
          <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">Bonus</span>
        </button>
      </div>

      {/* ── Logout ──────────────────────────────────── */}
      <button className="touch-btn w-full py-3.5 text-red-500 font-bold text-sm bg-red-50 dark:bg-red-900/10 rounded-2xl stagger-item" style={{ animationDelay: '300ms' }}>
        Log Out
      </button>
    </div>
  );
};

export default Profile;
