import React, { useState, useEffect } from 'react';
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
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTeam } from '../context/TeamContext';
import {
  getPokemonDetails,
  getPokemonEvolutionChain,
  calculateWeaknessesAndResistances,
  getAbilityDetails
} from '../services/pokemonService';
import { TYPE_COLORS } from '../components/FilterModal';
import { StatBar } from '../components/StatBar';
import { championsPokemon } from '../data/championsPokemon';
import { newlyAddedPokemon } from '../data/newlyAdded';

const { width } = Dimensions.get('window');

export const PokemonDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToTeam, removeFromTeam, isInTeam, canAddToTeam } = useTeam();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [isShiny, setIsShiny] = useState(false);
  const [selectedLoreVersion, setSelectedLoreVersion] = useState(null);
  const [isLoreDropdownOpen, setIsLoreDropdownOpen] = useState(false);
  
  // Ability Modal State
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [abilityDesc, setAbilityDesc] = useState('');
  const [isLoadingAbility, setIsLoadingAbility] = useState(false);

  const player = useAudioPlayer(details?.cryUrl);

  // Load details on mount or ID change
  useEffect(() => {
    let active = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [pokeDetails, pokeEvolutions] = await Promise.all([
          getPokemonDetails(id),
          getPokemonEvolutionChain(id)
        ]);
        
        if (active) {
          setDetails(pokeDetails);
          setEvolutionChain(pokeEvolutions);
          setLoading(false);
          
          if (pokeDetails.lore && pokeDetails.lore.availableVersions.length > 0) {
            setSelectedLoreVersion(pokeDetails.lore.availableVersions[0]);
          }
        }
      } catch (error) {
        console.error("Error loading Pokémon details:", error);
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  // Audio Playback for Cries
  const handlePlayCry = () => {
    if (player) {
      player.play();
    }
  };

  const handleAbilityPress = async (abilityName) => {
    setSelectedAbility(abilityName);
    setAbilityDesc('');
    setIsLoadingAbility(true);
    setIsAbilityModalOpen(true);

    const desc = await getAbilityDetails(abilityName);
    setAbilityDesc(desc);
    setIsLoadingAbility(false);
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
        stats: details.stats, // Pass whole stats object for full builder stats
      });
      if (!result.success) {
        alert(result.message);
      }
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

  // Calculate weakness relations
  const { weaknesses, resistances, immunities } = calculateWeaknessesAndResistances(details.types);

  // Champions logic
  const isChamp = championsPokemon.includes(details.name.toLowerCase());
  const isNew = newlyAddedPokemon.includes(details.name.toLowerCase());

  // Dynamic card colors
  const primaryType = details.types[0];
  const typeColor = TYPE_COLORS[primaryType.toLowerCase()] || '#A8A878';
  const bannerBgColor = theme.dark ? `${typeColor}2B` : `${typeColor}15`;

  const favorited = isFavorite(details.id);
  const inTeam = isInTeam(details.id);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 1. Header Hero Banner */}
      <View style={[styles.heroBanner, { backgroundColor: bannerBgColor }]}>
        {/* Floating ID & Action Buttons */}
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

        {/* Lore Version Selector Modal */}
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
                        style={[
                          styles.dropdownItem,
                          isActive && { backgroundColor: typeColor + '20' }
                        ]}
                        onPress={() => {
                          setSelectedLoreVersion(version);
                          setIsLoreDropdownOpen(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText, 
                          { color: theme.colors.text },
                          isActive && { color: typeColor, fontWeight: '800' }
                        ]}>
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

        {/* Ability Explanation Modal */}
        <Modal visible={isAbilityModalOpen} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsAbilityModalOpen(false)}>
            <Pressable style={[styles.dropdownModalContainer, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.modalHeader, { backgroundColor: typeColor }]}>
                <Text style={styles.modalTitle}>{selectedAbility ? selectedAbility.replace('-', ' ').toUpperCase() : 'Ability'}</Text>
                <TouchableOpacity onPress={() => setIsAbilityModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                {isLoadingAbility ? (
                  <View style={styles.modalLoading}>
                    <ActivityIndicator size="large" color={typeColor} />
                  </View>
                ) : (
                  <Text style={[styles.abilityDescText, { color: theme.colors.text }]}>
                    {abilityDesc}
                  </Text>
                )}
              </View>
            </Pressable>
          </TouchableOpacity>
        </Modal>

        {/* Large Artwork */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: isShiny ? (details.sprites.artworkShiny || details.sprites.artwork) : details.sprites.artwork }}
            style={styles.largeArtwork}
            resizeMode="contain"
          />
        </View>

        {/* Shiny & Team Toggle Row */}
        <View style={styles.heroControls}>
          {/* Shiny Toggle */}
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: isShiny ? theme.colors.primary : theme.colors.card }]}
            onPress={() => setIsShiny(!isShiny)}
          >
            <Ionicons name="sparkles" size={16} color={isShiny ? '#ffffff' : theme.colors.text} />
            <Text style={[styles.toggleText, { color: isShiny ? '#ffffff' : theme.colors.text }]}>
              {isShiny ? 'Shiny Mode' : 'Default Mode'}
            </Text>
          </TouchableOpacity>

          {/* Team Toggle */}
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: inTeam ? '#4CAF50' : theme.colors.card }]}
            onPress={handleTeamAction}
          >
            <Ionicons name={inTeam ? 'checkmark' : 'add'} size={16} color={inTeam ? '#ffffff' : theme.colors.text} />
            <Text style={[styles.toggleText, { color: inTeam ? '#ffffff' : theme.colors.text }]}>
              {inTeam ? 'In Team' : 'Add to Team'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Details Body */}
      <View style={styles.detailsBody}>
        {/* Name and Badges */}
        <View style={styles.titleSection}>
          <Text style={[styles.nameText, { color: theme.colors.text }]}>
            {details.name.charAt(0).toUpperCase() + details.name.slice(1)}
          </Text>
          <View style={styles.badgeRow}>
            {isChamp && (
              <View style={[styles.badge, styles.champBadge]}>
                <Text style={styles.badgeText}>🏆 Champions</Text>
              </View>
            )}
            {isNew && (
              <View style={[styles.badge, styles.newBadge]}>
                <Text style={styles.badgeText}>✨ New in Champions</Text>
              </View>
            )}
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

        {/* 2. Physical Details & Catch Rate */}
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

        {/* 3. Abilities */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Abilities</Text>
          <View style={styles.abilityRow}>
            {details.abilities.map(a => (
              <TouchableOpacity 
                key={a.name} 
                style={[styles.abilityBadge, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => handleAbilityPress(a.name)}
                activeOpacity={0.7}
              >
                <Text style={[styles.abilityText, { color: theme.colors.text }]}>
                  {a.name.replace('-', ' ').toUpperCase()}
                </Text>
                {a.isHidden && (
                  <View style={styles.hiddenAbilityBadge}>
                    <Text style={styles.hiddenAbilityText}>H</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. Base Stats Segment */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Base Stats</Text>
          <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
            <StatBar label="HP" value={details.stats.hp} color="#FF5252" />
            <StatBar label="Attack" value={details.stats.attack} color="#FF7A00" />
            <StatBar label="Defense" value={details.stats.defense} color="#FFCB05" />
            <StatBar label="SpecialAttack" value={details.stats.specialAttack} color="#4D62E8" />
            <StatBar label="SpecialDefense" value={details.stats.specialDefense} color="#4CAF50" />
            <StatBar label="Speed" value={details.stats.speed} color="#00D2D3" />
          </View>
        </View>

        {/* 4.5 Pokédex Lore & Encounters */}
        {details.lore?.availableVersions?.length > 0 && selectedLoreVersion && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pokédex & Encounters</Text>
            
            <View>
              <TouchableOpacity 
                style={[styles.dropdownTrigger, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => setIsLoreDropdownOpen(true)}
              >
                <Text style={[styles.dropdownTriggerText, { color: theme.colors.text }]}>
                  {selectedLoreVersion ? selectedLoreVersion.replace(/-/g, ' ').toUpperCase() : 'Select Game...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.loreContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {details.lore.flavorTexts[selectedLoreVersion] ? (
                <Text style={[styles.flavorText, { color: theme.colors.text }]}>
                  "{details.lore.flavorTexts[selectedLoreVersion]}"
                </Text>
              ) : (
                <Text style={[styles.flavorText, { color: theme.colors.textSecondary, fontStyle: 'italic' }]}>
                  No Pokédex entry found for this game.
                </Text>
              )}

              <Text style={[styles.matchupSubtitle, { color: theme.colors.text, marginTop: 16 }]}>Wild Encounters</Text>
              {details.lore.locations[selectedLoreVersion]?.length > 0 ? (
                <View style={{ gap: 8, marginTop: 4 }}>
                  {details.lore.locations[selectedLoreVersion].map((loc, idx) => (
                    <View key={idx} style={styles.locationRow}>
                      <Ionicons name="location" size={14} color={theme.colors.primary} />
                      <Text style={[styles.locationText, { color: theme.colors.text }]}>
                        {loc.name.replace(/-/g, ' ')}
                      </Text>
                      <Text style={[styles.methodText, { color: theme.colors.textSecondary }]}>
                        ({loc.methods.join(', ').replace(/-/g, ' ')})
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.locationText, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                  Cannot be found in the wild in this game.
                </Text>
              )}
            </View>
          </View>
        )}

        {/* 5. Weaknesses & Resistances */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Type Matchups</Text>
          <View style={[styles.weaknessContainer, { backgroundColor: theme.colors.card }]}>
            {/* Weaknesses */}
            <Text style={[styles.matchupSubtitle, { color: theme.colors.text }]}>Takes Extra Damage From (Weakness)</Text>
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
            ) : (
              <Text style={[styles.noMatchupText, { color: theme.colors.textSecondary }]}>None</Text>
            )}

            {/* Resistances */}
            <Text style={[styles.matchupSubtitle, { color: theme.colors.text, marginTop: 14 }]}>Takes Less Damage From (Resistance)</Text>
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
            ) : (
              <Text style={[styles.noMatchupText, { color: theme.colors.textSecondary }]}>None</Text>
            )}

            {/* Immunities */}
            {immunities.length > 0 && (
              <>
                <Text style={[styles.matchupSubtitle, { color: theme.colors.text, marginTop: 14 }]}>Takes No Damage From (Immune)</Text>
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

        {/* 6. Evolution Chain */}
        {evolutionChain && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Evolution Chain</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.evolutionScroll}>
              <EvolutionTree node={evolutionChain} currentId={details.id} theme={theme} navigation={navigation} />
            </ScrollView>
          </View>
        )}

        {/* 7. Movesets Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.movesButton, { backgroundColor: typeColor }]}
            onPress={() => navigation.navigate('Moveset', { 
              moves: details.moves, 
              name: details.name,
              primaryType: primaryType 
            })}
          >
            <Ionicons name="list" size={20} color="#ffffff" />
            <Text style={styles.movesButtonText}>View Full Movesets</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const EvolutionTree = ({ node, currentId, theme, navigation }) => {
  if (!node) return null;

  const isCurrent = node.id === currentId;
  const stageArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${node.id}.png`;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => {
          if (!isCurrent) {
            navigation.navigate('PokemonDetail', { id: node.id, name: node.name });
          }
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
                  <Text style={[styles.levelText, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                    Lvl {child.minLevel}
                  </Text>
                )}
                {child.item && (
                  <Text style={[styles.levelText, { color: theme.colors.textSecondary, textAlign: 'center', maxWidth: 70 }]}>
                    {child.item.replace('-', ' ')}
                  </Text>
                )}
                {child.region && (
                  <Text style={[styles.levelText, { color: theme.colors.textSecondary, textAlign: 'center', maxWidth: 70 }]}>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
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
  idText: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roundActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
  },
  imageWrapper: {
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.65,
    height: width * 0.65,
  },
  largeArtwork: {
    width: '100%',
    height: '100%',
  },
  heroControls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    gap: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailsBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  nameText: {
    fontSize: 26,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  champBadge: {
    backgroundColor: '#FFD700',
  },
  newBadge: {
    backgroundColor: '#1AD1B7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
  typesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  physicalRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 24,
  },
  physicalCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 1.5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  physicalVal: {
    fontSize: 15,
    fontWeight: '800',
    marginVertical: 4,
  },
  physicalLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  abilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  abilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  abilityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hiddenAbilityBadge: {
    marginLeft: 6,
    backgroundColor: '#E53E3E',
    borderRadius: 4,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenAbilityText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  statsCard: {
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weaknessContainer: {
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },
  matchupSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  matchupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  matchupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  matchupText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  matchupVal: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '850',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 3,
    borderRadius: 3,
  },
  noMatchupText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  evolutionScroll: {
    paddingVertical: 4,
  },
  stageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    gap: 2,
  },
  levelText: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  stageCard: {
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    width: 90,
    elevation: 1.5,
  },
  stageImage: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },
  stageName: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  movesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  movesButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  dropdownTriggerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownModalContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loreContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  flavorText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  methodText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  modalBody: {
    padding: 20,
    minHeight: 100,
    justifyContent: 'center',
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  abilityDescText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
});
