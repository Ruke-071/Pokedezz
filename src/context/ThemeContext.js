import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const LightTheme = {
  dark: false,
  colors: {
    background: '#F6F8FC',
    card: '#FFFFFF',
    text: '#2D3748',
    textSecondary: '#718096',
    border: '#E2E8F0',
    primary: '#EF5350', // Poke Red
    primaryLight: '#FFEBEE',
    accent: '#FFCB05', // Poke Yellow
    accentDark: '#3B4CCA', // Poke Blue
    success: '#4CAF50',
    info: '#2196F3',
    cardBackground: '#FFFFFF',
    shadow: '#171717',
    skeleton: '#E2E8F0',
  }
};

export const DarkTheme = {
  dark: true,
  colors: {
    background: '#121214',
    card: '#1A1A1E',
    text: '#F7FAFC',
    textSecondary: '#A0AEC0',
    border: '#2D3748',
    primary: '#FF5252',
    primaryLight: '#2C1D1D',
    accent: '#FFCB05',
    accentDark: '#4D62E8',
    success: '#81C784',
    info: '#64B5F6',
    cardBackground: '#1A1A1E',
    shadow: '#000000',
    skeleton: '#2D3748',
  }
};

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');

  useEffect(() => {
    // Load persisted theme choice
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_preference');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          setIsDarkMode(systemScheme === 'dark');
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, [systemScheme]);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('@theme_preference', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const theme = isDarkMode ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
