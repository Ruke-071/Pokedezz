import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { PokemonCard } from '../components/PokemonCard';
import { pokemonIndex } from '../data/pokemonIndex';
import { Ionicons } from '@expo/vector-icons';
import { PikachuStickerBackground } from '../components/PikachuStickerBackground';
import { PikachuFace } from '../components/PikachuFace';
import { PikachuLoader } from '../components/PikachuLoader';

export const FavoritesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    favorites,
    isPrecaching,
    precacheProgress,
    precacheAllFavorites,
  } = useFavorites();

  // Find all Pokémon details from index that match the favorited IDs
  const favoritedPokemonList = useMemo(() => {
    return pokemonIndex.filter(pokemon => favorites.includes(pokemon.id));
  }, [favorites]);

  const navigateToDetails = (pokemon) => {
    navigation.navigate('PokemonDetail', { id: pokemon.id, name: pokemon.name });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {theme.isPikachu && <PikachuStickerBackground />}
      {/* ── Offline Status & Header Banner ── */}
      {favoritedPokemonList.length > 0 && (
        <View style={[styles.headerBanner, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.headerInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="heart" size={16} color="#FF5252" />
              <Text style={[styles.headerCount, { color: theme.colors.text }]}>
                {favoritedPokemonList.length} Favorited
              </Text>
            </View>
            <View style={styles.offlinePill}>
              <Ionicons name="cloud-offline" size={12} color="#4CAF50" />
              <Text style={styles.offlinePillText}>Stored Locally · Offline Ready</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.syncBtn, { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}15` }]}
            onPress={precacheAllFavorites}
            disabled={isPrecaching}
            activeOpacity={0.7}
          >
            {isPrecaching ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {theme.isPikachu ? (
                  <PikachuLoader size={20} compact />
                ) : (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                )}
                <Text style={[styles.syncBtnText, { color: theme.colors.primary }]}>
                  {precacheProgress.current}/{precacheProgress.total}
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="cloud-download-outline" size={14} color={theme.colors.primary} />
                <Text style={[styles.syncBtnText, { color: theme.colors.primary }]}>Pre-cache All</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={favoritedPokemonList}
        keyExtractor={(item, index) => `${item.id}-${item.name}-${index}`}
        numColumns={2}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={styles.gridColumn}>
            <PokemonCard pokemon={item} onPress={navigateToDetails} />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {theme.isPikachu ? (
              <View style={{ alignItems: 'center', marginBottom: 14 }}>
                <PikachuFace size={72} />
              </View>
            ) : (
              <Ionicons name="heart-dislike-outline" size={64} color={theme.colors.textSecondary} />
            )}
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {theme.isPikachu ? 'Pikachu is Waiting for Favorites!' : 'No Favorites Yet'}
            </Text>
            <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
              Tap the heart icon on any Pokémon card or detail screen to store it locally for instant offline access.
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
  headerBanner: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  headerInfo: {
    gap: 4,
  },
  headerCount: {
    fontSize: 14,
    fontWeight: '800',
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  offlinePillText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '700',
  },
  syncBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  syncBtnText: {
    fontSize: 11,
    fontWeight: '700',
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
