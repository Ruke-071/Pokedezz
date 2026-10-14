import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCollection } from '../context/CollectionContext';
import { pokemonIndex } from '../data/pokemonIndex';
import { TYPE_COLORS } from '../components/FilterModal';
import { matchesPokemonSearch } from '../utils/searchUtils';

const { width } = Dimensions.get('window');

// ─── GENERATION RANGES ────────────────────────────────────────────────────────
const GENERATIONS = [
  { id: 1, name: 'Gen I', region: 'Kanto', start: 1, end: 151, color: '#FF5252' },
  { id: 2, name: 'Gen II', region: 'Johto', start: 152, end: 251, color: '#FFA000' },
  { id: 3, name: 'Gen III', region: 'Hoenn', start: 252, end: 386, color: '#4CAF50' },
  { id: 4, name: 'Gen IV', region: 'Sinnoh', start: 387, end: 493, color: '#00BCD4' },
  { id: 5, name: 'Gen V', region: 'Unova', start: 494, end: 649, color: '#3F51B5' },
  { id: 6, name: 'Gen VI', region: 'Kalos', start: 650, end: 721, color: '#9C27B0' },
  { id: 7, name: 'Gen VII', region: 'Alola', start: 722, end: 809, color: '#E91E63' },
  { id: 8, name: 'Gen VIII', region: 'Galar', start: 810, end: 905, color: '#009688' },
  { id: 9, name: 'Gen IX', region: 'Paldea', start: 906, end: 1025, color: '#795548' },
];

const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'steel', 'dark', 'fairy'
];

