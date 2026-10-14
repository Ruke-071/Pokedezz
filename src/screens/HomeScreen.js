import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PokemonCard } from '../components/PokemonCard';
import { FilterModal } from '../components/FilterModal';
import { PokemonGridSkeleton } from '../components/LoadingSkeleton';
import { pokemonIndex } from '../data/pokemonIndex';
import { championsPokemon } from '../data/championsPokemon';
import { newlyAddedPokemon } from '../data/newlyAdded';
import { Ionicons } from '@expo/vector-icons';
import { PokeBallLoading } from '../components/PokeBallLoading';
import { matchesPokemonSearch } from '../utils/searchUtils';
import {
  PikachuPattern,
  PikachuFace,
  PikachuBadge,
  PikachuFaceWidget,
  EeveePattern,
  EeveeFace,
  EeveeBadge,
  EeveeThemeWidget,
  ArceusBackground,
  ArceusPlate,
  ARCEUS_PLATES,
} from '../components';

export const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    types: [],
    generations: [],
    isLegendary: false,
    isMythical: false,
    championsOnly: false,
    newlyAddedOnly: false
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Pagination states
  const [displayedItems, setDisplayedItems] = useState(20);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load for beautiful skeleton animation
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Compute filtered pokemon list locally for instant results
  const filteredPokemonList = useMemo(() => {
    return pokemonIndex.filter(pokemon => {
      // 1. Search Query
      if (searchQuery.trim()) {
        if (!matchesPokemonSearch(pokemon, searchQuery)) {
          return false;
        }
      }

      // 2. Types Filter (Matches if Pokémon has at least one of the selected types)
      if (filters.types.length > 0) {
        const matchesType = pokemon.types.some(t => filters.types.includes(t.toLowerCase()));
        if (!matchesType) return false;
      }

      // 3. Generations Filter
      if (filters.generations.length > 0) {
        if (!filters.generations.includes(pokemon.generation)) return false;
      }

      // 4. Legendary Status
      if (filters.isLegendary && !pokemon.isLegendary) return false;

      // 5. Mythical Status
      if (filters.isMythical && !pokemon.isMythical) return false;

      // 6. Champions Only
      if (filters.championsOnly) {
        const isChamp = championsPokemon.includes(pokemon.name.toLowerCase());
        if (!isChamp) return false;
      }

      // 7. Newly Added Only
      if (filters.newlyAddedOnly) {
        const isNew = newlyAddedPokemon.includes(pokemon.name.toLowerCase());
        if (!isNew) return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Paginated subset of filtered list to display
  const paginatedList = useMemo(() => {
    return filteredPokemonList.slice(0, displayedItems);
  }, [filteredPokemonList, displayedItems]);

  const loadMore = () => {
    if (displayedItems < filteredPokemonList.length) {
      // Increase displayed page size
      setDisplayedItems(prev => prev + 20);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Reset filters, search, and page size on refresh
    setTimeout(() => {
      setSearchQuery('');
      setFilters({
        types: [],
        generations: [],
        isLegendary: false,
        isMythical: false,
        championsOnly: false,
        newlyAddedOnly: false
      });
      setDisplayedItems(20);
      setIsRefreshing(false);
    }, 1000);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setDisplayedItems(20); // Reset pagination on filter change
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += filters.types.length;
    count += filters.generations.length;
    if (filters.isLegendary) count++;
    if (filters.isMythical) count++;
    if (filters.championsOnly) count++;
    if (filters.newlyAddedOnly) count++;
    return count;
  }, [filters]);

  const navigateToDetails = useCallback((pokemon) => {
    Keyboard.dismiss();
    navigation.navigate('PokemonDetail', { id: pokemon.id, name: pokemon.name });
  }, [navigation]);

  const handleSearchSubmit = useCallback(() => {
    Keyboard.dismiss();
    if (filteredPokemonList.length > 0) {
      navigateToDetails(filteredPokemonList[0]);
    }
  }, [filteredPokemonList, navigateToDetails]);

  const renderPokemonCard = useCallback(({ item }) => (
    <View style={styles.gridColumn}>
      <PokemonCard pokemon={item} onPress={navigateToDetails} />
    </View>
  ), [navigateToDetails]);

  if (initialLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.headerActions, { borderBottomColor: theme.colors.border }]}>
          <View style={[styles.searchBarContainer, { backgroundColor: theme.colors.card }]} />
          <View style={[styles.filterButton, { backgroundColor: theme.colors.card, width: 45 }]} />
        </View>
        <PokemonGridSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {theme.isPikachu && <PikachuPattern subtle={true} opacity={0.16} />}
      {theme.isEevee && <EeveePattern subtle={true} opacity={0.16} />}
      {theme.isArceus && <ArceusBackground subtle={true} opacity={0.16} />}
      {/* Search & Filter Header */}
      <View style={[styles.headerActions, { borderBottomColor: theme.colors.border }]}>
        <View style={[styles.searchBarContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSearchSubmit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {theme.isPikachu ? (
              <PikachuFace size={22} style={{ marginRight: 6 }} />
            ) : theme.isEevee ? (
              <EeveeFace size={22} style={{ marginRight: 6 }} showCollar={false} />
            ) : theme.isArceus ? (
              <ArceusPlate type="normal" size={20} style={{ marginRight: 6 }} />
            ) : (
              <Ionicons name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
            )}
          </TouchableOpacity>
          <TextInput
            placeholder={
              theme.isPikachu
                ? '⚡ Search Pokémon in Pikachu Mode...'
                : theme.isEevee
                ? '🐾 Search Pokémon in Eevee Mode...'
                : theme.isArceus
                ? '📜 Search ancient Hisui Pokédex...'
                : 'Search by name or number...'
            }
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.searchInput, { color: theme.colors.text }]}
            value={searchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
            autoCorrect={false}
            autoCapitalize="none"
            onChangeText={(text) => {
              setSearchQuery(text);
              setDisplayedItems(20); // Reset page size on search
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          style={[
            styles.filterButton,
            {
              backgroundColor: activeFiltersCount > 0 ? theme.colors.primary : theme.colors.card,
              borderColor: activeFiltersCount > 0 ? theme.colors.primary : theme.colors.border,
            }
          ]}
        >
          <Ionicons
            name="funnel"
            size={18}
            color={activeFiltersCount > 0 ? '#ffffff' : theme.colors.text}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Grid List */}
      <FlatList
        data={paginatedList}
        keyExtractor={(item, index) => `${item.id}-${item.name}-${index}`}
        numColumns={2}
        renderItem={renderPokemonCard}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        ListHeaderComponent={
          theme.isPikachu ? () => (
            <View style={{ width: '100%', paddingHorizontal: 4, paddingBottom: 6 }}>
              <PikachuFaceWidget />
            </View>
          ) : theme.isEevee ? () => (
            <View style={{ width: '100%', paddingHorizontal: 4, paddingBottom: 6 }}>
              <EeveeThemeWidget />
            </View>
          ) : theme.isArceus ? () => (
            <View style={{ width: '100%', paddingHorizontal: 4, paddingBottom: 6 }}>
              {/* Ancient Hisui Field Journal Banner */}
              <View style={[styles.arceusBannerCard, { backgroundColor: '#FFFDF9', borderColor: '#E5D9C2' }]}>
                <View style={styles.arceusBannerTop}>
                  <View style={styles.arceusSilhouetteBadge}>
                    <Ionicons name="sunny" size={18} color="#C9A35B" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.arceusBannerTitle}>HISUI SURVEY CORPS</Text>
                    <Text style={styles.arceusBannerSub}>Tap any Sacred Plate to filter Pokémon by type</Text>
                  </View>
                  {filters.types.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setFilters(f => ({ ...f, types: [] }))}
                      style={styles.clearPlatesBtn}
                    >
                      <Text style={styles.clearPlatesText}>Reset</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Horizontal Interactive 18 Plates Filter Scroll */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.platesFilterRow}
                >
                  {ARCEUS_PLATES.map(plate => {
                    const isSelected = filters.types.includes(plate.type);
                    return (
                      <ArceusPlate
                        key={`home-plate-${plate.id}`}
                        type={plate.type}
                        size={28}
                        selected={isSelected}
                        showLabel={true}
                        onPress={() => {
                          setFilters(prev => {
                            const exists = prev.types.includes(plate.type);
                            return {
                              ...prev,
                              types: exists
                                ? prev.types.filter(t => t !== plate.type)
                                : [plate.type],
                            };
                          });
                          setDisplayedItems(20);
                        }}
                      />
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          ) : null
        }
        ListFooterComponent={() => {
          if (displayedItems < filteredPokemonList.length) {
            return (
              <View style={styles.loaderFooter}>
                <PokeBallLoading size={32} message="" />
              </View>
            );
          }
          return <View style={{ height: 20 }} />;
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {theme.isPikachu ? (
              <View style={{ alignItems: 'center' }}>
                <PikachuFace size={72} expression="surprised" blushing={true} />
                <Text style={[styles.emptyText, { color: theme.colors.text, marginTop: 14, fontWeight: '800' }]}>
                  Pika-pi? No Pokémon found!
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                  Try clearing your search or filter tags.
                </Text>
              </View>
            ) : theme.isEevee ? (
              <View style={{ alignItems: 'center' }}>
                <EeveeFace size={72} expression="surprised" blushing={true} />
                <Text style={[styles.emptyText, { color: theme.colors.text, marginTop: 14, fontWeight: '800' }]}>
                  Eev-vee? No Pokémon found!
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                  Try clearing your search or filter tags.
                </Text>
              </View>
            ) : theme.isArceus ? (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="sunny" size={64} color="#C9A35B" />
                <Text style={[styles.emptyText, { color: theme.colors.text, marginTop: 14, fontWeight: '800' }]}>
                  No Pokémon found in Hisui Records!
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                  Try resetting your Sacred Plate filters.
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No Pokémon found matching criteria.
                </Text>
              </View>
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Action Button (Compare) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Compare')}
      >
        {theme.isPikachu ? (
          <PikachuFace size={34} expression="wink" />
        ) : theme.isEevee ? (
          <EeveeFace size={34} expression="cheerful" showCollar={false} />
        ) : (
          <Ionicons name="aperture" size={28} color="#ffffff" />
        )}
      </TouchableOpacity>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        activeFilters={filters}
        onApply={handleApplyFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
  },
  searchBarContainer: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0, // clears default android padding
  },
  filterButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    borderWidth: 1,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#3B4CCA',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '850',
  },
  listContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  gridColumn: {
    width: '50%',
  },
  loaderFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  quickPillsScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  arceusBannerCard: {
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 10,
    elevation: 2,
    shadowColor: '#292A2D',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  arceusBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  arceusSilhouetteBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F2E7',
    borderWidth: 1,
    borderColor: '#C9A35B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arceusBannerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#262626',
    letterSpacing: 0.8,
  },
  arceusBannerSub: {
    fontSize: 9.5,
    color: '#5B6B7F',
    marginTop: 1,
  },
  clearPlatesBtn: {
    backgroundColor: '#C9A35B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  clearPlatesText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  platesFilterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
});
