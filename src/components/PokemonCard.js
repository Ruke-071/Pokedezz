import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { championsPokemon } from '../data/championsPokemon';
import { newlyAddedPokemon } from '../data/newlyAdded';
import { TYPE_COLORS } from './FilterModal';

export const PokemonCard = React.memo(({ pokemon, onPress }) => {
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();

  const nameLower = pokemon.name.toLowerCase();
  const isChamp = championsPokemon.includes(nameLower);
  const isNew = newlyAddedPokemon.includes(nameLower);
  const favorited = isFavorite(pokemon.id);

  // Capitalize name
  const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  
  // Format ID: e.g., #0001
  const formatId = (id) => {
    return `#${String(id).padStart(4, '0')}`;
  };

  const primaryType = pokemon.types[0];
  const typeColor = TYPE_COLORS[primaryType.toLowerCase()] || '#A8A878';

  // Dynamic card background based on primary type and current theme
  const getCardBgColor = () => {
    return theme.dark ? `${typeColor}1C` : `${typeColor}0D`;
  };

  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(pokemon)}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: getCardBgColor(),
          borderWidth: 1.5,
        }
      ]}
    >
      {/* Top Header Row: ID & Favorite Button */}
      <View style={styles.cardHeader}>
        <Text style={[styles.idText, { color: theme.colors.textSecondary }]}>
          {formatId(pokemon.id)}
        </Text>
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleFavorite(pokemon.id)}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={18}
            color={favorited ? '#FF5252' : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Image Container with colored background */}
      <View style={[styles.imageContainer, { backgroundColor: getCardBgColor() }]}>
        <Image
          source={{ uri: artworkUrl }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
      </View>

      {/* Badges Container */}
      <View style={styles.badgesWrapper}>
        {isChamp && (
          <View style={[styles.badge, styles.champBadge]}>
            <Text style={styles.badgeText}>🏆 Champions</Text>
          </View>
        )}
        {isNew && (
          <View style={[styles.badge, styles.newBadge]}>
            <Text style={styles.badgeText}>✨ New</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text numberOfLines={1} style={[styles.nameText, { color: theme.colors.text }]}>
        {capitalizedName}
      </Text>

      {/* Type Badges */}
      <View style={styles.typesRow}>
        {pokemon.types.map(t => {
          const tc = TYPE_COLORS[t.toLowerCase()] || '#A8A878';
          return (
            <View key={t} style={[styles.typeBadge, { backgroundColor: tc }]}>
              <Text style={styles.typeText}>{t.toUpperCase()}</Text>
            </View>
          );
        })}
      </View>

      {/* Mini Stats (HP, ATK, SPD) */}
      <View style={[styles.statsRow, { borderTopColor: theme.colors.border }]}>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatLabel, { color: theme.colors.textSecondary }]}>HP</Text>
          <Text style={[styles.miniStatVal, { color: theme.colors.text }]}>{pokemon.hp}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatLabel, { color: theme.colors.textSecondary }]}>ATK</Text>
          <Text style={[styles.miniStatVal, { color: theme.colors.text }]}>{pokemon.attack}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatLabel, { color: theme.colors.textSecondary }]}>SPD</Text>
          <Text style={[styles.miniStatVal, { color: theme.colors.text }]}>{pokemon.speed}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    margin: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  idText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'System',
  },
  heartButton: {
    padding: 4,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  pokemonImage: {
    width: 75,
    height: 75,
  },
  badgesWrapper: {
    flexDirection: 'row',
    gap: 4,
    height: 18,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
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
    fontSize: 8,
    fontWeight: '800',
    color: '#000000',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    fontFamily: 'System',
  },
  typesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    width: '100%',
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  miniStat: {
    alignItems: 'center',
  },
  miniStatLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  miniStatVal: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 14,
  },
});
