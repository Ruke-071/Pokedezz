import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { CollectionProvider } from './src/context/CollectionContext';
import { TeamProvider } from './src/context/TeamContext';
import { SidebarProvider } from './src/context/SidebarContext';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  const { isDarkMode } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <CollectionProvider>
          <TeamProvider>
            <SidebarProvider>
              <AppContent />
            </SidebarProvider>
          </TeamProvider>
        </CollectionProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
