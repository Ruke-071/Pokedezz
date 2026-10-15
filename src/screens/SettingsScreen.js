import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useTheme, THEME_MODES, TYPE_ACCENTS } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { getOfflineCacheStats, clearOfflineCache } from '../services/offlineStorage';
import { Ionicons } from '@expo/vector-icons';
import {
  PikachuPattern,
  PikachuFace,
  PikachuBadge,
  PikachuFaceWidget,
  PikachuLoader,
  EeveePattern,
  EeveeFace,
  EeveeThemeWidget,
  ArceusBackground,
  ArceusPlate,
  ArceusPlateGallery,
} from '../components';

export const SettingsScreen = ({ navigation }) => {
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
      'This will remove cached Pokémon details from local storage. Your favorites and teams will be preserved.',
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
            Alert.alert('Cache Cleared', 'Offline storage has been reset.');
          },
        },
      ]
    );
  };

  const openPokeApi = async () => {
    const url = 'https://pokeapi.co';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Notice', 'Cannot open browser on this device.');
      }
    } catch (e) {
      console.warn('Failed to open external link safely', e);
    }
  };

  const themeOptions = [
    {
      id: THEME_MODES.OBSIDIAN,
      name: 'Pokédex Obsidian',
      desc: 'Sleek dark graphite design with ruby Poké Ball accents',
      icon: 'contrast-outline',
      color: '#E34B52',
    },
    {
      id: THEME_MODES.EEVEE,
      name: 'Eevee Sticker Sheet',
      desc: 'Cozy cream, fluffy stickers, leaves & hearts',
      icon: 'heart',
      color: '#A67C52',
    },
    {
      id: THEME_MODES.PIKACHU,
      name: 'Pikachu Everywhere',
      desc: 'Faces, patterns, badges & soft yellow theme',
      icon: 'flash',
      color: '#FFD700',
    },
    {
      id: THEME_MODES.ARCEUS,
      name: 'Legends of Hisui',
      desc: 'Ancient parchment, 18 Plates, ink & divine gold',
      icon: 'sunny-outline',
      color: '#C9A35B',
    },
    {
      id: THEME_MODES.POKEDEX_RED,
      name: 'Pokédex Red',
      desc: 'Classic scarlet casing',
      icon: 'radio-outline',
      color: '#DC0A2D',
    },
    {
      id: THEME_MODES.AMOLED,
      name: 'Dark AMOLED',
      desc: 'Pitch-black OLED',
      icon: 'contrast-outline',
      color: '#000000',
    },
    {
      id: THEME_MODES.DARK,
      name: 'Dark Mode',
      desc: 'Deep charcoal navy',
      icon: 'moon-outline',
      color: '#1A1A1E',
    },
    {
      id: THEME_MODES.LIGHT,
      name: 'Light Mode',
      desc: 'Clean paper aesthetic',
      icon: 'sunny-outline',
      color: '#FFFFFF',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {theme.isPikachu && <PikachuPattern subtle={true} opacity={0.16} />}
      {theme.isEevee && <EeveePattern subtle={true} opacity={0.16} />}
      {theme.isArceus && <ArceusBackground subtle={true} opacity={0.16} />}
      {/* ── Section 1: Themes ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          APPEARANCE
        </Text>

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
                ]}
                onPress={() => changeThemeMode(opt.id)}
                activeOpacity={0.75}
              >
                <View style={styles.themeCardTop}>
                  {opt.id === THEME_MODES.EEVEE ? (
                    <View
                      style={[
                        styles.colorSampleBubble,
                        {
                          backgroundColor: '#FFF8EE',
                          borderColor: '#D7B899',
                          overflow: 'hidden',
                        },
                      ]}
                    >
                      <EeveeFace size={22} showCollar={false} />
                    </View>
                  ) : opt.id === THEME_MODES.PIKACHU ? (
                    <View
                      style={[
                        styles.colorSampleBubble,
                        {
                          backgroundColor: '#FFF2C6',
                          borderColor: '#FFD700',
                          overflow: 'hidden',
                        },
                      ]}
                    >
                      <PikachuFace size={22} />
                    </View>
                  ) : opt.id === THEME_MODES.ARCEUS ? (
                    <View
                      style={[
                        styles.colorSampleBubble,
                        {
                          backgroundColor: '#F8F2E7',
                          borderColor: '#C9A35B',
                          overflow: 'hidden',
                        },
                      ]}
                    >
                      <ArceusPlate type="normal" size={20} />
                    </View>
                  ) : opt.id === THEME_MODES.OBSIDIAN ? (
                    <View
                      style={[
                        styles.colorSampleBubble,
                        {
                          backgroundColor: '#151D27',
                          borderColor: '#E34B52',
                          borderWidth: 1.5,
                          overflow: 'hidden',
                        },
                      ]}
                    >
                      <Ionicons
                        name="contrast"
                        size={15}
                        color="#E34B52"
                      />
                    </View>
                  ) : (
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
                        size={15}
                        color={opt.id === THEME_MODES.LIGHT ? '#2D3748' : '#FFFFFF'}
                      />
                    </View>
                  )}

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

        {/* Live Interactive Widgets */}
        {theme.isPikachu && (
          <View style={{ marginTop: 14 }}>
            <PikachuFaceWidget />
          </View>
        )}
        {theme.isEevee && (
          <View style={{ marginTop: 14 }}>
            <EeveeThemeWidget />
          </View>
        )}
        {theme.isArceus && (
          <View style={{ marginTop: 14 }}>
            <ArceusPlateGallery
              onSelectPokemon={(pName) => {
                if (navigation && navigation.navigate) {
                  navigation.navigate('PokemonDetail', { name: pName.toLowerCase() });
                }
              }}
            />
          </View>
        )}
      </View>

      {/* ── Section 2: Accent Color ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          ACCENT COLOR
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.accentChipsGrid}>
            {Object.entries(TYPE_ACCENTS).map(([key, item]) => {
              const isSelected = accentKey === key;
              return (
                <TouchableOpacity
                  key={`accent-${key}`}
                  style={[
                    styles.accentChip,
                    {
                      backgroundColor: isSelected ? `${item.color}22` : (theme.dark ? '#252B36' : '#F1F5F9'),
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

      {/* ── Section 3: Storage & Offline Data ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          STORAGE & OFFLINE DATA
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {/* Status summary */}
          <View style={[styles.storageStatusRow, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.storageStatusLeft}>
              <Ionicons name="cloud-done-outline" size={20} color="#4CAF50" />
              <View>
                <Text style={[styles.storageStatusTitle, { color: theme.colors.text }]}>Offline Database</Text>
                <Text style={[styles.storageStatusSub, { color: theme.colors.textSecondary }]}>
                  {cacheStats.pokemonCount > 0
                    ? `${cacheStats.pokemonCount} Pokémon cached locally`
                    : '1,025 Pokémon indexed & ready'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#4CAF501C', borderColor: '#4CAF50' }]}>
              <Text style={styles.statusBadgeText}>READY</Text>
            </View>
          </View>

          {/* Pre-cache Favorites Button */}
          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: theme.colors.border }]}
            onPress={precacheAllFavorites}
            disabled={isPrecaching || favorites.length === 0}
            activeOpacity={0.7}
          >
            <View style={styles.actionRowLeft}>
              <Ionicons name="download-outline" size={19} color={theme.colors.primary} />
              <View>
                <Text style={[styles.actionRowTitle, { color: theme.colors.text }]}>Download Favorites</Text>
                <Text style={[styles.actionRowSub, { color: theme.colors.textSecondary }]}>
                  {favorites.length > 0 ? `${favorites.length} Pokémon starred` : 'No favorites to download'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Clear Cache Button */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleClearCache}
            disabled={clearing}
            activeOpacity={0.7}
          >
            <View style={styles.actionRowLeft}>
              <Ionicons name="trash-outline" size={19} color="#FF5252" />
              <View>
                <Text style={[styles.actionRowTitle, { color: '#FF5252' }]}>Clear Storage Cache</Text>
                <Text style={[styles.actionRowSub, { color: theme.colors.textSecondary }]}>
                  Free up locally stored images and data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Section 4: About ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          ABOUT
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Version</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>Pikadex v1.0.0</Text>
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
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Themes Grid
  themeModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeModeCard: {
    width: '48.5%',
    borderRadius: 14,
    padding: 12,
  },
  themeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorSampleBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPill: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  themeCardDesc: {
    fontSize: 11,
    lineHeight: 14,
  },

  // Accent Chips
  accentChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  accentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  accentColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accentChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Storage section
  storageStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  storageStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storageStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  storageStatusSub: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4CAF50',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionRowTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionRowSub: {
    fontSize: 11,
    marginTop: 1,
  },

  // About section
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  linkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
