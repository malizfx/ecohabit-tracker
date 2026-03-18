import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col fullscreen-safe">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center px-5 py-3">
        <button
          onClick={onBack}
          aria-label="Back"
          className="touch-target touch-btn p-2 -ml-2 text-gray-400"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold ml-4">Settings</h2>
      </div>

      {/* ── Content ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scroll-native no-scrollbar px-5 space-y-7 pb-4">
        <p className="text-gray-500 dark:text-gray-400">Settings content goes here...</p>
      </div>
    </div>
  );
};

export default SettingsScreen;