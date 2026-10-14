import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme, THEME_MODES, TYPE_ACCENTS } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { getOfflineCacheStats, clearOfflineCache } from '../services/offlineStorage';
import { PokeBallLoading } from '../components/PokeBallLoading';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const {
    theme,
    themeMode,
    accentKey,
    changeThemeMode,
    changeAccent,
  } = useTheme();

  const {
    favorites,
    precacheAllFavorites,
    isPrecaching,
  } = useFavorites();

  const [cacheStats, setCacheStats] = useState({
    pokemonCount: 0,
    evolutionCount: 0,
    movesCount: 0,
    abilitiesCount: 0,
    totalEntries: 0,
  });
  const [clearing, setClearing] = useState(false);
  const [showDemoLoader, setShowDemoLoader] = useState(false);

  const loadStats = async () => {
    const stats = await getOfflineCacheStats();
    setCacheStats(stats);
  };

  useEffect(() => {
    loadStats();
  }, [isPrecaching]);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Offline Cache',
      'This will remove cached Pokémon details from local storage. Favorited Pokémon IDs and team lists will not be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await clearOfflineCache();
            await loadStats();
            setClearing(false);
            Alert.alert('Cache Cleared', 'Local offline API cache has been successfully reset.');
          },
        },
      ]
    );
  };

  const openPokeApi = () => {
    Linking.openURL('https://pokeapi.co');
  };

  const openExpo = () => {
    Linking.openURL('https://expo.dev');
  };

  const themeOptions = [
    {
      id: THEME_MODES.POKEDEX_RED,
      name: 'Pokédex Red',
      desc: 'Classic scarlet casing & cyan scanner',
      icon: 'radio-outline',
      color: '#DC0A2D',
    },
    {
      id: THEME_MODES.AMOLED,
      name: 'Dark AMOLED',
      desc: 'Pure #000000 pitch-black OLED mode',
      icon: 'contrast-outline',
      color: '#000000',
    },
    {
      id: THEME_MODES.DARK,
      name: 'Dark Mode',
      desc: 'Deep navy charcoal surfaces',
      icon: 'moon-outline',
      color: '#1A1A1E',
    },
    {
      id: THEME_MODES.LIGHT,
      name: 'Light Mode',
      desc: 'Clean paper white aesthetic',
      icon: 'sunny-outline',
      color: '#FFFFFF',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* ── Section 1: Custom Pokédex Themes ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            CUSTOM POKÉDEX THEMES
          </Text>

          {/* Theme Mode Cards Grid */}
          <View style={styles.themeModeGrid}>
            {themeOptions.map(opt => {
              const isSelected = themeMode === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.themeModeCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                    isSelected && { shadowColor: theme.colors.primary, elevation: 4 },
                  ]}
                  onPress={() => changeThemeMode(opt.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.themeCardTop}>
                    <View
                      style={[
                        styles.colorSampleBubble,
                        {
                          backgroundColor: opt.color,
                          borderColor: opt.id === THEME_MODES.LIGHT ? '#CBD5E0' : 'rgba(255,255,255,0.2)',
                        },
                      ]}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={16}
                        color={opt.id === THEME_MODES.LIGHT ? '#2D3748' : '#FFFFFF'}
                      />
                    </View>

                    {isSelected && (
                      <View style={[styles.selectedPill, { backgroundColor: theme.colors.primary }]}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  <Text style={[styles.themeCardTitle, { color: theme.colors.text }]}>
                    {opt.name}
                  </Text>
                  <Text style={[styles.themeCardDesc, { color: theme.colors.textSecondary }]}>
                    {opt.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Section 2: Type-Based Accent Colors ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            TYPE-BASED ACCENT COLORS
          </Text>

          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.accentIntroRow}>
              <Ionicons name="color-palette-outline" size={20} color={theme.colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.accentIntroTitle, { color: theme.colors.text }]}>
                  Elemental Accent: {TYPE_ACCENTS[accentKey]?.name || 'Classic'}
                </Text>
                <Text style={[styles.accentIntroSub, { color: theme.colors.textSecondary }]}>
                  Applies dynamic highlight tones across buttons, badges, and meters
                </Text>
              </View>
            </View>

            {/* Accent Chips Grid */}
            <View style={styles.accentChipsGrid}>
              {Object.entries(TYPE_ACCENTS).map(([key, item]) => {
                const isSelected = accentKey === key;
                return (
                  <TouchableOpacity
                    key={`accent-${key}`}
                    style={[
                      styles.accentChip,
                      {
                        backgroundColor: isSelected ? `${item.color}25` : (theme.dark ? '#252B36' : '#F1F5F9'),
                        borderColor: isSelected ? item.color : theme.colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => changeAccent(key)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.accentColorDot, { backgroundColor: item.color }]} />
                    <Text
                      style={[
                        styles.accentChipText,
                        { color: isSelected ? item.color : theme.colors.text },
                        isSelected && { fontWeight: '800' },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Section 3: Animated Poké Ball Loading Preview ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            ANIMATED POKÉ BALL LOADER
          </Text>

          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, padding: 18, alignItems: 'center' }]}>
            <PokeBallLoading size={54} message="Syncing Pokédex database..." />

            <View style={[styles.loaderMetaRow, { borderTopColor: theme.colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="sparkles" size={16} color="#FFCB05" />
                <Text style={[styles.loaderMetaText, { color: theme.colors.textSecondary }]}>
                  Custom spin & glowing LED physics
                </Text>
              </View>
              <View style={[styles.activeEngineBadge, { backgroundColor: `${theme.colors.primary}18`, borderColor: theme.colors.primary }]}>
                <Text style={[styles.activeEngineBadgeText, { color: theme.colors.primary }]}>ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section 4: Offline-First Engine ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            OFFLINE-FIRST ENGINE
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {/* Status Header */}
            <View style={[styles.cacheHeaderRow, { borderBottomColor: theme.colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="cloud-offline" size={22} color="#4CAF50" />
                <View>
                  <Text style={[styles.cacheHeaderTitle, { color: theme.colors.text }]}>Offline Mode</Text>
                  <Text style={[styles.cacheHeaderSub, { color: theme.colors.textSecondary }]}>
                    All 1,000+ Pokémon indexed locally with instant cached responses
                  </Text>
                </View>
              </View>
              <View style={styles.activeEngineBadge}>
                <Text style={styles.activeEngineBadgeText}>ACTIVE</Text>
              </View>
            </View>

            {/* Cache Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: theme.dark ? '#252D3A' : '#F1F5F9' }]}>
                <Text style={[styles.statBoxNum, { color: theme.colors.primary }]}>{cacheStats.pokemonCount}</Text>
                <Text style={[styles.statBoxLabel, { color: theme.colors.textSecondary }]}>Pokémon Cached</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.dark ? '#252D3A' : '#F1F5F9' }]}>
                <Text style={[styles.statBoxNum, { color: '#00D2D3' }]}>{cacheStats.movesCount}</Text>
                <Text style={[styles.statBoxLabel, { color: theme.colors.textSecondary }]}>Moves Cached</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.dark ? '#252D3A' : '#F1F5F9' }]}>
                <Text style={[styles.statBoxNum, { color: '#FF7A00' }]}>{cacheStats.abilitiesCount}</Text>
                <Text style={[styles.statBoxLabel, { color: theme.colors.textSecondary }]}>Abilities</Text>
              </View>
            </View>

            {/* Pre-cache Favorites Button */}
            <TouchableOpacity
              style={[styles.cacheActionBtn, { borderTopColor: theme.colors.border }]}
              onPress={precacheAllFavorites}
              disabled={isPrecaching || favorites.length === 0}
              activeOpacity={0.7}
            >
              <View style={styles.cacheActionLeft}>
                <Ionicons name="cloud-download-outline" size={18} color={theme.colors.primary} />
                <View>
                  <Text style={[styles.cacheActionTitle, { color: theme.colors.text }]}>Pre-cache All Favorites</Text>
                  <Text style={[styles.cacheActionSub, { color: theme.colors.textSecondary }]}>
                    {favorites.length} favorited Pokémon stored locally
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* Clear Cache Button */}
            <TouchableOpacity
              style={[styles.cacheActionBtn, { borderTopColor: theme.colors.border }]}
              onPress={handleClearCache}
              disabled={clearing}
              activeOpacity={0.7}
            >
              <View style={styles.cacheActionLeft}>
                <Ionicons name="trash-outline" size={18} color="#FF5252" />
                <View>
                  <Text style={[styles.cacheActionTitle, { color: '#FF5252' }]}>Clear Offline Cache</Text>
                  <Text style={[styles.cacheActionSub, { color: theme.colors.textSecondary }]}>
                    Reset locally stored API responses
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section 5: App Information ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>APP IDENTITY & SYSTEM</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={[styles.listItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.listItemLeft}>
                <Ionicons name="phone-portrait-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>App Identity</Text>
              </View>
              <Text style={[styles.listItemRight, { color: theme.colors.textSecondary }]}>Pokédex (Raydex v1.0)</Text>
            </View>

            <View style={[styles.listItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.listItemLeft}>
                <Ionicons name="hardware-chip-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>Expo Framework</Text>
              </View>
              <Text style={[styles.listItemRight, { color: theme.colors.textSecondary }]}>SDK 57.0.0 (Native)</Text>
            </View>

            <TouchableOpacity
              style={[styles.listItem, { borderBottomColor: theme.colors.border }]}
              onPress={openPokeApi}
            >
              <View style={styles.listItemLeft}>
                <Ionicons name="server-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>Data Source</Text>
              </View>
              <View style={styles.listItemRightRow}>
                <Text style={[styles.listItemRightLink, { color: theme.colors.primary }]}>PokeAPI.co</Text>
                <Ionicons name="open-outline" size={14} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.listItem} onPress={openExpo}>
              <View style={styles.listItemLeft}>
                <Ionicons name="code-slash-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>Runtime</Text>
              </View>
              <View style={styles.listItemRightRow}>
                <Text style={[styles.listItemRightLink, { color: theme.colors.primary }]}>React Native 0.86</Text>
                <Ionicons name="open-outline" size={14} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Theme Mode Grid
  themeModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeModeCard: {
    width: '48.5%',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  themeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorSampleBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  themeCardDesc: {
    fontSize: 11,
    lineHeight: 15,
  },

  // Accent Chips
  accentIntroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  accentIntroTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  accentIntroSub: {
    fontSize: 11,
    marginTop: 1,
  },
  accentChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 14,
    paddingTop: 0,
  },
  accentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  accentColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  accentChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Loader Preview
  loaderMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  loaderMetaText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Cache Engine
  cacheHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  cacheHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cacheHeaderSub: {
    fontSize: 11,
    marginTop: 2,
    maxWidth: 220,
  },
  activeEngineBadge: {
    backgroundColor: '#4CAF5020',
    borderColor: '#4CAF50',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeEngineBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4CAF50',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statBoxNum: {
    fontSize: 16,
    fontWeight: '900',
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  cacheActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  cacheActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cacheActionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cacheActionSub: {
    fontSize: 11,
    marginTop: 1,
  },

  // List Items
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listItemRight: {
    fontSize: 13,
    fontWeight: '500',
  },
  listItemRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listItemRightLink: {
    fontSize: 13,
    fontWeight: '600',
  },
});
