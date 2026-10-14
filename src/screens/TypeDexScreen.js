import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { pokemonIndex } from '../data/pokemonIndex';
import { TYPE_COLORS, ALL_POKEMON_TYPES, TYPE_EFFECTIVENESS } from '../utils/teamUtils';

const { width } = Dimensions.get('window');

// Inherent battle traits for each Pokémon type
const TYPE_TRAITS = {
  normal: 'Ghost moves have no effect. No inherent resistances, but only weak to Fighting.',
  fire: 'Cannot be Burned. Fire-type moves boosted by 50% in harsh sunlight. Melts freeze instantly when using certain Fire attacks.',
  water: 'Water-type moves boosted by 50% in rain. Fire-type damage reduced by 50% in rain.',
  electric: 'Cannot be Paralyzed. Immune to paralysis from Thunder Wave, Stun Spore, Glare, or Discharge.',
  grass: 'Immune to spore and powder moves (Spore, Sleep Powder, Stun Spore, Poison Powder, Cotton Spore) and Leech Seed.',
  ice: 'Cannot be Frozen. In Snow, Defense is boosted by 50%. Takes no damage from Hail.',
  fighting: 'Exceptional offensive coverage hitting 5 types super effectively (Normal, Ice, Rock, Dark, Steel).',
  poison: 'Cannot be Poisoned or Badly Poisoned. Grounded Poison-types automatically absorb and remove Toxic Spikes upon entering battle.',
  ground: 'Takes no damage from Sandstorms. Completely immune to all Electric-type attacks.',
  flying: 'Immune to Ground-type moves, Spikes, Toxic Spikes, Sticky Web, and Terrain effects when grounded.',
  psychic: 'Immune to Psychic Terrain enemy priority attacks. Strong offensive Sp. Atk presence.',
  bug: 'Resists Ground, Grass, and Fighting. Hits Dark, Psychic, and Grass super effectively.',
  rock: 'Special Defense is boosted by 50% in a Sandstorm. Takes no chip damage from Sandstorms.',
  ghost: 'Immune to all trapping effects (Shadow Tag, Arena Trap, Magnet Pull, Mean Look, Fire Spin) and can always switch out or flee freely.',
  dragon: 'Resists the 4 elemental starter types (Fire, Water, Grass, Electric). Premier offensive powerhouse.',
  dark: 'Completely immune to status moves boosted by the Prankster ability. Immune to Psychic-type attacks.',
  steel: 'Cannot be Poisoned. Immune to Sandstorm chip damage. Boasts 10 resistances and 1 complete immunity, the most defensive type in Pokémon.',
  fairy: 'Completely immune to Dragon-type attacks. Powerful counter to Dragon, Dark, and Fighting types.',
};

