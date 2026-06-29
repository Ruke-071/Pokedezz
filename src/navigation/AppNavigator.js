import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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

const RootStack = createNativeStackNavigator();

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
      <RootStack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.card },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
        }}
      >
        <RootStack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Pokédex',
            headerLeft: () => (
              <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => {}}>
                <Ionicons name="menu" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', gap: 18, marginRight: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
                  <Ionicons name="star-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('TeamBuilder')}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <RootStack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ title: 'Favorites' }}
        />
        <RootStack.Screen
          name="Compare"
          component={CompareScreen}
          options={{ title: 'Compare Pokémon' }}
        />
        <RootStack.Screen
          name="TeamBuilder"
          component={TeamBuilderScreen}
          options={{ title: 'Team Builder' }}
        />
        <RootStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <RootStack.Screen
          name="PokemonDetail"
          component={PokemonDetailScreen}
          options={({ route }) => ({
            title: route.params?.name ? route.params.name.charAt(0).toUpperCase() + route.params.name.slice(1) : 'Details'
          })}
        />
        <RootStack.Screen
          name="Moveset"
          component={MovesetScreen}
          options={{ title: 'Movesets', presentation: 'modal' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
