import React, { useState, useMemo, useCallback } from 'react';
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
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { pokemonIndex } from '../data/pokemonIndex';
import { calculatePokemonStats, NATURES } from '../utils/statCalculator';
import {
  COMPETITIVE_MOVES,
  WEATHERS,
  TERRAINS,
  ATTACKER_ITEMS,
  DEFENDER_ITEMS,
  TYPE_COLORS,
  ALL_POKEMON_TYPES,
  calculateBattleDamage,
  calculateDefenderTypeMatrix,
} from '../utils/battleCalculator';

const { width } = Dimensions.get('window');

export const BattleCalculatorScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { teams } = useTeam();

  // ── Initial Pokémon Setup ───────────────────────────────────────────────────
  // Attacker defaults to Charizard (#6) or route param
  const initialAttackerPokemon = route.params?.attacker || pokemonIndex.find(p => p.id === 6) || pokemonIndex[0];
  // Defender defaults to Blastoise (#9) or Venusaur (#3)
  const initialDefenderPokemon = route.params?.defender || pokemonIndex.find(p => p.id === 9) || pokemonIndex[1];

  const [attackerPoke, setAttackerPoke] = useState(initialAttackerPokemon);
  const [attackerLevel, setAttackerLevel] = useState(100);
  const [attackerNature, setAttackerNature] = useState('Adamant');
  const [attackerItem, setAttackerItem] = useState('life-orb');
  const [attackerAbility, setAttackerAbility] = useState('none');
  const [attackerStage, setAttackerStage] = useState(0); // -6 to +6
  const [attackerEvs, setAttackerEvs] = useState({ hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 });
  const [attackerIvs, setAttackerIvs] = useState({ hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 });

  const [defenderPoke, setDefenderPoke] = useState(initialDefenderPokemon);
  const [defenderLevel, setDefenderLevel] = useState(100);
  const [defenderNature, setDefenderNature] = useState('Bold');
  const [defenderItem, setDefenderItem] = useState('leftovers');
  const [defenderAbility, setDefenderAbility] = useState('none');
  const [defenderStage, setDefenderStage] = useState(0); // -6 to +6
  const [defenderEvs, setDefenderEvs] = useState({ hp: 252, attack: 0, defense: 252, spAtk: 0, spDef: 4, speed: 0 });
  const [defenderIvs, setDefenderIvs] = useState({ hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 });

  // ── Move Configuration ──────────────────────────────────────────────────────
  const [selectedMove, setSelectedMove] = useState(COMPETITIVE_MOVES[10]); // Flare Blitz by default
  const [customMovePower, setCustomMovePower] = useState('100');
  const [customMoveType, setCustomMoveType] = useState('fire');
  const [customMoveCategory, setCustomMoveCategory] = useState('physical');
  const [isCustomMove, setIsCustomMove] = useState(false);

  // ── Battle Environment Conditions ───────────────────────────────────────────
  const [weather, setWeather] = useState('none');
  const [terrain, setTerrain] = useState('none');
  const [isCrit, setIsCrit] = useState(false);
  const [isBurned, setIsBurned] = useState(false);
  const [hasReflect, setHasReflect] = useState(false);
  const [hasLightScreen, setHasLightScreen] = useState(false);
  const [isDoubles, setIsDoubles] = useState(false);

  // ── Modal Pickers ───────────────────────────────────────────────────────────
  const [pokemonPickerTarget, setPokemonPickerTarget] = useState(null); // 'attacker' | 'defender'
  const [pokemonSearch, setPokemonSearch] = useState('');
  const [isMovePickerOpen, setIsMovePickerOpen] = useState(false);
  const [moveSearch, setMoveSearch] = useState('');
  const [moveTypeFilter, setMoveTypeFilter] = useState('all');
  const [isTeamPickerOpen, setIsTeamPickerOpen] = useState(false);
  const [teamPickerTarget, setTeamPickerTarget] = useState('attacker');

  // ── Compute Active Stats for Attacker & Defender ────────────────────────────
  const attackerStats = useMemo(() => {
    return calculatePokemonStats({
      baseStats: {
        hp: attackerPoke.hp,
        attack: attackerPoke.attack,
        defense: attackerPoke.defense,
        spAtk: attackerPoke.spAtk,
        spDef: attackerPoke.spDef,
        speed: attackerPoke.speed,
      },
      ivs: attackerIvs,
      evs: attackerEvs,
      level: attackerLevel,
      nature: attackerNature,
    });
  }, [attackerPoke, attackerIvs, attackerEvs, attackerLevel, attackerNature]);

  const defenderStats = useMemo(() => {
    return calculatePokemonStats({
      baseStats: {
        hp: defenderPoke.hp,
        attack: defenderPoke.attack,
        defense: defenderPoke.defense,
        spAtk: defenderPoke.spAtk,
        spDef: defenderPoke.spDef,
        speed: defenderPoke.speed,
      },
      ivs: defenderIvs,
      evs: defenderEvs,
      level: defenderLevel,
      nature: defenderNature,
    });
  }, [defenderPoke, defenderIvs, defenderEvs, defenderLevel, defenderNature]);

  // Active Move object
  const activeMove = useMemo(() => {
    if (isCustomMove) {
      return {
        name: 'Custom Move',
        type: customMoveType,
        category: customMoveCategory,
        power: Math.max(1, parseInt(customMovePower, 10) || 50),
      };
    }
    return selectedMove;
  }, [isCustomMove, customMovePower, customMoveType, customMoveCategory, selectedMove]);

  // ── Run Damage Calculation ──────────────────────────────────────────────────
  const battleResult = useMemo(() => {
    return calculateBattleDamage({
      attacker: {
        id: attackerPoke.id,
        name: attackerPoke.name,
        types: attackerPoke.types,
        stats: attackerStats,
        level: attackerLevel,
      },
      defender: {
        id: defenderPoke.id,
        name: defenderPoke.name,
        types: defenderPoke.types,
        stats: defenderStats,
        level: defenderLevel,
      },
      move: activeMove,
      attackerStage,
      defenderStage,
      isCrit,
      weather,
      terrain,
      attackerItem,
      defenderItem,
      attackerAbility,
      defenderAbility,
      isBurned,
      hasReflect,
      hasLightScreen,
      isDoubles,
    });
  }, [
    attackerPoke,
    defenderPoke,
    attackerStats,
    defenderStats,
    attackerLevel,
    defenderLevel,
    activeMove,
    attackerStage,
    defenderStage,
    isCrit,
    weather,
    terrain,
    attackerItem,
    defenderItem,
    attackerAbility,
    defenderAbility,
    isBurned,
    hasReflect,
    hasLightScreen,
    isDoubles,
  ]);

  // ── Compute 18-Type Matchup Matrix for Defender ─────────────────────────────
  const typeMatrix = useMemo(() => {
    return calculateDefenderTypeMatrix(defenderPoke.types, defenderAbility);
  }, [defenderPoke.types, defenderAbility]);

  // ── Quick Swap Roles (Attacker <-> Defender) ────────────────────────────────
  const handleSwapRoles = useCallback(() => {
    const tempPoke = attackerPoke;
    const tempLvl = attackerLevel;
    const tempNature = attackerNature;
    const tempItem = attackerItem;
    const tempAbility = attackerAbility;
    const tempEvs = attackerEvs;
    const tempIvs = attackerIvs;
    const tempStage = attackerStage;

    setAttackerPoke(defenderPoke);
    setAttackerLevel(defenderLevel);
    setAttackerNature(defenderNature);
    setAttackerItem(defenderItem === 'assault-vest' ? 'choice-specs' : defenderItem === 'eviolite' ? 'none' : defenderItem);
    setAttackerAbility(defenderAbility);
    setAttackerEvs(defenderEvs);
    setAttackerIvs(defenderIvs);
    setAttackerStage(defenderStage);

    setDefenderPoke(tempPoke);
    setDefenderLevel(tempLvl);
    setDefenderNature(tempNature);
    setDefenderItem(tempItem === 'choice-band' || tempItem === 'choice-specs' ? 'leftovers' : tempItem);
    setDefenderAbility(tempAbility);
    setDefenderEvs(tempEvs);
    setDefenderIvs(tempIvs);
    setDefenderStage(tempStage);
  }, [
    attackerPoke, attackerLevel, attackerNature, attackerItem, attackerAbility, attackerEvs, attackerIvs, attackerStage,
    defenderPoke, defenderLevel, defenderNature, defenderItem, defenderAbility, defenderEvs, defenderIvs, defenderStage
  ]);

  // Filtered Pokémon list for modal
  const filteredPokemon = useMemo(() => {
    if (!pokemonSearch.trim()) return pokemonIndex.slice(0, 40);
    const q = pokemonSearch.toLowerCase().trim();
    return pokemonIndex.filter(p => p.name.toLowerCase().includes(q) || String(p.id).includes(q)).slice(0, 50);
  }, [pokemonSearch]);

  // Filtered moves list for modal
  const filteredMoves = useMemo(() => {
    return COMPETITIVE_MOVES.filter(m => {
      if (moveTypeFilter !== 'all' && m.type.toLowerCase() !== moveTypeFilter) return false;
      if (moveSearch.trim()) {
        const q = moveSearch.toLowerCase().trim();
        return m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [moveSearch, moveTypeFilter]);

  // HP Bar color based on remaining defender HP percentage
  const remainingHpPercent = Math.max(0, 100 - battleResult.maxPercent);
  const hpBarColor =
    remainingHpPercent > 50 ? '#4CAF50' : remainingHpPercent > 20 ? '#FFCB05' : '#FF5252';

  const attackerArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${attackerPoke.id}.png`;
  const defenderArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${defenderPoke.id}.png`;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Duel Arena Header (Attacker VS Defender) ── */}
        <View style={[styles.arenaCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {/* Attacker Col */}
          <TouchableOpacity
            style={styles.combatantCol}
            activeOpacity={0.8}
            onPress={() => setPokemonPickerTarget('attacker')}
          >
            <View style={[styles.roleBadge, { backgroundColor: '#FF7A0022', borderColor: '#FF7A00' }]}>
              <Text style={[styles.roleBadgeText, { color: '#FF7A00' }]}>ATTACKER</Text>
            </View>
            <Image source={{ uri: attackerArtwork }} style={styles.combatantImg} resizeMode="contain" />
            <Text numberOfLines={1} style={[styles.combatantName, { color: theme.colors.text }]}>
              {attackerPoke.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
            <View style={styles.typesRow}>
              {attackerPoke.types.map(t => (
                <View key={`att-${t}`} style={[styles.miniTypePill, { backgroundColor: TYPE_COLORS[t.toLowerCase()] || '#888' }]}>
                  <Text style={styles.miniTypePillText}>{t.toUpperCase()}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.combatantSub, { color: theme.colors.textSecondary }]}>
              Lvl {attackerLevel} • {attackerNature}
            </Text>
          </TouchableOpacity>

          {/* Center VS & Quick Swap */}
          <View style={styles.arenaCenter}>
            <TouchableOpacity
              style={[styles.swapBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleSwapRoles}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.vsText, { color: theme.colors.textSecondary }]}>VS</Text>
            {battleResult.speedAdvantage === 'attacker' ? (
              <View style={[styles.speedBadge, { backgroundColor: '#00D2D31C', borderColor: '#00D2D3' }]}>
                <Ionicons name="flash" size={12} color="#00D2D3" />
                <Text style={[styles.speedBadgeText, { color: '#00D2D3' }]}>Attacker 1st</Text>
              </View>
            ) : battleResult.speedAdvantage === 'defender' ? (
              <View style={[styles.speedBadge, { backgroundColor: '#FF7A001C', borderColor: '#FF7A00' }]}>
                <Ionicons name="flash" size={12} color="#FF7A00" />
                <Text style={[styles.speedBadgeText, { color: '#FF7A00' }]}>Defender 1st</Text>
              </View>
            ) : (
              <Text style={[styles.speedTieText, { color: theme.colors.textSecondary }]}>Speed Tie</Text>
            )}
          </View>

          {/* Defender Col */}
          <TouchableOpacity
            style={styles.combatantCol}
            activeOpacity={0.8}
            onPress={() => setPokemonPickerTarget('defender')}
          >
            <View style={[styles.roleBadge, { backgroundColor: '#4D62E822', borderColor: '#4D62E8' }]}>
              <Text style={[styles.roleBadgeText, { color: '#4D62E8' }]}>DEFENDER</Text>
            </View>
            <Image source={{ uri: defenderArtwork }} style={styles.combatantImg} resizeMode="contain" />
            <Text numberOfLines={1} style={[styles.combatantName, { color: theme.colors.text }]}>
              {defenderPoke.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
            <View style={styles.typesRow}>
              {defenderPoke.types.map(t => (
                <View key={`def-${t}`} style={[styles.miniTypePill, { backgroundColor: TYPE_COLORS[t.toLowerCase()] || '#888' }]}>
                  <Text style={styles.miniTypePillText}>{t.toUpperCase()}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.combatantSub, { color: theme.colors.textSecondary }]}>
              Lvl {defenderLevel} • {defenderNature}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 2. Damage Verdict Dashboard (Hero Card) ── */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={[styles.heroSubHeader, { color: theme.colors.textSecondary }]}>ESTIMATED DAMAGE</Text>
              <Text style={[styles.heroDamageRange, { color: theme.colors.text }]}>
                {battleResult.minPercent}% - {battleResult.maxPercent}%
              </Text>
            </View>
            <View
              style={[
                styles.verdictBadge,
                {
                  backgroundColor:
                    battleResult.minPercent >= 100
                      ? '#E53935'
                      : battleResult.maxPercent >= 100
                      ? '#FF9800'
                      : '#388E3C',
                },
              ]}
            >
              <Text style={styles.verdictBadgeText}>{battleResult.koDescription}</Text>
            </View>
          </View>

          {/* Damage in HP */}
          <Text style={[styles.hpNumbersText, { color: theme.colors.textSecondary }]}>
            Deals <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{battleResult.minDamage} - {battleResult.maxDamage} HP</Text> (Defender Max HP: {battleResult.defenderMaxHp})
          </Text>

          {/* Dynamic Interactive HP Gauge */}
          <View style={styles.hpBarTrack}>
            <View
              style={[
                styles.hpBarDamage,
                {
                  width: `${Math.min(100, battleResult.maxPercent)}%`,
                  backgroundColor: '#E5393588',
                },
              ]}
            />
            <View
              style={[
                styles.hpBarFill,
                {
                  width: `${remainingHpPercent}%`,
                  backgroundColor: hpBarColor,
                },
              ]}
            />
          </View>
          <View style={styles.hpBarLabels}>
            <Text style={[styles.hpBarStatusText, { color: hpBarColor }]}>
              Remaining HP: ~{remainingHpPercent.toFixed(1)}%
            </Text>
            <Text style={[styles.hpBarStatusText, { color: theme.colors.textSecondary }]}>
              Hits to KO: {battleResult.hitsToKo ? `${battleResult.hitsToKo} Hit${battleResult.hitsToKo > 1 ? 's' : ''}` : 'N/A'}
            </Text>
          </View>

          {/* Battle Modifiers Pill Row */}
          <View style={styles.modifierPillsWrap}>
            {battleResult.isStab && (
              <View style={[styles.modPill, { backgroundColor: '#4CAF501C', borderColor: '#4CAF50' }]}>
                <Text style={[styles.modPillText, { color: '#4CAF50' }]}>STAB (1.5×)</Text>
              </View>
            )}
            {battleResult.effectiveness >= 2 && (
              <View style={[styles.modPill, { backgroundColor: '#E539351C', borderColor: '#E53935' }]}>
                <Text style={[styles.modPillText, { color: '#E53935' }]}>Super Effective ({battleResult.effectiveness}×)</Text>
              </View>
            )}
            {battleResult.effectiveness < 1 && battleResult.effectiveness > 0 && (
              <View style={[styles.modPill, { backgroundColor: '#78909C1C', borderColor: '#78909C' }]}>
                <Text style={[styles.modPillText, { color: '#78909C' }]}>Resisted ({battleResult.effectiveness}×)</Text>
              </View>
            )}
            {battleResult.effectiveness === 0 && (
              <View style={[styles.modPill, { backgroundColor: '#4242421C', borderColor: '#424242' }]}>
                <Text style={[styles.modPillText, { color: '#B0BEC5' }]}>Immune (0×)</Text>
              </View>
            )}
            {isCrit && (
              <View style={[styles.modPill, { backgroundColor: '#FFD7001C', borderColor: '#FFD700' }]}>
                <Text style={[styles.modPillText, { color: '#FFD700' }]}>Critical Hit (1.5×)</Text>
              </View>
            )}
            {weather !== 'none' && (
              <View style={[styles.modPill, { backgroundColor: `${WEATHERS.find(w => w.id === weather)?.color || '#999'}1C`, borderColor: WEATHERS.find(w => w.id === weather)?.color || '#999' }]}>
                <Text style={[styles.modPillText, { color: WEATHERS.find(w => w.id === weather)?.color || '#999' }]}>
                  {WEATHERS.find(w => w.id === weather)?.name}
                </Text>
              </View>
            )}
            {terrain !== 'none' && (
              <View style={[styles.modPill, { backgroundColor: `${TERRAINS.find(t => t.id === terrain)?.color || '#999'}1C`, borderColor: TERRAINS.find(t => t.id === terrain)?.color || '#999' }]}>
                <Text style={[styles.modPillText, { color: TERRAINS.find(t => t.id === terrain)?.color || '#999' }]}>
                  {TERRAINS.find(t => t.id === terrain)?.name} Terrain
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── 3. Move Selection & Stat Stages ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>MOVE & STAT STAGES</Text>
          <TouchableOpacity onPress={() => setIsCustomMove(!isCustomMove)}>
            <Text style={[styles.toggleCustomText, { color: theme.colors.primary }]}>
              {isCustomMove ? 'Choose from Database' : 'Custom Move'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {isCustomMove ? (
            <View style={styles.customMoveForm}>
              <View style={styles.inputRow}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Move Power</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  keyboardType="numeric"
                  value={customMovePower}
                  onChangeText={setCustomMovePower}
                  maxLength={3}
                />
              </View>

              <View style={styles.customTypeSelectRow}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Type: {customMoveType.toUpperCase()}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  {ALL_POKEMON_TYPES.map(t => (
                    <TouchableOpacity
                      key={`custom-type-${t}`}
                      style={[
                        styles.chipBtn,
                        { backgroundColor: TYPE_COLORS[t] },
                        customMoveType === t && { borderWidth: 2, borderColor: '#FFFFFF' }
                      ]}
                      onPress={() => setCustomMoveType(t)}
                    >
                      <Text style={styles.chipBtnText}>{t.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.categoryRow}>
                <TouchableOpacity
                  style={[
                    styles.catBtn,
                    customMoveCategory === 'physical' && { backgroundColor: '#FF7A00', borderColor: '#FF7A00' },
                    { borderColor: theme.colors.border }
                  ]}
                  onPress={() => setCustomMoveCategory('physical')}
                >
                  <Text style={[styles.catBtnText, customMoveCategory === 'physical' && { color: '#FFF' }]}>PHYSICAL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.catBtn,
                    customMoveCategory === 'special' && { backgroundColor: '#4D62E8', borderColor: '#4D62E8' },
                    { borderColor: theme.colors.border }
                  ]}
                  onPress={() => setCustomMoveCategory('special')}
                >
                  <Text style={[styles.catBtnText, customMoveCategory === 'special' && { color: '#FFF' }]}>SPECIAL</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.moveSelectorCard}
              onPress={() => setIsMovePickerOpen(true)}
              activeOpacity={0.8}
            >
              <View style={styles.moveSelectorLeft}>
                <View style={[styles.moveTypeBadge, { backgroundColor: TYPE_COLORS[activeMove.type] || '#888' }]}>
                  <Text style={styles.moveTypeBadgeText}>{activeMove.type.toUpperCase()}</Text>
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.selectedMoveName, { color: theme.colors.text }]}>{activeMove.name}</Text>
                  <Text style={[styles.selectedMoveMeta, { color: theme.colors.textSecondary }]}>
                    {activeMove.category.toUpperCase()} • Base Power: {activeMove.power}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Stat Stages Row (-6 to +6) */}
          <View style={[styles.stagesRow, { borderTopColor: theme.colors.border }]}>
            <View style={styles.stageBox}>
              <Text style={[styles.stageBoxLabel, { color: theme.colors.textSecondary }]}>
                Attacker {activeMove.category === 'physical' ? 'Atk' : 'SpA'} Stage
              </Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: theme.colors.background }]}
                  onPress={() => setAttackerStage(Math.max(-6, attackerStage - 1))}
                >
                  <Ionicons name="remove" size={16} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.stageValue, { color: attackerStage > 0 ? '#4CAF50' : attackerStage < 0 ? '#FF5252' : theme.colors.text }]}>
                  {attackerStage > 0 ? `+${attackerStage}` : attackerStage}
                </Text>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: theme.colors.background }]}
                  onPress={() => setAttackerStage(Math.min(6, attackerStage + 1))}
                >
                  <Ionicons name="add" size={16} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.stageDivider} />

            <View style={styles.stageBox}>
              <Text style={[styles.stageBoxLabel, { color: theme.colors.textSecondary }]}>
                Defender {activeMove.category === 'physical' ? 'Def' : 'SpD'} Stage
              </Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: theme.colors.background }]}
                  onPress={() => setDefenderStage(Math.max(-6, defenderStage - 1))}
                >
                  <Ionicons name="remove" size={16} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.stageValue, { color: defenderStage > 0 ? '#4CAF50' : defenderStage < 0 ? '#FF5252' : theme.colors.text }]}>
                  {defenderStage > 0 ? `+${defenderStage}` : defenderStage}
                </Text>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: theme.colors.background }]}
                  onPress={() => setDefenderStage(Math.min(6, defenderStage + 1))}
                >
                  <Ionicons name="add" size={16} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ── 4. Full 18-Type Matchup Matrix for Defender ── */}
        <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
          DEFENDER TYPE WEAKNESSES & RESISTANCES
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardSubText, { color: theme.colors.textSecondary }]}>
            How incoming move types interact with {defenderPoke.name.toUpperCase()}'s typing:
          </Text>

          {/* 4x Ultra Weak */}
          {typeMatrix.superSuperEffective.length > 0 && (
            <View style={styles.matrixRow}>
              <View style={[styles.matrixBadge, { backgroundColor: '#B71C1C' }]}>
                <Text style={styles.matrixBadgeText}>4×</Text>
              </View>
              <View style={styles.matrixChipsList}>
                {typeMatrix.superSuperEffective.map(({ type }) => (
                  <View key={`4x-${type}`} style={[styles.typeChip, { backgroundColor: TYPE_COLORS[type] }]}>
                    <Text style={styles.typeChipText}>{type.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 2x Weak */}
          {typeMatrix.superEffective.length > 0 && (
            <View style={styles.matrixRow}>
              <View style={[styles.matrixBadge, { backgroundColor: '#E53935' }]}>
                <Text style={styles.matrixBadgeText}>2×</Text>
              </View>
              <View style={styles.matrixChipsList}>
                {typeMatrix.superEffective.map(({ type }) => (
                  <View key={`2x-${type}`} style={[styles.typeChip, { backgroundColor: TYPE_COLORS[type] }]}>
                    <Text style={styles.typeChipText}>{type.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 0.5x Resisted */}
          {typeMatrix.resisted.length > 0 && (
            <View style={styles.matrixRow}>
              <View style={[styles.matrixBadge, { backgroundColor: '#43A047' }]}>
                <Text style={styles.matrixBadgeText}>½×</Text>
              </View>
              <View style={styles.matrixChipsList}>
                {typeMatrix.resisted.map(({ type }) => (
                  <View key={`half-${type}`} style={[styles.typeChip, { backgroundColor: TYPE_COLORS[type] }]}>
                    <Text style={styles.typeChipText}>{type.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 0.25x Double Resisted */}
          {typeMatrix.doubleResisted.length > 0 && (
            <View style={styles.matrixRow}>
              <View style={[styles.matrixBadge, { backgroundColor: '#1B5E20' }]}>
                <Text style={styles.matrixBadgeText}>¼×</Text>
              </View>
              <View style={styles.matrixChipsList}>
                {typeMatrix.doubleResisted.map(({ type }) => (
                  <View key={`quart-${type}`} style={[styles.typeChip, { backgroundColor: TYPE_COLORS[type] }]}>
                    <Text style={styles.typeChipText}>{type.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 0x Immune */}
          {typeMatrix.immune.length > 0 && (
            <View style={styles.matrixRow}>
              <View style={[styles.matrixBadge, { backgroundColor: '#37474F' }]}>
                <Text style={styles.matrixBadgeText}>0×</Text>
              </View>
              <View style={styles.matrixChipsList}>
                {typeMatrix.immune.map(({ type }) => (
                  <View key={`0x-${type}`} style={[styles.typeChip, { backgroundColor: TYPE_COLORS[type] }]}>
                    <Text style={styles.typeChipText}>{type.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── 5. Field & Battle Modifiers ── */}
        <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
          FIELD CONDITIONS & WEATHER
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {/* Weather Selector */}
          <Text style={[styles.subLabel, { color: theme.colors.text }]}>Active Weather</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weatherScroll}>
            {WEATHERS.map(w => {
              const active = weather === w.id;
              return (
                <TouchableOpacity
                  key={`w-${w.id}`}
                  style={[
                    styles.envChip,
                    {
                      backgroundColor: active ? w.color : theme.colors.background,
                      borderColor: active ? w.color : theme.colors.border,
                    },
                  ]}
                  onPress={() => setWeather(w.id)}
                >
                  <Ionicons name={w.icon} size={14} color={active ? '#000000' : theme.colors.text} />
                  <Text style={[styles.envChipText, { color: active ? '#000000' : theme.colors.text, fontWeight: active ? '800' : '500' }]}>
                    {w.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Terrain Selector */}
          <Text style={[styles.subLabel, { color: theme.colors.text, marginTop: 14 }]}>Active Terrain</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weatherScroll}>
            {TERRAINS.map(t => {
              const active = terrain === t.id;
              return (
                <TouchableOpacity
                  key={`t-${t.id}`}
                  style={[
                    styles.envChip,
                    {
                      backgroundColor: active ? t.color : theme.colors.background,
                      borderColor: active ? t.color : theme.colors.border,
                    },
                  ]}
                  onPress={() => setTerrain(t.id)}
                >
                  <Ionicons name={t.icon} size={14} color={active ? '#000000' : theme.colors.text} />
                  <Text style={[styles.envChipText, { color: active ? '#000000' : theme.colors.text, fontWeight: active ? '800' : '500' }]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Toggle Switches */}
          <View style={[styles.switchesGrid, { borderTopColor: theme.colors.border }]}>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Critical Hit (1.5×)</Text>
              <Switch value={isCrit} onValueChange={setIsCrit} trackColor={{ true: theme.colors.primary }} />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Attacker is Burned</Text>
              <Switch value={isBurned} onValueChange={setIsBurned} trackColor={{ true: '#FF7A00' }} />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Reflect Active (Physical)</Text>
              <Switch value={hasReflect} onValueChange={setHasReflect} trackColor={{ true: '#F85888' }} />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Light Screen (Special)</Text>
              <Switch value={hasLightScreen} onValueChange={setHasLightScreen} trackColor={{ true: '#4D62E8' }} />
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Doubles Format (Spread 0.75×)</Text>
              <Switch value={isDoubles} onValueChange={setIsDoubles} trackColor={{ true: theme.colors.primary }} />
            </View>
          </View>
        </View>

        {/* ── 6. Advanced Equipment & Builds (Items, Levels, Natures) ── */}
        <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
          COMBATANT BUILDS & ITEMS
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {/* Attacker Item */}
          <View style={styles.buildRow}>
            <Text style={[styles.buildTitle, { color: theme.colors.text }]}>Attacker Item</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              {ATTACKER_ITEMS.map(item => {
                const isSelected = attackerItem === item.id;
                return (
                  <TouchableOpacity
                    key={`ai-${item.id}`}
                    style={[
                      styles.itemChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.background,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setAttackerItem(item.id)}
                  >
                    <Text style={[styles.itemChipText, { color: isSelected ? '#FFFFFF' : theme.colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Defender Item */}
          <View style={[styles.buildRow, { marginTop: 14 }]}>
            <Text style={[styles.buildTitle, { color: theme.colors.text }]}>Defender Item</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              {DEFENDER_ITEMS.map(item => {
                const isSelected = defenderItem === item.id;
                return (
                  <TouchableOpacity
                    key={`di-${item.id}`}
                    style={[
                      styles.itemChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.background,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setDefenderItem(item.id)}
                  >
                    <Text style={[styles.itemChipText, { color: isSelected ? '#FFFFFF' : theme.colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Level Toggles (50 / 100) */}
          <View style={[styles.levelPresetRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.buildTitle, { color: theme.colors.text }]}>Standard Level Presets</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[
                  styles.lvlBtn,
                  attackerLevel === 50 && defenderLevel === 50 && { backgroundColor: theme.colors.primary },
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => {
                  setAttackerLevel(50);
                  setDefenderLevel(50);
                }}
              >
                <Text style={[styles.lvlBtnText, attackerLevel === 50 && { color: '#FFFFFF' }]}>Level 50 (VGC)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.lvlBtn,
                  attackerLevel === 100 && defenderLevel === 100 && { backgroundColor: theme.colors.primary },
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => {
                  setAttackerLevel(100);
                  setDefenderLevel(100);
                }}
              >
                <Text style={[styles.lvlBtnText, attackerLevel === 100 && { color: '#FFFFFF' }]}>Level 100 (Smogon)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Load from Saved Teams */}
          {teams && teams.length > 0 && (
            <View style={[styles.teamLoadSection, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.buildTitle, { color: theme.colors.text }]}>Load from Saved Teams</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.teamLoadBtn, { backgroundColor: '#FF7A0018', borderColor: '#FF7A00' }]}
                  onPress={() => {
                    setTeamPickerTarget('attacker');
                    setIsTeamPickerOpen(true);
                  }}
                >
                  <Ionicons name="folder-open-outline" size={16} color="#FF7A00" />
                  <Text style={[styles.teamLoadBtnText, { color: '#FF7A00' }]}>Load Attacker</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.teamLoadBtn, { backgroundColor: '#4D62E818', borderColor: '#4D62E8' }]}
                  onPress={() => {
                    setTeamPickerTarget('defender');
                    setIsTeamPickerOpen(true);
                  }}
                >
                  <Ionicons name="shield-outline" size={16} color="#4D62E8" />
                  <Text style={[styles.teamLoadBtnText, { color: '#4D62E8' }]}>Load Defender</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Modal: Pokémon Picker ── */}
      <Modal visible={Boolean(pokemonPickerTarget)} animationType="slide">
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalHeading, { color: theme.colors.text }]}>
              Select {pokemonPickerTarget === 'attacker' ? 'Attacker' : 'Defender'}
            </Text>
            <TouchableOpacity onPress={() => setPokemonPickerTarget(null)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={[styles.modalSearchBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.modalSearchInput, { color: theme.colors.text }]}
              placeholder="Search by Pokémon name or number..."
              placeholderTextColor={theme.colors.textSecondary}
              value={pokemonSearch}
              onChangeText={setPokemonSearch}
            />
            {pokemonSearch.length > 0 && (
              <TouchableOpacity onPress={() => setPokemonSearch('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredPokemon}
            keyExtractor={item => `pick-${item.id}-${item.name}`}
            renderItem={({ item }) => {
              const art = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;
              return (
                <TouchableOpacity
                  style={[styles.pokePickRow, { borderBottomColor: theme.colors.border }]}
                  onPress={() => {
                    if (pokemonPickerTarget === 'attacker') setAttackerPoke(item);
                    else setDefenderPoke(item);
                    setPokemonPickerTarget(null);
                  }}
                >
                  <Image source={{ uri: art }} style={styles.pokePickImg} resizeMode="contain" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.pokePickName, { color: theme.colors.text }]}>
                      {item.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                    <Text style={[styles.pokePickSub, { color: theme.colors.textSecondary }]}>
                      #{String(item.id).padStart(3, '0')} • BST: {item.total}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {item.types.map(t => (
                      <View key={`t-${t}`} style={[styles.miniTypePill, { backgroundColor: TYPE_COLORS[t.toLowerCase()] || '#888' }]}>
                        <Text style={styles.miniTypePillText}>{t.toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Modal: Move Picker ── */}
      <Modal visible={isMovePickerOpen} animationType="slide">
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalHeading, { color: theme.colors.text }]}>Select Competitive Move</Text>
            <TouchableOpacity onPress={() => setIsMovePickerOpen(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.modalSearchBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.modalSearchInput, { color: theme.colors.text }]}
              placeholder="Search move by name or type..."
              placeholderTextColor={theme.colors.textSecondary}
              value={moveSearch}
              onChangeText={setMoveSearch}
            />
          </View>

          {/* Type Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, paddingHorizontal: 16 }}>
            <TouchableOpacity
              style={[
                styles.moveFilterChip,
                moveTypeFilter === 'all' && { backgroundColor: theme.colors.primary },
                { borderColor: theme.colors.border }
              ]}
              onPress={() => setMoveTypeFilter('all')}
            >
              <Text style={[styles.moveFilterChipText, moveTypeFilter === 'all' && { color: '#FFF' }]}>ALL</Text>
            </TouchableOpacity>
            {ALL_POKEMON_TYPES.map(t => (
              <TouchableOpacity
                key={`mf-${t}`}
                style={[
                  styles.moveFilterChip,
                  moveTypeFilter === t && { backgroundColor: TYPE_COLORS[t] },
                  { borderColor: theme.colors.border }
                ]}
                onPress={() => setMoveTypeFilter(t)}
              >
                <Text style={[styles.moveFilterChipText, moveTypeFilter === t && { color: '#FFF' }]}>{t.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredMoves}
            keyExtractor={item => `move-${item.name}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.movePickRow, { borderBottomColor: theme.colors.border }]}
                onPress={() => {
                  setSelectedMove(item);
                  setIsCustomMove(false);
                  setIsMovePickerOpen(false);
                }}
              >
                <View style={[styles.moveTypeBadge, { backgroundColor: TYPE_COLORS[item.type] || '#888' }]}>
                  <Text style={styles.moveTypeBadgeText}>{item.type.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.selectedMoveName, { color: theme.colors.text }]}>{item.name}</Text>
                  <Text style={[styles.selectedMoveMeta, { color: theme.colors.textSecondary }]}>
                    {item.category.toUpperCase()} • Power: {item.power} • Acc: {item.accuracy}%
                  </Text>
                </View>
                <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Modal: Team Picker ── */}
      <Modal visible={isTeamPickerOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setIsTeamPickerOpen(false)}>
          <View style={[styles.teamPickerModal, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalHeading, { color: theme.colors.text }]}>
                Choose Team Member for {teamPickerTarget.toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => setIsTeamPickerOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              {teams.map(team => (
                <View key={team.id} style={styles.teamGroup}>
                  <Text style={[styles.teamGroupName, { color: theme.colors.primary }]}>{team.name} ({team.playStyle})</Text>
                  {team.members.length === 0 ? (
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12, paddingVertical: 4 }}>No Pokémon in this team</Text>
                  ) : (
                    team.members.map(member => {
                      const match = pokemonIndex.find(p => p.id === member.id || p.name.toLowerCase() === member.name.toLowerCase());
                      if (!match) return null;
                      return (
                        <TouchableOpacity
                          key={`tm-${team.id}-${member.id}`}
                          style={[styles.teamMemberRow, { borderBottomColor: theme.colors.border }]}
                          onPress={() => {
                            if (teamPickerTarget === 'attacker') setAttackerPoke(match);
                            else setDefenderPoke(match);
                            setIsTeamPickerOpen(false);
                          }}
                        >
                          <Text style={[styles.teamMemberName, { color: theme.colors.text }]}>
                            {match.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 4 }}>
                            {match.types.map(t => (
                              <View key={`tt-${t}`} style={[styles.miniTypePill, { backgroundColor: TYPE_COLORS[t.toLowerCase()] || '#888' }]}>
                                <Text style={styles.miniTypePillText}>{t.toUpperCase()}</Text>
                              </View>
                            ))}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  arenaCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  combatantCol: {
    flex: 1,
    alignItems: 'center',
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  combatantImg: {
    width: 80,
    height: 80,
  },
  combatantName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  typesRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  miniTypePill: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  miniTypePillText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  combatantSub: {
    fontSize: 11,
    marginTop: 4,
  },
  arenaCenter: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  swapBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  speedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  speedTieText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 6,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 14,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroSubHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroDamageRange: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  verdictBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 160,
  },
  verdictBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  hpNumbersText: {
    fontSize: 12,
    marginTop: 8,
  },
  hpBarTrack: {
    height: 12,
    backgroundColor: '#E0E0E033',
    borderRadius: 6,
    marginTop: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  hpBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 6,
    zIndex: 2,
  },
  hpBarDamage: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 6,
    zIndex: 1,
  },
  hpBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  hpBarStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modifierPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  modPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  toggleCustomText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardSubText: {
    fontSize: 12,
    marginBottom: 10,
  },
  moveSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  moveSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moveTypeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moveTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  selectedMoveName: {
    fontSize: 15,
    fontWeight: '700',
  },
  selectedMoveMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  customMoveForm: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'center',
    fontWeight: '700',
  },
  customTypeSelectRow: {
    marginTop: 4,
  },
  chipBtn: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  chipBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  catBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  catBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#718096',
  },
  stagesRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  stageBox: {
    flex: 1,
    alignItems: 'center',
  },
  stageDivider: {
    width: 1,
    backgroundColor: '#E0E0E044',
  },
  stageBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageValue: {
    fontSize: 14,
    fontWeight: '900',
    minWidth: 26,
    textAlign: 'center',
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  matrixBadge: {
    width: 32,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  matrixBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  matrixChipsList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeChip: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeChipText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  weatherScroll: {
    gap: 8,
    marginTop: 6,
  },
  envChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  envChipText: {
    fontSize: 11,
  },
  switchesGrid: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 14,
    gap: 6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  buildRow: {
    marginTop: 4,
  },
  buildTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  itemChipText: {
    fontSize: 11,
  },
  levelPresetRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lvlBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  lvlBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  teamLoadSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 14,
  },
  teamLoadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
  },
  teamLoadBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    margin: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
  },
  pokePickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  pokePickImg: {
    width: 44,
    height: 44,
  },
  pokePickName: {
    fontSize: 14,
    fontWeight: '700',
  },
  pokePickSub: {
    fontSize: 11,
    marginTop: 2,
  },
  moveFilterChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  moveFilterChipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  movePickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  teamPickerModal: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    elevation: 6,
  },
  teamGroup: {
    marginBottom: 14,
  },
  teamGroupName: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  teamMemberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  teamMemberName: {
    fontSize: 13,
    fontWeight: '600',
  },
});
