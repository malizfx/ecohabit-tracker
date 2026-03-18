
import React, { useState } from 'react';
import { Users, Timer, ShieldCheck } from 'lucide-react';
import { Challenge } from '../types';
import { hapticLight, hapticMedium } from '../services/nativeService';

const MOCK_CHALLENGES: Challenge[] = [
  { id: '1', title: 'Car-Free Week', description: 'Swap your commute for cycling or public transit for 7 days.', participants: 1242, daysRemaining: 3, joined: true },
  { id: '2', title: 'Meatless Mondays', description: 'Help reduce methane by skipping meat once a week.', participants: 4501, daysRemaining: 12, joined: false },
  { id: '3', title: 'Plastic Purge', description: 'Zero single-use plastics for 14 days straight.', participants: 890, daysRemaining: 5, joined: false },
];

const TABS = ['Active', 'Trending', 'Local', 'Completed'] as const;

const Challenges: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState(0);
  const [challenges, setChallenges] = useState(MOCK_CHALLENGES);

  const handleJoin = (id: string) => {
    hapticMedium();
    setChallenges(prev =>
      prev.map(c => c.id === id ? { ...c, joined: true } : c)
    );
  };

  const handleFilterTap = (idx: number) => {
    hapticLight();
    setActiveFilter(idx);
  };

  return (
    <div className="space-y-5 content-safe scroll-native no-scrollbar px-5">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between stagger-item">
        <h1 className="text-2xl font-bold">Challenges</h1>
        <button className="touch-btn text-primary-500 font-semibold text-sm px-3 py-2 -mr-3 rounded-xl">
          + Create
        </button>
      </div>

      {/* ── Filter Tabs ─────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 stagger-item" style={{ animationDelay: '60ms' }}>
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => handleFilterTap(idx)}
            className={`touch-btn px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${idx === activeFilter
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Challenge Cards ─────────────────────────── */}
      <div className="space-y-3.5">
        {challenges.map((challenge, idx) => (
          <div
            key={challenge.id}
            className="touch-card bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden stagger-item"
            style={{ animationDelay: `${120 + idx * 80}ms` }}
          >
            {challenge.joined && (
              <div className="absolute top-4 right-4 text-green-500">
                <ShieldCheck size={20} />
              </div>
            )}

            <h3 className="text-base font-bold pr-8">{challenge.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{challenge.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                  <Users size={14} /> {challenge.participants.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-orange-500">
                  <Timer size={14} /> {challenge.daysRemaining}d left
                </div>
              </div>

              <button
                onClick={() => !challenge.joined && handleJoin(challenge.id)}
                className={`touch-btn px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${challenge.joined
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  }`}
              >
                {challenge.joined ? 'View Stats' : 'Join'}
              </button>
            </div>

            {challenge.joined && (
              <div className="mt-4 h-1.5 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full progress-animate w-[60%]" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Leaderboard CTA ─────────────────────────── */}
      <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg stagger-item" style={{ animationDelay: '360ms' }}>
        <h3 className="font-bold text-lg mb-1.5">Global Leaderboard</h3>
        <p className="text-sm opacity-90 mb-4 leading-relaxed">See how you rank against eco-warriors worldwide.</p>
        <button className="touch-btn w-full bg-white/20 backdrop-blur-md py-3.5 rounded-xl font-bold transition-colors duration-200">
          Show Leaderboard
        </button>
      </div>
    </div>
  );
};

export default Challenges;
