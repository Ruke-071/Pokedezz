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
  EEVEE: 'eevee',
  OBSIDIAN: 'obsidian',
};

// Helper to generate full theme object with selected accent
export const createTheme = (mode, accentKey = 'classic') => {
  const accent = TYPE_ACCENTS[accentKey] || TYPE_ACCENTS.classic;
  const isObsidian = mode === THEME_MODES.OBSIDIAN;
  const isAmoled = mode === THEME_MODES.AMOLED;
  const isPokedexRed = mode === THEME_MODES.POKEDEX_RED;
  const isPikachu = mode === THEME_MODES.PIKACHU;
  const isArceus = mode === THEME_MODES.ARCEUS;
  const isEevee = mode === THEME_MODES.EEVEE;
  const isDark = mode === THEME_MODES.DARK || isAmoled || isPokedexRed || isObsidian;

  if (isEevee) {
    return {
      dark: false,
      mode: THEME_MODES.EEVEE,
      accentKey,
      isEevee: true,
      colors: {
        background: '#F5EAD7', // Cozy cream base
        card: '#FFF8EE', // Warm surface card
        cardBackground: '#FFF8EE',
        surface: '#EEDCC8', // Soft light caramel surface
        surfaceSubtle: '#FFFBF5',
        text: '#4A3320', // High-contrast deep dark brown
        textSecondary: '#855E39', // Eevee warm brown secondary
        border: '#D7B899', // Light caramel border
        borderLight: '#E8D2BE',
        primary: '#A67C52', // Iconic Eevee brown
        primaryLight: 'rgba(166, 124, 82, 0.22)',
        accent: '#F7A8C3', // Peach accent
        accentDark: '#E27396',
        accentLeaf: '#A3D6C6', // Leaf green accent
        success: '#68BAA4',
        info: '#7DB5DB',
        shadow: '#543D28',
        skeleton: '#E6D3BF',
        pokedexRed: '#F7A8C3',
        scannerCyan: '#A3D6C6',
        eeveeCream: '#F5EAD7',
        eeveeCaramel: '#D7B899',
        eeveeBrown: '#A67C52',
        eeveeDarkBrown: '#6D4C2F',
        eeveeWarmSurface: '#FFF8EE',
        eeveeLeaf: '#A3D6C6',
        eeveePeach: '#F7A8C3',
      },
    };
  }

  if (isPikachu) {
    return {
      dark: false,
      mode: THEME_MODES.PIKACHU,
      accentKey,
      isPikachu: true,
      colors: {
        background: '#FFF9E6', // Soft warm yellow base
        card: '#FFFFFF', // Crisp clean card surface
        cardBackground: '#FFFFFF',
        surface: '#FFF2C6', // Soft warm yellow surface
        surfaceSubtle: '#FFFBEF',
        text: '#1F1905', // High-contrast warm brown-black text
        textSecondary: '#7A621E', // Golden-brown secondary text
        border: '#F6D565', // Rich Pikachu gold border
        primary: '#E6A800', // Iconic Pikachu electric gold
        primaryLight: 'rgba(255, 215, 0, 0.22)',
        accent: '#FF3B30', // Cheek-pouch rosy red
        accentDark: '#D32F2F',
        success: '#2E7D32',
        info: '#0288D1',
        shadow: '#4A3B00',
        skeleton: '#FFECA8',
        pokedexRed: '#FF3B30',
        scannerCyan: '#FFB800',
        pikachuYellow: '#FFD700',
        pikachuCheek: '#FF3B30',
        pikachuBrown: '#1F1905',
        pikachuSoftBase: '#FFF9E6',
        pikachuCard: '#FFFFFF',
        pikachuBorder: '#F6D565',
      },
    };
  }

  if (isArceus) {
    return {
      dark: false,
      mode: THEME_MODES.ARCEUS,
      accentKey,
      isArceus: true,
      colors: {
        background: '#F8F2E7', // Aged parchment base
        card: '#FFFDF9', // Refined ivory card surface
        cardBackground: '#FFFDF9',
        surface: '#E5D9C2', // Aged paper surface
        surfaceSubtle: '#F2EADB',
        text: '#262626', // Sumi ink black text
        textSecondary: '#5B6B7F', // Slate blue secondary
        border: '#E5D9C2', // Weathered paper border
        borderGold: '#C9A35B', // Divine gold filigree
        primary: '#C9A35B', // Divine gold inspired by Arceus ring & Plates
        primaryLight: 'rgba(201, 163, 91, 0.18)',
        accent: '#5B6B7F', // Slate blue accent
        accentDark: '#292A2D', // Dark shrine charcoal
        accentGold: '#C9A35B', // Divine gold
        accentMist: '#A7C4D9', // Mist blue
        accentGreen: '#7C9A8B', // Mountain green
        accentCrimson: '#B44A4A', // Sunset crimson
        darkShrine: '#292A2D', // Dark shrine
        success: '#7C9A8B', // Mountain green
        info: '#5B6B7F', // Slate blue
        shadow: '#292A2D',
        skeleton: '#E5D9C2',
        pokedexRed: '#B44A4A',
        scannerCyan: '#A7C4D9',
        parchment: '#F8F2E7',
        agedPaper: '#E5D9C2',
        slateBlue: '#5B6B7F',
        divineGold: '#C9A35B',
        inkBlack: '#262626',
        mistBlue: '#A7C4D9',
        mountainGreen: '#7C9A8B',
        sunsetCrimson: '#B44A4A',
      },
    };
  }

  if (isObsidian) {
    return {
      dark: true,
      mode: THEME_MODES.OBSIDIAN,
      accentKey,
      isObsidian: true,
      colors: {
        background: '#0D1117', // Main background: dark graphite
        backgroundSecondary: '#111820', // Secondary background
        card: '#151D27', // Card surface
        cardBackground: '#151D27',
        surface: '#111820', // Secondary surface
        surfaceElevated: '#1C2632', // Elevated surface
        surfaceSubtle: '#1C2632',
        text: '#F2F4F7', // Primary text
        textSecondary: '#9AA6B2', // Secondary text
        border: '#293441', // Borders
        borderLight: '#384656',
        primary: accentKey !== 'classic' ? accent.color : '#E34B52', // Primary accent: Poké Ball ruby red
        primaryLight: 'rgba(227, 75, 82, 0.16)',
        accent: '#D6B477', // Secondary accent: Gold
        accentDark: '#8F7546',
        accentGold: '#D6B477',
        accentRed: '#E34B52',
        success: '#3FB950',
        info: '#58A6FF',
        shadow: '#05070A',
        skeleton: '#1C2632',
        pokedexRed: '#E34B52',
        scannerCyan: '#58A6FF',
        obsidianMain: '#0D1117',
        obsidianSecondary: '#111820',
        obsidianCard: '#151D27',
        obsidianElevated: '#1C2632',
        obsidianRed: '#E34B52',
        obsidianGold: '#D6B477',
        obsidianText: '#F2F4F7',
        obsidianTextMuted: '#9AA6B2',
        obsidianBorder: '#293441',
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
  const [themeMode, setThemeMode] = useState(THEME_MODES.PIKACHU);
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
          else if (legacy === 'light') setThemeMode(THEME_MODES.LIGHT);
          else setThemeMode(THEME_MODES.PIKACHU);
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
