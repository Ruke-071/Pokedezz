import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Import Screens
import { HomeScreen } from '../screens/HomeScreen';
import { PokemonDetailScreen } from '../screens/PokemonDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { TeamBuilderScreen } from '../screens/TeamBuilderScreen';
import { CompareScreen } from '../screens/CompareScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MovesetScreen } from '../screens/MovesetScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const FavoritesStack = createNativeStackNavigator();

// Stack Navigator for Home Tab
function HomeStackScreen() {
  const { theme } = useTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen
        name="PokeHome"
        component={HomeScreen}
        options={{ title: 'Pokédex' }}
      />
      <HomeStack.Screen
        name="PokemonDetail"
        component={PokemonDetailScreen}
        options={({ route }) => ({
          title: route.params?.name ? route.params.name.charAt(0).toUpperCase() + route.params.name.slice(1) : 'Details'
        })}
      />
      <HomeStack.Screen
        name="Moveset"
        component={MovesetScreen}
        options={{ title: 'Movesets', presentation: 'modal' }}
      />
    </HomeStack.Navigator>
  );
}

// Stack Navigator for Favorites Tab
function FavoritesStackScreen() {
  const { theme } = useTheme();
  return (
    <FavoritesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
      }}
    >
      <FavoritesStack.Screen
        name="PokeFavorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <FavoritesStack.Screen
        name="PokemonDetail"
        component={PokemonDetailScreen}
        options={({ route }) => ({
          title: route.params?.name ? route.params.name.charAt(0).toUpperCase() + route.params.name.slice(1) : 'Details'
        })}
      />
      <FavoritesStack.Screen
        name="Moveset"
        component={MovesetScreen}
        options={{ title: 'Movesets', presentation: 'modal' }}
      />
    </FavoritesStack.Navigator>
  );
}

export default function AppNavigator() {
  const { theme, isDarkMode } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: isDarkMode,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'logo-game-controller-b'; // Gaming/Pokeball style or fallback
              iconName = 'search';
            } else if (route.name === 'FavoritesTab') {
              iconName = 'heart';
            } else if (route.name === 'TeamBuilder') {
              iconName = 'people';
            } else if (route.name === 'Compare') {
              iconName = 'git-compare';
            } else if (route.name === 'Settings') {
              iconName = 'settings';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStackScreen}
          options={{ tabBarLabel: 'Pokédex' }}
        />
        <Tab.Screen
          name="FavoritesTab"
          component={FavoritesStackScreen}
          options={{ tabBarLabel: 'Favorites' }}
        />
        <Tab.Screen
          name="TeamBuilder"
          component={TeamBuilderScreen}
          options={{
            headerShown: true,
            title: 'Team Builder',
            headerStyle: { backgroundColor: theme.colors.card },
            headerTintColor: theme.colors.text,
            headerTitleStyle: { fontWeight: '800' },
            headerShadowVisible: false,
          }}
        />
        <Tab.Screen
          name="Compare"
          component={CompareScreen}
          options={{
            headerShown: true,
            title: 'Compare Pokémon',
            headerStyle: { backgroundColor: theme.colors.card },
            headerTintColor: theme.colors.text,
            headerTitleStyle: { fontWeight: '800' },
            headerShadowVisible: false,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: 'Settings',
            headerStyle: { backgroundColor: theme.colors.card },
            headerTintColor: theme.colors.text,
            headerTitleStyle: { fontWeight: '800' },
            headerShadowVisible: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
