import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { StatBar } from '../components/StatBar';
import { TYPE_COLORS } from '../components/FilterModal';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const TeamBuilderScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    team,
    removeFromTeam,
    clearTeam,
    getTeamStats,
    getTeamTypeDistribution
  } = useTeam();

  const stats = getTeamStats();
  const typeDistribution = getTeamTypeDistribution();

  const handleRemove = async (id) => {
    await removeFromTeam(id);
  };

  const navigateToDetails = (id, name) => {
    navigation.navigate('PokemonDetail', { id, name });
  };

  // Build 6 empty/filled slot grid
  const renderTeamSlots = () => {
    const slots = [];
    for (let i = 0; i < 6; i++) {
      const pokemon = team[i];
      if (pokemon) {
        const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
        const primaryType = pokemon.types[0];
        const cardBorderColor = TYPE_COLORS[primaryType.toLowerCase()] || theme.colors.border;

        slots.push(
          <View
            key={`slot-${pokemon.name}`}
            style={[
              styles.slotCard,
              {
                backgroundColor: theme.dark ? `${cardBorderColor}2B` : `${cardBorderColor}1D`,
                borderColor: cardBorderColor,
                borderWidth: 1.5,
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => navigateToDetails(pokemon.id, pokemon.name)}
              style={styles.slotPressArea}
            >
              <Image source={{ uri: artworkUrl }} style={styles.slotImage} resizeMode="contain" />
              <View style={styles.slotInfo}>
                <Text numberOfLines={1} style={[styles.slotName, { color: theme.colors.text }]}>
                  {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                </Text>
                <Text style={[styles.slotId, { color: theme.colors.textSecondary }]}>#{pokemon.id}{pokemon.variant ? ` (API ${pokemon.originalId})` : ''}</Text>
                <View style={styles.typesRow}>
                  {pokemon.types.map(t => (
                    <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t.toLowerCase()] }]}>
                      <Text style={styles.typeText}>{t.toUpperCase()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRemove(pokemon.id)}
              style={styles.removeButton}
            >
              <Ionicons name="trash-outline" size={18} color="#FF5252" />
            </TouchableOpacity>
          </View>
        );
      } else {
        slots.push(
          <TouchableOpacity
            key={`empty-${i}`}
            onPress={() => navigation.navigate('Home')}
            style={[
              styles.emptySlot,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }
            ]}
          >
            <Ionicons name="add-circle-outline" size={28} color={theme.colors.textSecondary} />
            <Text style={[styles.emptySlotText, { color: theme.colors.textSecondary }]}>
              Add Pokémon
            </Text>
          </TouchableOpacity>
        );
      }
    }
    return slots;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header Slot Status */}
        <View style={styles.teamHeaderRow}>
          <Text style={[styles.teamCountText, { color: theme.colors.text }]}>
            Active Team ({team.length}/6)
          </Text>
          {team.length > 0 && (
            <TouchableOpacity onPress={clearTeam}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Team Grid Slots */}
        <View style={styles.slotsGrid}>
          {renderTeamSlots()}
        </View>

        {/* Team Statistics / Analysis */}
        {team.length > 0 ? (
          <>
            {/* Team Stats averages */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Team Average Stats</Text>
              <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
                {stats && (
                  <>
                    <StatBar label="HP" value={stats.average.hp} color="#FF5252" />
                    <StatBar label="Attack" value={stats.average.attack} color="#FF7A00" />
                    <StatBar label="Defense" value={stats.average.defense} color="#FFCB05" />
                    <StatBar label="SpecialAttack" value={stats.average.specialAttack} color="#4D62E8" />
                    <StatBar label="SpecialDefense" value={stats.average.specialDefense} color="#4CAF50" />
                    <StatBar label="Speed" value={stats.average.speed} color="#00D2D3" />
                  </>
                )}
              </View>
            </View>

            {/* Type Distribution analysis */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Type Distribution</Text>
              <View style={[styles.typeDistCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.typeDistSub, { color: theme.colors.textSecondary }]}>
                  Shows type counts on your active team for synergy checks:
                </Text>
                <View style={styles.typeGrid}>
                  {Object.entries(typeDistribution).map(([type, count]) => {
                    const tc = TYPE_COLORS[type.toLowerCase()] || '#A8A878';
                    return (
                      <View key={type} style={[styles.distBadge, { borderColor: tc, borderWidth: 1.5 }]}>
                        <View style={[styles.distIndicator, { backgroundColor: tc }]} />
                        <Text style={[styles.distName, { color: theme.colors.text }]}>
                          {type.toUpperCase()}
                        </Text>
                        <Text style={[styles.distCount, { backgroundColor: tc }]}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyPrompt}>
            <Ionicons name="shield-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyPromptTitle, { color: theme.colors.text }]}>
              Team is Empty
            </Text>
            <Text style={[styles.emptyPromptSub, { color: theme.colors.textSecondary }]}>
              Browse the Pokédex and add up to 6 of your favorite Pokémon to construct your dream team!
            </Text>
          </View>
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
  teamHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  teamCountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  clearAllText: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '700',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  slotCard: {
    width: (width - 42) / 2,
    borderRadius: 16,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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
    marginBottom: 4,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 7,
    color: '#ffffff',
    fontWeight: '900',
  },
  removeButton: {
    padding: 6,
  },
  emptySlot: {
    width: (width - 42) / 2,
    height: 64,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  emptySlotText: {
    fontSize: 10,
    fontWeight: '700',
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
    padding: 16,
    elevation: 2,
  },
  typeDistCard: {
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },
  typeDistSub: {
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 18,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    borderRadius: 8,
    gap: 6,
    height: 30,
  },
  distIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  distName: {
    fontSize: 9,
    fontWeight: '800',
  },
  distCount: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 8,
    height: '100%',
    lineHeight: 28,
    textAlign: 'center',
  },
  emptyPrompt: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyPromptTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyPromptSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
