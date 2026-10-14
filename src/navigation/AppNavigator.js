import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { navigationRef } from './navigationRef';
import { Sidebar } from '../components/Sidebar';
import { PikachuFace } from '../components/PikachuFace';

// Import Screens
import { HomeScreen } from '../screens/HomeScreen';
import { PokemonDetailScreen } from '../screens/PokemonDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { TeamBuilderScreen } from '../screens/TeamBuilderScreen';
import { CompareScreen } from '../screens/CompareScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MovesetScreen } from '../screens/MovesetScreen';
import { StatCalculatorScreen } from '../screens/StatCalculatorScreen';
import { BattleCalculatorScreen } from '../screens/BattleCalculatorScreen';
import { PokedexStatsScreen } from '../screens/PokedexStatsScreen';
import { MoveAbilityDatabaseScreen } from '../screens/MoveAbilityDatabaseScreen';
import { LocationDexScreen } from '../screens/LocationDexScreen';
import { TypeDexScreen } from '../screens/TypeDexScreen';
import { ItemDexScreen } from '../screens/ItemDexScreen';
import { NatureDexScreen } from '../screens/NatureDexScreen';

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const { theme, isDarkMode } = useTheme();
  const { openSidebar } = useSidebar();

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
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
              headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {theme.isPikachu ? (
                    <PikachuFace size={24} />
                  ) : (
                    <Image
                      source={require('../../assets/legends-arceus-pokedex.png')}
                      style={{ width: 24, height: 24, borderRadius: 5 }}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.text }}>
                    Pokédex
                  </Text>
                  {theme.isPikachu && (
                    <View style={{ backgroundColor: '#FF3B30', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, marginLeft: 2 }}>
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>⚡ PIKA</Text>
                    </View>
                  )}
                </View>
              ),
              headerLeft: () => (
                <TouchableOpacity
                  style={{ marginLeft: 8, padding: 4 }}
                  onPress={openSidebar}
                  activeOpacity={0.7}
                >
                  <Ionicons name="menu" size={26} color={theme.colors.text} />
                </TouchableOpacity>
              ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', gap: 16, marginRight: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.navigate('Favorites')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="star-outline" size={22} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="ellipsis-vertical" size={22} color={theme.colors.text} />
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
          name="BattleCalculator"
          component={BattleCalculatorScreen}
          options={{ title: 'Battle Calculator' }}
        />
        <RootStack.Screen
          name="StatCalculator"
          component={StatCalculatorScreen}
          options={{ title: 'Stat Calculator' }}
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
        <RootStack.Screen
          name="PokedexStats"
          component={PokedexStatsScreen}
          options={{ title: 'Pokédex Statistics' }}
        />
        <RootStack.Screen
          name="MoveAbilityDatabase"
          component={MoveAbilityDatabaseScreen}
          options={{ title: 'Move & Ability Database' }}
        />
        <RootStack.Screen
          name="LocationDex"
          component={LocationDexScreen}
          options={{ title: 'Location Dex' }}
        />
        <RootStack.Screen
          name="TypeDex"
          component={TypeDexScreen}
          options={{ title: 'Type Dex' }}
        />
        <RootStack.Screen
          name="ItemDex"
          component={ItemDexScreen}
          options={{ title: 'Item Dex' }}
        />
        <RootStack.Screen
          name="NatureDex"
          component={NatureDexScreen}
          options={{ title: 'Nature Dex' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
    <Sidebar />
  </View>
);
}
