import { useCallback, useState } from 'react';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS, DIFFICULTY_CONFIGS } from '../constants';

const STORAGE_KEY = 'cmiyc_settings';

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

interface UseSettingsReturn {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
  effectiveFearRadius: number;
  effectiveSpeed: number;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  const diffConfig = DIFFICULTY_CONFIGS[settings.difficulty];
  const effectiveFearRadius = settings.motionReduction
    ? settings.fearRadius * 0.5
    : settings.fearRadius;
  const effectiveSpeed = settings.motionReduction
    ? settings.animationSpeed * 0.3
    : settings.animationSpeed * diffConfig.speed;

  return { settings, updateSetting, resetSettings, effectiveFearRadius, effectiveSpeed };
}
