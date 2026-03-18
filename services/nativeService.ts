/**
 * nativeService.ts
 * ─────────────────
 * Thin wrappers around Capacitor native plugins.
 * Every call is guarded:
 *   1. Capacitor.isNativePlatform() — skips on web/dev
 *   2. Dynamic imports — won't crash if a plugin isn't installed
 *   3. try/catch — graceful degradation
 */

import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

// ─── Status Bar ──────────────────────────────────────────
export const configureStatusBar = async (darkMode: boolean) => {
  if (!isNative) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({
      style: darkMode ? Style.Dark : Style.Light,
    });
    await StatusBar.setBackgroundColor({
      color: darkMode ? '#0f172a' : '#f9fafb',
    });
  } catch (e) {
    console.warn('[native] StatusBar unavailable:', e);
  }
};

// ─── Haptics ─────────────────────────────────────────────
export const hapticLight = async () => {
  if (!isNative) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
};

export const hapticMedium = async () => {
  if (!isNative) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
};

export const hapticSuccess = async () => {
  if (!isNative) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
};

export const hapticWarning = async () => {
  if (!isNative) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {}
};

// ─── Back Button ─────────────────────────────────────────
type BackButtonCallback = () => void;
let backButtonCleanup: (() => void) | null = null;

export const registerBackButton = (handler: BackButtonCallback) => {
  if (!isNative) return;
  // Remove any existing listener first
  unregisterBackButton();
  import('@capacitor/app').then(({ App }) => {
    const listener = App.addListener('backButton', ({ canGoBack }) => {
      handler();
    });
    backButtonCleanup = () => {
      listener.then(l => l.remove());
    };
  }).catch(() => {});
};

export const unregisterBackButton = () => {
  if (backButtonCleanup) {
    backButtonCleanup();
    backButtonCleanup = null;
  }
};

// ─── Splash / Launch ────────────────────────────────────
export const initNativeApp = async (darkMode: boolean) => {
  if (!isNative) return;
  await configureStatusBar(darkMode);
};

export { isNative };
