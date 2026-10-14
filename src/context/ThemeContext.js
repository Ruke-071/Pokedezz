import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

// Type Accent Color Palette
export const TYPE_ACCENTS = {
  classic: { name: 'Poké Red', color: '#EF5350', light: '#FFEBEE', dark: '#2C1D1D' },
  pikachu: { name: 'Pikachu Gold', color: '#FFD700', light: '#FFFDE7', dark: '#332A00' },
  arceus: { name: 'Arceus Divine', color: '#E6C25B', light: '#FFF8E1', dark: '#241E0D' },
  fire: { name: 'Fire', color: '#F08030', light: '#FDF2E9', dark: '#331B0B' },
  water: { name: 'Water', color: '#3B82F6', light: '#EFF6FF', dark: '#0C2340' },
  electric: { name: 'Electric', color: '#F59E0B', light: '#FEF3C7', dark: '#382500' },
  grass: { name: 'Grass', color: '#10B981', light: '#ECFDF5', dark: '#062E20' },
  ice: { name: 'Ice', color: '#06B6D4', light: '#ECFEFF', dark: '#082F38' },
  psychic: { name: 'Psychic', color: '#EC4899', light: '#FDF2F8', dark: '#3D0A24' },
  dragon: { name: 'Dragon', color: '#7C3AED', light: '#F5F3FF', dark: '#230E4E' },
  dark: { name: 'Dark', color: '#6366F1', light: '#EEF2FF', dark: '#181B34' },
  ghost: { name: 'Ghost', color: '#8B5CF6', light: '#F5F3FF', dark: '#281745' },
  fairy: { name: 'Fairy', color: '#F472B6', light: '#FDF2F8', dark: '#3B1226' },
  steel: { name: 'Steel', color: '#64748B', light: '#F8FAFC', dark: '#1E293B' },
};

// Base Theme Presets
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AMOLED: 'amoled',
  POKEDEX_RED: 'pokedex-red',
  PIKACHU: 'pikachu',
  ARCEUS: 'arceus',
};

