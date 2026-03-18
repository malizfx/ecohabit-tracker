import React, { useState, useRef } from 'react';
import { Camera, Send, X, Loader2, Car, Utensils, Zap, Trash2, Droplets } from 'lucide-react';
import { HabitCategory, HabitLog } from '../types';
import { analyzeHabit } from '../services/geminiService';
import { hapticLight, hapticMedium } from '../services/nativeService';

interface LogHabitProps {
  onLog: (log: HabitLog) => void;
  onClose: () => void;
}

const LogHabit: React.FC<LogHabitProps> = ({ onLog, onClose }) => {
  const [category, setCategory] = useState<HabitCategory>(HabitCategory.TRANSPORT);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: HabitCategory.TRANSPORT, icon: Car, label: 'Transport', emoji: '🚲' },
    { id: HabitCategory.FOOD, icon: Utensils, label: 'Food', emoji: '🥗' },
    { id: HabitCategory.ENERGY, icon: Zap, label: 'Energy', emoji: '⚡' },
    { id: HabitCategory.WASTE, icon: Trash2, label: 'Waste', emoji: '♻️' },
    { id: HabitCategory.WATER, icon: Droplets, label: 'Water', emoji: '💧' },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySelect = (cat: HabitCategory) => {
    setCategory(cat);
    hapticLight();
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    hapticMedium();
    setIsAnalyzing(true);

    try {
      const analysis = await analyzeHabit(category, description, photo || undefined);

      const newLog: HabitLog = {
        id: Math.random().toString(36).substr(2, 9),
        category,
        description,
        co2Saved: analysis.co2Saved,
        timestamp: Date.now(),
        photoUrl: photo || undefined,
      };

      onLog(newLog);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col fullscreen-safe">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={onClose}
          aria-label="Close"
          className="touch-target touch-btn p-2 -ml-2 text-gray-400"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold">Log Habit</h2>
        <div className="w-12" />
      </div>

      {/* ── Form ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scroll-native no-scrollbar px-5 space-y-7 pb-4">
        {/* Category Selection */}
        <section>
          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 block">
            Category
          </label>
          <div className="grid grid-cols-5 gap-2.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`touch-btn flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200 ${isSelected
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 scale-105'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500'
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-bold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Description */}
        <section>
          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">
            What did you do?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Used my own coffee cup, rode bike to work…"
            className="w-full h-28 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary-500 text-base resize-none leading-relaxed"
            autoCapitalize="sentences"
            spellCheck
          />
        </section>

        {/* Photo Upload / Camera */}
        <section>
          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">
            Add Photo (Optional)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="touch-card w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-slate-800"
          >
            {photo ? (
              <>
                <img src={photo} className="w-full h-full object-cover" alt="Proof" />
                <button
                  onClick={(e) => { e.stopPropagation(); setPhoto(null); }}
                  aria-label="Remove photo"
                  className="absolute top-2 right-2 touch-target touch-btn bg-black/50 text-white rounded-full p-1.5"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <Camera size={28} className="text-gray-300 dark:text-gray-600 mb-2" />
                <span className="text-sm text-gray-400 font-medium">Capture or Upload</span>
              </>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </section>
      </div>

      {/* ── Submit Button ───────────────────────────── */}
      <div className="px-5 py-4 safe-bottom">
        <button
          onClick={handleSubmit}
          disabled={!description.trim() || isAnalyzing}
          className="touch-btn w-full bg-primary-500 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary-500/20"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Analyzing with AI…
            </>
          ) : (
            <>
              <Send size={18} /> Log Action
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LogHabit;
