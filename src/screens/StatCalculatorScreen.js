import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { pokemonIndex } from '../data/pokemonIndex';
import { TYPE_COLORS } from '../components/FilterModal';
import {
  STAT_KEYS,
  STAT_LABELS,
  STAT_COLORS,
  NATURES,
  calculatePokemonStats,
  getStatRange,
  getEvBudget,
  IV_PRESETS,
  EV_PRESETS,
  getNatureMultiplier,
} from '../utils/statCalculator';

const { width } = Dimensions.get('window');

export const StatCalculatorScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Selected Pokemon from params or default to Charizard (#6) or Bulbasaur (#1)
  const initialPokemon = route.params?.pokemon || pokemonIndex.find(p => p.id === (route.params?.id || 6)) || pokemonIndex[0];

  const [selectedPokemon, setSelectedPokemon] = useState(initialPokemon);
  const [level, setLevel] = useState(100);
  const [nature, setNature] = useState('Adamant');

  const [ivs, setIvs] = useState({
    hp: 31,
    attack: 31,
    defense: 31,
    spAtk: 31,
    spDef: 31,
    speed: 31,
  });

  const [evs, setEvs] = useState({
    hp: 4,
    attack: 252,
    defense: 0,
    spAtk: 0,
    spDef: 0,
    speed: 252,
  });

  // Modal states
  const [isPokemonModalOpen, setIsPokemonModalOpen] = useState(false);
  const [isNatureModalOpen, setIsNatureModalOpen] = useState(false);
  const [searchPokemonText, setSearchPokemonText] = useState('');

  // When route params change (e.g. Navigating with a new Pokemon)
  useEffect(() => {
    if (route.params?.pokemon) {
      setSelectedPokemon(route.params.pokemon);
    } else if (route.params?.id) {
      const match = pokemonIndex.find(p => p.id === route.params.id);
      if (match) setSelectedPokemon(match);
    }
  }, [route.params]);

  // Extract base stats from selected Pokemon
  const baseStats = useMemo(() => {
    if (!selectedPokemon) return { hp: 100, attack: 100, defense: 100, spAtk: 100, spDef: 100, speed: 100 };
    return {
      hp: selectedPokemon.hp ?? 50,
      attack: selectedPokemon.attack ?? 50,
      defense: selectedPokemon.defense ?? 50,
      spAtk: selectedPokemon.spAtk ?? selectedPokemon.specialAttack ?? 50,
      spDef: selectedPokemon.spDef ?? selectedPokemon.specialDefense ?? 50,
      speed: selectedPokemon.speed ?? 50,
    };
  }, [selectedPokemon]);

  // Compute calculated stats
  const calculated = useMemo(() => {
    return calculatePokemonStats({
      baseStats,
      ivs,
      evs,
      level,
      nature,
    });
  }, [baseStats, ivs, evs, level, nature]);

  // EV Budget calculation
  const evBudget = useMemo(() => getEvBudget(evs), [evs]);

  // Primary color & artwork
  const primaryType = selectedPokemon?.types?.[0]?.toLowerCase() || 'normal';
  const typeColor = TYPE_COLORS[primaryType] || theme.colors.primary;
  const artworkUrl = selectedPokemon?.sprites?.artwork ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon?.id || 1}.png`;

  // Update a single IV
  const handleIvChange = (statKey, value) => {
    const num = Math.max(0, Math.min(31, parseInt(value, 10) || 0));
    setIvs(prev => ({ ...prev, [statKey]: num }));
  };

  // Update a single EV
  const handleEvChange = (statKey, value) => {
    const num = Math.max(0, Math.min(252, parseInt(value, 10) || 0));
    setEvs(prev => ({ ...prev, [statKey]: num }));
  };

  // Quick EV adjustment
  const handleEvQuickAdd = (statKey, amount) => {
    setEvs(prev => {
      const current = prev[statKey] || 0;
      const otherTotal = STAT_KEYS.filter(k => k !== statKey).reduce((sum, k) => sum + (prev[k] || 0), 0);
      const maxPossibleForThis = Math.min(252, 510 - otherTotal);
      const nextVal = Math.max(0, Math.min(maxPossibleForThis, current + amount));
      return { ...prev, [statKey]: nextVal };
    });
  };

  // Apply IV Preset
  const applyIvPreset = (presetIvs) => {
    setIvs({ ...presetIvs });
  };

  // Apply EV Preset
  const applyEvPreset = (preset) => {
    setEvs({ ...preset.evs });
    if (preset.nature) setNature(preset.nature);
  };

  // Search filtered Pokémon list for picker modal
  const filteredIndex = useMemo(() => {
    if (!searchPokemonText.trim()) return pokemonIndex.slice(0, 100);
    const q = searchPokemonText.toLowerCase().trim();
    return pokemonIndex
      .filter(p => p.name.toLowerCase().includes(q) || String(p.id).includes(q))
      .slice(0, 100);
  }, [searchPokemonText]);

  // Current nature object
  const currentNatureObj = useMemo(() => {
    return NATURES.find(n => n.name.toLowerCase() === nature.toLowerCase()) || NATURES[0];
  }, [nature]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Pokemon Banner Card ── */}
        <View style={[styles.pokemonHeaderCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.pokemonHeaderInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.pokemonDexNum, { color: typeColor }]}>
                #{String(selectedPokemon?.id || 1).padStart(4, '0')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {(selectedPokemon?.types || ['normal']).map(t => (
                  <View key={t} style={[styles.typePill, { backgroundColor: TYPE_COLORS[t.toLowerCase()] || '#A8A878' }]}>
                    <Text style={styles.typePillText}>{t.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text numberOfLines={1} style={[styles.pokemonName, { color: theme.colors.text }]}>
              {selectedPokemon?.name ? selectedPokemon.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Pokémon'}
            </Text>

            <TouchableOpacity
              style={[styles.changePokemonBtn, { borderColor: typeColor }]}
              onPress={() => setIsPokemonModalOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-horizontal" size={14} color={typeColor} />
              <Text style={[styles.changePokemonText, { color: typeColor }]}>Change Pokémon</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.artworkContainer, { backgroundColor: `${typeColor}15` }]}>
            <Image source={{ uri: artworkUrl }} style={styles.artworkImage} resizeMode="contain" />
          </View>
        </View>

        {/* ── Configuration Bar (Level & Nature) ── */}
        <View style={styles.configSection}>
          {/* Level Selector */}
          <View style={[styles.configCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.configCardHeader}>
              <Ionicons name="flash-outline" size={16} color={typeColor} />
              <Text style={[styles.configLabel, { color: theme.colors.text }]}>Level: {level}</Text>
            </View>
            <View style={styles.levelControlsRow}>
              <TouchableOpacity
                style={[styles.levelQuickBtn, level === 50 && { backgroundColor: typeColor }]}
                onPress={() => setLevel(50)}
              >
                <Text style={[styles.levelQuickText, { color: level === 50 ? '#fff' : theme.colors.text }]}>50</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.levelQuickBtn, level === 100 && { backgroundColor: typeColor }]}
                onPress={() => setLevel(100)}
              >
                <Text style={[styles.levelQuickText, { color: level === 100 ? '#fff' : theme.colors.text }]}>100</Text>
              </TouchableOpacity>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.dark ? '#333' : '#E2E8F0' }]}
                  onPress={() => setLevel(prev => Math.max(1, prev - 1))}
                >
                  <Ionicons name="remove" size={14} color={theme.colors.text} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.levelInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={String(level)}
                  keyboardType="number-pad"
                  maxLength={3}
                  onChangeText={val => {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed)) setLevel(Math.max(1, Math.min(100, parsed)));
                    else if (val === '') setLevel(1);
                  }}
                />
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.dark ? '#333' : '#E2E8F0' }]}
                  onPress={() => setLevel(prev => Math.max(1, Math.min(100, prev + 1)))}
                >
                  <Ionicons name="add" size={14} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Nature Selector */}
          <TouchableOpacity
            style={[styles.configCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => setIsNatureModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.configCardHeader}>
              <Ionicons name="compass-outline" size={16} color={typeColor} />
              <Text style={[styles.configLabel, { color: theme.colors.text }]}>Nature</Text>
            </View>
            <View style={styles.natureDisplayRow}>
              <Text style={[styles.natureNameText, { color: theme.colors.text }]}>{nature}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.natureEffectPills}>
              {currentNatureObj.increased ? (
                <>
                  <View style={[styles.natureBadge, styles.natureBadgeBoost]}>
                    <Text style={styles.natureBadgeText}>+{STAT_LABELS[currentNatureObj.increased]}</Text>
                  </View>
                  <View style={[styles.natureBadge, styles.natureBadgeHinder]}>
                    <Text style={styles.natureBadgeText}>-{STAT_LABELS[currentNatureObj.decreased]}</Text>
                  </View>
                </>
              ) : (
                <View style={[styles.natureBadge, styles.natureBadgeNeutral]}>
                  <Text style={styles.natureBadgeNeutralText}>Neutral (No Effect)</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ── EV Budget & Stat Total Summary ── */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={[styles.summaryTitle, { color: theme.colors.textSecondary }]}>EV Budget</Text>
              <Text style={[styles.summaryBigVal, { color: evBudget.isOverLimit ? '#FF5252' : theme.colors.text }]}>
                {evBudget.total} <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>/ 510</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.summaryTitle, { color: theme.colors.textSecondary }]}>Total Stats (BST → Calc)</Text>
              <Text style={[styles.summaryBigVal, { color: typeColor }]}>
                {calculated.baseTotal} <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>→</Text> {calculated.total}
              </Text>
            </View>
          </View>

          {/* EV Budget Bar */}
          <View style={[styles.evProgressBarBg, { backgroundColor: theme.dark ? '#2D3748' : '#E2E8F0' }]}>
            <View
              style={[
                styles.evProgressBarFill,
                {
                  width: `${Math.min(100, (evBudget.total / 510) * 100)}%`,
                  backgroundColor: evBudget.isOverLimit ? '#FF5252' : typeColor,
                },
              ]}
            />
          </View>
          <View style={styles.evRemainingRow}>
            <Text style={[styles.evRemainingText, { color: theme.colors.textSecondary }]}>
              {evBudget.remaining} EVs remaining
            </Text>
            {evBudget.isOverLimit && (
              <Text style={styles.evOverLimitWarning}>⚠️ Exceeds 510 max limit!</Text>
            )}
          </View>
        </View>

        {/* ── Quick Presets Carousel ── */}
        <View style={styles.presetsSection}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Quick EV Builds</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
            {EV_PRESETS.map(preset => (
              <TouchableOpacity
                key={preset.name}
                style={[
                  styles.presetChip,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
                onPress={() => applyEvPreset(preset)}
                activeOpacity={0.7}
              >
                <Text style={[styles.presetChipTitle, { color: theme.colors.text }]}>{preset.name}</Text>
                <Text style={[styles.presetChipDesc, { color: theme.colors.textSecondary }]}>{preset.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.ivPresetsRow}>
            <Text style={[styles.sectionHeading, { color: theme.colors.text, marginBottom: 0 }]}>IV Presets:</Text>
            <View style={styles.ivPresetsButtons}>
              {IV_PRESETS.map(preset => (
                <TouchableOpacity
                  key={preset.name}
                  style={[styles.ivPresetBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => applyIvPreset(preset.ivs)}
                >
                  <Text style={[styles.ivPresetText, { color: typeColor }]}>{preset.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── Interactive Stat Calculation Cards ── */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Calculated Stats Breakdown</Text>

          {STAT_KEYS.map(statKey => {
            const label = STAT_LABELS[statKey];
            const color = STAT_COLORS[statKey];
            const baseVal = baseStats[statKey] || 0;
            const finalVal = calculated.stats[statKey] || 0;
            const ivVal = ivs[statKey] ?? 31;
            const evVal = evs[statKey] ?? 0;
            const natureMult = getNatureMultiplier(nature, statKey);
            const range = getStatRange(baseVal, statKey, level);

            // Bar fill calculation relative to realistic max stat bounds (e.g. 500)
            const barPct = Math.min(100, Math.max(8, (finalVal / 500) * 100));

            return (
              <View
                key={statKey}
                style={[styles.statRowCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                {/* Header: Stat Label, Nature Indicator, Final Stat Value */}
                <View style={styles.statRowHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[styles.statDot, { backgroundColor: color }]} />
                    <Text style={[styles.statLabelText, { color: theme.colors.text }]}>{label}</Text>
                    {natureMult > 1.0 && (
                      <View style={[styles.miniNatureBadge, { backgroundColor: '#4CAF5025', borderColor: '#4CAF50' }]}>
                        <Text style={[styles.miniNatureBadgeText, { color: '#4CAF50' }]}>+10%</Text>
                      </View>
                    )}
                    {natureMult < 1.0 && (
                      <View style={[styles.miniNatureBadge, { backgroundColor: '#FF525225', borderColor: '#FF5252' }]}>
                        <Text style={[styles.miniNatureBadgeText, { color: '#FF5252' }]}>-10%</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                    <Text style={[styles.statBaseText, { color: theme.colors.textSecondary }]}>Base {baseVal}</Text>
                    <Text style={[styles.statFinalValue, { color }]}>{finalVal}</Text>
                  </View>
                </View>

                {/* Progress Bar & Range */}
                <View style={[styles.statBarBg, { backgroundColor: theme.dark ? '#2D3748' : '#E2E8F0' }]}>
                  <View style={[styles.statBarFill, { width: `${barPct}%`, backgroundColor: color }]} />
                </View>

                <View style={styles.rangeInfoRow}>
                  <Text style={[styles.rangeInfoText, { color: theme.colors.textSecondary }]}>
                    Range at Lv.{level}: {range.min} ~ {range.max}
                  </Text>
                </View>

                {/* IV and EV Controls */}
                <View style={styles.controlsRow}>
                  {/* IV Control */}
                  <View style={styles.controlBox}>
                    <Text style={[styles.controlLabel, { color: theme.colors.textSecondary }]}>IV (0-31)</Text>
                    <View style={styles.stepperMini}>
                      <TouchableOpacity
                        style={[styles.stepperMiniBtn, { backgroundColor: theme.dark ? '#333' : '#EDF2F7' }]}
                        onPress={() => handleIvChange(statKey, ivVal - 1)}
                      >
                        <Ionicons name="remove" size={12} color={theme.colors.text} />
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.stepperMiniInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                        value={String(ivVal)}
                        keyboardType="number-pad"
                        maxLength={2}
                        onChangeText={v => handleIvChange(statKey, v)}
                      />
                      <TouchableOpacity
                        style={[styles.stepperMiniBtn, { backgroundColor: theme.dark ? '#333' : '#EDF2F7' }]}
                        onPress={() => handleIvChange(statKey, ivVal + 1)}
                      >
                        <Ionicons name="add" size={12} color={theme.colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* EV Control */}
                  <View style={styles.controlBox}>
                    <Text style={[styles.controlLabel, { color: theme.colors.textSecondary }]}>EV (0-252)</Text>
                    <View style={styles.stepperMini}>
                      <TouchableOpacity
                        style={[styles.stepperMiniBtn, { backgroundColor: theme.dark ? '#333' : '#EDF2F7' }]}
                        onPress={() => handleEvQuickAdd(statKey, -4)}
                      >
                        <Ionicons name="remove" size={12} color={theme.colors.text} />
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.stepperMiniInput, { color: theme.colors.text, borderColor: theme.colors.border, width: 44 }]}
                        value={String(evVal)}
                        keyboardType="number-pad"
                        maxLength={3}
                        onChangeText={v => handleEvChange(statKey, v)}
                      />
                      <TouchableOpacity
                        style={[styles.stepperMiniBtn, { backgroundColor: theme.dark ? '#333' : '#EDF2F7' }]}
                        onPress={() => handleEvQuickAdd(statKey, 4)}
                      >
                        <Ionicons name="add" size={12} color={theme.colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Quick EV buttons */}
                  <View style={styles.quickEvButtonsCol}>
                    <TouchableOpacity
                      style={[styles.quickEvPill, evVal === 252 && { backgroundColor: color }]}
                      onPress={() => handleEvChange(statKey, 252)}
                    >
                      <Text style={[styles.quickEvPillText, { color: evVal === 252 ? '#fff' : theme.colors.text }]}>252</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickEvPill, evVal === 0 && { backgroundColor: theme.colors.border }]}
                      onPress={() => handleEvChange(statKey, 0)}
                    >
                      <Text style={[styles.quickEvPillText, { color: theme.colors.textSecondary }]}>0</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Pokemon Picker Modal ── */}
      <Modal visible={isPokemonModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.card, paddingTop: insets.top + 12 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Pokémon</Text>
              <TouchableOpacity onPress={() => setIsPokemonModalOpen(false)}>
                <Ionicons name="close-circle" size={26} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Search Pokémon by name or #"
                placeholderTextColor={theme.colors.textSecondary}
                value={searchPokemonText}
                onChangeText={setSearchPokemonText}
                autoCorrect={false}
              />
              {searchPokemonText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchPokemonText('')}>
                  <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredIndex}
              keyExtractor={item => `${item.id}-${item.name}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const itemPrimary = item.types?.[0]?.toLowerCase() || 'normal';
                const itemColor = TYPE_COLORS[itemPrimary] || theme.colors.primary;
                const isSelected = selectedPokemon?.id === item.id;
                const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;

                return (
                  <TouchableOpacity
                    style={[
                      styles.pokemonListItem,
                      { borderBottomColor: theme.colors.border },
                      isSelected && { backgroundColor: `${itemColor}1A` },
                    ]}
                    onPress={() => {
                      setSelectedPokemon(item);
                      setIsPokemonModalOpen(false);
                      setSearchPokemonText('');
                    }}
                  >
                    <Image source={{ uri: sprite }} style={styles.miniSprite} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalDexNum, { color: itemColor }]}>#{String(item.id).padStart(4, '0')}</Text>
                      <Text style={[styles.modalPokemonName, { color: theme.colors.text }]}>
                        {item.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {(item.types || []).map(t => (
                        <View key={t} style={[styles.modalTypePill, { backgroundColor: TYPE_COLORS[t.toLowerCase()] || '#A8A878' }]}>
                          <Text style={styles.modalTypePillText}>{t.toUpperCase()}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ── Nature Picker Modal ── */}
      <Modal visible={isNatureModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.card, paddingTop: insets.top + 12 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Nature</Text>
              <TouchableOpacity onPress={() => setIsNatureModalOpen(false)}>
                <Ionicons name="close-circle" size={26} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={NATURES}
              keyExtractor={item => item.name}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item.name.toLowerCase() === nature.toLowerCase();
                return (
                  <TouchableOpacity
                    style={[
                      styles.natureListItem,
                      { borderBottomColor: theme.colors.border },
                      isSelected && { backgroundColor: `${theme.colors.primary}1A` },
                    ]}
                    onPress={() => {
                      setNature(item.name);
                      setIsNatureModalOpen(false);
                    }}
                  >
                    <Text style={[styles.natureListName, { color: theme.colors.text }, isSelected && { fontWeight: '800', color: theme.colors.primary }]}>
                      {item.name}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {item.increased ? (
                        <>
                          <View style={[styles.natureBadge, styles.natureBadgeBoost]}>
                            <Text style={styles.natureBadgeText}>+{STAT_LABELS[item.increased]}</Text>
                          </View>
                          <View style={[styles.natureBadge, styles.natureBadgeHinder]}>
                            <Text style={styles.natureBadgeText}>-{STAT_LABELS[item.decreased]}</Text>
                          </View>
                        </>
                      ) : (
                        <View style={[styles.natureBadge, styles.natureBadgeNeutral]}>
                          <Text style={styles.natureBadgeNeutralText}>Neutral</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pokemonHeaderCard: {
    margin: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  pokemonHeaderInfo: {
    flex: 1,
    marginRight: 12,
  },
  pokemonDexNum: {
    fontSize: 12,
    fontWeight: '800',
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  pokemonName: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 4,
  },
  changePokemonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  changePokemonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  artworkContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkImage: {
    width: 80,
    height: 80,
  },
  configSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  configCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  configCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  configLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  levelControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelQuickBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A0AEC055',
  },
  levelQuickText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelInput: {
    width: 34,
    height: 24,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 4,
    padding: 0,
  },
  natureDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  natureNameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  natureEffectPills: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  natureBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  natureBadgeBoost: {
    backgroundColor: '#4CAF5020',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  natureBadgeHinder: {
    backgroundColor: '#FF525220',
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  natureBadgeNeutral: {
    backgroundColor: '#A0AEC020',
    borderWidth: 1,
    borderColor: '#A0AEC0',
  },
  natureBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4CAF50',
  },
  natureBadgeNeutralText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A0AEC0',
  },
  summaryCard: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryBigVal: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  evProgressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  evProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  evRemainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  evRemainingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  evOverLimitWarning: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5252',
  },
  presetsSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  presetsScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetChipTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  presetChipDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  ivPresetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  ivPresetsButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  ivPresetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  ivPresetText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  statRowCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  statRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statLabelText: {
    fontSize: 14,
    fontWeight: '800',
  },
  miniNatureBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  miniNatureBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statBaseText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statFinalValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  statBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rangeInfoRow: {
    marginBottom: 8,
  },
  rangeInfoText: {
    fontSize: 10,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#A0AEC030',
  },
  controlBox: {
    flex: 1,
  },
  controlLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepperMini: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperMiniBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperMiniInput: {
    width: 32,
    height: 24,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 3,
    padding: 0,
  },
  quickEvButtonsCol: {
    flexDirection: 'row',
    gap: 4,
    alignSelf: 'flex-end',
  },
  quickEvPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A0AEC040',
  },
  quickEvPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  pokemonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  miniSprite: {
    width: 40,
    height: 40,
  },
  modalDexNum: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalPokemonName: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalTypePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalTypePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  natureListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  natureListName: {
    fontSize: 15,
    fontWeight: '600',
  },
});
