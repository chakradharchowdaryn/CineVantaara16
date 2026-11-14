import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ROLE_THEMES, RoleThemeConfig } from '../utils/roleThemes';
import { ProfessionalRole } from '../types';

export type ThemeMode = 'dark' | 'light';

export type GlobalSkinId = 'GRAND_CINEMA_GOLD';

export interface GlobalSkinConfig {
  id: GlobalSkinId;
  name: string;
  tagline: string;
  cssClass: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

export const GLOBAL_SKINS: Record<GlobalSkinId, GlobalSkinConfig> = {
  GRAND_CINEMA_GOLD: {
    id: 'GRAND_CINEMA_GOLD',
    name: 'Grand Obsidian Gold & Crimson Studio',
    tagline: 'Hollywood Red Carpet & 70mm Gold Stage',
    cssClass: 'skin-grand-cinema',
    primary: '#F59E0B',
    secondary: '#DC2626',
    accent: '#FDE68A',
    glow: 'rgba(245, 158, 11, 0.4)'
  }
};

interface ThemeContextType {
  theme: RoleThemeConfig;
  activeRole: ProfessionalRole;
  mode: ThemeMode;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  globalSkin: GlobalSkinId;
  setGlobalSkin: (skin: GlobalSkinId) => void;
  currentSkinConfig: GlobalSkinConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeRole } = useAuth();
  const rawTheme = ROLE_THEMES[activeRole] || ROLE_THEMES.DIRECTOR;

  // Master Theme is permanently Grand Obsidian Gold & Crimson Studio
  const [mode, setMode] = useState<ThemeMode>(() => {
    localStorage.setItem('cv_theme_mode', 'dark');
    return 'dark';
  });

  const [globalSkin, setGlobalSkinState] = useState<GlobalSkinId>(() => {
    localStorage.setItem('cv_global_skin', 'GRAND_CINEMA_GOLD');
    localStorage.setItem('cv_grand_cinema_applied', 'true');
    return 'GRAND_CINEMA_GOLD';
  });

  const currentSkinConfig = GLOBAL_SKINS.GRAND_CINEMA_GOLD;

  const setGlobalSkin = (_newSkin: GlobalSkinId) => {
    setGlobalSkinState('GRAND_CINEMA_GOLD');
    localStorage.setItem('cv_global_skin', 'GRAND_CINEMA_GOLD');
  };

  // Sync global skin to document root and body
  useEffect(() => {
    const legacyClasses = [
      'skin-tuscan-linen',
      'skin-cyber-neon',
      'skin-vintage-noir',
      'skin-royal-velvet',
      'skin-emerald-studio',
      'skin-anamorphic-blue',
      'theme-light',
      'light'
    ];
    legacyClasses.forEach(cls => {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    });

    document.documentElement.classList.add('skin-grand-cinema', 'theme-dark', 'dark');
    document.body.classList.add('skin-grand-cinema', 'theme-dark', 'dark');

    document.documentElement.style.setProperty('--skin-primary', currentSkinConfig.primary);
    document.documentElement.style.setProperty('--skin-secondary', currentSkinConfig.secondary);
    document.documentElement.style.setProperty('--skin-accent', currentSkinConfig.accent);
    document.documentElement.style.setProperty('--skin-glow', currentSkinConfig.glow);

    const linkIcon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (linkIcon) {
      linkIcon.href = '/brand/logo-master.png';
    }
  }, [currentSkinConfig]);

  const theme = rawTheme;

  useEffect(() => {
    document.documentElement.classList.add('theme-dark', 'dark');
    document.documentElement.classList.remove('theme-light', 'light');
    document.documentElement.style.setProperty('--role-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--role-secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--role-accent', theme.accentColor);
  }, [mode, theme]);

  const toggleThemeMode = () => {
    setMode('dark');
    localStorage.setItem('cv_theme_mode', 'dark');
  };

  const setThemeMode = (_newMode: ThemeMode) => {
    setMode('dark');
    localStorage.setItem('cv_theme_mode', 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        activeRole,
        mode,
        toggleThemeMode,
        setThemeMode,
        globalSkin,
        setGlobalSkin,
        currentSkinConfig
      }}
    >
      <div
        className="theme-dark skin-grand-cinema min-h-screen bg-[#0A0908] text-white"
        style={{
          // @ts-ignore
          '--role-primary': theme.primaryColor,
          '--role-secondary': theme.secondaryColor,
          '--role-accent': theme.accentColor,
          '--skin-primary': currentSkinConfig.primary,
          '--skin-secondary': currentSkinConfig.secondary,
          '--skin-accent': currentSkinConfig.accent,
          '--skin-glow': currentSkinConfig.glow
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
