import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const TYPE_COLORS = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  steel: '#B8B8D0',
  dark: '#705746',
  fairy: '#EE99AC',
};

const TYPES = Object.keys(TYPE_COLORS);
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const FilterModal = ({ visible, onClose, activeFilters, onApply }) => {
  const { theme } = useTheme();
  
  // Local state initialized with active filters
  const [selectedTypes, setSelectedTypes] = useState(activeFilters.types || []);
  const [selectedGens, setSelectedGens] = useState(activeFilters.generations || []);
  const [isLegendary, setIsLegendary] = useState(activeFilters.isLegendary || false);
  const [isMythical, setIsMythical] = useState(activeFilters.isMythical || false);
  const [championsOnly, setChampionsOnly] = useState(activeFilters.championsOnly || false);
  const [newlyAddedOnly, setNewlyAddedOnly] = useState(activeFilters.newlyAddedOnly || false);

  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const toggleGen = (gen) => {
    if (selectedGens.includes(gen)) {
      setSelectedGens(selectedGens.filter(g => g !== gen));
    } else {
      setSelectedGens([...selectedGens, gen]);
    }
  };

  const handleApply = () => {
    onApply({
      types: selectedTypes,
      generations: selectedGens,
      isLegendary,
      isMythical,
      championsOnly,
      newlyAddedOnly
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setSelectedGens([]);
    setIsLegendary(false);
    setIsMythical(false);
    setChampionsOnly(false);
    setNewlyAddedOnly(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Filters Scrollable Content */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Champions Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Champions Special</Text>
              
              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.switchLabel, { color: theme.colors.text }]}>🏆 Champions Only</Text>
                  <Text style={[styles.switchSub, { color: theme.colors.textSecondary }]}>Show only Pokémon in Pokémon Champions</Text>
                </View>
                <Switch
                  value={championsOnly}
                  onValueChange={setChampionsOnly}
                  trackColor={{ false: '#767577', true: theme.colors.primary }}
                  thumbColor={championsOnly ? '#ffffff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.switchLabel, { color: theme.colors.text }]}>✨ Newly Added in Champions</Text>
                  <Text style={[styles.switchSub, { color: theme.colors.textSecondary }]}>Show recently added Champions</Text>
                </View>
                <Switch
                  value={newlyAddedOnly}
                  onValueChange={setNewlyAddedOnly}
                  trackColor={{ false: '#767577', true: theme.colors.primary }}
                  thumbColor={newlyAddedOnly ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Rarity Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Rarity</Text>
              
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Legendary Pokémon</Text>
                <Switch
                  value={isLegendary}
                  onValueChange={setIsLegendary}
                  trackColor={{ false: '#767577', true: theme.colors.primary }}
                  thumbColor={isLegendary ? '#ffffff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Mythical Pokémon</Text>
                <Switch
                  value={isMythical}
                  onValueChange={setIsMythical}
                  trackColor={{ false: '#767577', true: theme.colors.primary }}
                  thumbColor={isMythical ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Generations Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Generations</Text>
              <View style={styles.chipsRow}>
                {GENERATIONS.map(gen => {
                  const selected = selectedGens.includes(gen);
                  return (
                    <TouchableOpacity
                      key={gen}
                      onPress={() => toggleGen(gen)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? theme.colors.primary : theme.colors.card,
                          borderColor: selected ? theme.colors.primary : theme.colors.border,
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: selected ? '#ffffff' : theme.colors.text }
                        ]}
                      >
                        Gen {gen}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Types Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Types</Text>
              <View style={styles.chipsRow}>
                {TYPES.map(type => {
                  const selected = selectedTypes.includes(type);
                  const typeColor = TYPE_COLORS[type];
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => toggleType(type)}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: selected ? typeColor : theme.colors.card,
                          borderColor: typeColor,
                          borderWidth: 1.5,
                        }
                      ]}
                    >
                      <View style={[styles.typeColorCircle, { backgroundColor: typeColor }]} />
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: selected ? '#ffffff' : theme.colors.text,
                            fontWeight: '600',
                          }
                        ]}
                      >
                        {type.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons Footer */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
            <TouchableOpacity onPress={handleReset} style={[styles.resetButton, { borderColor: theme.colors.border }]}>
              <Text style={[styles.resetButtonText, { color: theme.colors.text }]}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  switchSub: {
    fontSize: 12,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeColorCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
