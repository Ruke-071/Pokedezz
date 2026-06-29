import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTeam } from '../context/TeamContext';
import {
  getPokemonDetails,
  getPokemonEvolutionChain,
  calculateWeaknessesAndResistances,
  getAbilityDetails,
  getMoveDetails,
} from '../services/pokemonService';
import { TYPE_COLORS } from '../components/FilterModal';
import { StatBar } from '../components/StatBar';
import { championsPokemon } from '../data/championsPokemon';
import { pokemonIndex } from '../data/pokemonIndex';
import { newlyAddedPokemon } from '../data/newlyAdded';
import { getPokemonDexColor, getSolidCardBg } from '../components/PokemonCard';

const { width } = Dimensions.get('window');

// ─── Inline Move Row ───────────────────────────────────────────────────────────
const MoveRow = ({ move, theme, onPress }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let mounted = true;
    getMoveDetails(move.name).then(res => {
      if (mounted) setDetails(res);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [move.name]);

  const typeColor = details ? (TYPE_COLORS[details.type] || '#888') : '#888';
  const dmgClass = details ? (details.damageClass || 'Status').toUpperCase() : 'STATUS';
  const levelLabel = move.level > 0 ? String(move.level) : (move.label || '—');

  return (
    <TouchableOpacity
      style={styles.moveCardContainer}
      activeOpacity={0.75}
      onPress={() => onPress(move.name)}
    >
      <View style={[styles.levelCircle, { borderColor: typeColor, backgroundColor: theme.colors.background }]}>
        <Text style={[styles.levelCircleText, { color: theme.colors.text }]}>{levelLabel}</Text>
      </View>
      
      <View style={[styles.moveCardContent, { shadowColor: typeColor, backgroundColor: theme.colors.card }]}>
        <View style={[styles.moveTitleBlock, { backgroundColor: typeColor }]}>
          <Text style={[styles.moveTitleText, { color: '#fff', flex: 1 }]} numberOfLines={1}>
            {move.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Text>
          <View style={styles.moveBadgesContainer}>
            {details && (
              <View style={[styles.moveBadge, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                <Text style={styles.moveBadgeText}>{details.type.toUpperCase()}</Text>
              </View>
            )}
            <View style={[styles.moveBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={[styles.moveBadgeText, { color: '#fff' }]}>{dmgClass}</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.moveStatsBlock, { backgroundColor: theme.colors.card }]}>
          {details ? (
            <>
              <View style={styles.statItem}>
                <Text style={styles.moveStatTextLight}>ATTACK</Text>
                <Text style={[styles.moveStatTextBold, { color: theme.colors.text }]}>{details.power || '--'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.moveStatTextLight}>ACCURACY</Text>
                <Text style={[styles.moveStatTextBold, { color: theme.colors.text }]}>{details.accuracy ? `${details.accuracy}%` : '--'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.moveStatTextLight}>PP</Text>
                <Text style={[styles.moveStatTextBold, { color: theme.colors.text }]}>{details.pp || '--'}</Text>
              </View>
            </>
          ) : (
            <View style={{ flex: 1, paddingVertical: 5, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.textSecondary} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Evolution Tree (unchanged) ───────────────────────────────────────────────
const EvolutionTree = ({ node, currentId, theme, navigation }) => {
  if (!node) return null;
  const isCurrent = node.id === currentId;
  const stageArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${node.id}.png`;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => {
          if (!isCurrent) navigation.navigate('PokemonDetail', { id: node.id, name: node.name });
        }}
        style={[
          styles.stageCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: isCurrent ? theme.colors.primary : theme.colors.border,
            borderWidth: isCurrent ? 2 : 1,
          }
        ]}
      >
        <Image source={{ uri: stageArtwork }} style={styles.stageImage} resizeMode="contain" />
        <Text style={[styles.stageName, { color: theme.colors.text }]}>
          {node.name.charAt(0).toUpperCase() + node.name.slice(1)}
        </Text>
      </TouchableOpacity>

      {node.evolvesTo && node.evolvesTo.length > 0 && (
        <View style={{ marginLeft: 8, justifyContent: 'center' }}>
          {node.evolvesTo.map((child) => (
            <View key={child.id} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
                {child.minLevel && (
                  <Text style={[styles.levelText, { color: theme.colors.textSecondary }]}>Lvl {child.minLevel}</Text>
                )}
                {child.item && (
                  <Text style={[styles.levelText, { color: theme.colors.textSecondary, maxWidth: 70 }]}>
                    {child.item.replace('-', ' ')}
                  </Text>
                )}
                {child.region && (
                  <Text style={[styles.levelText, { color: theme.colors.textSecondary, maxWidth: 70 }]}>
                    in {child.region.charAt(0).toUpperCase() + child.region.slice(1)}
                  </Text>
                )}
              </View>
              <EvolutionTree node={child} currentId={currentId} theme={theme} navigation={navigation} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Variant Form Card (Mega & Alternate Forms) ───────────────────────────────
const VariantFormCard = ({ item, theme, navigation }) => {
  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;
  const primaryType = item.types[0];
  const dexColor = getPokemonDexColor(item.speciesId ?? item.id, item.name, primaryType);

  const cardBg = theme.dark ? '#1A1A1A' : '#FFFFFF';
  const archBg = theme.dark ? `${dexColor}35` : `${dexColor}1C`;

  // Format name nicely
  let displayName = item.name;
  if (item.name.toLowerCase().includes('-gmax')) {
    displayName = `Gigantamax ${item.name.replace('-gmax', '')}`;
  } else if (item.name.toLowerCase().includes('-mega')) {
    displayName = `Mega ${item.name.replace('-mega', '')}`;
  }
  const capitalizedName = displayName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const sharedDex = `#${String(item.speciesId).padStart(3, '0')}`;

  return (
    <TouchableOpacity
      style={[styles.variantCard, { backgroundColor: cardBg, borderColor: theme.dark ? '#2C2C2C' : '#EAEAEA' }]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('PokemonDetail', { id: item.id, name: item.name })}
    >
      {/* Curved Arch Header */}
      <View style={[styles.variantArch, { backgroundColor: archBg }]}>
        <Image source={{ uri: artworkUrl }} style={styles.variantImage} resizeMode="contain" />
      </View>

      {/* Details Section */}
      <View style={styles.variantCardContent}>
        <Text style={[styles.variantDex, { color: theme.colors.textSecondary }]}>{sharedDex}</Text>
        <Text numberOfLines={1} style={[styles.variantName, { color: theme.colors.text }]}>
          {capitalizedName}
        </Text>
        <View style={styles.variantTypesCol}>
          {item.types.map(t => {
            const tc = TYPE_COLORS[t.toLowerCase()] || '#A8A878';
            return (
              <View key={t} style={[styles.variantTypePill, { borderColor: tc, backgroundColor: theme.dark ? `${tc}1C` : `${tc}0D` }]}>
                <Text style={[styles.variantTypePillText, { color: tc }]}>{t.toUpperCase()}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const PokemonDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToTeam, removeFromTeam, isInTeam, canAddToTeam } = useTeam();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [isShiny, setIsShiny] = useState(false);
  const [selectedLoreVersion, setSelectedLoreVersion] = useState(null);
  const [isLoreDropdownOpen, setIsLoreDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'moves' | 'more'

  // Moves Tab selector states
  const [selectedVersion, setSelectedVersion] = useState('champions');
  const [selectedLearnMethod, setSelectedLearnMethod] = useState('level-up');
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);

  // Ability Modal
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [abilityDesc, setAbilityDesc] = useState('');
  const [isLoadingAbility, setIsLoadingAbility] = useState(false);

  // Move Modal
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedMove, setSelectedMove] = useState(null);
  const [moveDetails, setMoveDetails] = useState(null);
  const [isLoadingMove, setIsLoadingMove] = useState(false);

  const player = useAudioPlayer(details?.cryUrl);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [pokeDetails, pokeEvolutions] = await Promise.all([
          getPokemonDetails(id),
          getPokemonEvolutionChain(id),
        ]);
        if (active) {
          setDetails(pokeDetails);
          setEvolutionChain(pokeEvolutions);
          setLoading(false);
          if (pokeDetails.lore?.availableVersions?.length > 0) {
            setSelectedLoreVersion(pokeDetails.lore.availableVersions[0]);
          }
          if (pokeDetails.moves?.availableVersions?.length > 0) {
            setSelectedVersion(pokeDetails.moves.availableVersions[0]);
          }
        }
      } catch (error) {
        console.error('Error loading Pokémon details:', error);
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
  }, [id]);

  const handlePlayCry = () => { if (player) player.play(); };

  const handleAbilityPress = async (abilityName) => {
    setSelectedAbility(abilityName);
    setAbilityDesc('');
    setIsLoadingAbility(true);
    setIsAbilityModalOpen(true);
    const desc = await getAbilityDetails(abilityName);
    setAbilityDesc(desc);
    setIsLoadingAbility(false);
  };

  const handleMovePress = async (moveName) => {
    setSelectedMove(moveName);
    setMoveDetails(null);
    setIsLoadingMove(true);
    setIsMoveModalOpen(true);
    const md = await getMoveDetails(moveName);
    setMoveDetails(md);
    setIsLoadingMove(false);
  };

  const handleTeamAction = async () => {
    if (!details) return;
    if (isInTeam(details.id)) {
      await removeFromTeam(details.id);
    } else {
      const result = await addToTeam({
        id: details.id,
        name: details.name,
        types: details.types,
        hp: details.stats.hp,
        attack: details.stats.attack,
        speed: details.stats.speed,
        stats: details.stats,
      });
      if (!result.success) alert(result.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading PokéData...</Text>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Failed to load Pokémon details.</Text>
      </View>
    );
  }

  const { weaknesses, resistances, immunities } = calculateWeaknessesAndResistances(details.types);
  const isChamp = championsPokemon.includes(details.name.toLowerCase());
  const isNew = newlyAddedPokemon.includes(details.name.toLowerCase());
  const primaryType = details.types[0];
  const typeColor = TYPE_COLORS[primaryType.toLowerCase()] || '#A8A878';
  const dexColor = getPokemonDexColor(details.id, details.name, primaryType);
  const bannerBgColor = getSolidCardBg(dexColor, theme.dark);
  const favorited = isFavorite(details.id);
  const inTeam = isInTeam(details.id);

  // Dynamic learn method and version moves extraction
  const currentVersionMoves = details.moves?.byVersion?.[selectedVersion] || {};
  const activeMethodLabelMap = {
    'level-up': { label: 'Level Up', prefix: '' },
    'machine': { label: 'TM / HM', prefix: 'TM' },
    'egg': { label: 'Egg', prefix: 'Egg' },
    'tutor': { label: 'Tutor', prefix: 'Tutor' },
  };

  // Get available methods for this version
  const availableMethods = [];
  if (currentVersionMoves['level-up']?.length > 0) availableMethods.push('level-up');
  if (currentVersionMoves['machine']?.length > 0) availableMethods.push('machine');
  if (currentVersionMoves['egg']?.length > 0) availableMethods.push('egg');
  if (currentVersionMoves['tutor']?.length > 0) availableMethods.push('tutor');

  // Fallback to first available method if selected method has no moves in this version
  const displayMethod = availableMethods.includes(selectedLearnMethod) 
    ? selectedLearnMethod 
    : (availableMethods[0] || 'level-up');

  const movesList = (currentVersionMoves[displayMethod] || []).map(m => ({
    ...m,
    learnMethod: displayMethod === 'level-up' ? 'Level-Up' : activeMethodLabelMap[displayMethod]?.label || 'Other',
    label: displayMethod === 'level-up' ? (m.level > 0 ? m.level.toString() : '') : activeMethodLabelMap[displayMethod]?.prefix || '',
  }));

  if (displayMethod === 'level-up') {
    movesList.sort((a, b) => a.level - b.level);
  }

  // Find forms from database
  const currentInIndex = pokemonIndex.find(p => p.id === details.id);
  const baseSpeciesId = currentInIndex ? currentInIndex.speciesId : (details.id > 10000 ? details.id : details.id);
  const allForms = pokemonIndex.filter(p => p.speciesId === baseSpeciesId);
  const baseFormEntry = pokemonIndex.find(p => p.id === baseSpeciesId);

  // Mega forms
  const megaForms = allForms.filter(p => p.variant === 'mega' || p.name.includes('-mega'));

  // Alternate forms (Gmax, Alolan, etc.) — exclude base form and mega forms
  const alternateForms = allForms.filter(p => p.id !== baseSpeciesId && p.variant !== 'mega' && !p.name.includes('-mega'));

  // Dynamic screen background color matching Pokemon Pokédex color on Info tab,
  // and clean White/Black depending on light/dark theme on Moves/More tabs.
  const screenBgColor = activeTab === 'info'
    ? getSolidCardBg(dexColor, theme.dark)
    : (theme.dark ? '#000000' : '#FFFFFF');

  return (
    <View style={[styles.rootContainer, { backgroundColor: screenBgColor }]}>
      {/* ── Modals ── */}
      {/* Lore version picker */}
      {details.lore?.availableVersions?.length > 0 && (
        <Modal visible={isLoreDropdownOpen} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsLoreDropdownOpen(false)}>
            <Pressable style={[styles.dropdownModalContainer, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.modalHeader, { backgroundColor: typeColor }]}>
                <Text style={styles.modalTitle}>Select Game Version</Text>
                <TouchableOpacity onPress={() => setIsLoreDropdownOpen(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 300 }}>
                {details.lore.availableVersions.map(version => {
                  const isActive = selectedLoreVersion === version;
                  return (
                    <TouchableOpacity
                      key={`dd-${version}`}
                      style={[styles.dropdownItem, isActive && { backgroundColor: typeColor + '20' }]}
                      onPress={() => { setSelectedLoreVersion(version); setIsLoreDropdownOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.colors.text }, isActive && { color: typeColor, fontWeight: '800' }]}>
                        {version.replace(/-/g, ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Pressable>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Moves version picker */}
      {details.moves?.availableVersions?.length > 0 && (
        <Modal visible={isVersionDropdownOpen} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsVersionDropdownOpen(false)}>
            <Pressable style={[styles.dropdownModalContainer, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.modalHeader, { backgroundColor: typeColor }]}>
                <Text style={styles.modalTitle}>Select Game Version</Text>
                <TouchableOpacity onPress={() => setIsVersionDropdownOpen(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 300 }}>
                {details.moves.availableVersions.map(version => {
                  const isActive = selectedVersion === version;
                  return (
                    <TouchableOpacity
                      key={`mv-${version}`}
                      style={[styles.dropdownItem, isActive && { backgroundColor: typeColor + '20' }]}
                      onPress={() => { setSelectedVersion(version); setIsVersionDropdownOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.colors.text }, isActive && { color: typeColor, fontWeight: '800' }]}>
                        {version.replace(/-/g, ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Pressable>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Moves learn method picker */}
      <Modal visible={isMethodDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsMethodDropdownOpen(false)}>
          <Pressable style={[styles.dropdownModalContainer, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.modalHeader, { backgroundColor: typeColor }]}>
              <Text style={styles.modalTitle}>Select Learn Method</Text>
              <TouchableOpacity onPress={() => setIsMethodDropdownOpen(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {availableMethods.map(methodId => {
                const isActive = displayMethod === methodId;
                return (
                  <TouchableOpacity
                    key={`meth-${methodId}`}
                    style={[styles.dropdownItem, isActive && { backgroundColor: typeColor + '20' }]}
                    onPress={() => { setSelectedLearnMethod(methodId); setIsMethodDropdownOpen(false); }}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.colors.text }, isActive && { color: typeColor, fontWeight: '800' }]}>
                      {activeMethodLabelMap[methodId]?.label || methodId}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </TouchableOpacity>
      </Modal>

      {/* Ability modal */}
      <Modal visible={isAbilityModalOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsAbilityModalOpen(false)}>
          <Pressable style={[styles.dropdownModalContainer, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.modalHeader, { backgroundColor: typeColor }]}>
              <Text style={styles.modalTitle}>{selectedAbility ? selectedAbility.replace(/-/g, ' ').toUpperCase() : 'Ability'}</Text>
              <TouchableOpacity onPress={() => setIsAbilityModalOpen(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {isLoadingAbility ? (
                <ActivityIndicator size="large" color={typeColor} />
              ) : (
                <Text style={[styles.abilityDescText, { color: theme.colors.text }]}>{abilityDesc}</Text>
              )}
            </View>
          </Pressable>
        </TouchableOpacity>
      </Modal>

      {/* Move modal */}
      <Modal visible={isMoveModalOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsMoveModalOpen(false)}>
          <Pressable style={[styles.dropdownModalContainer, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.modalHeader, { backgroundColor: moveDetails ? (TYPE_COLORS[moveDetails.type] || typeColor) : typeColor }]}>
              <Text style={styles.modalTitle}>{selectedMove ? selectedMove.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Move'}</Text>
              <TouchableOpacity onPress={() => setIsMoveModalOpen(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {isLoadingMove ? (
                <ActivityIndicator size="large" color={typeColor} />
              ) : moveDetails ? (
                <View style={{ gap: 10 }}>
                  <View style={styles.moveStatRow}>
                    <Text style={[styles.moveStatKey, { color: theme.colors.textSecondary }]}>Type</Text>
                    <View style={[styles.moveTypePill, { backgroundColor: TYPE_COLORS[moveDetails.type] || typeColor }]}>
                      <Text style={styles.moveTypePillText}>{moveDetails.type?.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.moveStatRow}>
                    <Text style={[styles.moveStatKey, { color: theme.colors.textSecondary }]}>Category</Text>
                    <Text style={[styles.moveStatVal, { color: theme.colors.text }]}>{moveDetails.damageClass?.toUpperCase() || '—'}</Text>
                  </View>
                  <View style={styles.moveStatRow}>
                    <Text style={[styles.moveStatKey, { color: theme.colors.textSecondary }]}>Power</Text>
                    <Text style={[styles.moveStatVal, { color: theme.colors.text }]}>{moveDetails.power || '—'}</Text>
                  </View>
                  <View style={styles.moveStatRow}>
                    <Text style={[styles.moveStatKey, { color: theme.colors.textSecondary }]}>Accuracy</Text>
                    <Text style={[styles.moveStatVal, { color: theme.colors.text }]}>{moveDetails.accuracy ? `${moveDetails.accuracy}%` : '—'}</Text>
                  </View>
                  <View style={styles.moveStatRow}>
                    <Text style={[styles.moveStatKey, { color: theme.colors.textSecondary }]}>PP</Text>
                    <Text style={[styles.moveStatVal, { color: theme.colors.text }]}>{moveDetails.pp || '—'}</Text>
                  </View>
                  {moveDetails.effect && (
                    <Text style={[styles.abilityDescText, { color: theme.colors.text, marginTop: 6 }]}>{moveDetails.effect}</Text>
                  )}
                </View>
              ) : null}
            </View>
          </Pressable>
        </TouchableOpacity>
      </Modal>

      {/* ── Main Scrollable Content ── */}
      <ScrollView
        style={{ flex: 1, backgroundColor: screenBgColor }}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={[styles.heroBanner, { backgroundColor: bannerBgColor }]}>
          <View style={styles.floatingHeader}>
            <Text style={[styles.idText, { color: theme.colors.textSecondary }]}>
              #{String(details.id).padStart(4, '0')}
            </Text>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handlePlayCry} style={[styles.roundActionBtn, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="volume-high" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleFavorite(details.id)} style={[styles.roundActionBtn, { backgroundColor: theme.colors.card }]}>
                <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={20} color={favorited ? '#FF5252' : theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: isShiny ? (details.sprites.artworkShiny || details.sprites.artwork) : details.sprites.artwork }}
              style={styles.largeArtwork}
              resizeMode="contain"
            />
          </View>

          <View style={styles.heroControls}>
            <TouchableOpacity
              style={[styles.toggleButton, { backgroundColor: isShiny ? theme.colors.primary : theme.colors.card }]}
              onPress={() => setIsShiny(!isShiny)}
            >
              <Ionicons name="sparkles" size={16} color={isShiny ? '#ffffff' : theme.colors.text} />
              <Text style={[styles.toggleText, { color: isShiny ? '#ffffff' : theme.colors.text }]}>
                {isShiny ? 'Shiny' : 'Default'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Details Body */}
        <View style={styles.detailsBody}>
          {/* Name & badges */}
          <View style={styles.titleSection}>
            <Text style={[styles.nameText, { color: theme.colors.text }]}>
              {details.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
            <View style={styles.badgeRow}>
              {isChamp && <View style={[styles.badge, styles.champBadge]}><Text style={styles.badgeText}>🏆 Champions</Text></View>}
              {isNew && <View style={[styles.badge, styles.newBadge]}><Text style={styles.badgeText}>✨ New</Text></View>}
            </View>
          </View>

          {/* Types */}
          <View style={styles.typesRow}>
            {details.types.map(t => {
              const tc = TYPE_COLORS[t.toLowerCase()] || '#A8A878';
              return (
                <View key={t} style={[styles.typeBadge, { backgroundColor: tc }]}>
                  <Text style={styles.typeText}>{t.toUpperCase()}</Text>
                </View>
              );
            })}
          </View>

          {/* Physical */}
          <View style={styles.physicalRow}>
            <View style={[styles.physicalCard, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="resize" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.physicalVal, { color: theme.colors.text }]}>{details.height} m</Text>
              <Text style={[styles.physicalLabel, { color: theme.colors.textSecondary }]}>Height</Text>
            </View>
            <View style={[styles.physicalCard, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="speedometer" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.physicalVal, { color: theme.colors.text }]}>{details.weight} kg</Text>
              <Text style={[styles.physicalLabel, { color: theme.colors.textSecondary }]}>Weight</Text>
            </View>
            <View style={[styles.physicalCard, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="disc" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.physicalVal, { color: theme.colors.text }]}>{details.lore?.captureRate || '?'}</Text>
              <Text style={[styles.physicalLabel, { color: theme.colors.textSecondary }]}>Catch Rate</Text>
            </View>
          </View>

          {/* ── TAB CONTENT ── */}
          {activeTab === 'info' ? (
            <>
              {/* Abilities — styled like screenshot */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Abilities</Text>
                <View style={[styles.abilitiesCard, { backgroundColor: theme.colors.card }]}>
                  {details.abilities.map((a, idx) => (
                    <TouchableOpacity
                      key={a.name}
                      style={[
                        styles.abilityListItem,
                        idx < details.abilities.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                        a.isHidden && { opacity: 0.85 },
                      ]}
                      onPress={() => handleAbilityPress(a.name)}
                      activeOpacity={0.7}
                    >
                      {a.isHidden && (
                        <View style={[styles.hiddenPill, { backgroundColor: typeColor + '30', borderColor: typeColor }]}>
                          <Text style={[styles.hiddenPillText, { color: typeColor }]}>Hidden</Text>
                        </View>
                      )}
                      <Text style={[styles.abilityListText, { color: theme.colors.text }, a.isHidden && { flex: 1 }]}>
                        {a.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Text>
                      <Ionicons name="information-circle-outline" size={18} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Base Stats */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Base Stats</Text>
                <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
                  <StatBar label="HP" value={details.stats.hp} color="#FF5252" />
                  <StatBar label="Attack" value={details.stats.attack} color="#FF7A00" />
                  <StatBar label="Defense" value={details.stats.defense} color="#FFCB05" />
                  <StatBar label="Sp. Atk" value={details.stats.specialAttack} color="#4D62E8" />
                  <StatBar label="Sp. Def" value={details.stats.specialDefense} color="#4CAF50" />
                  <StatBar label="Speed" value={details.stats.speed} color="#00D2D3" />
                  <View style={[styles.bstTotalRow, { borderTopColor: theme.colors.border }]}>
                    <Text style={[styles.bstTotalLabel, { color: theme.colors.textSecondary }]}>Total (BST)</Text>
                    <Text style={[styles.bstTotalVal, { color: typeColor }]}>
                      {details.stats.hp + details.stats.attack + details.stats.defense + details.stats.specialAttack + details.stats.specialDefense + details.stats.speed}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Lore */}
              {details.lore?.availableVersions?.length > 0 && selectedLoreVersion && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pokédex & Encounters</Text>
                  <TouchableOpacity
                    style={[styles.dropdownTrigger, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                    onPress={() => setIsLoreDropdownOpen(true)}
                  >
                    <Text style={[styles.dropdownTriggerText, { color: theme.colors.text }]}>
                      {selectedLoreVersion.replace(/-/g, ' ').toUpperCase()}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <View style={[styles.loreContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    {details.lore.flavorTexts[selectedLoreVersion] ? (
                      <Text style={[styles.flavorText, { color: theme.colors.text }]}>"{details.lore.flavorTexts[selectedLoreVersion]}"</Text>
                    ) : (
                      <Text style={[styles.flavorText, { color: theme.colors.textSecondary, fontStyle: 'italic' }]}>No entry for this game.</Text>
                    )}
                    <Text style={[styles.matchupSubtitle, { color: theme.colors.text, marginTop: 16 }]}>Wild Encounters</Text>
                    {details.lore.locations[selectedLoreVersion]?.length > 0 ? (
                      <View style={{ gap: 8, marginTop: 4 }}>
                        {details.lore.locations[selectedLoreVersion].map((loc, idx) => (
                          <View key={idx} style={styles.locationRow}>
                            <Ionicons name="location" size={14} color={theme.colors.primary} />
                            <Text style={[styles.locationText, { color: theme.colors.text }]}>{loc.name.replace(/-/g, ' ')}</Text>
                            <Text style={[styles.methodText, { color: theme.colors.textSecondary }]}>({loc.methods.join(', ').replace(/-/g, ' ')})</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={[styles.locationText, { color: theme.colors.textSecondary, marginTop: 4 }]}>Not found in the wild in this game.</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Type Matchups */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Type Matchups</Text>
                <View style={[styles.weaknessContainer, { backgroundColor: theme.colors.card }]}>
                  <Text style={[styles.matchupSubtitle, { color: theme.colors.text }]}>Weaknesses</Text>
                  {weaknesses.length > 0 ? (
                    <View style={styles.matchupGrid}>
                      {weaknesses.map(w => {
                        const tc = TYPE_COLORS[w.type] || '#A8A878';
                        return (
                          <View key={w.type} style={[styles.matchupBadge, { backgroundColor: tc }]}>
                            <Text style={styles.matchupText}>{w.type.toUpperCase()}</Text>
                            <Text style={styles.matchupVal}>x{w.value}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : <Text style={[styles.noMatchupText, { color: theme.colors.textSecondary }]}>None</Text>}

                  <Text style={[styles.matchupSubtitle, { color: theme.colors.text, marginTop: 14 }]}>Resistances</Text>
                  {resistances.length > 0 ? (
                    <View style={styles.matchupGrid}>
                      {resistances.map(r => {
                        const tc = TYPE_COLORS[r.type] || '#A8A878';
                        return (
                          <View key={r.type} style={[styles.matchupBadge, { backgroundColor: tc }]}>
                            <Text style={styles.matchupText}>{r.type.toUpperCase()}</Text>
                            <Text style={styles.matchupVal}>x{r.value}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : <Text style={[styles.noMatchupText, { color: theme.colors.textSecondary }]}>None</Text>}

                  {immunities.length > 0 && (
                    <>
                      <Text style={[styles.matchupSubtitle, { color: theme.colors.text, marginTop: 14 }]}>Immunities</Text>
                      <View style={styles.matchupGrid}>
                        {immunities.map(i => {
                          const tc = TYPE_COLORS[i.type] || '#A8A878';
                          return (
                            <View key={i.type} style={[styles.matchupBadge, { backgroundColor: tc }]}>
                              <Text style={styles.matchupText}>{i.type.toUpperCase()}</Text>
                              <Text style={styles.matchupVal}>0x</Text>
                            </View>
                          );
                        })}
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Evolution */}
              {evolutionChain && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Evolution Chain</Text>
                  <View style={styles.evolutionWrapper}>
                    <EvolutionTree node={evolutionChain} currentId={details.id} theme={theme} navigation={navigation} />
                  </View>
                </View>
              )}

              {/* Alternate Forms */}
              {alternateForms.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Alternative forms</Text>
                  <View style={[styles.formsContainerCard, { backgroundColor: theme.colors.card }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantScroll}>
                      {baseFormEntry && (
                        <VariantFormCard item={baseFormEntry} theme={theme} navigation={navigation} />
                      )}
                      {alternateForms.map(item => (
                        <VariantFormCard key={`alt-${item.id}`} item={item} theme={theme} navigation={navigation} />
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}

              {/* Mega Evolution */}
              {megaForms.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mega Evolution</Text>
                  <View style={[styles.formsContainerCard, { backgroundColor: theme.colors.card }]}>
                    {megaForms.map(megaItem => (
                      <View key={`mega-row-${megaItem.id}`} style={styles.megaRowLayout}>
                        {baseFormEntry && (
                          <VariantFormCard item={baseFormEntry} theme={theme} navigation={navigation} />
                        )}
                        <View style={styles.megaArrowWrapper}>
                          <Ionicons name="swap-horizontal" size={20} color={theme.colors.textSecondary} />
                        </View>
                        <VariantFormCard item={megaItem} theme={theme} navigation={navigation} />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : activeTab === 'moves' ? (
            /* ── MOVES TAB ── */
            <View style={styles.section}>
              {/* Dropdown row for Learn Method and Game Version selector */}
              <View style={[styles.movesDropdownRow]}>
                <TouchableOpacity 
                  style={[styles.movesDropdownTrigger, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => setIsMethodDropdownOpen(true)}
                >
                  <Text style={[styles.movesDropdownText, { color: theme.colors.text }]}>
                    {activeMethodLabelMap[displayMethod]?.label || 'Learn Method'}
                  </Text>
                  <Ionicons name="caret-down" size={12} color={theme.colors.textSecondary} style={{ marginLeft: 6 }} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.movesDropdownTrigger, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => setIsVersionDropdownOpen(true)}
                >
                  <Text style={[styles.movesDropdownText, { color: theme.colors.text }]}>
                    {selectedVersion.replace(/-/g, ' ').toUpperCase()}
                  </Text>
                  <Ionicons name="caret-down" size={12} color={theme.colors.textSecondary} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>

              {/* Moves List cards */}
              {movesList.length > 0 ? (
                movesList.map((m, index) => (
                  <MoveRow 
                    key={`${displayMethod}-${m.name}-${index}`} 
                    move={m} 
                    theme={theme} 
                    onPress={handleMovePress} 
                  />
                ))
              ) : (
                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 24, fontStyle: 'italic' }}>
                  No moves learnable via {activeMethodLabelMap[displayMethod]?.label || displayMethod} in this version.
                </Text>
              )}
            </View>
          ) : (
            /* ── MORE TAB: Training & Breeding ── */
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Training</Text>
              <View style={[styles.moreCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.moreRow}>
                  <Text style={[styles.moreVal, { color: typeColor }]}>{details.training?.evYield ?? '—'}</Text>
                  <Text style={[styles.moreLabel, { color: theme.colors.textSecondary }]}>EV Yield</Text>
                </View>
                <View style={[styles.moreDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.moreRow}>
                  <Text style={[styles.moreVal, { color: typeColor }]}>
                    {details.training?.captureRate ?? '?'}
                    {details.training?.captureRate != null
                      ? ` (${((details.training.captureRate / 255) * 100).toFixed(1)}% · Poké Ball · Full HP)`
                      : ''}
                  </Text>
                  <Text style={[styles.moreLabel, { color: theme.colors.textSecondary }]}>Catch rate</Text>
                </View>
                <View style={[styles.moreDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.moreRow}>
                  <Text style={[styles.moreVal, { color: typeColor, textTransform: 'capitalize' }]}>
                    {details.training?.growthRate ?? '?'}
                  </Text>
                  <Text style={[styles.moreLabel, { color: theme.colors.textSecondary }]}>Growth rate</Text>
                </View>
                <View style={[styles.moreDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.moreHalfRow}>
                  <View style={styles.moreHalf}>
                    <Text style={[styles.moreVal, { color: typeColor }]}>{details.training?.baseHappiness ?? '?'}</Text>
                    <Text style={[styles.moreLabel, { color: theme.colors.textSecondary }]}>Base happiness</Text>
                  </View>
                  <View style={[styles.moreHalfDivider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.moreHalf}>
                    <Text style={[styles.moreVal, { color: typeColor }]}>{details.training?.baseExperience ?? '?'}</Text>
                    <Text style={[styles.moreLabel, { color: theme.colors.textSecondary }]}>Base experience</Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>Breeding</Text>
              <View style={[styles.moreCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.moreRow}>
                  {details.breeding?.genderless ? (
                    <Text style={[styles.moreVal, { color: theme.colors.textSecondary }]}>Genderless</Text>
                  ) : (
                    <View style={styles.genderBarWrapper}>
                      <View style={[styles.genderBarMale, { flex: details.breeding?.maleRatio ?? 50 }]}>
                        <Ionicons name="male" size={11} color="#fff" />
                        <Text style={styles.genderPct}>{details.breeding?.maleRatio ?? '?'}%</Text>
                      </View>
                      <View style={[styles.genderBarFemale, { flex: details.breeding?.femaleRatio ?? 50 }]}>
                        <Text style={styles.genderPct}>{details.breeding?.femaleRatio ?? '?'}%</Text>
                        <Ionicons name="female" size={11} color="#fff" />
                      </View>
                    </View>
                  )}
                  <Text style={[styles.moreLabel, { color: theme.colors.textSecondary }]}>Gender ratio</Text>
                </View>
                <View style={[styles.moreDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.moreRow}>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    {(details.breeding?.eggGroups ?? []).map(g => (
                      <View key={g} style={[styles.eggGroupPill, { backgroundColor: typeColor + '25', borderColor: typeColor }]}>
                        <Text style={[styles.eggGroupText, { color: typeColor }]}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[styles.moreLabel, { color: theme.colors.textSecondary }]}>Egg groups</Text>
                </View>
                <View style={[styles.moreDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.moreRow}>
                  <Text style={[styles.moreVal, { color: typeColor }]}>
                    {details.breeding?.eggCycles ?? '?'}
                    {details.breeding?.hatchSteps ? ` (${details.breeding.hatchSteps.toLocaleString()} steps)` : ''}
                  </Text>
                  <Text style={[styles.moreLabel, { color: theme.colors.textSecondary }]}>Egg cycles</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Tab Ribbon ── */}
      <View style={[
        styles.bottomRibbon,
        {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          paddingBottom: insets.bottom || 8,
        }
      ]}>
        {/* Info Tab */}
        <TouchableOpacity
          style={styles.ribbonTab}
          onPress={() => setActiveTab('info')}
          activeOpacity={0.75}
        >
          <Ionicons
            name="information-circle"
            size={24}
            color={activeTab === 'info' ? typeColor : theme.colors.textSecondary}
          />
          <Text style={[styles.ribbonLabel, { color: activeTab === 'info' ? typeColor : theme.colors.textSecondary }]}>
            Info
          </Text>
          {activeTab === 'info' && <View style={[styles.ribbonIndicator, { backgroundColor: typeColor }]} />}
        </TouchableOpacity>

        {/* Moves Tab */}
        <TouchableOpacity
          style={styles.ribbonTab}
          onPress={() => setActiveTab('moves')}
          activeOpacity={0.75}
        >
          <Ionicons
            name="flash"
            size={24}
            color={activeTab === 'moves' ? typeColor : theme.colors.textSecondary}
          />
          <Text style={[styles.ribbonLabel, { color: activeTab === 'moves' ? typeColor : theme.colors.textSecondary }]}>
            Moves
          </Text>
          {activeTab === 'moves' && <View style={[styles.ribbonIndicator, { backgroundColor: typeColor }]} />}
        </TouchableOpacity>

        {/* More Tab */}
        <TouchableOpacity
          style={styles.ribbonTab}
          onPress={() => setActiveTab('more')}
          activeOpacity={0.75}
        >
          <Ionicons
            name="ellipsis-horizontal-circle"
            size={24}
            color={activeTab === 'more' ? typeColor : theme.colors.textSecondary}
          />
          <Text style={[styles.ribbonLabel, { color: activeTab === 'more' ? typeColor : theme.colors.textSecondary }]}>
            More
          </Text>
          {activeTab === 'more' && <View style={[styles.ribbonIndicator, { backgroundColor: typeColor }]} />}
        </TouchableOpacity>

        {/* Add to Team */}
        <TouchableOpacity
          style={styles.ribbonTab}
          onPress={handleTeamAction}
          activeOpacity={0.75}
        >
          <View style={[
            styles.teamIconCircle,
            { backgroundColor: inTeam ? '#4CAF50' : typeColor }
          ]}>
            <Ionicons
              name={inTeam ? 'checkmark' : 'add'}
              size={22}
              color="#ffffff"
            />
          </View>
          <Text style={[styles.ribbonLabel, { color: inTeam ? '#4CAF50' : typeColor }]}>
            {inTeam ? 'In Team' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 16, fontWeight: '700' },

  // Hero
  heroBanner: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  floatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  idText: { fontSize: 18, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 10 },
  roundActionBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15,
  },
  imageWrapper: {
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.65,
    height: width * 0.55,
  },
  largeArtwork: { width: '100%', height: '100%' },
  heroControls: { flexDirection: 'row', gap: 12, marginTop: 10 },
  toggleButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, elevation: 2, gap: 6,
  },
  toggleText: { fontSize: 12, fontWeight: '700' },

  // Body
  detailsBody: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  titleSection: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8,
  },
  nameText: { fontSize: 26, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  champBadge: { backgroundColor: '#FFD700' },
  newBadge: { backgroundColor: '#1AD1B7' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#000' },
  typesRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  typeBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  typeText: { fontSize: 11, color: '#FFF', fontWeight: '800' },
  physicalRow: { flexDirection: 'row', gap: 15, marginBottom: 24 },
  physicalCard: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', elevation: 1.5 },
  physicalVal: { fontSize: 15, fontWeight: '800', marginVertical: 4 },
  physicalLabel: { fontSize: 11, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },

  // Abilities — datadex style
  abilitiesCard: { borderRadius: 16, overflow: 'hidden', elevation: 2 },
  abilityListItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  hiddenPill: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  hiddenPillText: { fontSize: 10, fontWeight: '800' },
  abilityListText: { flex: 1, fontSize: 15, fontWeight: '700' },
  abilityDescText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },

  // Stats
  statsCard: { borderRadius: 20, padding: 16, elevation: 2 },
  bstTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1,
  },
  bstTotalLabel: { fontSize: 13, fontWeight: '700' },
  bstTotalVal: { fontSize: 18, fontWeight: '900' },

  // Lore
  dropdownTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12,
  },
  dropdownTriggerText: { fontSize: 14, fontWeight: '700' },
  loreContainer: { padding: 16, borderRadius: 16, borderWidth: 1 },
  flavorText: { fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  locationText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  methodText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  matchupSubtitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },

  // Type matchups
  weaknessContainer: { borderRadius: 20, padding: 16, elevation: 2 },
  matchupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  matchupBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 4 },
  matchupText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  matchupVal: { color: '#fff', fontSize: 9, fontWeight: '850', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 3, borderRadius: 3 },
  noMatchupText: { fontSize: 12, fontStyle: 'italic' },

  // Evolution
  evolutionWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  evolutionScroll: { paddingVertical: 4 },
  arrowContainer: { alignItems: 'center', justifyContent: 'center', marginHorizontal: 4, gap: 1 },
  levelText: { fontSize: 8, fontWeight: '700', textAlign: 'center' },
  stageCard: { borderRadius: 12, padding: 8, alignItems: 'center', width: 75, elevation: 1.5 },
  stageImage: { width: 44, height: 44, marginBottom: 2 },
  stageName: { fontSize: 9, fontWeight: '700', textAlign: 'center' },

  // Moves tab card styles
  moveCardContainer: {
    marginBottom: 12,
    paddingLeft: 22,
    position: 'relative',
  },
  levelCircle: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelCircleText: {
    fontSize: 13,
    fontWeight: '800',
  },
  moveCardContent: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  moveTitleBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 30,
    paddingRight: 12,
  },
  moveTitleText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  moveBadgesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  moveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moveBadgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '850',
    letterSpacing: 0.5,
  },
  moveStatsBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 30,
    paddingRight: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#00000015',
  },
  moveStatTextLight: {
    fontSize: 9,
    color: '#888',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  moveStatTextBold: {
    fontSize: 15,
    fontWeight: '800',
  },
  movesDropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  movesDropdownTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  movesDropdownText: {
    fontSize: 14,
    fontWeight: '700',
  },
  moveStatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moveStatKey: { fontSize: 13, fontWeight: '600' },
  moveStatVal: { fontSize: 14, fontWeight: '800' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  dropdownModalContainer: { width: '100%', borderRadius: 20, overflow: 'hidden', elevation: 10, marginBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#00000010' },
  dropdownItemText: { fontSize: 14, fontWeight: '600' },
  modalBody: { padding: 20, minHeight: 100, justifyContent: 'center' },

  // Bottom ribbon
  bottomRibbon: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  ribbonTab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 10, paddingBottom: 4, position: 'relative',
  },
  ribbonLabel: { fontSize: 10, fontWeight: '700', marginTop: 3 },
  ribbonIndicator: {
    position: 'absolute', top: 0, left: '25%', right: '25%',
    height: 3, borderRadius: 2,
  },
  teamIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2,
  },

  // More tab
  moreCard: {
    borderRadius: 16, overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2,
  },
  moreRow: {
    paddingHorizontal: 16, paddingVertical: 14,
  },
  moreVal: {
    fontSize: 15, fontWeight: '700', marginBottom: 3,
  },
  moreLabel: {
    fontSize: 12, fontWeight: '500',
  },
  moreDivider: { height: 1 },
  moreHalfRow: {
    flexDirection: 'row',
  },
  moreHalf: {
    flex: 1, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center',
  },
  moreHalfDivider: { width: 1 },

  // Gender bar
  genderBarWrapper: {
    flexDirection: 'row', borderRadius: 8, overflow: 'hidden',
    height: 28, marginBottom: 4, width: '100%',
  },
  genderBarMale: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    paddingHorizontal: 8, gap: 4, backgroundColor: '#5B9BD5',
  },
  genderBarFemale: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    paddingHorizontal: 8, gap: 4, backgroundColor: '#E8527C',
  },
  genderPct: { color: '#fff', fontSize: 11, fontWeight: '800' },

  // Egg groups
  eggGroupPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  eggGroupText: { fontSize: 13, fontWeight: '700' },

  // Variant Form Styles (Megas & Alternate Forms)
  formsContainerCard: {
    borderRadius: 20,
    padding: 16,
    elevation: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    marginBottom: 8,
  },
  variantScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  variantCard: {
    width: 125,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    marginRight: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  variantArch: {
    width: '100%',
    height: 80,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  variantImage: {
    width: 62,
    height: 62,
  },
  variantCardContent: {
    padding: 8,
    alignItems: 'center',
    width: '100%',
  },
  variantDex: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 1,
  },
  variantName: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    width: '100%',
  },
  variantTypesCol: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  variantTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  variantTypePillText: {
    fontSize: 8,
    fontWeight: '850',
  },
  megaRowLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    gap: 16,
  },
  megaArrowWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0000000C',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
