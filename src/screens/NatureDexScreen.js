import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { STAT_LABELS, STAT_COLORS } from '../utils/statCalculator';

// 25 Official Pokémon Natures with complete competitive metadata
const NATURE_DATA = [
  {
    name: 'Hardy',
    increased: null,
    decreased: null,
    flavorLike: 'None',
    flavorDislike: 'None',
    role: 'Neutral Nature',
    archetype: 'Balanced All-Rounder',
    description: 'Provides no stat modifications (+0% / -0%). Useful for all-around battle testing or mixed casual play.',
    topUsers: ['Mew', 'Arceus', 'Silvally'],
  },
  {
    name: 'Lonely',
    increased: 'attack',
    decreased: 'defense',
    flavorLike: 'Spicy',
    flavorDislike: 'Sour',
    role: 'Mixed Physical Wallbreaker',
    archetype: 'Offensive Mixed Attacker',
    description: 'Boosts Attack while lowering Defense. Popular on mixed sweepers wanting to preserve Sp. Atk and Speed.',
    topUsers: ['Deoxys-Attack', 'Greninja', 'Pheromosa'],
  },
  {
    name: 'Brave',
    increased: 'attack',
    decreased: 'speed',
    flavorLike: 'Spicy',
    flavorDislike: 'Sweet',
    role: 'Trick Room Physical Sweeper',
    archetype: 'Heavy Trick Room Bruiser',
    description: 'Boosts Attack while minimizing Speed to maximize offensive initiative under Trick Room.',
    topUsers: ['Ursaluna', 'Melmetal', 'Conkeldurr', 'Torkoal'],
  },
  {
    name: 'Adamant',
    increased: 'attack',
    decreased: 'spAtk',
    flavorLike: 'Spicy',
    flavorDislike: 'Dry',
    role: 'Pure Physical Sweeper / Wallbreaker',
    archetype: 'Premier Physical Powerhouse',
    description: 'Maximizes Attack without compromising bulk or Speed. The most celebrated nature for physical attackers.',
    topUsers: ['Dragonite', 'Kingambit', 'Tyranitar', 'Rillaboom', 'Great Tusk'],
  },
  {
    name: 'Naughty',
    increased: 'attack',
    decreased: 'spDef',
    flavorLike: 'Spicy',
    flavorDislike: 'Bitter',
    role: 'Mixed Physical Striker',
    archetype: 'Mixed Wallbreaker',
    description: 'Increases Attack at the expense of Sp. Def. Great for physical attackers that carry mixed special moves.',
    topUsers: ['Salamence', 'Sharpedo', 'Camerupt'],
  },
  {
    name: 'Bold',
    increased: 'defense',
    decreased: 'attack',
    flavorLike: 'Sour',
    flavorDislike: 'Spicy',
    role: 'Physical Wall & Support',
    archetype: 'Defensive Support / Pivot',
    description: 'Raises Defense while safely dropping unnecessary Attack. Minimizes Foul Play and confusion damage.',
    topUsers: ['Slowbro', 'Clefable', 'Corviknight', 'Weezing-Galar', 'Toxapex'],
  },
  {
    name: 'Docile',
    increased: null,
    decreased: null,
    flavorLike: 'None',
    flavorDislike: 'None',
    role: 'Neutral Nature',
    archetype: 'Balanced All-Rounder',
    description: 'Neutral nature with no stat advantages or penalties.',
    topUsers: ['Eevee', 'Ditto', 'Castform'],
  },
  {
    name: 'Relaxed',
    increased: 'defense',
    decreased: 'speed',
    flavorLike: 'Sour',
    flavorDislike: 'Sweet',
    role: 'Trick Room Physical Wall',
    archetype: 'Bulky Slow Pivot',
    description: 'Maximizes Defense while lowering Speed for slower pivot switches (Volt Switch, U-turn, Teleport).',
    topUsers: ['Ferrothorn', 'Slowking-Galar', 'Forretress', 'Dondozo'],
  },
  {
    name: 'Impish',
    increased: 'defense',
    decreased: 'spAtk',
    flavorLike: 'Sour',
    flavorDislike: 'Dry',
    role: 'Physical Wall & Spikes Setter',
    archetype: 'Bulky Physical Tank',
    description: 'Boosts Defense while dropping unused Sp. Atk, preserving physical Attack for Knock Off or Body Press.',
    topUsers: ['Skarmory', 'Gliscor', 'Hippowdon', 'Garganacl', 'Ting-Lu'],
  },
  {
    name: 'Lax',
    increased: 'defense',
    decreased: 'spDef',
    flavorLike: 'Sour',
    flavorDislike: 'Bitter',
    role: 'Niche Physical Tank',
    archetype: 'Specialized Defense Buffer',
    description: 'Boosts Defense while reducing Sp. Def. Rarely used competitively due to compromising special bulk.',
    topUsers: ['Avalugg', 'Steelix'],
  },
  {
    name: 'Timid',
    increased: 'speed',
    decreased: 'attack',
    flavorLike: 'Sweet',
    flavorDislike: 'Spicy',
    role: 'Fast Special Sweeper',
    archetype: 'Premier Speed Sp. Attacker',
    description: 'Boosts Speed to outspeed threats while minimizing Foul Play and confusion damage. Essential on fast mages.',
    topUsers: ['Iron Valiant', 'Gengar', 'Alakazam', 'Flutter Mane', 'Chi-Yu'],
  },
  {
    name: 'Hasty',
    increased: 'speed',
    decreased: 'defense',
    flavorLike: 'Sweet',
    flavorDislike: 'Sour',
    role: 'Fast Mixed Sweeper',
    archetype: 'Speed Mixed Striker',
    description: 'Raises Speed while preserving both offensive stats, sacrificing physical bulk.',
    topUsers: ['Greninja', 'Cinderace', 'Deoxys-Speed'],
  },
  {
    name: 'Serious',
    increased: null,
    decreased: null,
    flavorLike: 'None',
    flavorDislike: 'None',
    role: 'Neutral Nature',
    archetype: 'Balanced All-Rounder',
    description: 'Neutral nature with balanced stat growth.',
    topUsers: ['Smeargle', 'Zoroark'],
  },
  {
    name: 'Jolly',
    increased: 'speed',
    decreased: 'spAtk',
    flavorLike: 'Sweet',
    flavorDislike: 'Dry',
    role: 'Fast Physical Sweeper',
    archetype: 'Premier Speed Physical Sweeper',
    description: 'Boosts Speed to win speed ties against opposing sweepers while cutting unnecessary Sp. Atk.',
    topUsers: ['Garchomp', 'Weavile', 'Cinderace', 'Meowscarada', 'Roaring Moon'],
  },
  {
    name: 'Naive',
    increased: 'speed',
    decreased: 'spDef',
    flavorLike: 'Sweet',
    flavorDislike: 'Bitter',
    role: 'Fast Mixed Attacker',
    archetype: 'Speed Mixed Sweeper',
    description: 'Maximizes Speed while keeping both physical and special offensive stats intact.',
    topUsers: ['Dragapult', 'Hydreigon', 'Iron Bundle'],
  },
  {
    name: 'Modest',
    increased: 'spAtk',
    decreased: 'attack',
    flavorLike: 'Dry',
    flavorDislike: 'Spicy',
    role: 'Pure Special Wallbreaker',
    archetype: 'Premier Special Powerhouse',
    description: 'Maximizes Sp. Atk output for overwhelming special damage, cutting unused physical Attack.',
    topUsers: ['Volcarona', 'Heatran', 'Gholdengo', 'Kyogre', 'Walking Wake'],
  },
  {
    name: 'Mild',
    increased: 'spAtk',
    decreased: 'defense',
    flavorLike: 'Dry',
    flavorDislike: 'Sour',
    role: 'Mixed Special Striker',
    archetype: 'Mixed Wallbreaker',
    description: 'Raises Sp. Atk while lowering Defense, retaining both offensive stats and Speed.',
    topUsers: ['Lucario', 'Blaziken', 'Nidoking'],
  },
  {
    name: 'Quiet',
    increased: 'spAtk',
    decreased: 'speed',
    flavorLike: 'Dry',
    flavorDislike: 'Sweet',
    role: 'Trick Room Special Sweeper',
    archetype: 'Heavy Trick Room Mage',
    description: 'Maximizes Sp. Atk while reducing Speed to act first in Trick Room environments.',
    topUsers: ['Hatterene', 'Reuniclus', 'Armarouge', 'Vikavolt'],
  },
  {
    name: 'Bashful',
    increased: null,
    decreased: null,
    flavorLike: 'None',
    flavorDislike: 'None',
    role: 'Neutral Nature',
    archetype: 'Balanced All-Rounder',
    description: 'Neutral nature with no stat alterations.',
    topUsers: ['Porygon', 'Spinda'],
  },
  {
    name: 'Rash',
    increased: 'spAtk',
    decreased: 'spDef',
    flavorLike: 'Dry',
    flavorDislike: 'Bitter',
    role: 'Mixed Special Attacker',
    archetype: 'Mixed Striker',
    description: 'Boosts Sp. Atk at the cost of Sp. Def to retain Attack and Speed.',
    topUsers: ['Aegislash', 'Kingdra', 'Magnezone'],
  },
  {
    name: 'Calm',
    increased: 'spDef',
    decreased: 'attack',
    flavorLike: 'Bitter',
    flavorDislike: 'Spicy',
    role: 'Special Wall & Healer',
    archetype: 'Defensive Special Sponge',
    description: 'Boosts Sp. Def while cutting unused Attack to safely sponge enemy Draco Meteors, Surfs, and Focus Blasts.',
    topUsers: ['Blissey', 'Umbreon', 'Rotom-Wash', 'Goodra-Hisui', 'Clodsire'],
  },
  {
    name: 'Gentle',
    increased: 'spDef',
    decreased: 'defense',
    flavorLike: 'Bitter',
    flavorDislike: 'Sour',
    role: 'Special Defense Buffer',
    archetype: 'Niche Special Tank',
    description: 'Raises Sp. Def at the expense of Defense. Rarely favored over Calm or Careful.',
    topUsers: ['Latias', 'Florges'],
  },
  {
    name: 'Sassy',
    increased: 'spDef',
    decreased: 'speed',
    flavorLike: 'Bitter',
    flavorDislike: 'Sweet',
    role: 'Trick Room Special Wall',
    archetype: 'Slow Defensive Pivot',
    description: 'Raises Sp. Def while minimizing Speed to facilitate slow pivots under Trick Room or entry hazards.',
    topUsers: ['Gastrodon', 'Ferrothorn', 'Bronzong', 'Slowking'],
  },
  {
    name: 'Careful',
    increased: 'spDef',
    decreased: 'spAtk',
    flavorLike: 'Bitter',
    flavorDislike: 'Dry',
    role: 'Special Wall with Physical Moves',
    archetype: 'Specially Defensive Bruiser',
    description: 'Raises Sp. Def while dropping Sp. Atk, preserving Attack for moves like Earthquake, Knock Off, and Roost.',
    topUsers: ['Corviknight', 'Garganacl', 'Snorlax', 'Ting-Lu'],
  },
  {
    name: 'Quirky',
    increased: null,
    decreased: null,
    flavorLike: 'None',
    flavorDislike: 'None',
    role: 'Neutral Nature',
    archetype: 'Balanced All-Rounder',
    description: 'Neutral nature with standard progression across all 6 stats.',
    topUsers: ['Dunsparce', 'Ogerpon'],
  },
];

