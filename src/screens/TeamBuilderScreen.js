import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { pokemonIndex } from '../data/pokemonIndex.js';
import {
  TYPE_COLORS,
  ALL_POKEMON_TYPES,
  PLAY_STYLES,
  PLAY_STYLE_ICONS,
  getPokemonAbilityInfo,
  getPokemonDefensiveMultipliers,
} from '../utils/teamUtils.js';
import { matchesPokemonSearch } from '../utils/searchUtils';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import {
  PikachuPattern,
  PikachuFace,
  PikachuBadge,
  EeveePattern,
  EeveeFace,
  EeveeBadge,
  ArceusBackground,
} from '../components';

const { width } = Dimensions.get('window');

const STAT_LABELS = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  spAtk: 'SpA',
  spDef: 'SpD',
  speed: 'Spe',
};

const STAT_COLORS = {
  hp: '#FF5252',
  attack: '#FF7A00',
  defense: '#FFCB05',
  spAtk: '#4D62E8',
  spDef: '#4CAF50',
  speed: '#00D2D3',
};

export const TeamBuilderScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const {
    teams,
    activeTeamId,
    activeTeam,
    team,
    selectTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    duplicateTeam,
    removeFromTeam,
    replaceTeamSlot,
    clearTeam,
    getTeamDefensiveCoverage,
    getTeamStats,
  } = useTeam();

  // Active bottom analysis tab: 'coverage' | 'stats' | 'abilities'
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('coverage');

  // Coverage filter toggle: 'all' | 'weaknesses' | 'resistances' | 'immunities'
  const [coverageFilter, setCoverageFilter] = useState('all');

  // Modals state
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [isPokemonPickerOpen, setIsPokemonPickerOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  // New team form inputs
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamPlayStyle, setNewTeamPlayStyle] = useState('Competitive');

  // Search in Pokémon Picker
  const [searchPickerText, setSearchPickerText] = useState('');
  const [selectedPickerType, setSelectedPickerType] = useState('all');

  // Export Shareable Image state
  const [isExporting, setIsExporting] = useState(false);
  const exportCardRef = useRef(null);

  // Data calculations
  const statsData = useMemo(() => getTeamStats(), [team]);
  const coverageData = useMemo(() => getTeamDefensiveCoverage(), [team]);

  // Navigate to Pokémon Details
  const navigateToDetails = (id, name) => {
    navigation.navigate('PokemonDetail', { id, name });
  };

  // Open Pokémon picker for a specific slot
  const handleOpenPickerForSlot = (slotIndex) => {
    setSelectedSlotIndex(slotIndex);
    setSearchPickerText('');
    setSelectedPickerType('all');
    setIsPokemonPickerOpen(true);
  };

  // Pick Pokémon into slot
  const handleSelectPokemonForSlot = async (selectedPokemon) => {
    if (selectedSlotIndex !== null) {
      await replaceTeamSlot(selectedSlotIndex, selectedPokemon);
    }
    setIsPokemonPickerOpen(false);
    setSelectedSlotIndex(null);
  };

  // Filtered Pokémon list for picker modal
  const filteredPickerPokemon = useMemo(() => {
    let list = pokemonIndex;
    if (selectedPickerType !== 'all') {
      list = list.filter(p => (p.types || []).some(t => t.toLowerCase() === selectedPickerType));
    }
    if (searchPickerText.trim()) {
      list = list.filter(p => matchesPokemonSearch(p, searchPickerText));
    }
    return list.slice(0, 100);
  }, [searchPickerText, selectedPickerType]);

  // Create new team handler
  const handleCreateTeamSubmit = async () => {
    if (!newTeamName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your team.');
      return;
    }
    await createTeam(newTeamName.trim(), newTeamPlayStyle);
    setNewTeamName('');
    setIsNewTeamModalOpen(false);
  };

  // Export team card as shareable image
  const handleExportTeamImage = async () => {
    if (team.length === 0) {
      Alert.alert('Empty Team', 'Add at least one Pokémon to your team before exporting.');
      return;
    }

    try {
      setIsExporting(true);
      // Wait one frame to ensure high-resolution layout is completely rendered
      await new Promise(r => setTimeout(r, 250));

      const uri = await captureRef(exportCardRef, {
        format: 'png',
        quality: 1.0,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Share ${activeTeam?.name || 'Pokémon Team'}`,
          UTI: 'public.png',
        });
      } else {
        await Share.share({
          message: `Check out my Pokémon team: ${activeTeam?.name} (${activeTeam?.playStyle})!\nMembers: ${team.map(p => p.name.toUpperCase()).join(', ')}`,
        });
      }
    } catch (error) {
      console.error('Error exporting team image:', error);
      Alert.alert('Export Notice', 'Unable to share image on this device. You can take a screenshot of your team card!');
    } finally {
      setIsExporting(false);
    }
  };

  // Render 6-slot grid
  const renderTeamSlots = () => {
    const slots = [];
    for (let i = 0; i < 6; i++) {
      const pokemon = team[i];
      if (pokemon) {
        const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
        const primaryType = pokemon.types?.[0] || 'normal';
        const cardBorderColor = TYPE_COLORS[primaryType.toLowerCase()] || theme.colors.border;
        const ability = getPokemonAbilityInfo(pokemon);

        slots.push(
          <View
            key={`slot-${pokemon.id}-${pokemon.name}-${i}`}
            style={[
              styles.slotCard,
              {
                backgroundColor: theme.dark ? '#1A1D24' : '#FFFFFF',
                borderColor: cardBorderColor,
                borderWidth: 1.5,
              },
            ]}
          >
            {/* Slot Index Tag */}
            <View style={[styles.slotIndexBadge, { backgroundColor: cardBorderColor }]}>
              <Text style={styles.slotIndexText}>#{i + 1}</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigateToDetails(pokemon.id, pokemon.name)}
              style={styles.slotPressArea}
              activeOpacity={0.7}
            >
              <Image source={{ uri: artworkUrl }} style={styles.slotImage} resizeMode="contain" />
              <View style={styles.slotInfo}>
                <Text numberOfLines={1} style={[styles.slotName, { color: theme.colors.text }]}>
                  {pokemon.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>

                <View style={styles.typesRow}>
                  {(pokemon.types || []).map((t, idx) => {
                    const tName = typeof t === 'string' ? t.toLowerCase() : (t?.name || 'normal').toLowerCase();
                    return (
                      <View key={`${tName}-${idx}`} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[tName] || '#888' }]}>
                        <Text style={styles.typeText}>{tName.toUpperCase()}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Quick stats mini row */}
                <View style={styles.slotMiniStatsRow}>
                  <Text style={[styles.slotBstText, { color: cardBorderColor }]}>
                    BST {pokemon.total || (pokemon.hp + pokemon.attack + pokemon.defense + pokemon.spAtk + pokemon.spDef + pokemon.speed) || '--'}
                  </Text>
                  <Text style={[styles.slotAbilityText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    · {ability.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Quick Actions (Replace & Remove) */}
            <View style={styles.slotActionsCol}>
              <TouchableOpacity
                onPress={() => handleOpenPickerForSlot(i)}
                style={[styles.slotActionBtn, { backgroundColor: theme.dark ? '#2A2E39' : '#EDF2F7' }]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="swap-horizontal" size={14} color={cardBorderColor} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeFromTeam(pokemon.id)}
                style={[styles.slotActionBtn, { backgroundColor: '#FF525215', marginTop: 6 }]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="trash-outline" size={14} color="#FF5252" />
              </TouchableOpacity>
            </View>
          </View>
        );
      } else {
        slots.push(
          <TouchableOpacity
            key={`empty-slot-${i}`}
            onPress={() => handleOpenPickerForSlot(i)}
            style={[
              styles.emptySlot,
              {
                backgroundColor: theme.dark ? '#161920' : '#F7FAFC',
                borderColor: theme.dark ? '#2D3748' : '#E2E8F0',
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={[styles.emptySlotIconWrap, { backgroundColor: theme.dark ? '#232936' : '#EDF2F7' }]}>
              {theme.isPikachu ? (
                <PikachuFace size={24} silhouette={true} silhouetteColor="rgba(225, 168, 0, 0.28)" />
              ) : theme.isEevee ? (
                <EeveeFace size={24} silhouette={true} silhouetteColor="rgba(166, 124, 82, 0.3)" showCollar={false} />
              ) : (
                <Ionicons name="add" size={24} color={theme.colors.primary} />
              )}
            </View>
            <Text style={[styles.emptySlotText, { color: theme.colors.text }]}>Add Pokémon</Text>
            <Text style={[styles.emptySlotSub, { color: theme.colors.textSecondary }]}>Slot #{i + 1}</Text>
          </TouchableOpacity>
        );
      }
    }
    return slots;
  };

  // Filtered coverage breakdown list
  const filteredCoverageBreakdown = useMemo(() => {
    if (!coverageData?.typeBreakdown) return [];
    if (coverageFilter === 'weaknesses') {
      return coverageData.typeBreakdown.filter(t => t.weakCount > 0);
    }
    if (coverageFilter === 'resistances') {
      return coverageData.typeBreakdown.filter(t => t.resistCount > 0);
    }
    if (coverageFilter === 'immunities') {
      return coverageData.typeBreakdown.filter(t => t.immuneCount > 0);
    }
    return coverageData.typeBreakdown;
  }, [coverageData, coverageFilter]);

  const activeIcon = PLAY_STYLE_ICONS[activeTeam?.playStyle] || 'shield-checkmark-outline';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {theme.isPikachu && <PikachuPattern subtle={true} opacity={0.16} />}
      {theme.isEevee && <EeveePattern subtle={true} opacity={0.16} />}
      {theme.isArceus && <ArceusBackground subtle={true} opacity={0.16} />}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Header Card (Team Name, Play Style, Multi-Team Switcher & Actions) ── */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <View style={styles.playStylePill}>
                <Ionicons name={activeIcon} size={13} color={theme.colors.primary} />
                <Text style={[styles.playStyleText, { color: theme.colors.primary }]}>
                  {activeTeam?.playStyle || 'Competitive'}
                </Text>
              </View>

              <Text numberOfLines={1} style={[styles.teamNameTitle, { color: theme.colors.text }]}>
                {activeTeam?.name || 'Active Team'}
              </Text>
              <Text style={[styles.teamSubText, { color: theme.colors.textSecondary }]}>
                {team.length}/6 Pokémon · {activeTeam?.description || 'Build, balance and export your roster'}
              </Text>
            </View>

            {/* Switch Team & Export Buttons */}
            <View style={styles.headerBtnGroup}>
              <TouchableOpacity
                style={[styles.actionHeaderBtn, { backgroundColor: `${theme.colors.primary}18`, borderColor: theme.colors.primary }]}
                onPress={() => setIsTeamModalOpen(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="albums-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.actionHeaderBtnText, { color: theme.colors.primary }]}>Teams</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionHeaderBtn, { backgroundColor: '#4CAF5018', borderColor: '#4CAF50', marginTop: 6 }]}
                onPress={handleExportTeamImage}
                disabled={isExporting}
                activeOpacity={0.7}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#4CAF50" />
                ) : (
                  <>
                    <Ionicons name="share-social-outline" size={16} color="#4CAF50" />
                    <Text style={[styles.actionHeaderBtnText, { color: '#4CAF50' }]}>Share Card</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Teams Carousel Quick Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.teamsQuickScroll}>
            {teams.map(t => {
              const isSelected = t.id === activeTeamId;
              const iconName = PLAY_STYLE_ICONS[t.playStyle] || 'shield-checkmark-outline';
              return (
                <TouchableOpacity
                  key={`quick-team-${t.id}`}
                  style={[
                    styles.quickTeamChip,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : (theme.dark ? '#252B36' : '#EDF2F7'),
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => selectTeam(t.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={iconName} size={14} color={isSelected ? '#fff' : theme.colors.text} />
                  <Text style={[styles.quickTeamChipText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                    {t.name}
                  </Text>
                  <View style={[styles.quickTeamCountBadge, { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)' }]}>
                    <Text style={[styles.quickTeamCountText, { color: isSelected ? '#fff' : theme.colors.textSecondary }]}>
                      {t.members.length}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.quickAddTeamChip, { borderColor: theme.colors.primary }]}
              onPress={() => setIsNewTeamModalOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={16} color={theme.colors.primary} />
              <Text style={[styles.quickAddTeamText, { color: theme.colors.primary }]}>New Team</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ── 6-Slot Pokémon Grid ── */}
        <View style={styles.gridSection}>
          <View style={styles.gridHeaderRow}>
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Active Team Roster</Text>
            {team.length > 0 && (
              <TouchableOpacity onPress={() => clearTeam()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.clearTeamText}>Clear Slots</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.slotsGrid}>{renderTeamSlots()}</View>
        </View>

        {/* ── Analysis Tabs (Coverage | Stats | Abilities) ── */}
        {team.length > 0 && (
          <View style={styles.analysisSection}>
            <View style={[styles.tabBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {[
                { id: 'coverage', label: 'Type Coverage', icon: 'shield-outline' },
                { id: 'stats', label: 'Stats Comparison', icon: 'bar-chart-outline' },
                { id: 'abilities', label: 'Abilities & Synergy', icon: 'flash-outline' },
              ].map(tab => {
                const isActive = activeAnalysisTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.tabItem,
                      isActive && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 },
                    ]}
                    onPress={() => setActiveAnalysisTab(tab.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={16}
                      color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.tabItemText,
                        { color: isActive ? theme.colors.primary : theme.colors.textSecondary },
                        isActive && { fontWeight: '800' },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── TAB 1: TYPE COVERAGE (Weaknesses & Resistances) ── */}
            {activeAnalysisTab === 'coverage' && (
              <View style={[styles.analysisCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                {/* Vulnerability Summary Alerts */}
                <View style={styles.coverageSummaryRow}>
                  <View style={[styles.summaryStatBox, { backgroundColor: coverageData.majorWeaknesses.length > 0 ? '#FF525215' : '#4CAF5015' }]}>
                    <Text style={[styles.summaryStatVal, { color: coverageData.majorWeaknesses.length > 0 ? '#FF5252' : '#4CAF50' }]}>
                      {coverageData.majorWeaknesses.length}
                    </Text>
                    <Text style={[styles.summaryStatLabel, { color: coverageData.majorWeaknesses.length > 0 ? '#FF5252' : '#4CAF50' }]}>
                      Team Hazards
                    </Text>
                  </View>

                  <View style={[styles.summaryStatBox, { backgroundColor: '#4CAF5015' }]}>
                    <Text style={[styles.summaryStatVal, { color: '#4CAF50' }]}>
                      {coverageData.superResistedTypes.length}
                    </Text>
                    <Text style={[styles.summaryStatLabel, { color: '#4CAF50' }]}>Super Resists</Text>
                  </View>

                  <View style={[styles.summaryStatBox, { backgroundColor: '#4D62E815' }]}>
                    <Text style={[styles.summaryStatVal, { color: '#4D62E8' }]}>
                      {coverageData.totalImmunities}
                    </Text>
                    <Text style={[styles.summaryStatLabel, { color: '#4D62E8' }]}>Immunities</Text>
                  </View>
                </View>

                {/* Filter Chips */}
                <View style={styles.coverageChipsRow}>
                  {[
                    { id: 'all', label: `All Types (${coverageData.typeBreakdown.length})` },
                    { id: 'weaknesses', label: `Weaknesses (${coverageData.typeBreakdown.filter(t => t.weakCount > 0).length})` },
                    { id: 'resistances', label: `Resistances (${coverageData.typeBreakdown.filter(t => t.resistCount > 0).length})` },
                    { id: 'immunities', label: `Immunities (${coverageData.typeBreakdown.filter(t => t.immuneCount > 0).length})` },
                  ].map(f => {
                    const isSelected = coverageFilter === f.id;
                    return (
                      <TouchableOpacity
                        key={f.id}
                        style={[
                          styles.filterMiniChip,
                          {
                            backgroundColor: isSelected ? theme.colors.primary : (theme.dark ? '#222834' : '#EDF2F7'),
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          },
                        ]}
                        onPress={() => setCoverageFilter(f.id)}
                      >
                        <Text style={[styles.filterMiniChipText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Breakdown List of Types */}
                <View style={styles.coverageListContainer}>
                  {filteredCoverageBreakdown.map(item => {
                    const typeColor = TYPE_COLORS[item.type] || '#888';
                    const isDanger = item.status === 'danger';
                    return (
                      <View
                        key={`cov-${item.type}`}
                        style={[
                          styles.coverageRowCard,
                          {
                            backgroundColor: theme.dark ? '#1A1E27' : '#F8FAFC',
                            borderColor: isDanger ? '#FF5252' : theme.colors.border,
                          },
                          isDanger && { borderWidth: 1.5 },
                        ]}
                      >
                        {/* Type Badge */}
                        <View style={[styles.coverageTypePill, { backgroundColor: typeColor }]}>
                          <Text style={styles.coverageTypePillText}>{item.type.toUpperCase()}</Text>
                        </View>

                        {/* Counts Badge Indicator */}
                        <View style={styles.coverageDetailsCol}>
                          <View style={styles.coverageCountsRow}>
                            {item.weakCount > 0 && (
                              <View style={[styles.tagBadge, { backgroundColor: '#FF525220' }]}>
                                <Text style={[styles.tagBadgeText, { color: '#FF5252' }]}>
                                  ⚠️ {item.weakCount} Weak
                                </Text>
                              </View>
                            )}

                            {item.resistCount > 0 && (
                              <View style={[styles.tagBadge, { backgroundColor: '#4CAF5020' }]}>
                                <Text style={[styles.tagBadgeText, { color: '#4CAF50' }]}>
                                  🛡️ {item.resistCount} Resist
                                </Text>
                              </View>
                            )}

                            {item.immuneCount > 0 && (
                              <View style={[styles.tagBadge, { backgroundColor: '#4D62E820' }]}>
                                <Text style={[styles.tagBadgeText, { color: '#4D62E8' }]}>
                                  ✨ {item.immuneCount} Immune
                                </Text>
                              </View>
                            )}

                            {item.weakCount === 0 && item.resistCount === 0 && item.immuneCount === 0 && (
                              <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>Neutral (1× damage)</Text>
                            )}
                          </View>

                          {/* Member breakdown pills */}
                          {(item.weakList.length > 0 || item.immuneList.length > 0) && (
                            <View style={styles.memberNamesRow}>
                              {item.weakList.map(w => (
                                <Text key={w.name} style={styles.weakMemberText}>
                                  {w.name} ({w.multiplier}×)
                                </Text>
                              ))}
                              {item.immuneList.map(im => (
                                <Text key={im.name} style={styles.immuneMemberText}>
                                  {im.name} (0×)
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── TAB 2: STATS COMPARISON ── */}
            {activeAnalysisTab === 'stats' && (
              <View style={[styles.analysisCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                {/* Team MVP / Role Awards */}
                <Text style={[styles.cardSubTitle, { color: theme.colors.text }]}>Team Roles & Leaders</Text>
                <View style={styles.mvpGrid}>
                  {Object.entries(statsData.topPerformers).map(([key, data]) => {
                    if (!data.pokemon) return null;
                    const statColor = STAT_COLORS[key] || theme.colors.primary;
                    const art = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.pokemon.id}.png`;
                    return (
                      <View
                        key={`mvp-${key}`}
                        style={[
                          styles.mvpBox,
                          { backgroundColor: theme.dark ? '#1A1E27' : '#F7FAFC', borderColor: theme.colors.border },
                        ]}
                      >
                        <Image source={{ uri: art }} style={styles.mvpMiniImg} resizeMode="contain" />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.mvpRoleTag, { color: statColor }]}>{data.role}</Text>
                          <Text numberOfLines={1} style={[styles.mvpName, { color: theme.colors.text }]}>
                            {data.pokemon.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Text>
                          <Text style={[styles.mvpVal, { color: statColor }]}>
                            {STAT_LABELS[key] || 'BST'}: <Text style={{ fontWeight: '800' }}>{data.val}</Text>
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Team Average Stat Bars */}
                <Text style={[styles.cardSubTitle, { color: theme.colors.text, marginTop: 18 }]}>
                  Team Averages (Avg Total: {statsData.averages.bst})
                </Text>

                <View style={styles.averagesBarsContainer}>
                  {Object.keys(STAT_LABELS).map(k => {
                    const avg = statsData.averages[k] || 0;
                    const c = STAT_COLORS[k];
                    const pct = Math.min(100, Math.max(8, (avg / 150) * 100));
                    return (
                      <View key={`avg-bar-${k}`} style={styles.avgBarRow}>
                        <Text style={[styles.avgBarLabel, { color: theme.colors.textSecondary }]}>{STAT_LABELS[k]}</Text>
                        <View style={[styles.avgBarBg, { backgroundColor: theme.dark ? '#252B36' : '#EDF2F7' }]}>
                          <View style={[styles.avgBarFill, { width: `${pct}%`, backgroundColor: c }]} />
                        </View>
                        <Text style={[styles.avgBarNum, { color: c }]}>{avg}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Comparative Member Stats Table */}
                <Text style={[styles.cardSubTitle, { color: theme.colors.text, marginTop: 18 }]}>Individual Breakdown</Text>
                {team.map((p, idx) => {
                  const pArt = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
                  return (
                    <View
                      key={`comp-row-${p.id}-${idx}`}
                      style={[
                        styles.memberStatRowCard,
                        { backgroundColor: theme.dark ? '#1A1E27' : '#F7FAFC', borderColor: theme.colors.border },
                      ]}
                    >
                      <Image source={{ uri: pArt }} style={styles.memberStatMiniSprite} resizeMode="contain" />
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text numberOfLines={1} style={[styles.memberStatName, { color: theme.colors.text }]}>
                          {p.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                          <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>HP {p.hp || 50}</Text>
                          <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>Atk {p.attack || 50}</Text>
                          <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>Def {p.defense || 50}</Text>
                          <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>Spe {p.speed || 50}</Text>
                        </View>
                      </View>
                      <View style={[styles.memberBstBadge, { backgroundColor: `${theme.colors.primary}1A` }]}>
                        <Text style={[styles.memberBstText, { color: theme.colors.primary }]}>
                          BST {p.total || 500}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ── TAB 3: ABILITIES & SYNERGY ── */}
            {activeAnalysisTab === 'abilities' && (
              <View style={[styles.analysisCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardSubTitle, { color: theme.colors.text }]}>Abilities Breakdown</Text>

                {team.map((p, idx) => {
                  const pArt = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
                  const ab = getPokemonAbilityInfo(p);
                  return (
                    <View
                      key={`ab-card-${p.id}-${idx}`}
                      style={[
                        styles.abilityCard,
                        { backgroundColor: theme.dark ? '#1A1E27' : '#F7FAFC', borderColor: theme.colors.border },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Image source={{ uri: pArt }} style={styles.abilityMiniSprite} resizeMode="contain" />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.abilityPokeName, { color: theme.colors.text }]}>
                            {p.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Text>
                          <Text style={[styles.abilityTitle, { color: theme.colors.primary }]}>{ab.name}</Text>
                        </View>
                      </View>
                      <Text style={[styles.abilityDescText, { color: theme.colors.textSecondary }]}>{ab.desc}</Text>
                    </View>
                  );
                })}

                {/* Team Strategy Advice */}
                <View style={[styles.strategyCard, { backgroundColor: `${theme.colors.primary}12`, borderColor: `${theme.colors.primary}40` }]}>
                  <Ionicons name="bulb-outline" size={18} color={theme.colors.primary} />
                  <Text style={[styles.strategyCardText, { color: theme.colors.text }]}>
                    <Text style={{ fontWeight: '800', color: theme.colors.primary }}>Tactical Tip:</Text> Maintain a
                    mix of physical and special sweepers alongside at least one defensive pivot with status clearing or
                    immunities.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── HIDDEN OFF-SCREEN VIEW FOR CAPTURING SHARABLE TEAM IMAGE CARD ── */}
        <View style={styles.hiddenCaptureContainer} collapsable={false}>
          <View ref={exportCardRef} collapsable={false} style={styles.exportCard}>
            {/* Header */}
            <View style={styles.exportHeader}>
              <View>
                <Text style={styles.exportBrand}>POKÉDEX TRAINER CARD</Text>
                <Text style={styles.exportTeamTitle}>{activeTeam?.name || 'Dream Team'}</Text>
                <Text style={styles.exportPlayStyle}>
                  Play Style: {activeTeam?.playStyle} · {team.length} Members
                </Text>
              </View>
              <Ionicons name="sparkles" size={28} color="#FFCB05" />
            </View>

            {/* 6 Pokemon Roster Grid in Export Card */}
            <View style={styles.exportRosterGrid}>
              {team.map((p, idx) => {
                const art = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
                const pt = (p.types?.[0] || 'normal').toLowerCase();
                const tc = TYPE_COLORS[pt] || '#888';
                return (
                  <View key={`exp-p-${p.id}-${idx}`} style={[styles.exportPokeCard, { borderColor: tc }]}>
                    <Image source={{ uri: art }} style={styles.exportPokeImg} resizeMode="contain" />
                    <Text numberOfLines={1} style={styles.exportPokeName}>
                      {p.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 3, marginTop: 2 }}>
                      {(p.types || []).map((t, tIdx) => {
                        const tName = typeof t === 'string' ? t.toLowerCase() : (t?.name || 'normal').toLowerCase();
                        return (
                          <View key={`exp-t-${tName}-${tIdx}`} style={[styles.exportTypePill, { backgroundColor: TYPE_COLORS[tName] || '#888' }]}>
                            <Text style={styles.exportTypePillText}>{tName.toUpperCase()}</Text>
                          </View>
                        );
                      })}
                    </View>
                    <Text style={styles.exportBstText}>BST {p.total || 500}</Text>
                  </View>
                );
              })}
            </View>

            {/* Summary Footer */}
            <View style={styles.exportFooterRow}>
              <View>
                <Text style={styles.exportSummaryLabel}>Average Team BST</Text>
                <Text style={styles.exportSummaryVal}>{statsData.averages.bst}</Text>
              </View>
              <View>
                <Text style={styles.exportSummaryLabel}>Immunities</Text>
                <Text style={[styles.exportSummaryVal, { color: '#4CAF50' }]}>{coverageData.totalImmunities}</Text>
              </View>
              <View>
                <Text style={styles.exportSummaryLabel}>Hazards</Text>
                <Text style={[styles.exportSummaryVal, { color: coverageData.majorWeaknesses.length > 0 ? '#FF5252' : '#4CAF50' }]}>
                  {coverageData.majorWeaknesses.length}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── MODAL 1: SWITCH & MANAGE TEAMS ── */}
      <Modal visible={isTeamModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.card, paddingTop: insets.top + 16 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Saved Teams</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                  Switch, duplicate, or create play style rosters
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsTeamModalOpen(false)}>
                <Ionicons name="close-circle" size={26} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
              {teams.map(t => {
                const isSelected = t.id === activeTeamId;
                const iconName = PLAY_STYLE_ICONS[t.playStyle] || 'shield-checkmark-outline';
                return (
                  <View
                    key={`manage-team-${t.id}`}
                    style={[
                      styles.teamManageCard,
                      {
                        backgroundColor: isSelected ? `${theme.colors.primary}12` : (theme.dark ? '#1F2430' : '#F7FAFC'),
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => {
                        selectTeam(t.id);
                        setIsTeamModalOpen(false);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name={iconName} size={16} color={theme.colors.primary} />
                        <Text style={[styles.teamManageName, { color: theme.colors.text }]}>{t.name}</Text>
                        {isSelected && (
                          <View style={[styles.activePill, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.activePillText}>ACTIVE</Text>
                          </View>
                        )}
                      </View>

                      <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 }}>
                        {t.playStyle} · {t.members.length}/6 Pokémon
                      </Text>

                      {/* Mini Avatar Previews */}
                      <View style={styles.miniAvatarsRow}>
                        {t.members.map((m, mIdx) => {
                          const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`;
                          return (
                            <Image
                              key={`t-mini-${m.id}-${mIdx}`}
                              source={{ uri: sprite }}
                              style={styles.miniAvatar}
                            />
                          );
                        })}
                      </View>
                    </TouchableOpacity>

                    {/* Actions: Duplicate & Delete */}
                    <View style={styles.teamManageActionsCol}>
                      <TouchableOpacity
                        onPress={() => duplicateTeam(t.id)}
                        style={[styles.teamManageMiniBtn, { backgroundColor: theme.dark ? '#2D3748' : '#EDF2F7' }]}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="copy-outline" size={15} color={theme.colors.text} />
                      </TouchableOpacity>

                      {teams.length > 1 && (
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert('Delete Team', `Are you sure you want to delete ${t.name}?`, [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => deleteTeam(t.id) },
                            ]);
                          }}
                          style={[styles.teamManageMiniBtn, { backgroundColor: '#FF525220', marginTop: 6 }]}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons name="trash-outline" size={15} color="#FF5252" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                style={[styles.addNewTeamBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  setIsTeamModalOpen(false);
                  setIsNewTeamModalOpen(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.addNewTeamBtnText}>Create New Team</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: CREATE NEW TEAM ── */}
      <Modal visible={isNewTeamModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.card, paddingTop: insets.top + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Create Team</Text>
              <TouchableOpacity onPress={() => setIsNewTeamModalOpen(false)}>
                <Ionicons name="close-circle" size={26} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Team Name</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                placeholder="e.g. Cynthia Champions, Rain Sweeper, Mono Fire"
                placeholderTextColor={theme.colors.textSecondary}
                value={newTeamName}
                onChangeText={setNewTeamName}
                autoFocus
              />

              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 16 }]}>Play Style</Text>
              <View style={styles.playStylesGrid}>
                {PLAY_STYLES.map(styleName => {
                  const isSelected = newTeamPlayStyle === styleName;
                  const icon = PLAY_STYLE_ICONS[styleName] || 'shield-outline';
                  return (
                    <TouchableOpacity
                      key={styleName}
                      style={[
                        styles.playStyleSelectChip,
                        {
                          backgroundColor: isSelected ? theme.colors.primary : (theme.dark ? '#222834' : '#EDF2F7'),
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                      onPress={() => setNewTeamPlayStyle(styleName)}
                    >
                      <Ionicons name={icon} size={14} color={isSelected ? '#fff' : theme.colors.text} />
                      <Text style={[styles.playStyleSelectText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                        {styleName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.submitCreateBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleCreateTeamSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitCreateBtnText}>Create Team</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: IN-APP POKÉMON PICKER (Instant Add/Replace into Slot) ── */}
      <Modal visible={isPokemonPickerOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.card, paddingTop: insets.top + 16, height: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Select Pokémon for Slot #{selectedSlotIndex !== null ? selectedSlotIndex + 1 : ''}
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                  Tap any Pokémon to instantly place it in your active squad
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsPokemonPickerOpen(false)}>
                <Ionicons name="close-circle" size={26} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search Box */}
            <View style={[styles.searchBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Search by Pokémon name or #..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchPickerText}
                onChangeText={setSearchPickerText}
                autoCorrect={false}
              />
              {searchPickerText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchPickerText('')}>
                  <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Type Filter Chips in Picker */}
            <View style={{ marginBottom: 10 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                <TouchableOpacity
                  style={[
                    styles.pickerTypeChip,
                    {
                      backgroundColor: selectedPickerType === 'all' ? theme.colors.primary : (theme.dark ? '#232936' : '#EDF2F7'),
                      borderColor: selectedPickerType === 'all' ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPickerType('all')}
                >
                  <Text style={[styles.pickerTypeChipText, { color: selectedPickerType === 'all' ? '#fff' : theme.colors.text }]}>
                    All Types
                  </Text>
                </TouchableOpacity>

                {ALL_POKEMON_TYPES.map(t => {
                  const isSel = selectedPickerType === t;
                  const c = TYPE_COLORS[t];
                  return (
                    <TouchableOpacity
                      key={`pt-${t}`}
                      style={[
                        styles.pickerTypeChip,
                        {
                          backgroundColor: isSel ? c : (theme.dark ? '#232936' : '#EDF2F7'),
                          borderColor: isSel ? c : theme.colors.border,
                        },
                      ]}
                      onPress={() => setSelectedPickerType(t)}
                    >
                      <Text style={[styles.pickerTypeChipText, { color: isSel ? '#fff' : theme.colors.text }]}>
                        {t.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Pokémon List */}
            <FlatList
              data={filteredPickerPokemon}
              keyExtractor={(item, index) => `${item.id}-${item.name}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => {
                const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;
                const primary = (item.types?.[0] || 'normal').toLowerCase();
                const typeC = TYPE_COLORS[primary] || theme.colors.primary;
                const isAlreadyInTeam = team.some(p => p.id === item.id);

                return (
                  <TouchableOpacity
                    style={[
                      styles.pickerListItem,
                      { borderBottomColor: theme.colors.border },
                      isAlreadyInTeam && { opacity: 0.5 },
                    ]}
                    onPress={() => handleSelectPokemonForSlot(item)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: sprite }} style={styles.pickerMiniSprite} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pickerDexNum, { color: typeC }]}>
                        #{String(item.id).padStart(4, '0')}
                      </Text>
                      <Text style={[styles.pickerName, { color: theme.colors.text }]}>
                        {item.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 4, marginRight: 8 }}>
                      {(item.types || []).map((t, idx) => {
                        const tName = typeof t === 'string' ? t.toLowerCase() : (t?.name || 'normal').toLowerCase();
                        return (
                          <View key={`${tName}-${idx}`} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[tName] || '#888' }]}>
                            <Text style={styles.typeText}>{tName.toUpperCase()}</Text>
                          </View>
                        );
                      })}
                    </View>

                    <Text style={[styles.pickerBstText, { color: theme.colors.textSecondary }]}>
                      BST {item.total || 500}
                    </Text>
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
  headerCard: {
    margin: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playStylePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  playStyleText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teamNameTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  teamSubText: {
    fontSize: 12,
    marginTop: 2,
  },
  headerBtnGroup: {
    alignItems: 'flex-end',
  },
  actionHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  teamsQuickScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
  },
  quickTeamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickTeamChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickTeamCountBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
  },
  quickTeamCountText: {
    fontSize: 10,
    fontWeight: '800',
  },
  quickAddTeamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  quickAddTeamText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Roster Slots Grid
  gridSection: {
    paddingHorizontal: 16,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  clearTeamText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5252',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  slotCard: {
    width: (width - 42) / 2,
    borderRadius: 16,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  slotIndexBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    zIndex: 1,
  },
  slotIndexText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
  },
  slotPressArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slotImage: {
    width: 44,
    height: 44,
    marginRight: 6,
  },
  slotInfo: {
    flex: 1,
  },
  slotName: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 3,
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
  },
  slotMiniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotBstText: {
    fontSize: 10,
    fontWeight: '800',
  },
  slotAbilityText: {
    fontSize: 9,
    flex: 1,
  },
  slotActionsCol: {
    alignItems: 'center',
    marginLeft: 4,
  },
  slotActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty Slot
  emptySlot: {
    width: (width - 42) / 2,
    height: 84,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptySlotText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptySlotSub: {
    fontSize: 10,
  },

  // Analysis Tabs
  analysisSection: {
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '600',
  },
  analysisCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },

  // Coverage Breakdown
  coverageSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  summaryStatBox: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  summaryStatVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  summaryStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  coverageChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  filterMiniChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterMiniChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  coverageListContainer: {
    gap: 8,
  },
  coverageRowCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverageTypePill: {
    width: 66,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  coverageTypePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
  },
  coverageDetailsCol: {
    flex: 1,
  },
  coverageCountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  memberNamesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  weakMemberText: {
    fontSize: 10,
    color: '#FF5252',
    fontWeight: '600',
  },
  immuneMemberText: {
    fontSize: 10,
    color: '#4D62E8',
    fontWeight: '700',
  },

  // Stats Comparison
  cardSubTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  mvpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mvpBox: {
    width: (width - 76) / 2,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mvpMiniImg: {
    width: 36,
    height: 36,
    marginRight: 6,
  },
  mvpRoleTag: {
    fontSize: 10,
    fontWeight: '800',
  },
  mvpName: {
    fontSize: 12,
    fontWeight: '800',
  },
  mvpVal: {
    fontSize: 11,
  },
  averagesBarsContainer: {
    gap: 8,
  },
  avgBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avgBarLabel: {
    width: 34,
    fontSize: 11,
    fontWeight: '700',
  },
  avgBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  avgBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  avgBarNum: {
    width: 28,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  memberStatRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  memberStatMiniSprite: {
    width: 36,
    height: 36,
    marginRight: 8,
  },
  memberStatName: {
    fontSize: 13,
    fontWeight: '800',
  },
  memberBstBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberBstText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // Abilities
  abilityCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
  },
  abilityMiniSprite: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  abilityPokeName: {
    fontSize: 13,
    fontWeight: '800',
  },
  abilityTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  abilityDescText: {
    fontSize: 11,
    lineHeight: 16,
  },
  strategyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  strategyCardText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  // Hidden Export Card (for react-native-view-shot)
  hiddenCaptureContainer: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  exportCard: {
    width: 480,
    backgroundColor: '#11141C',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#4D62E8',
  },
  exportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
    paddingBottom: 14,
  },
  exportBrand: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFCB05',
    letterSpacing: 1.5,
  },
  exportTeamTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  exportPlayStyle: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 2,
  },
  exportRosterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  exportPokeCard: {
    width: (480 - 48 - 24) / 3,
    backgroundColor: '#1A1F2C',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 10,
    alignItems: 'center',
  },
  exportPokeImg: {
    width: 64,
    height: 64,
  },
  exportPokeName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 6,
  },
  exportTypePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exportTypePillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ffffff',
  },
  exportBstText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A0AEC0',
    marginTop: 4,
  },
  exportFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
    paddingTop: 14,
  },
  exportSummaryLabel: {
    fontSize: 10,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  exportSummaryVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 2,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  teamManageCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamManageName: {
    fontSize: 15,
    fontWeight: '800',
  },
  activePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#fff',
  },
  miniAvatarsRow: {
    flexDirection: 'row',
    gap: -4,
    marginTop: 6,
  },
  miniAvatar: {
    width: 28,
    height: 28,
  },
  teamManageActionsCol: {
    alignItems: 'center',
    marginLeft: 8,
  },
  teamManageMiniBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewTeamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  addNewTeamBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  playStylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playStyleSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  playStyleSelectText: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitCreateBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitCreateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },

  // Picker
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  pickerTypeChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerTypeChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pickerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  pickerMiniSprite: {
    width: 44,
    height: 44,
    marginRight: 8,
  },
  pickerDexNum: {
    fontSize: 11,
    fontWeight: '800',
  },
  pickerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  pickerBstText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