// Helper to generate full theme object with selected accent
export const createTheme = (mode, accentKey = 'classic') => {
  const accent = TYPE_ACCENTS[accentKey] || TYPE_ACCENTS.classic;
  const isAmoled = mode === THEME_MODES.AMOLED;
  const isPokedexRed = mode === THEME_MODES.POKEDEX_RED;
  const isPikachu = mode === THEME_MODES.PIKACHU;
  const isArceus = mode === THEME_MODES.ARCEUS;
  const isDark = mode === THEME_MODES.DARK || isAmoled || isPokedexRed || isPikachu || isArceus;

  if (isPikachu) {
    return {
      dark: true,
      mode: THEME_MODES.PIKACHU,
      accentKey,
      isPikachu: true,
      colors: {
        background: '#1A1605', // Deep lightning-amber obsidian
        card: '#272007', // Warm Pikachu amber card
        cardBackground: '#272007',
        surface: '#362C0B',
        text: '#FFFDE7', // Warm bright cream yellow text
        textSecondary: '#E5C158', // Goldenrod secondary
        border: '#54430F', // Rich gold border
        primary: '#FFD700', // Iconic Pikachu Electric Gold
        primaryLight: 'rgba(255, 215, 0, 0.18)',
        accent: '#FF3B30', // Cheek-Pouch Rosy Red
        accentDark: '#D32F2F',
        success: '#4CAF50',
        info: '#00E5FF',
        shadow: '#100C02',
        skeleton: '#382F0F',
        pokedexRed: '#FF3B30',
        scannerCyan: '#FFD700',
        pikachuYellow: '#FFD700',
        pikachuCheek: '#FF3B30',
        pikachuBrown: '#2A2006',
      },
    };
  }

  if (isArceus) {
    return {
      dark: true,
      mode: THEME_MODES.ARCEUS,
      accentKey,
      isArceus: true,
      colors: {
        background: '#0B0F19', // Deep cosmic Sinnoh ether
        card: '#131A2B', // Celestial platinum-slate
        cardBackground: '#131A2B',
        surface: '#1C263D', // Sacred temple altar surface
        text: '#F5F7FA', // Divine platinum white
        textSecondary: '#9AAEC7', // Starlight silver
        border: '#DFC16E4D', // Gold filigree border
        primary: '#E6C25B', // Sacred Arceus Celestial Gold
        primaryLight: 'rgba(230, 194, 91, 0.2)',
        accent: '#00E5FF', // Arc Phone Divine Cyan
        accentDark: '#0097A7',
        success: '#1DE9B6', // Jade life energy
        info: '#E6C25B',
        shadow: '#04060A',
        skeleton: '#1F293D',
        pokedexRed: '#E6C25B',
        scannerCyan: '#00E5FF',
        arceusGold: '#E6C25B',
        arceusJade: '#00E5FF',
      },
    };
  }

  if (isPokedexRed) {
    return {
      dark: true,
      mode: THEME_MODES.POKEDEX_RED,
      accentKey,
      colors: {
        background: '#8E0E00', // Deep metallic Pokédex crimson
        card: '#A81815', // Pokédex red panel
        cardBackground: '#A81815',
        surface: '#B71C1C',
        text: '#FFFFFF',
        textSecondary: '#FFCDD2',
        border: '#5F0900',
        primary: '#29B6F6', // Glowing Cyan Scanner LED
        primaryLight: 'rgba(41, 182, 246, 0.15)',
        accent: '#FFEB3B', // Indicator yellow
        accentDark: '#1E88E5',
        success: '#4CAF50',
        info: '#00E5FF',
        shadow: '#3E0000',
        skeleton: '#9A1412',
        pokedexRed: '#DC0A2D',
        scannerCyan: '#00E5FF',
      },
    };
  }

  if (isAmoled) {
    return {
      dark: true,
      mode: THEME_MODES.AMOLED,
      accentKey,
      colors: {
        background: '#000000', // Pitch-black true AMOLED
        card: '#0D0D11', // Deep carbon card
        cardBackground: '#0D0D11',
        surface: '#121216',
        text: '#FFFFFF',
        textSecondary: '#9E9E9E',
        border: '#212126',
        primary: accent.color,
        primaryLight: accent.dark,
        accent: '#FFD700',
        accentDark: '#4D62E8',
        success: '#81C784',
        info: '#64B5F6',
        shadow: '#000000',
        skeleton: '#1A1A22',
        pokedexRed: '#FF3344',
        scannerCyan: '#00E5FF',
      },
    };
  }

  if (isDark) {
    return {
      dark: true,
      mode: THEME_MODES.DARK,
      accentKey,
      colors: {
        background: '#121214',
        card: '#1A1A1E',
        cardBackground: '#1A1A1E',
        surface: '#24242A',
        text: '#F7FAFC',
        textSecondary: '#A0AEC0',
        border: '#2D3748',
        primary: accent.color,
        primaryLight: accent.dark,
        accent: '#FFCB05',
        accentDark: '#4D62E8',
        success: '#81C784',
        info: '#64B5F6',
        shadow: '#000000',
        skeleton: '#2D3748',
        pokedexRed: '#EF5350',
        scannerCyan: '#29B6F6',
      },
    };
  }

  // Classic Light
  return {
    dark: false,
    mode: THEME_MODES.LIGHT,
    accentKey,
    colors: {
      background: '#F6F8FC',
      card: '#FFFFFF',
      cardBackground: '#FFFFFF',
      surface: '#F1F5F9',
      text: '#2D3748',
      textSecondary: '#718096',
      border: '#E2E8F0',
      primary: accent.color,
      primaryLight: accent.light,
      accent: '#FFCB05',
      accentDark: '#3B4CCA',
      success: '#4CAF50',
      info: '#2196F3',
      shadow: '#171717',
      skeleton: '#E2E8F0',
      pokedexRed: '#DC0A2D',
      scannerCyan: '#0288D1',
    },
  };
};

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState(THEME_MODES.LIGHT);
  const [accentKey, setAccentKey] = useState('classic');

  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const [savedMode, savedAccent] = await Promise.all([
          AsyncStorage.getItem('@theme_mode_v2'),
          AsyncStorage.getItem('@theme_accent_v2'),
        ]);

        if (savedMode) {
          setThemeMode(savedMode);
        } else {
          // Check legacy theme preference
          const legacy = await AsyncStorage.getItem('@theme_preference');
          if (legacy === 'dark') setThemeMode(THEME_MODES.DARK);
          else if (systemScheme === 'dark') setThemeMode(THEME_MODES.DARK);
          else setThemeMode(THEME_MODES.LIGHT);
        }

        if (savedAccent && TYPE_ACCENTS[savedAccent]) {
          setAccentKey(savedAccent);
        }
      } catch (e) {
        console.error('Failed to load theme settings:', e);
      }
    };

    loadThemePreferences();
  }, [systemScheme]);

  // Set specific theme mode ('light', 'dark', 'amoled', 'pokedex-red')
  const changeThemeMode = async (mode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem('@theme_mode_v2', mode);
      await AsyncStorage.setItem('@theme_preference', mode === THEME_MODES.LIGHT ? 'light' : 'dark');
    } catch (e) {
      console.error('Failed to save theme mode:', e);
    }
  };

  // Set type accent color
  const changeAccent = async (accent) => {
    if (TYPE_ACCENTS[accent]) {
      setAccentKey(accent);
      try {
        await AsyncStorage.setItem('@theme_accent_v2', accent);
      } catch (e) {
        console.error('Failed to save theme accent:', e);
      }
    }
  };

  // Toggle between simple light and dark
  const toggleTheme = () => {
    const nextMode = themeMode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    changeThemeMode(nextMode);
  };

  // Dynamic theme object
  const theme = useMemo(() => {
    return createTheme(themeMode, accentKey);
  }, [themeMode, accentKey]);

  const isDarkMode = theme.dark;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        accentKey,
        isDarkMode,
        changeThemeMode,
        changeAccent,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
