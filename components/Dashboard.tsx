
import React from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Info, ChevronRight, MapPin } from 'lucide-react';
import { UserProfile, HabitLog, DailyTip } from '../types';
import { formatRelativeTime } from '../utils/formatTime';

interface DashboardProps {
  user: UserProfile;
  logs: HabitLog[];
  tip: DailyTip | null;
  location: { lat: number; lng: number } | null;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Transport: '🚲',
  Food: '🥗',
  Energy: '⚡',
  Waste: '♻️',
  Water: '💧',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Dashboard: React.FC<DashboardProps> = ({ user, logs, tip, location }) => {

  /* ── Derive chart data from actual logs (last 7 days) ── */
  const chartData = React.useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dayStr = date.toDateString();
      const dayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === dayStr);
      const co2 = dayLogs.reduce((sum, l) => sum + l.co2Saved, 0);
      return {
        day: DAY_LABELS[date.getDay()],
        co2: Math.round(co2 * 10) / 10,
      };
    });
  }, [logs]);

  return (
    <div className="space-y-5 content-safe scroll-native no-scrollbar px-5">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between stagger-item">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            You've saved <span className="font-bold text-primary-600 dark:text-primary-400">{user.totalCO2Saved.toFixed(1)}kg</span> CO₂ this month.
          </p>
        </div>
        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-sm">
          <Flame size={16} fill="currentColor" />
          <span className="font-bold text-sm">{user.streak}</span>
        </div>
      </div>

      {/* ── Daily Tip ──────────────────────────────────── */}
      {tip && (
        <div className="touch-card bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl border border-primary-100 dark:border-primary-800/30 relative overflow-hidden stagger-item" style={{ animationDelay: '80ms' }}>
          <div className="flex items-start gap-3">
            <div className="bg-primary-500/10 p-2 rounded-xl text-primary-600 flex-shrink-0">
              <Info size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-primary-900 dark:text-primary-100 text-sm">{tip.title}</h3>
              <p className="text-sm text-primary-700 dark:text-primary-300 mt-1 leading-relaxed">{tip.content}</p>
            </div>
          </div>
          {location && (
            <div className="mt-3 flex items-center gap-1 text-[10px] text-primary-600/50 uppercase tracking-widest font-bold">
              <MapPin size={10} /> Based on your location
            </div>
          )}
        </div>
      )}

      {/* ── Savings Chart ──────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm stagger-item" style={{ animationDelay: '160ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">CO₂ Savings Trend</h3>
          <button className="touch-btn text-primary-500 text-xs font-semibold flex items-center gap-0.5 px-2 py-1 -mr-2 rounded-lg">
            Details <ChevronRight size={14} />
          </button>
        </div>
        <div className="h-44 w-full -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                  padding: '8px 12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="co2"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorCo2)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Activity ────────────────────────────── */}
      <div className="stagger-item" style={{ animationDelay: '240ms' }}>
        <h3 className="font-bold text-sm mb-3">Recent Habits</h3>
        <div className="space-y-2.5">
          {logs.slice(0, 5).map((log, idx) => (
            <div
              key={log.id}
              className="touch-card bg-white dark:bg-slate-800 p-3.5 rounded-xl flex items-center gap-3 shadow-sm border border-gray-100/80 dark:border-slate-700/40 stagger-item"
              style={{ animationDelay: `${280 + idx * 60}ms` }}
            >
              <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {log.photoUrl ? (
                  <img src={log.photoUrl} className="w-full h-full object-cover" alt="" loading="lazy" />
                ) : (
                  <span className="text-lg">{CATEGORY_EMOJI[log.category] || '🌿'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">{log.category}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{log.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-primary-600 dark:text-primary-400">-{log.co2Saved.toFixed(1)}kg</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatRelativeTime(log.timestamp)}</p>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-12">
              <span className="text-5xl block mb-4">🌱</span>
              <h3 className="font-bold text-lg mb-1">Start Your Journey</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Tap the <span className="font-bold text-primary-500">+</span> button below to log your first eco-friendly habit!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
