import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { PokemonCard } from '../components/PokemonCard';
import { pokemonIndex } from '../data/pokemonIndex';
import { Ionicons } from '@expo/vector-icons';

export const FavoritesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { favorites } = useFavorites();

  // Find all Pokémon details from index that match the favorited IDs
  const favoritedPokemonList = useMemo(() => {
    return pokemonIndex.filter(pokemon => favorites.includes(pokemon.id));
  }, [favorites]);

  const navigateToDetails = (pokemon) => {
    navigation.navigate('PokemonDetail', { id: pokemon.id, name: pokemon.name });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={favoritedPokemonList}
        keyExtractor={(item) => item.name}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.gridColumn}>
            <PokemonCard pokemon={item} onPress={navigateToDetails} />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Favorites Yet</Text>
            <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
              Tap the heart icon on any Pokémon card to add it here.
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    flexGrow: 1,
  },
  gridColumn: {
    width: '50%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
