import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ITEM_DEX, ITEM_CATEGORIES } from '../data/itemDexData';
import { pokemonIndex } from '../data/pokemonIndex';
import { PikachuPattern, EeveePattern, ArceusBackground } from '../components';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'alpha', label: 'A - Z' },
  { id: 'gen-desc', label: 'Newest Gen' },
  { id: 'fling', label: 'Fling Power' },
];

export const ItemDexScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedItem, setSelectedItem] = useState(null);

  // Filter & Sort items
  const filteredItems = useMemo(() => {
    let result = ITEM_DEX.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.shortDesc.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesPokemon = (item.compatiblePokemon || []).some((p) => p.toLowerCase().includes(q));
        return matchesName || matchesDesc || matchesCategory || matchesPokemon;
      }
      return true;
    });

    if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'gen-desc') {
      result.sort((a, b) => (b.gen || 0) - (a.gen || 0));
    } else if (sortBy === 'fling') {
      result.sort((a, b) => (b.flingPower || 0) - (a.flingPower || 0));
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: ITEM_DEX.length };
    ITEM_DEX.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  const getCategoryMeta = (catId) => {
    return ITEM_CATEGORIES.find((c) => c.id === catId) || ITEM_CATEGORIES[0];
  };

  const handleNavigateToPokemon = (pkString) => {
    setSelectedItem(null);
    // Extract base name before parenthesis e.g. "Eevee (Vaporeon)" -> "eevee"
    const cleanName = pkString.split(' ')[0].replace(/[^a-zA-Z-]/g, '').toLowerCase();
    const found = pokemonIndex.find((p) => p.name.toLowerCase().includes(cleanName));
    if (found) {
      setTimeout(() => {
        navigation.navigate('PokemonDetail', { id: found.id, name: found.name });
      }, 150);
    }
  };

  const renderItemCard = ({ item }) => {
    const catMeta = getCategoryMeta(item.category);

    return (
      <TouchableOpacity
        style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={() => setSelectedItem(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryPill, { backgroundColor: catMeta.color }]}>
            <Ionicons name={catMeta.icon} size={11} color="#FFF" />
            <Text style={styles.categoryPillText}>{catMeta.name}</Text>
          </View>
          <Text style={[styles.genText, { color: theme.colors.textSecondary }]}>Gen {item.gen}</Text>
        </View>

        <View style={styles.spriteWrap}>
          <Image
            source={{ uri: item.sprite }}
            style={styles.itemSprite}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={[styles.itemShortDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.shortDesc}
        </Text>

        {item.flingPower !== undefined && item.flingPower > 0 && (
          <View style={styles.cardFooter}>
            <Text style={[styles.flingBadge, { color: theme.colors.textSecondary }]}>
              Fling: <Text style={{ color: '#E91E63', fontWeight: '800' }}>{item.flingPower} BP</Text>
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {theme.isPikachu && <PikachuPattern subtle={true} opacity={0.16} />}
      {theme.isEevee && <EeveePattern subtle={true} opacity={0.16} />}
      {theme.isArceus && <ArceusBackground subtle={true} opacity={0.16} />}

      {/* Search Header */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#222' : '#F5F5F5', borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search 450+ held items, stones, berries, mega items..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {ITEM_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryFilterPill,
                  isSelected && { backgroundColor: cat.color },
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isSelected ? '#FFF' : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryFilterText,
                    { color: isSelected ? '#FFF' : theme.colors.text },
                  ]}
                >
                  {cat.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sort Bar */}
        <View style={styles.sortBar}>
          <Text style={[styles.sortLabel, { color: theme.colors.textSecondary }]}>Sort By:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortPillsRow}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.sortPill,
                  sortBy === opt.id && { backgroundColor: theme.colors.primary },
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => setSortBy(opt.id)}
              >
                <Text
                  style={[
                    styles.sortPillText,
                    { color: sortBy === opt.id ? '#FFF' : theme.colors.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Items Grid */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItemCard}
        numColumns={2}
        contentContainerStyle={styles.listGrid}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No items found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Try adjusting your search query or selecting a different category.
            </Text>
          </View>
        }
      />

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal
          visible={!!selectedItem}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{selectedItem.name}</Text>
                  <View style={styles.modalCatRow}>
                    <View style={[styles.categoryPill, { backgroundColor: getCategoryMeta(selectedItem.category).color }]}>
                      <Ionicons name={getCategoryMeta(selectedItem.category).icon} size={12} color="#FFF" />
                      <Text style={styles.categoryPillText}>{getCategoryMeta(selectedItem.category).name}</Text>
                    </View>
                    <Text style={[styles.genText, { color: theme.colors.textSecondary }]}>
                      Introduced in Gen {selectedItem.gen}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: isDarkMode ? '#333' : '#F0F0F0' }]}
                  onPress={() => setSelectedItem(null)}
                >
                  <Ionicons name="close" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
                {/* Large Sprite & Stats */}
                <View style={styles.modalHero}>
                  <View style={[styles.modalSpriteContainer, { backgroundColor: isDarkMode ? '#252525' : '#F9F9F9' }]}>
                    <Image
                      source={{ uri: selectedItem.sprite }}
                      style={styles.modalSprite}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.modalStatsColumn}>
                    <View style={styles.modalStatItem}>
                      <Text style={[styles.modalStatLabel, { color: theme.colors.textSecondary }]}>Cost / Value</Text>
                      <Text style={[styles.modalStatValue, { color: theme.colors.text }]}>
                        {selectedItem.cost || 'Special'}
                      </Text>
                    </View>
                    {selectedItem.flingPower !== undefined && (
                      <View style={styles.modalStatItem}>
                        <Text style={[styles.modalStatLabel, { color: theme.colors.textSecondary }]}>Fling Power</Text>
                        <Text style={[styles.modalStatValue, { color: '#E91E63' }]}>
                          {selectedItem.flingPower ? `${selectedItem.flingPower} BP` : 'None'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Full In-Game Effect */}
                <Text style={[styles.modalSectionLabel, { color: theme.colors.textSecondary }]}>IN-GAME EFFECT</Text>
                <Text style={[styles.modalDesc, { color: theme.colors.text }]}>
                  {selectedItem.description}
                </Text>

                {/* Competitive Notes */}
                {selectedItem.competitiveNotes && (
                  <>
                    <Text style={[styles.modalSectionLabel, { color: '#E91E63', marginTop: 12 }]}>COMPETITIVE UTILITY</Text>
                    <Text style={[styles.modalDesc, { color: theme.colors.textSecondary }]}>
                      {selectedItem.competitiveNotes}
                    </Text>
                  </>
                )}

                {/* Compatible Pokémon */}
                {selectedItem.compatiblePokemon && selectedItem.compatiblePokemon.length > 0 && (
                  <>
                    <Text style={[styles.modalSectionLabel, { color: '#9C27B0', marginTop: 12 }]}>
                      COMPATIBLE / EVOLVING POKÉMON (TAP TO VIEW)
                    </Text>
                    <View style={styles.compatibleChipsRow}>
                      {selectedItem.compatiblePokemon.map((pk) => (
                        <TouchableOpacity
                          key={pk}
                          style={[
                            styles.compatibleChip,
                            { backgroundColor: isDarkMode ? '#2A2A2A' : '#EDE7F6' },
                          ]}
                          onPress={() => handleNavigateToPokemon(pk)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="sparkles" size={12} color="#9C27B0" />
                          <Text style={[styles.compatibleChipText, { color: theme.colors.text }]}>{pk}</Text>
                          <Ionicons name="arrow-forward-circle" size={14} color="#9C27B0" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  categoriesScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  categoryFilterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sortPillsRow: {
    gap: 6,
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listGrid: {
    padding: 8,
    paddingBottom: 40,
  },
  itemCard: {
    flex: 1,
    margin: 6,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  categoryPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  genText: {
    fontSize: 10,
    fontWeight: '700',
  },
  spriteWrap: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  itemSprite: {
    width: 60,
    height: 60,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  itemShortDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  cardFooter: {
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  flingBadge: {
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  modalCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalHero: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  modalSpriteContainer: {
    width: 90,
    height: 90,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSprite: {
    width: 72,
    height: 72,
  },
  modalStatsColumn: {
    flex: 1,
    gap: 8,
  },
  modalStatItem: {
    gap: 2,
  },
  modalStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalStatValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  compatibleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  compatibleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  compatibleChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
  },
});