const STAT_FILTER_BUTTONS = [
  { id: 'all', label: 'All (25)' },
  { id: 'speed', label: '+Speed (4)' },
  { id: 'attack', label: '+Attack (4)' },
  { id: 'spAtk', label: '+Sp. Atk (4)' },
  { id: 'defense', label: '+Defense (4)' },
  { id: 'spDef', label: '+Sp. Def (4)' },
  { id: 'neutral', label: 'Neutral (5)' },
];

export const NatureDexScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLookupTool, setShowLookupTool] = useState(false);
  const [lookupPlus, setLookupPlus] = useState('attack');
  const [lookupMinus, setLookupMinus] = useState('spAtk');

  // Filtered Natures list
  const filteredNatures = useMemo(() => {
    return NATURE_DATA.filter((nature) => {
      if (selectedFilter === 'neutral' && (nature.increased !== null || nature.decreased !== null)) {
        return false;
      }
      if (selectedFilter !== 'all' && selectedFilter !== 'neutral' && nature.increased !== selectedFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = nature.name.toLowerCase().includes(q);
        const matchesRole = nature.role.toLowerCase().includes(q);
        const matchesPokemon = nature.topUsers.some((u) => u.toLowerCase().includes(q));
        return matchesName || matchesRole || matchesPokemon;
      }
      return true;
    });
  }, [selectedFilter, searchQuery]);

  // Lookup matched nature
  const lookupResult = useMemo(() => {
    if (!lookupPlus || !lookupMinus) return null;
    if (lookupPlus === lookupMinus) {
      return NATURE_DATA.find((n) => n.increased === null);
    }
    return NATURE_DATA.find((n) => n.increased === lookupPlus && n.decreased === lookupMinus);
  }, [lookupPlus, lookupMinus]);

  const renderNatureCard = ({ item }) => {
    const isNeutral = !item.increased && !item.decreased;

    return (
      <View style={[styles.natureCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.natureName, { color: theme.colors.text }]}>{item.name}</Text>
              {isNeutral ? (
                <View style={[styles.badgePill, { backgroundColor: '#78909C' }]}>
                  <Text style={styles.badgePillText}>NEUTRAL</Text>
                </View>
              ) : (
                <View style={[styles.badgePill, { backgroundColor: STAT_COLORS[item.increased] || '#4CAF50' }]}>
                  <Text style={styles.badgePillText}>+{STAT_LABELS[item.increased]}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.natureRole, { color: theme.colors.textSecondary }]}>{item.role}</Text>
          </View>
        </View>

        {/* Modifiers Pill Row */}
        <View style={styles.modifiersRow}>
          <View style={[styles.modPill, { backgroundColor: isDarkMode ? '#1B2E1D' : '#E8F5E9', borderColor: '#4CAF50' }]}>
            <Ionicons name="arrow-up" size={14} color="#4CAF50" />
            <Text style={[styles.modPillLabel, { color: '#4CAF50' }]}>
              {item.increased ? `+10% ${STAT_LABELS[item.increased]}` : 'None (+0%)'}
            </Text>
          </View>

          <View style={[styles.modPill, { backgroundColor: isDarkMode ? '#2E1818' : '#FFEBEE', borderColor: '#E53935' }]}>
            <Ionicons name="arrow-down" size={14} color="#E53935" />
            <Text style={[styles.modPillLabel, { color: '#E53935' }]}>
              {item.decreased ? `-10% ${STAT_LABELS[item.decreased]}` : 'None (-0%)'}
            </Text>
          </View>
        </View>

        {/* Flavor Profile */}
        <View style={[styles.flavorRow, { backgroundColor: isDarkMode ? '#222' : '#F9F9F9' }]}>
          <View style={styles.flavorItem}>
            <Ionicons name="heart-outline" size={13} color="#FF9800" />
            <Text style={[styles.flavorText, { color: theme.colors.textSecondary }]}>
              Likes: <Text style={{ fontWeight: '700', color: theme.colors.text }}>{item.flavorLike}</Text>
            </Text>
          </View>
          <View style={styles.flavorItem}>
            <Ionicons name="close-circle-outline" size={13} color="#78909C" />
            <Text style={[styles.flavorText, { color: theme.colors.textSecondary }]}>
              Dislikes: <Text style={{ fontWeight: '700', color: theme.colors.text }}>{item.flavorDislike}</Text>
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={[styles.natureDesc, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>

        {/* Top Competitive Users */}
        <View style={styles.topUsersWrap}>
          <Text style={[styles.topUsersTitle, { color: theme.colors.textSecondary }]}>Notable Users:</Text>
          <View style={styles.userChipsRow}>
            {item.topUsers.map((u) => (
              <View key={u} style={[styles.userChip, { backgroundColor: isDarkMode ? '#333' : '#E0E0E0' }]}>
                <Text style={[styles.userChipText, { color: theme.colors.text }]}>{u}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Search & Interactive Finder Header */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#222' : '#F5F5F5', borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search nature by name, role, or Pokémon..."
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

        {/* Toggle Nature Finder Tool */}
        <TouchableOpacity
          style={[
            styles.toggleFinderButton,
            { backgroundColor: showLookupTool ? '#4CAF50' : isDarkMode ? '#2C2C2C' : '#EDE7F6' },
          ]}
          onPress={() => setShowLookupTool(!showLookupTool)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showLookupTool ? 'calculator' : 'calculator-outline'}
            size={16}
            color={showLookupTool ? '#FFF' : '#673AB7'}
          />
          <Text
            style={[
              styles.toggleFinderText,
              { color: showLookupTool ? '#FFF' : '#673AB7' },
            ]}
          >
            {showLookupTool ? 'Close Nature Finder' : 'Open Quick Nature Finder (+ / -)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* QUICK NATURE FINDER TOOL (EXPANDABLE) */}
      {showLookupTool && (
        <View style={[styles.finderBox, { backgroundColor: theme.colors.card, borderColor: '#4CAF50' }]}>
          <Text style={[styles.finderTitle, { color: theme.colors.text }]}>
            🎯 Quick Nature Matcher
          </Text>
          <Text style={[styles.finderSubtitle, { color: theme.colors.textSecondary }]}>
            Select your desired stat boosts and reductions:
          </Text>

          {/* Plus Stat Selector */}
          <Text style={[styles.finderLabel, { color: '#4CAF50' }]}>+ Boosted Stat (+10%):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.finderPills}>
            {['attack', 'defense', 'spAtk', 'spDef', 'speed'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.finderPill,
                  lookupPlus === st && { backgroundColor: '#4CAF50' },
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => setLookupPlus(st)}
              >
                <Text style={[styles.finderPillText, { color: lookupPlus === st ? '#FFF' : theme.colors.text }]}>
                  +{STAT_LABELS[st]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Minus Stat Selector */}
          <Text style={[styles.finderLabel, { color: '#E53935', marginTop: 10 }]}>- Lowered Stat (-10%):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.finderPills}>
            {['attack', 'defense', 'spAtk', 'spDef', 'speed'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.finderPill,
                  lookupMinus === st && { backgroundColor: '#E53935' },
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => setLookupMinus(st)}
              >
                <Text style={[styles.finderPillText, { color: lookupMinus === st ? '#FFF' : theme.colors.text }]}>
                  -{STAT_LABELS[st]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Result Card */}
          {lookupResult && (
            <View style={[styles.finderResultBanner, { backgroundColor: isDarkMode ? '#1B2E1D' : '#E8F5E9' }]}>
              <View>
                <Text style={[styles.finderResultTitle, { color: '#2E7D32' }]}>
                  {lookupResult.name} Nature
                </Text>
                <Text style={[styles.finderResultSub, { color: theme.colors.textSecondary }]}>
                  {lookupResult.role} • Likes {lookupResult.flavorLike}
                </Text>
              </View>
              <View style={[styles.badgePill, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.badgePillText}>EXACT MATCH</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Filter Category Scroll */}
      <View style={[styles.filterScrollWrap, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {STAT_FILTER_BUTTONS.map((btn) => (
            <TouchableOpacity
              key={btn.id}
              style={[
                styles.filterTabPill,
                selectedFilter === btn.id && { backgroundColor: theme.colors.primary },
                { borderColor: theme.colors.border },
              ]}
              onPress={() => setSelectedFilter(btn.id)}
            >
              <Text
                style={[
                  styles.filterTabPillText,
                  { color: selectedFilter === btn.id ? '#FFF' : theme.colors.textSecondary },
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Natures List */}
      <FlatList
        data={filteredNatures}
        keyExtractor={(item) => item.name}
        renderItem={renderNatureCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No natures found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Try adjusting your search query or filter.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
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
  toggleFinderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  toggleFinderText: {
    fontSize: 12,
    fontWeight: '800',
  },
  finderBox: {
    margin: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  finderTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  finderSubtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  finderLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  finderPills: {
    gap: 6,
    paddingVertical: 4,
  },
  finderPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  finderPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  finderResultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  finderResultTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  finderResultSub: {
    fontSize: 12,
    marginTop: 2,
  },
  filterScrollWrap: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterTabPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 12,
    paddingBottom: 40,
    gap: 12,
  },
  natureCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  natureName: {
    fontSize: 18,
    fontWeight: '900',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  natureRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  modifiersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  modPillLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  flavorRow: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'space-around',
  },
  flavorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flavorText: {
    fontSize: 11,
  },
  natureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  topUsersWrap: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: 8,
    gap: 6,
  },
  topUsersTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  userChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  userChipText: {
    fontSize: 11,
    fontWeight: '700',
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