export const PokedexStatsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { favorites } = useFavorites();
  const {
    caught,
    discovered,
    shinies,
    isCaught,
    toggleCaught,
    isShiny,
    toggleShiny,
  } = useCollection();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'generations' | 'types' | 'shinies'
  const [quickCatchModal, setQuickCatchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Total Base Pokémon count (standard 1-1025)
  const baseDexList = useMemo(() => {
    return pokemonIndex.filter(p => p.id <= 1025 && (!p.variant || p.variant === 'normal'));
  }, []);

  const totalBaseCount = 1025;
  const caughtCount = caught.length;
  const discoveredCount = discovered.length;
  const favoritedCount = favorites.length;
  const shinyCount = shinies.length;

  const caughtPercent = Math.min(100, Math.round((caughtCount / totalBaseCount) * 100));
  const discoveredPercent = Math.min(100, Math.round((discoveredCount / totalBaseCount) * 100));

  // 2. Generation Completion Stats
  const genStats = useMemo(() => {
    return GENERATIONS.map(gen => {
      const genPokemon = pokemonIndex.filter(p => p.id >= gen.start && p.id <= gen.end && (!p.variant || p.variant === 'normal'));
      const totalInGen = genPokemon.length || (gen.end - gen.start + 1);
      const caughtInGen = genPokemon.filter(p => caught.includes(p.id)).length;
      const percent = totalInGen > 0 ? Math.round((caughtInGen / totalInGen) * 100) : 0;
      return {
        ...gen,
        total: totalInGen,
        caught: caughtInGen,
        percent,
      };
    });
  }, [caught]);

  // 3. Type Completion & Most Collected Stats
  const typeStats = useMemo(() => {
    const counts = {};
    ALL_TYPES.forEach(t => {
      counts[t] = { type: t, total: 0, caught: 0, percent: 0 };
    });

    baseDexList.forEach(p => {
      (p.types || []).forEach(t => {
        const typeKey = (typeof t === 'string' ? t : t.name).toLowerCase();
        if (counts[typeKey]) {
          counts[typeKey].total += 1;
          if (caught.includes(p.id)) {
            counts[typeKey].caught += 1;
          }
        }
      });
    });

    return Object.values(counts).map(item => ({
      ...item,
      percent: item.total > 0 ? Math.round((item.caught / item.total) * 100) : 0,
    })).sort((a, b) => b.caught - a.caught || b.percent - a.percent);
  }, [baseDexList, caught]);

  // Most Collected Types
  const topTypes = useMemo(() => {
    return typeStats.filter(t => t.caught > 0).slice(0, 3);
  }, [typeStats]);

  // 4. Milestone Badges
  const badges = useMemo(() => [
    {
      id: 'starter',
      icon: 'egg-outline',
      title: 'First Step',
      desc: 'Catch your first Pokémon',
      unlocked: caughtCount >= 1,
      tier: 'Bronze',
      progress: Math.min(1, caughtCount / 1),
    },
    {
      id: 'apprentice',
      icon: 'walk-outline',
      title: 'Apprentice Trainer',
      desc: 'Catch 10 Pokémon',
      unlocked: caughtCount >= 10,
      tier: 'Bronze',
      progress: Math.min(1, caughtCount / 10),
    },
    {
      id: 'collector_50',
      icon: 'medal-outline',
      title: 'Field Researcher',
      desc: 'Catch 50 Pokémon',
      unlocked: caughtCount >= 50,
      tier: 'Silver',
      progress: Math.min(1, caughtCount / 50),
    },
    {
      id: 'centurion',
      icon: 'ribbon-outline',
      title: 'Centurion',
      desc: 'Catch 100 Pokémon',
      unlocked: caughtCount >= 100,
      tier: 'Silver',
      progress: Math.min(1, caughtCount / 100),
    },
    {
      id: 'master_300',
      icon: 'trophy-outline',
      title: 'Grand Master',
      desc: 'Catch 300 Pokémon',
      unlocked: caughtCount >= 300,
      tier: 'Gold',
      progress: Math.min(1, caughtCount / 300),
    },
    {
      id: 'living_dex',
      icon: 'sparkles',
      title: 'Pokédex Legend',
      desc: 'Catch 500+ Pokémon',
      unlocked: caughtCount >= 500,
      tier: 'Platinum',
      progress: Math.min(1, caughtCount / 500),
    },
    {
      id: 'shiny_first',
      icon: 'star',
      title: 'Shiny Sparkle',
      desc: 'Catch your first Shiny Pokémon',
      unlocked: shinyCount >= 1,
      tier: 'Gold',
      progress: Math.min(1, shinyCount / 1),
    },
    {
      id: 'shiny_hoard',
      icon: 'diamond-outline',
      title: 'Shiny Hoarder',
      desc: 'Catch 10+ Shiny Pokémon',
      unlocked: shinyCount >= 10,
      tier: 'Platinum',
      progress: Math.min(1, shinyCount / 10),
    },
    {
      id: 'kanto_champ',
      icon: 'flag-outline',
      title: 'Kanto Pioneer',
      desc: 'Catch 80%+ of Gen 1 (120+)',
      unlocked: (genStats[0]?.caught || 0) >= 120,
      tier: 'Gold',
      progress: Math.min(1, (genStats[0]?.caught || 0) / 120),
    },
  ], [caughtCount, shinyCount, genStats]);

  // Shiny Pokémon List
  const shinyPokemonList = useMemo(() => {
    return pokemonIndex.filter(p => shinies.includes(p.id));
  }, [shinies]);

  // Filtered Pokémon for Quick Catch Modal
  const modalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return pokemonIndex.slice(0, 30);
    return pokemonIndex.filter(p => matchesPokemonSearch(p, searchQuery)).slice(0, 50);
  }, [searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ── HERO PROGRESS CARD ── */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={[styles.heroSub, { color: theme.colors.textSecondary }]}>Pokédex Progress</Text>
              <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Trainer Snapshot</Text>
            </View>
            <TouchableOpacity
              style={[styles.quickCatchBtn, { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.8}
              onPress={() => setQuickCatchModal(true)}
            >
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={styles.quickCatchBtnText}>Quick Catch</Text>
            </TouchableOpacity>
          </View>

          {/* Main Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
                National Dex Completion
              </Text>
              <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>
                {caughtPercent}%
              </Text>
            </View>
            <View style={[styles.progressBarTrack, { backgroundColor: theme.dark ? '#333' : '#E0E0E0' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.max(3, caughtPercent)}%`, backgroundColor: theme.colors.primary }
                ]}
              />
            </View>
            <Text style={[styles.progressDetailText, { color: theme.colors.textSecondary }]}>
              {caughtCount} of {totalBaseCount} Pokémon Registered
            </Text>
          </View>

          {/* 4 Stat Metric Cards */}
          <View style={styles.statsMetricsRow}>
            {/* Caught */}
            <View style={[styles.metricCard, { backgroundColor: theme.dark ? '#222' : '#F8F9FA' }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#4CAF501A' }]}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              </View>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{caughtCount}</Text>
              <Text style={[styles.metricTitle, { color: theme.colors.textSecondary }]}>Caught</Text>
            </View>

            {/* Discovered */}
            <View style={[styles.metricCard, { backgroundColor: theme.dark ? '#222' : '#F8F9FA' }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#2196F31A' }]}>
                <Ionicons name="eye" size={18} color="#2196F3" />
              </View>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{discoveredCount}</Text>
              <Text style={[styles.metricTitle, { color: theme.colors.textSecondary }]}>Discovered</Text>
            </View>

            {/* Favorited */}
            <View style={[styles.metricCard, { backgroundColor: theme.dark ? '#222' : '#F8F9FA' }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#FFB3001A' }]}>
                <Ionicons name="star" size={18} color="#FFB300" />
              </View>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{favoritedCount}</Text>
              <Text style={[styles.metricTitle, { color: theme.colors.textSecondary }]}>Favorited</Text>
            </View>

            {/* Shinies */}
            <View style={[styles.metricCard, { backgroundColor: theme.dark ? '#222' : '#F8F9FA' }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#E91E631A' }]}>
                <Ionicons name="sparkles" size={18} color="#E91E63" />
              </View>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{shinyCount}</Text>
              <Text style={[styles.metricTitle, { color: theme.colors.textSecondary }]}>Shinies</Text>
            </View>
          </View>
        </View>

        {/* ── NAVIGATION TABS ── */}
        <View style={styles.tabsContainer}>
          {[
            { id: 'overview', label: 'Milestones & Badges', icon: 'ribbon-outline' },
            { id: 'generations', label: 'By Generation', icon: 'map-outline' },
            { id: 'types', label: 'By Type', icon: 'color-palette-outline' },
            { id: 'shinies', label: `Shinies (${shinyCount})`, icon: 'sparkles-outline' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  isActive && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                  !isActive && {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  }
                ]}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={isActive ? '#fff' : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    { color: isActive ? '#fff' : theme.colors.text }
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── TAB CONTENT ── */}
        {activeTab === 'overview' && (
          <View style={styles.section}>
            {/* Most Collected Types Banner */}
            {topTypes.length > 0 && (
              <View style={[styles.subCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.subCardTitle, { color: theme.colors.text }]}>
                  🏆 Most Collected Types
                </Text>
                <View style={styles.topTypesRow}>
                  {topTypes.map((item, idx) => {
                    const color = TYPE_COLORS[item.type] || '#777';
                    return (
                      <View key={item.type} style={[styles.topTypePill, { backgroundColor: `${color}1A`, borderColor: color }]}>
                        <Text style={[styles.topTypeRank, { color }]}>#{idx + 1}</Text>
                        <Text style={[styles.topTypeName, { color }]}>{item.type.toUpperCase()}</Text>
                        <Text style={[styles.topTypeCount, { color: theme.colors.text }]}>
                          {item.caught} caught ({item.percent}%)
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Badges & Milestones Grid */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Trainer Milestones</Text>
            <View style={styles.badgesGrid}>
              {badges.map(badge => (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    badge.unlocked && { borderColor: '#4CAF5080' }
                  ]}
                >
                  <View style={[
                    styles.badgeIconBubble,
                    { backgroundColor: badge.unlocked ? '#4CAF5020' : theme.dark ? '#333' : '#F0F0F0' }
                  ]}>
                    <Ionicons
                      name={badge.icon}
                      size={24}
                      color={badge.unlocked ? '#4CAF50' : theme.colors.textSecondary}
                    />
                  </View>
                  <Text style={[styles.badgeTitle, { color: theme.colors.text }]}>{badge.title}</Text>
                  <Text style={[styles.badgeDesc, { color: theme.colors.textSecondary }]}>{badge.desc}</Text>
                  
                  {/* Status Indicator */}
                  <View style={styles.badgeFooter}>
                    {badge.unlocked ? (
                      <View style={styles.unlockedTag}>
                        <Ionicons name="checkmark-circle" size={13} color="#4CAF50" />
                        <Text style={styles.unlockedText}>Unlocked</Text>
                      </View>
                    ) : (
                      <View style={styles.progressMiniTrack}>
                        <View style={[styles.progressMiniFill, { width: `${Math.round(badge.progress * 100)}%`, backgroundColor: theme.colors.primary }]} />
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── GENERATIONS TAB ── */}
        {activeTab === 'generations' && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              Regional Pokédex Completion
            </Text>
            {genStats.map(gen => (
              <View
                key={gen.id}
                style={[styles.regionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <View style={styles.regionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.regionPill, { backgroundColor: `${gen.color}20`, borderColor: gen.color }]}>
                      <Text style={[styles.regionPillText, { color: gen.color }]}>{gen.name}</Text>
                    </View>
                    <Text style={[styles.regionName, { color: theme.colors.text }]}>{gen.region}</Text>
                  </View>
                  <Text style={[styles.regionPercent, { color: gen.color }]}>{gen.percent}%</Text>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressBarTrack, { backgroundColor: theme.dark ? '#333' : '#E0E0E0', marginTop: 10 }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.max(2, gen.percent)}%`, backgroundColor: gen.color }
                    ]}
                  />
                </View>
                <Text style={[styles.regionDetail, { color: theme.colors.textSecondary }]}>
                  {gen.caught} of {gen.total} caught
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── TYPES TAB ── */}
        {activeTab === 'types' && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              Type Affinity & Coverage
            </Text>
            {typeStats.map(item => {
              const tc = TYPE_COLORS[item.type] || '#777';
              return (
                <View
                  key={item.type}
                  style={[styles.typeStatCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                >
                  <View style={styles.typeStatHeader}>
                    <View style={[styles.typeTag, { backgroundColor: tc }]}>
                      <Text style={styles.typeTagText}>{item.type.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.typeStatNumbers, { color: theme.colors.text }]}>
                      {item.caught} / {item.total} ({item.percent}%)
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: theme.dark ? '#333' : '#E0E0E0', marginTop: 8 }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.max(2, item.percent)}%`, backgroundColor: tc }
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── SHINIES TAB ── */}
        {activeTab === 'shinies' && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              Shiny Trophy Showcase ({shinyCount})
            </Text>
            {shinyPokemonList.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Ionicons name="sparkles-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Shinies Registered Yet</Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Mark shiny Pokémon in Quick Catch or on any Pokémon detail screen to build your trophy case!
                </Text>
                <TouchableOpacity
                  style={[styles.quickCatchBtn, { backgroundColor: theme.colors.primary, marginTop: 14 }]}
                  onPress={() => setQuickCatchModal(true)}
                >
                  <Ionicons name="sparkles" size={14} color="#fff" />
                  <Text style={styles.quickCatchBtnText}>Log Shiny Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.shinyGrid}>
                {shinyPokemonList.map(item => {
                  const shinySprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${item.id}.png`;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.shinyCard, { backgroundColor: theme.colors.card, borderColor: '#FFB30080' }]}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('PokemonDetail', { id: item.id, name: item.name })}
                    >
                      <View style={styles.shinySparkleIcon}>
                        <Ionicons name="sparkles" size={14} color="#FFD700" />
                      </View>
                      <Image source={{ uri: shinySprite }} style={styles.shinyImage} resizeMode="contain" />
                      <Text numberOfLines={1} style={[styles.shinyName, { color: theme.colors.text }]}>
                        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                      </Text>
                      <Text style={[styles.shinyId, { color: theme.colors.textSecondary }]}>
                        #{String(item.id).padStart(3, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── QUICK CATCH / LOGGER MODAL ── */}
      <Modal visible={quickCatchModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Quick Catch Logger</Text>
                <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                  Tap Pokéball to mark caught, or Stars for Shiny!
                </Text>
              </View>
              <TouchableOpacity onPress={() => setQuickCatchModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={26} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.modalSearchBox, { backgroundColor: theme.dark ? '#222' : '#F0F0F0' }]}>
              <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
              <TextInput
                placeholder="Search Pokémon to log..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.modalSearchInput, { color: theme.colors.text }]}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            <FlatList
              data={modalSearchResults}
              keyExtractor={item => `${item.id}-${item.name}`}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const caughtState = isCaught(item.id);
                const shinyState = isShiny(item.id);
                const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;

                return (
                  <View style={[styles.loggerRow, { borderBottomColor: theme.colors.border }]}>
                    <Image source={{ uri: sprite }} style={styles.loggerAvatar} resizeMode="contain" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.loggerName, { color: theme.colors.text }]}>
                        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                      </Text>
                      <Text style={[styles.loggerDex, { color: theme.colors.textSecondary }]}>
                        #{String(item.id).padStart(3, '0')}
                      </Text>
                    </View>

                    {/* Action buttons */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {/* Shiny Button */}
                      <TouchableOpacity
                        style={[
                          styles.loggerActionBtn,
                          shinyState
                            ? { backgroundColor: '#FFD700', borderColor: '#FFB300' }
                            : { backgroundColor: theme.dark ? '#333' : '#EAEAEA', borderColor: 'transparent' }
                        ]}
                        onPress={() => toggleShiny(item.id)}
                      >
                        <Ionicons
                          name="sparkles"
                          size={16}
                          color={shinyState ? '#000' : theme.colors.textSecondary}
                        />
                      </TouchableOpacity>

                      {/* Caught Button */}
                      <TouchableOpacity
                        style={[
                          styles.loggerActionBtn,
                          caughtState
                            ? { backgroundColor: '#4CAF50', borderColor: '#388E3C' }
                            : { backgroundColor: theme.dark ? '#333' : '#EAEAEA', borderColor: 'transparent' }
                        ]}
                        onPress={() => toggleCaught(item.id)}
                      >
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={caughtState ? '#fff' : theme.colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    margin: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  quickCatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickCatchBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 18,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '900',
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressDetailText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
  statsMetricsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  subCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  topTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topTypePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topTypeRank: {
    fontWeight: '900',
    fontSize: 11,
  },
  topTypeName: {
    fontWeight: '800',
    fontSize: 11,
  },
  topTypeCount: {
    fontWeight: '600',
    fontSize: 11,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: (width - 42) / 2,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  badgeIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 10,
  },
  badgeFooter: {
    marginTop: 'auto',
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '800',
  },
  progressMiniTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressMiniFill: {
    height: '100%',
    borderRadius: 2,
  },
  regionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regionPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  regionPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  regionName: {
    fontSize: 15,
    fontWeight: '800',
  },
  regionPercent: {
    fontSize: 15,
    fontWeight: '900',
  },
  regionDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
  },
  typeStatCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  typeStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeTagText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  typeStatNumbers: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  shinyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shinyCard: {
    width: (width - 42) / 3,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
  },
  shinySparkleIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  shinyImage: {
    width: 65,
    height: 65,
    marginBottom: 4,
  },
  shinyName: {
    fontSize: 11,
    fontWeight: '700',
  },
  shinyId: {
    fontSize: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  loggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  loggerAvatar: {
    width: 44,
    height: 44,
  },
  loggerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  loggerDex: {
    fontSize: 11,
  },
  loggerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
