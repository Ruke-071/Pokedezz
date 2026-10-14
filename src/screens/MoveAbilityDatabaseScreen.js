import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { TYPE_COLORS } from '../components/FilterModal';
import {
  MOVES_DATABASE,
  ABILITIES_DATABASE,
  getLearnersForMove,
  getPokemonForAbility,
} from '../data/movesAndAbilitiesData';

const { width } = Dimensions.get('window');

const ALL_TYPES = [
  'all', 'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'steel', 'dark', 'fairy'
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'physical', label: 'Physical ⚔️' },
  { id: 'special', label: 'Special 🔮' },
  { id: 'status', label: 'Status 🛡️' },
];

const POWER_FILTERS = [
  { id: 'all', label: 'All Powers' },
  { id: '100+', label: '100+ DMG' },
  { id: '75-99', label: '75–99' },
  { id: '50-74', label: '50–74' },
  { id: 'status', label: 'Status Only' },
];

export const MoveAbilityDatabaseScreen = ({ navigation }) => {
  const { theme } = useTheme();

  // Mode: 'moves' | 'abilities'
  const [activeDatabase, setActiveDatabase] = useState('moves');

  // Move filters
  const [moveQuery, setMoveQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPowerFilter, setSelectedPowerFilter] = useState('all');
  const [sortBy, setSortBy] = useState('power'); // 'power' | 'accuracy' | 'pp' | 'name'

  // Ability filters
  const [abilityQuery, setAbilityQuery] = useState('');
  const [abilityCategory, setAbilityCategory] = useState('all');

  // Selected Detail Modal
  const [selectedMoveModal, setSelectedMoveModal] = useState(null);
  const [selectedAbilityModal, setSelectedAbilityModal] = useState(null);

  // ─── FILTERED MOVES ─────────────────────────────────────────────────────────
  const filteredMoves = useMemo(() => {
    let list = MOVES_DATABASE;

    // Search query
    if (moveQuery.trim()) {
      const q = moveQuery.toLowerCase().trim();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      list = list.filter(m => m.type.toLowerCase() === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(m => m.category.toLowerCase() === selectedCategory);
    }

    // Power filter
    if (selectedPowerFilter !== 'all') {
      if (selectedPowerFilter === '100+') {
        list = list.filter(m => m.power && m.power >= 100);
      } else if (selectedPowerFilter === '75-99') {
        list = list.filter(m => m.power && m.power >= 75 && m.power <= 99);
      } else if (selectedPowerFilter === '50-74') {
        list = list.filter(m => m.power && m.power >= 50 && m.power <= 74);
      } else if (selectedPowerFilter === 'status') {
        list = list.filter(m => m.category === 'status');
      }
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'power') {
        return (b.power || 0) - (a.power || 0);
      }
      if (sortBy === 'accuracy') {
        return (b.accuracy || 0) - (a.accuracy || 0);
      }
      if (sortBy === 'pp') {
        return (b.pp || 0) - (a.pp || 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [moveQuery, selectedType, selectedCategory, selectedPowerFilter, sortBy]);

  // ─── FILTERED ABILITIES ─────────────────────────────────────────────────────
  const filteredAbilities = useMemo(() => {
    let list = ABILITIES_DATABASE;

    if (abilityQuery.trim()) {
      const q = abilityQuery.toLowerCase().trim();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.battleEffect && a.battleEffect.toLowerCase().includes(q))
      );
    }

    if (abilityCategory !== 'all') {
      list = list.filter(a => a.category.toLowerCase() === abilityCategory.toLowerCase());
    }

    return list;
  }, [abilityQuery, abilityCategory]);

  // Learners for active move modal
  const activeLearners = useMemo(() => {
    if (!selectedMoveModal) return [];
    return getLearnersForMove(selectedMoveModal);
  }, [selectedMoveModal]);

  // Pokémon with active ability modal
  const activeAbilityPokemon = useMemo(() => {
    if (!selectedAbilityModal) return [];
    return getPokemonForAbility(selectedAbilityModal);
  }, [selectedAbilityModal]);

  const navigateToPokemon = (pokemon) => {
    setSelectedMoveModal(null);
    setSelectedAbilityModal(null);
    navigation.navigate('PokemonDetail', { id: pokemon.id, name: pokemon.name });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      {/* ── TOP SEGMENTED SWITCH: MOVES VS ABILITIES ── */}
      <View style={[styles.topSegmentWrapper, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.segmentContainer, { backgroundColor: theme.dark ? '#222' : '#EAEAEA' }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeDatabase === 'moves' && { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => setActiveDatabase('moves')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="flash"
              size={15}
              color={activeDatabase === 'moves' ? '#fff' : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentBtnText,
                { color: activeDatabase === 'moves' ? '#fff' : theme.colors.text }
              ]}
            >
              Moves Database ({filteredMoves.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeDatabase === 'abilities' && { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => setActiveDatabase('abilities')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="sparkles"
              size={15}
              color={activeDatabase === 'abilities' ? '#fff' : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentBtnText,
                { color: activeDatabase === 'abilities' ? '#fff' : theme.colors.text }
              ]}
            >
              Abilities ({filteredAbilities.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ──────────────────────────────────────────────────────────────────────────
          MOVES TAB VIEW
      ────────────────────────────────────────────────────────────────────────── */}
      {activeDatabase === 'moves' ? (
        <View style={{ flex: 1 }}>
          {/* Search & Filter Header */}
          <View style={[styles.searchSection, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
            {/* Search Input */}
            <View style={[styles.searchBar, { backgroundColor: theme.dark ? '#222' : '#F0F0F0' }]}>
              <Ionicons name="search" size={17} color={theme.colors.textSecondary} />
              <TextInput
                placeholder="Search moves by name, type, or effect..."
                placeholderTextColor={theme.colors.textSecondary}
                value={moveQuery}
                onChangeText={setMoveQuery}
                style={[styles.searchInput, { color: theme.colors.text }]}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {moveQuery.length > 0 && (
                <TouchableOpacity onPress={() => setMoveQuery('')}>
                  <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Horizontal Type Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalChips}
            >
              {ALL_TYPES.map(t => {
                const isSelected = selectedType === t;
                const typeColor = t === 'all' ? theme.colors.primary : (TYPE_COLORS[t] || '#777');
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.chip,
                      isSelected
                        ? { backgroundColor: typeColor, borderColor: typeColor }
                        : { backgroundColor: theme.dark ? '#222' : '#F4F4F4', borderColor: theme.colors.border }
                    ]}
                    onPress={() => setSelectedType(t)}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                      {t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Category and Power Filter Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.horizontalChips, { marginTop: 8 }]}
            >
              {CATEGORIES.map(c => {
                const isSelected = selectedCategory === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.chipSmall,
                      isSelected
                        ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                        : { backgroundColor: theme.dark ? '#222' : '#F4F4F4', borderColor: theme.colors.border }
                    ]}
                    onPress={() => setSelectedCategory(c.id)}
                  >
                    <Text style={[styles.chipSmallText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {POWER_FILTERS.map(p => {
                const isSelected = selectedPowerFilter === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.chipSmall,
                      isSelected
                        ? { backgroundColor: '#FF7A00', borderColor: '#FF7A00' }
                        : { backgroundColor: theme.dark ? '#222' : '#F4F4F4', borderColor: theme.colors.border }
                    ]}
                    onPress={() => setSelectedPowerFilter(p.id)}
                  >
                    <Text style={[styles.chipSmallText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Moves List */}
          <FlatList
            data={filteredMoves}
            keyExtractor={item => `${item.numId || item.id}-${item.name}`}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={7}
            removeClippedSubviews={true}
            contentContainerStyle={{ padding: 14, paddingBottom: 60 }}
            renderItem={({ item }) => {
              const tc = TYPE_COLORS[item.type] || '#777';
              return (
                <TouchableOpacity
                  style={[styles.moveCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  activeOpacity={0.75}
                  onPress={() => setSelectedMoveModal(item)}
                >
                  <View style={styles.moveCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.moveName, { color: theme.colors.text }]}>{item.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <View style={[styles.typeBadge, { backgroundColor: tc }]}>
                          <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.categoryBadge, { backgroundColor: theme.dark ? '#333' : '#EAEAEA' }]}>
                          <Text style={[styles.categoryBadgeText, { color: theme.colors.textSecondary }]}>
                            {item.category.toUpperCase()}
                          </Text>
                        </View>
                        {item.priority > 0 && (
                          <View style={styles.priorityBadge}>
                            <Text style={styles.priorityBadgeText}>+{item.priority} Priority</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Stats Triad */}
                    <View style={styles.statsTriad}>
                      <View style={styles.statMiniCol}>
                        <Text style={[styles.statMiniValue, { color: theme.colors.text }]}>
                          {item.power !== null ? item.power : '—'}
                        </Text>
                        <Text style={[styles.statMiniLabel, { color: theme.colors.textSecondary }]}>PWR</Text>
                      </View>
                      <View style={styles.statMiniCol}>
                        <Text style={[styles.statMiniValue, { color: theme.colors.text }]}>
                          {item.accuracy !== null ? `${item.accuracy}%` : '—'}
                        </Text>
                        <Text style={[styles.statMiniLabel, { color: theme.colors.textSecondary }]}>ACC</Text>
                      </View>
                      <View style={styles.statMiniCol}>
                        <Text style={[styles.statMiniValue, { color: theme.colors.text }]}>
                          {item.pp || 15}
                        </Text>
                        <Text style={[styles.statMiniLabel, { color: theme.colors.textSecondary }]}>PP</Text>
                      </View>
                    </View>
                  </View>

                  <Text numberOfLines={2} style={[styles.moveDesc, { color: theme.colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Moves Found</Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                  Try adjusting your search terms or type filters.
                </Text>
              </View>
            )}
          />
        </View>
      ) : (
        /* ──────────────────────────────────────────────────────────────────────────
            ABILITIES TAB VIEW
        ────────────────────────────────────────────────────────────────────────── */
        <View style={{ flex: 1 }}>
          {/* Search Header */}
          <View style={[styles.searchSection, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
            <View style={[styles.searchBar, { backgroundColor: theme.dark ? '#222' : '#F0F0F0' }]}>
              <Ionicons name="search" size={17} color={theme.colors.textSecondary} />
              <TextInput
                placeholder="Search abilities by name or effect..."
                placeholderTextColor={theme.colors.textSecondary}
                value={abilityQuery}
                onChangeText={setAbilityQuery}
                style={[styles.searchInput, { color: theme.colors.text }]}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {abilityQuery.length > 0 && (
                <TouchableOpacity onPress={() => setAbilityQuery('')}>
                  <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
              {['all', 'Offensive', 'Defensive', 'Weather', 'Utility'].map(cat => {
                const isSelected = abilityCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chipSmall,
                      isSelected
                        ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                        : { backgroundColor: theme.dark ? '#222' : '#F4F4F4', borderColor: theme.colors.border }
                    ]}
                    onPress={() => setAbilityCategory(cat)}
                  >
                    <Text style={[styles.chipSmallText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                      {cat === 'all' ? 'All Abilities' : cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Abilities List */}
          <FlatList
            data={filteredAbilities}
            keyExtractor={item => `${item.numId || item.id}-${item.name}`}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={7}
            removeClippedSubviews={true}
            contentContainerStyle={{ padding: 14, paddingBottom: 60 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.abilityCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                activeOpacity={0.75}
                onPress={() => setSelectedAbilityModal(item)}
              >
                <View style={styles.abilityHeader}>
                  <Text style={[styles.abilityName, { color: theme.colors.text }]}>{item.name}</Text>
                  <View style={[styles.abilityCategoryPill, { backgroundColor: `${theme.colors.primary}20` }]}>
                    <Text style={[styles.abilityCategoryText, { color: theme.colors.primary }]}>{item.category}</Text>
                  </View>
                </View>

                <Text style={[styles.abilityDesc, { color: theme.colors.textSecondary }]}>
                  {item.description}
                </Text>

                <View style={styles.abilityFooterRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="people-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.abilityLearnerCount, { color: theme.colors.textSecondary }]}>
                      {item.pokemonIds?.length ? `${item.pokemonIds.length} Pokémon` : 'Official Ability'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Abilities Found</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MOVE DETAILS & LEARNERS MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal visible={!!selectedMoveModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {selectedMoveModal && (
              <>
                {/* Modal Header */}
                <View style={styles.modalSheetHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalSheetTitle, { color: theme.colors.text }]}>
                      {selectedMoveModal.name}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[selectedMoveModal.type] || '#777' }]}>
                        <Text style={styles.typeBadgeText}>{selectedMoveModal.type.toUpperCase()}</Text>
                      </View>
                      <View style={[styles.categoryBadge, { backgroundColor: theme.dark ? '#333' : '#EAEAEA' }]}>
                        <Text style={[styles.categoryBadgeText, { color: theme.colors.textSecondary }]}>
                          {selectedMoveModal.category.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedMoveModal(null)}>
                    <Ionicons name="close-circle" size={26} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: '80%' }} showsVerticalScrollIndicator={false}>
                  {/* Stats Grid */}
                  <View style={[styles.modalStatsGrid, { backgroundColor: theme.dark ? '#222' : '#F8F9FA' }]}>
                    <View style={styles.modalStatItem}>
                      <Text style={[styles.modalStatVal, { color: theme.colors.text }]}>
                        {selectedMoveModal.power !== null ? selectedMoveModal.power : '—'}
                      </Text>
                      <Text style={[styles.modalStatLbl, { color: theme.colors.textSecondary }]}>POWER</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Text style={[styles.modalStatVal, { color: theme.colors.text }]}>
                        {selectedMoveModal.accuracy !== null ? `${selectedMoveModal.accuracy}%` : '—'}
                      </Text>
                      <Text style={[styles.modalStatLbl, { color: theme.colors.textSecondary }]}>ACCURACY</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Text style={[styles.modalStatVal, { color: theme.colors.text }]}>
                        {selectedMoveModal.pp || 15}
                      </Text>
                      <Text style={[styles.modalStatLbl, { color: theme.colors.textSecondary }]}>PP</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Text style={[styles.modalStatVal, { color: theme.colors.text }]}>
                        {selectedMoveModal.priority > 0 ? `+${selectedMoveModal.priority}` : '0'}
                      </Text>
                      <Text style={[styles.modalStatLbl, { color: theme.colors.textSecondary }]}>PRIORITY</Text>
                    </View>
                  </View>

                  {/* Battle Effect */}
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionHeading, { color: theme.colors.text }]}>
                      Battle Effect & Mechanics
                    </Text>
                    <Text style={[styles.modalEffectBody, { color: theme.colors.text }]}>
                      {selectedMoveModal.longEffect || selectedMoveModal.description}
                    </Text>
                  </View>

                  {/* Pokémon Learners List */}
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionHeading, { color: theme.colors.text }]}>
                      Notable Pokémon That Learn This Move ({activeLearners.length})
                    </Text>
                    <View style={styles.learnersGrid}>
                      {activeLearners.map(p => {
                        const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                        return (
                          <TouchableOpacity
                            key={p.id}
                            style={[styles.learnerChip, { backgroundColor: theme.dark ? '#2A2A2A' : '#F0F0F0' }]}
                            onPress={() => navigateToPokemon(p)}
                            activeOpacity={0.7}
                          >
                            <Image source={{ uri: sprite }} style={styles.learnerAvatar} resizeMode="contain" />
                            <Text numberOfLines={1} style={[styles.learnerName, { color: theme.colors.text }]}>
                              {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
          ABILITY DETAILS & POKEMON MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal visible={!!selectedAbilityModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {selectedAbilityModal && (
              <>
                <View style={styles.modalSheetHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalSheetTitle, { color: theme.colors.text }]}>
                      {selectedAbilityModal.name}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      <View style={[styles.abilityCategoryPill, { backgroundColor: `${theme.colors.primary}20` }]}>
                        <Text style={[styles.abilityCategoryText, { color: theme.colors.primary }]}>
                          {selectedAbilityModal.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedAbilityModal(null)}>
                    <Ionicons name="close-circle" size={26} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: '80%' }} showsVerticalScrollIndicator={false}>
                  {/* Effect */}
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionHeading, { color: theme.colors.text }]}>
                      In-Depth Battle Mechanics
                    </Text>
                    <Text style={[styles.modalEffectBody, { color: theme.colors.text }]}>
                      {selectedAbilityModal.battleEffect || selectedAbilityModal.description}
                    </Text>
                  </View>

                  {/* Pokémon with Ability */}
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionHeading, { color: theme.colors.text }]}>
                      Pokémon Possessing This Ability ({activeAbilityPokemon.length})
                    </Text>
                    <View style={styles.learnersGrid}>
                      {activeAbilityPokemon.map(p => {
                        const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                        return (
                          <TouchableOpacity
                            key={p.id}
                            style={[styles.learnerChip, { backgroundColor: theme.dark ? '#2A2A2A' : '#F0F0F0' }]}
                            onPress={() => navigateToPokemon(p)}
                            activeOpacity={0.7}
                          >
                            <Image source={{ uri: sprite }} style={styles.learnerAvatar} resizeMode="contain" />
                            <Text numberOfLines={1} style={[styles.learnerName, { color: theme.colors.text }]}>
                              {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
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
  topSegmentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 11,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
  },
  horizontalChips: {
    paddingTop: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipSmallText: {
    fontSize: 11,
    fontWeight: '700',
  },
  moveCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  moveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  moveName: {
    fontSize: 16,
    fontWeight: '800',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priorityBadge: {
    backgroundColor: '#FF980020',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityBadgeText: {
    color: '#FF9800',
    fontSize: 10,
    fontWeight: '800',
  },
  statsTriad: {
    flexDirection: 'row',
    gap: 12,
  },
  statMiniCol: {
    alignItems: 'center',
  },
  statMiniValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  statMiniLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  moveDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 8,
  },
  abilityCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  abilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  abilityName: {
    fontSize: 16,
    fontWeight: '800',
  },
  abilityCategoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  abilityCategoryText: {
    fontSize: 11,
    fontWeight: '800',
  },
  abilityDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  abilityFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150,150,150,0.15)',
  },
  abilityLearnerCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalSheetTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  modalStatsGrid: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalStatLbl: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalEffectBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  learnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  learnerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  learnerAvatar: {
    width: 32,
    height: 32,
  },
  learnerName: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
});
