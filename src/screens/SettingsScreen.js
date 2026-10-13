import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { getOfflineCacheStats, clearOfflineCache } from '../services/offlineStorage';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const {
    favorites,
    precacheAllFavorites,
    isPrecaching,
    precacheProgress,
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Theme Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="moon" size={20} color={theme.colors.primary} style={styles.settingIcon} />
                <View>
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>Switch between light and dark themes</Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* ── Offline Mode & Storage Management Section ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>OFFLINE-FIRST ENGINE</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
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
              {isPrecaching ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}>
                    {precacheProgress.current}/{precacheProgress.total}
                  </Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              )}
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
                  <Text style={[styles.cacheActionTitle, { color: '#FF5252' }]}>Clear Cached API Data</Text>
                  <Text style={[styles.cacheActionSub, { color: theme.colors.textSecondary }]}>
                    Free up local storage space
                  </Text>
                </View>
              </View>
              {clearing ? (
                <ActivityIndicator size="small" color="#FF5252" />
              ) : (
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Champions Information Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>POKÉMON CHAMPIONS</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.infoBlock}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>What is Pokémon Champions?</Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Pokémon Champions is an action-packed custom battle-arena game mode. 
                This Pokédex app automatically tags and filters Pokémon that are currently playable in Champions (🏆) 
                and highlights any recently added combatants (✨).
              </Text>
            </View>
          </View>
        </View>

        {/* About App Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>ABOUT APPLICATION</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            
            {/* Version */}
            <View style={[styles.listItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.listItemLeft}>
                <Ionicons name="information-circle" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>Version</Text>
              </View>
              <Text style={[styles.listItemRight, { color: theme.colors.textSecondary }]}>1.0.0 (Production)</Text>
            </View>

            {/* PokeAPI */}
            <TouchableOpacity onPress={openPokeApi} style={[styles.listItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.listItemLeft}>
                <Ionicons name="globe" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>Data Source</Text>
              </View>
              <View style={styles.listItemRightRow}>
                <Text style={[styles.listItemRightLink, { color: theme.colors.info }]}>PokeAPI.co</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Framework */}
            <TouchableOpacity onPress={openExpo} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Ionicons name="phone-portrait" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>Built With</Text>
              </View>
              <View style={styles.listItemRightRow}>
                <Text style={[styles.listItemRightLink, { color: theme.colors.info }]}>React Native + Expo SDK 57</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
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
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  cacheHeaderRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  infoBlock: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
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
