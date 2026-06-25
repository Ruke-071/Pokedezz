import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Keyboard
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getPokemonDetails } from '../services/pokemonService';
import { pokemonIndex } from '../data/pokemonIndex';
import { TYPE_COLORS } from '../components/FilterModal';
import { Ionicons } from '@expo/vector-icons';

export const CompareScreen = () => {
  const { theme } = useTheme();

  // Selected pokemon state
  const [poke1, setPoke1] = useState(null);
  const [poke2, setPoke2] = useState(null);

  // Search input and suggestions state
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);

  // Full detail state
  const [details1, setDetails1] = useState(null);
  const [details2, setDetails2] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (text, slot) => {
    if (slot === 1) {
      setSearch1(text);
      if (text.trim().length > 1) {
        const query = text.toLowerCase().trim();
        const matches = pokemonIndex
          .filter(p => p.name.includes(query) || String(p.id).includes(query))
          .slice(0, 5);
        setSuggestions1(matches);
      } else {
        setSuggestions1([]);
      }
    } else {
      setSearch2(text);
      if (text.trim().length > 1) {
        const query = text.toLowerCase().trim();
        const matches = pokemonIndex
          .filter(p => p.name.includes(query) || String(p.id).includes(query))
          .slice(0, 5);
        setSuggestions2(matches);
      } else {
        setSuggestions2([]);
      }
    }
  };

  const selectPokemon = async (pokemon, slot) => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const details = await getPokemonDetails(pokemon.id);
      if (slot === 1) {
        setPoke1(pokemon);
        setDetails1(details);
        setSearch1(pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1));
        setSuggestions1([]);
      } else {
        setPoke2(pokemon);
        setDetails2(details);
        setSearch2(pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1));
        setSuggestions2([]);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to load details for comparison.");
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = (slot) => {
    if (slot === 1) {
      setPoke1(null);
      setDetails1(null);
      setSearch1('');
    } else {
      setPoke2(null);
      setDetails2(null);
      setSearch2('');
    }
  };

  // Compare stats helper: returns 1 if val1 > val2, 2 if val2 > val1, 0 if equal
  const getWinner = (val1, val2) => {
    if (val1 > val2) return 1;
    if (val2 > val1) return 2;
    return 0;
  };

  const renderStatComparisonRow = (label, statKey) => {
    if (!details1 || !details2) return null;
    
    const val1 = details1.stats[statKey];
    const val2 = details2.stats[statKey];
    const winner = getWinner(val1, val2);

    return (
      <View style={[styles.compareRow, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.compareCol}>
          <Text
            style={[
              styles.compareValue,
              {
                color: winner === 1 ? '#4CAF50' : theme.colors.text,
                fontWeight: winner === 1 ? '800' : '500',
              }
            ]}
          >
            {val1}
            {winner === 1 && <Ionicons name="caret-up" size={12} color="#4CAF50" />}
          </Text>
        </View>

        <Text style={[styles.compareLabel, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>

        <View style={styles.compareCol}>
          <Text
            style={[
              styles.compareValue,
              {
                color: winner === 2 ? '#4CAF50' : theme.colors.text,
                fontWeight: winner === 2 ? '800' : '500',
                textAlign: 'right',
              }
            ]}
          >
            {winner === 2 && <Ionicons name="caret-up" size={12} color="#4CAF50" />}
            {val2}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {/* Selection Area */}
        <View style={styles.selectionSection}>
          {/* Pokémon 1 Selection */}
          <View style={styles.selectBlock}>
            <Text style={[styles.selectTitle, { color: theme.colors.textSecondary }]}>Pokémon 1</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TextInput
                placeholder="Search..."
                placeholderTextColor={theme.colors.textSecondary}
                value={search1}
                onChangeText={(text) => handleSearch(text, 1)}
                style={[styles.input, { color: theme.colors.text }]}
              />
              {poke1 && (
                <TouchableOpacity onPress={() => clearSelection(1)}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            {/* Suggestions 1 */}
            {suggestions1.length > 0 && (
              <View style={[styles.suggestionsList, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                {suggestions1.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => selectPokemon(item, 1)}
                    style={[styles.suggestionItem, { borderBottomColor: theme.colors.border }]}
                  >
                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* VS Divider */}
          <View style={styles.vsContainer}>
            <Text style={[styles.vsText, { color: theme.colors.primary }]}>VS</Text>
          </View>

          {/* Pokémon 2 Selection */}
          <View style={styles.selectBlock}>
            <Text style={[styles.selectTitle, { color: theme.colors.textSecondary }]}>Pokémon 2</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TextInput
                placeholder="Search..."
                placeholderTextColor={theme.colors.textSecondary}
                value={search2}
                onChangeText={(text) => handleSearch(text, 2)}
                style={[styles.input, { color: theme.colors.text }]}
              />
              {poke2 && (
                <TouchableOpacity onPress={() => clearSelection(2)}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            {/* Suggestions 2 */}
            {suggestions2.length > 0 && (
              <View style={[styles.suggestionsList, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                {suggestions2.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => selectPokemon(item, 2)}
                    style={[styles.suggestionItem, { borderBottomColor: theme.colors.border }]}
                  >
                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Loading details state */}
        {loading && (
          <View style={styles.centerLoading}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Fetching details...</Text>
          </View>
        )}

        {/* Display Side-By-Side Comparison */}
        {details1 && details2 ? (
          <View style={styles.compareContainer}>
            {/* Visual Header Grid */}
            <View style={[styles.visualHeader, { backgroundColor: theme.colors.card }]}>
              <View style={styles.visualColumn}>
                <Image source={{ uri: details1.sprites.artwork }} style={styles.compareImage} resizeMode="contain" />
                <Text style={[styles.compareNameText, { color: theme.colors.text }]}>
                  {details1.name.charAt(0).toUpperCase() + details1.name.slice(1)}
                </Text>
                <View style={styles.typesRow}>
                  {details1.types.map(t => (
                    <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t.toLowerCase()] }]}>
                      <Text style={styles.typeText}>{t.toUpperCase().slice(0, 4)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.visualVsCol}>
                <View style={[styles.vsCircle, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.vsCircleText}>VS</Text>
                </View>
              </View>

              <View style={styles.visualColumn}>
                <Image source={{ uri: details2.sprites.artwork }} style={styles.compareImage} resizeMode="contain" />
                <Text style={[styles.compareNameText, { color: theme.colors.text }]}>
                  {details2.name.charAt(0).toUpperCase() + details2.name.slice(1)}
                </Text>
                <View style={styles.typesRow}>
                  {details2.types.map(t => (
                    <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t.toLowerCase()] }]}>
                      <Text style={styles.typeText}>{t.toUpperCase().slice(0, 4)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Base Stats Comparative list */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Base Stats Comparison</Text>
              <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
                {renderStatComparisonRow('HP', 'hp')}
                {renderStatComparisonRow('ATTACK', 'attack')}
                {renderStatComparisonRow('DEFENSE', 'defense')}
                {renderStatComparisonRow('SP. ATK', 'specialAttack')}
                {renderStatComparisonRow('SP. DEF', 'specialDefense')}
                {renderStatComparisonRow('SPEED', 'speed')}
              </View>
            </View>

            {/* Abilities Comparison */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Abilities</Text>
              <View style={[styles.compareRowCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.abilitiesCol}>
                  {details1.abilities.map(a => (
                    <Text key={a.name} style={[styles.abilityItemText, { color: theme.colors.text }]}>
                      • {a.name.replace('-', ' ')} {a.isHidden && '(Hidden)'}
                    </Text>
                  ))}
                </View>
                <View style={[styles.abilitiesDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.abilitiesCol}>
                  {details2.abilities.map(a => (
                    <Text key={a.name} style={[styles.abilityItemText, { color: theme.colors.text, textAlign: 'right' }]}>
                      {a.name.replace('-', ' ')} {a.isHidden && '(Hidden)'} •
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        ) : (
          !loading && (
            <View style={styles.placeholderContainer}>
              <Ionicons name="git-compare" size={64} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>Select two Pokémon</Text>
              <Text style={[styles.placeholderSub, { color: theme.colors.textSecondary }]}>
                Search and select two Pokémon in the inputs above to compare their stats and attributes side-by-side.
              </Text>
            </View>
          )
        )}
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
  selectionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 100, // ensures suggestions appear over content
    marginBottom: 20,
  },
  selectBlock: {
    flex: 2,
    position: 'relative',
  },
  selectTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 42,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    height: '100%',
    padding: 0,
  },
  vsContainer: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  suggestionsList: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    maxHeight: 180,
    overflow: 'hidden',
    zIndex: 999,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
  centerLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  compareContainer: {
    marginTop: 10,
  },
  visualHeader: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    marginBottom: 24,
    alignItems: 'center',
  },
  visualColumn: {
    flex: 2,
    alignItems: 'center',
  },
  visualVsCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  vsCircleText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  compareImage: {
    width: 65,
    height: 65,
    marginBottom: 8,
  },
  compareNameText: {
    fontSize: 13,
    fontWeight: '850',
    marginBottom: 6,
    textAlign: 'center',
  },
  typesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: '800',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  statsCard: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  compareCol: {
    flex: 1,
  },
  compareValue: {
    fontSize: 14,
  },
  compareLabel: {
    flex: 1.5,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  compareRowCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },
  abilitiesCol: {
    flex: 1,
    gap: 6,
  },
  abilitiesDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  abilityItemText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