export const TypeDexScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [selectedType, setSelectedType] = useState('fire');
  const [activeTab, setActiveTab] = useState('matchups'); // 'matchups' | 'pokemon'
  const [rosterFilter, setRosterFilter] = useState('all'); // 'all' | 'pure' | 'dual'
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate offensive effectiveness for selected type
  const offensiveMatchups = useMemo(() => {
    const doubleTo = [];
    const halfTo = [];
    const zeroTo = [];

    ALL_POKEMON_TYPES.forEach((defType) => {
      const eff = TYPE_EFFECTIVENESS[defType];
      if (eff) {
        if (eff.doubleDamageFrom.includes(selectedType)) {
          doubleTo.push(defType);
        } else if (eff.halfDamageFrom.includes(selectedType)) {
          halfTo.push(defType);
        } else if (eff.noDamageFrom.includes(selectedType)) {
          zeroTo.push(defType);
        }
      }
    });

    return { doubleTo, halfTo, zeroTo };
  }, [selectedType]);

  // Defensive matchups for selected type
  const defensiveMatchups = useMemo(() => {
    const eff = TYPE_EFFECTIVENESS[selectedType] || { doubleDamageFrom: [], halfDamageFrom: [], noDamageFrom: [] };
    return {
      weakTo: eff.doubleDamageFrom || [],
      resists: eff.halfDamageFrom || [],
      immuneTo: eff.noDamageFrom || [],
    };
  }, [selectedType]);

  // Filter Pokémon for selected type
  const typePokemon = useMemo(() => {
    return pokemonIndex.filter((p) => {
      if (!p.types || !p.types.includes(selectedType)) return false;
      if (rosterFilter === 'pure' && p.types.length !== 1) return false;
      if (rosterFilter === 'dual' && p.types.length !== 2) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesId = String(p.speciesId || p.id).includes(query);
        return matchesName || matchesId;
      }
      return true;
    });
  }, [selectedType, rosterFilter, searchQuery]);

  // Total counts for selected type
  const typeStats = useMemo(() => {
    const all = pokemonIndex.filter((p) => p.types && p.types.includes(selectedType));
    const pure = all.filter((p) => p.types.length === 1);
    const dual = all.filter((p) => p.types.length === 2);
    return { total: all.length, pure: pure.length, dual: dual.length };
  }, [selectedType]);

  const selectedColor = TYPE_COLORS[selectedType] || theme.colors.primary;

  const renderPokemonCard = ({ item }) => {
    const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;
    const formattedId = String(item.speciesId || item.id).padStart(4, '0');

    return (
      <TouchableOpacity
        style={[styles.pokeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PokemonDetail', { id: item.id, name: item.name })}
      >
        <Image
          source={{ uri: artworkUrl }}
          style={styles.pokeImage}
          resizeMode="contain"
        />
        <Text style={[styles.pokeId, { color: theme.colors.textSecondary }]}>#{formattedId}</Text>
        <Text style={[styles.pokeName, { color: theme.colors.text }]} numberOfLines={1}>
          {item.name.replace('-', ' ')}
        </Text>
        <View style={styles.pokeTypesRow}>
          {item.types.map((t) => (
            <View
              key={t}
              style={[
                styles.miniTypeChip,
                { backgroundColor: TYPE_COLORS[t] || '#888' },
              ]}
            >
              <Text style={styles.miniTypeChipText}>{t}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.pokeBst, { color: theme.colors.textSecondary }]}>
          BST: <Text style={{ fontWeight: '700', color: theme.colors.text }}>{item.total || '—'}</Text>
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Type Selector Carousel */}
      <View style={[styles.selectorContainer, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorContent}
        >
          {ALL_POKEMON_TYPES.map((type) => {
            const isSelected = selectedType === type;
            const tColor = TYPE_COLORS[type];
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typePill,
                  {
                    backgroundColor: isSelected ? tColor : isDarkMode ? '#252525' : '#F0F0F0',
                    borderColor: isSelected ? '#FFFFFF' : 'transparent',
                    borderWidth: isSelected ? 1.5 : 0,
                  },
                ]}
                onPress={() => setSelectedType(type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.typePillText,
                    { color: isSelected ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Hero Banner for Selected Type */}
      <View style={[styles.heroBanner, { backgroundColor: selectedColor }]}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroTitle}>{selectedType.toUpperCase()} TYPE</Text>
          <Text style={styles.heroSubtitle}>
            {typeStats.total} Pokémon • {typeStats.pure} Pure • {typeStats.dual} Dual
          </Text>
        </View>
        <View style={styles.heroBadge}>
          <Ionicons name="shield-outline" size={28} color="#FFFFFF" />
        </View>
      </View>

      {/* Main Mode Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'matchups' && { borderBottomColor: selectedColor, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('matchups')}
        >
          <Ionicons
            name="flash-outline"
            size={18}
            color={activeTab === 'matchups' ? selectedColor : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'matchups' ? selectedColor : theme.colors.textSecondary, fontWeight: activeTab === 'matchups' ? '800' : '600' },
            ]}
          >
            Matchups & Traits
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pokemon' && { borderBottomColor: selectedColor, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('pokemon')}
        >
          <Ionicons
            name="list-outline"
            size={18}
            color={activeTab === 'pokemon' ? selectedColor : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'pokemon' ? selectedColor : theme.colors.textSecondary, fontWeight: activeTab === 'pokemon' ? '800' : '600' },
            ]}
          >
            Pokémon ({typePokemon.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB CONTENT */}
      {activeTab === 'matchups' ? (
        <ScrollView style={styles.scrollArea} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Offensive Section */}
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="arrow-up-circle" size={20} color="#4CAF50" />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Offense (When Attacking)</Text>
            </View>

            <Text style={[styles.labelRow, { color: '#4CAF50' }]}>Super Effective Deals 2.0× Damage To:</Text>
            <View style={styles.chipsWrap}>
              {offensiveMatchups.doubleTo.length > 0 ? (
                offensiveMatchups.doubleTo.map((t) => (
                  <View key={t} style={[styles.matchChip, { backgroundColor: TYPE_COLORS[t] }]}>
                    <Text style={styles.matchChipText}>{t.toUpperCase()} (2×)</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>None (Deals neutral damage)</Text>
              )}
            </View>

            <Text style={[styles.labelRow, { color: '#FF9800', marginTop: 12 }]}>Not Very Effective Deals 0.5× Damage To:</Text>
            <View style={styles.chipsWrap}>
              {offensiveMatchups.halfTo.length > 0 ? (
                offensiveMatchups.halfTo.map((t) => (
                  <View key={t} style={[styles.matchChip, { backgroundColor: TYPE_COLORS[t] }]}>
                    <Text style={styles.matchChipText}>{t.toUpperCase()} (0.5×)</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>None</Text>
              )}
            </View>

            {offensiveMatchups.zeroTo.length > 0 && (
              <>
                <Text style={[styles.labelRow, { color: '#E53935', marginTop: 12 }]}>No Effect Deals 0.0× Damage To:</Text>
                <View style={styles.chipsWrap}>
                  {offensiveMatchups.zeroTo.map((t) => (
                    <View key={t} style={[styles.matchChip, { backgroundColor: '#424242' }]}>
                      <Text style={styles.matchChipText}>{t.toUpperCase()} (0×)</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Defensive Section */}
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 14 }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#2196F3" />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Defense (When Defending)</Text>
            </View>

            <Text style={[styles.labelRow, { color: '#E53935' }]}>Weaknesses (Takes 2.0× Damage From):</Text>
            <View style={styles.chipsWrap}>
              {defensiveMatchups.weakTo.length > 0 ? (
                defensiveMatchups.weakTo.map((t) => (
                  <View key={t} style={[styles.matchChip, { backgroundColor: TYPE_COLORS[t] }]}>
                    <Text style={styles.matchChipText}>{t.toUpperCase()} (2×)</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>None (No direct weaknesses!)</Text>
              )}
            </View>

            <Text style={[styles.labelRow, { color: '#4CAF50', marginTop: 12 }]}>Resistances (Takes 0.5× Damage From):</Text>
            <View style={styles.chipsWrap}>
              {defensiveMatchups.resists.length > 0 ? (
                defensiveMatchups.resists.map((t) => (
                  <View key={t} style={[styles.matchChip, { backgroundColor: TYPE_COLORS[t] }]}>
                    <Text style={styles.matchChipText}>{t.toUpperCase()} (0.5×)</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>None</Text>
              )}
            </View>

            {defensiveMatchups.immuneTo.length > 0 && (
              <>
                <Text style={[styles.labelRow, { color: '#9C27B0', marginTop: 12 }]}>Immunities (Takes 0.0× Damage From):</Text>
                <View style={styles.chipsWrap}>
                  {defensiveMatchups.immuneTo.map((t) => (
                    <View key={t} style={[styles.matchChip, { backgroundColor: '#4A148C' }]}>
                      <Text style={styles.matchChipText}>{t.toUpperCase()} (Immune)</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Inherent Battle Traits & Mechanics */}
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 14 }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color="#FFB300" />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Inherent Type Mechanics</Text>
            </View>
            <Text style={[styles.traitDescription, { color: theme.colors.textSecondary }]}>
              {TYPE_TRAITS[selectedType] || 'Standard elemental properties.'}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Filter Bar & Search */}
          <View style={[styles.rosterFilterBar, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
            <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#222' : '#F5F5F5', borderColor: theme.colors.border }]}>
              <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder={`Search ${selectedType} Pokémon...`}
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterPillsRow}>
              {[
                { id: 'all', label: `All (${typeStats.total})` },
                { id: 'pure', label: `Pure (${typeStats.pure})` },
                { id: 'dual', label: `Dual (${typeStats.dual})` },
              ].map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.subFilterPill,
                    rosterFilter === f.id && { backgroundColor: selectedColor },
                    { borderColor: theme.colors.border },
                  ]}
                  onPress={() => setRosterFilter(f.id)}
                >
                  <Text
                    style={[
                      styles.subFilterPillText,
                      { color: rosterFilter === f.id ? '#FFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Grid List */}
          <FlatList
            data={typePokemon}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            renderItem={renderPokemonCard}
            contentContainerStyle={styles.rosterGrid}
            showsVerticalScrollIndicator={false}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Pokémon found</Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                  Try clearing your search or filters.
                </Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectorContainer: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  selectorContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  heroLeft: {
    flex: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 14,
  },
  scrollArea: {
    flex: 1,
  },
  sectionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  labelRow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  matchChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  matchChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  traitDescription: {
    fontSize: 14,
    lineHeight: 21,
  },
  rosterFilterBar: {
    padding: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  subFilterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rosterGrid: {
    padding: 10,
  },
  pokeCard: {
    flex: 1,
    margin: 6,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  pokeImage: {
    width: 80,
    height: 80,
    marginVertical: 4,
  },
  pokeId: {
    fontSize: 11,
    fontWeight: '700',
  },
  pokeName: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
    marginTop: 2,
    textAlign: 'center',
  },
  pokeTypesRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 6,
  },
  miniTypeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniTypeChipText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pokeBst: {
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
  },
});
