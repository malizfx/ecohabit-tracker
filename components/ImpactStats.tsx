
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { UserProfile, HabitLog, HabitCategory } from '../types';

interface ImpactStatsProps {
    user: UserProfile;
    logs: HabitLog[];
}

const CATEGORY_META: Record<string, { color: string; icon: string }> = {
    [HabitCategory.TRANSPORT]: { color: '#3b82f6', icon: '🚲' },
    [HabitCategory.FOOD]: { color: '#f59e0b', icon: '🥗' },
    [HabitCategory.ENERGY]: { color: '#22c55e', icon: '⚡' },
    [HabitCategory.WASTE]: { color: '#8b5cf6', icon: '♻️' },
    [HabitCategory.WATER]: { color: '#06b6d4', icon: '💧' },
};

const ImpactStats: React.FC<ImpactStatsProps> = ({ user, logs }) => {
    const co2 = user.totalCO2Saved;

    /* ── Category breakdown ─────────────────────────── */
    const categoryData = Object.values(HabitCategory)
        .map(cat => {
            const catLogs = logs.filter(l => l.category === cat);
            const total = catLogs.reduce((s, l) => s + l.co2Saved, 0);
            return {
                name: cat,
                value: Math.round(total * 10) / 10,
                count: catLogs.length,
                ...CATEGORY_META[cat],
            };
        })
        .filter(d => d.value > 0);

    /* ── CO₂ equivalencies ─────────────────────────── */
    const equivalencies = [
        { icon: '🌳', value: (co2 / 21).toFixed(1), unit: 'trees/yr' },
        { icon: '🚗', value: (co2 * 2.3).toFixed(0), unit: 'km saved' },
        { icon: '💡', value: Math.round(co2 / 0.005).toLocaleString(), unit: 'bulb hrs' },
    ];

    /* ── Week-over-week comparison ─────────────────── */
    const now = Date.now();
    const WEEK = 7 * 86_400_000;
    const thisWeekLogs = logs.filter(l => now - l.timestamp < WEEK);
    const lastWeekLogs = logs.filter(l => {
        const age = now - l.timestamp;
        return age >= WEEK && age < 2 * WEEK;
    });
    const thisWeekCO2 = thisWeekLogs.reduce((s, l) => s + l.co2Saved, 0);
    const lastWeekCO2 = lastWeekLogs.reduce((s, l) => s + l.co2Saved, 0);

    let weekTrend = 0;
    if (lastWeekCO2 > 0) weekTrend = ((thisWeekCO2 - lastWeekCO2) / lastWeekCO2) * 100;
    else if (thisWeekCO2 > 0) weekTrend = 100;

    const TrendIcon = weekTrend > 0 ? TrendingUp : weekTrend < 0 ? TrendingDown : Minus;
    const trendColor = weekTrend > 0 ? 'text-emerald-300' : weekTrend < 0 ? 'text-red-300' : 'text-white/70';

    /* ── Max for bar chart scaling ─────────────────── */
    const maxCatValue = Math.max(...categoryData.map(c => c.value), 1);

    return (
        <div className="space-y-5 content-safe scroll-native no-scrollbar">
            <h1 className="text-2xl font-bold">Your Impact</h1>

            {/* ── Hero Card ──────────────────────────────── */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white text-center shadow-lg stagger-item">
                <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Total CO₂ Saved</p>
                <p className="text-5xl font-black mt-2 count-pop">{co2.toFixed(1)}</p>
                <p className="text-base font-medium opacity-90 mt-1">kilograms</p>
                <div className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${trendColor}`}>
                    <TrendIcon size={16} />
                    <span>{weekTrend > 0 ? '+' : ''}{weekTrend.toFixed(0)}% vs last week</span>
                </div>
            </div>

            {/* ── Equivalencies ──────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
                {equivalencies.map((eq, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-slate-800 p-3 rounded-xl text-center shadow-sm stagger-item"
                        style={{ animationDelay: `${(i + 1) * 80}ms` }}
                    >
                        <span className="text-2xl block">{eq.icon}</span>
                        <p className="text-lg font-black mt-1">{eq.value}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">{eq.unit}</p>
                    </div>
                ))}
            </div>

            {/* ── Category Breakdown ─────────────────────── */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm stagger-item" style={{ animationDelay: '320ms' }}>
                <h3 className="font-bold mb-4">By Category</h3>
                {categoryData.length > 0 ? (
                    <div className="space-y-4">
                        {categoryData.map(cat => {
                            const pct = (cat.value / maxCatValue) * 100;
                            return (
                                <div key={cat.name} className="flex items-center gap-3">
                                    <span className="text-xl w-8 text-center flex-shrink-0">{cat.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium truncate">{cat.name}</span>
                                            <span className="font-bold text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">{cat.value}kg</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full progress-animate"
                                                style={{ width: `${pct}%`, backgroundColor: cat.color }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <span className="text-4xl block mb-3">🌱</span>
                        <p className="text-sm text-gray-400 font-medium">Log some habits to see your category breakdown!</p>
                    </div>
                )}
            </div>

            {/* ── This Week Summary ──────────────────────── */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm stagger-item" style={{ animationDelay: '400ms' }}>
                <h3 className="font-bold mb-3">This Week</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-3xl font-black text-primary-500">{thisWeekLogs.length}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Actions</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-black text-emerald-500">{thisWeekCO2.toFixed(1)}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">kg saved</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImpactStats;
