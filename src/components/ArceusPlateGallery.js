import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ARCEUS_PLATES } from '../data/arceusPlatesData';
import { ArceusPlate } from './ArceusPlate';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * ArceusPlateGallery Component
 * 
 * Features:
 * 1. Sacred Celestial Ring: A circular arrangement of all 18 Plates around the divine Arceus emblem.
 * 2. Plate Detail Card: Inscription, lore, type color, and relevant Pokémon of the selected plate.
 * 3. Grid / Ring mode switcher.
 * 4. Tap-to-inspect interactivity.
 */
export const ArceusPlateGallery = ({ onSelectPokemon, style }) => {
  const [selectedPlate, setSelectedPlate] = useState(ARCEUS_PLATES[1]); // Default to Flame Plate
  const [viewMode, setViewMode] = useState('ring'); // 'ring' | 'grid'

  const RING_RADIUS = Math.min((SCREEN_WIDTH - 64) / 2, 120);

  return (
    <View style={[styles.container, style]}>
      {/* Gallery Header Ribbon */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="sparkles" size={14} color="#C9A35B" />
          <Text style={styles.titleText}>THE 18 SACRED PLATES</Text>
        </View>

        {/* View Mode Toggle: Ring or Grid */}
        <View style={styles.viewToggleWrap}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'ring' && styles.toggleBtnActive]}
            onPress={() => setViewMode('ring')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="radio-button-on"
              size={13}
              color={viewMode === 'ring' ? '#C9A35B' : '#5B6B7F'}
            />
            <Text style={[styles.toggleBtnText, viewMode === 'ring' && styles.toggleBtnTextActive]}>
              Ring
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
            onPress={() => setViewMode('grid')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="grid-outline"
              size={12}
              color={viewMode === 'grid' ? '#C9A35B' : '#5B6B7F'}
            />
            <Text style={[styles.toggleBtnText, viewMode === 'grid' && styles.toggleBtnTextActive]}>
              Grid
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Mode 1: Sacred Circular Arrangement ── */}
      {viewMode === 'ring' ? (
        <View style={[styles.ringContainer, { height: RING_RADIUS * 2 + 54 }]}>
          {/* Concentric Golden Guidance Rings */}
          <View
            style={[
              styles.guidanceRingOuter,
              {
                width: RING_RADIUS * 2,
                height: RING_RADIUS * 2,
                borderRadius: RING_RADIUS,
              },
            ]}
          />
          <View
            style={[
              styles.guidanceRingInner,
              {
                width: RING_RADIUS * 1.3,
                height: RING_RADIUS * 1.3,
                borderRadius: (RING_RADIUS * 1.3) / 2,
              },
            ]}
          />

          {/* Center Divine Core */}
          <View style={styles.centerDivineEmblem}>
            <Ionicons name="sunny" size={26} color="#C9A35B" />
            <Text style={styles.centerDivineSub}>ORIGINAL ONE</Text>
          </View>

          {/* 18 Plates Positioned in Circular Orbit */}
          {ARCEUS_PLATES.map((plate, index) => {
            const angle = (index * (360 / ARCEUS_PLATES.length) - 90) * (Math.PI / 180);
            const x = Math.round(RING_RADIUS * Math.cos(angle));
            const y = Math.round(RING_RADIUS * Math.sin(angle));
            const isSelected = selectedPlate?.id === plate.id;

            return (
              <View
                key={plate.id}
                style={[
                  styles.orbitPlateWrap,
                  {
                    transform: [{ translateX: x }, { translateY: y }],
                  },
                ]}
              >
                <ArceusPlate
                  type={plate.type}
                  size={24}
                  selected={isSelected}
                  onPress={() => setSelectedPlate(plate)}
                />
              </View>
            );
          })}
        </View>
      ) : (
        /* ── Mode 2: 18 Plates Grid ── */
        <View style={styles.gridContainer}>
          {ARCEUS_PLATES.map((plate) => {
            const isSelected = selectedPlate?.id === plate.id;
            return (
              <View key={`grid-${plate.id}`} style={styles.gridItemWrap}>
                <ArceusPlate
                  type={plate.type}
                  size={32}
                  selected={isSelected}
                  onPress={() => setSelectedPlate(plate)}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.gridItemLabel,
                    isSelected && { color: '#C9A35B', fontWeight: '800' },
                  ]}
                >
                  {plate.typeName}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* ── Selected Plate Ancient Inscription Card ── */}
      {selectedPlate && (
        <View style={styles.detailCard}>
          <View style={styles.detailCardTop}>
            <ArceusPlate
              type={selectedPlate.type}
              size={38}
              selected={true}
            />
            <View style={styles.detailTitleCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.detailPlateName}>{selectedPlate.name}</Text>
                <View style={[styles.typeBadgePill, { backgroundColor: selectedPlate.color }]}>
                  <Text style={styles.typeBadgePillText}>{selectedPlate.typeName.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.detailJpName}>{selectedPlate.japaneseName}</Text>
            </View>
          </View>

          {/* Ancient Lore & Inscription */}
          <View style={styles.inscriptionBox}>
            <View style={styles.inscriptionHeader}>
              <Ionicons name="book-outline" size={12} color="#C9A35B" />
              <Text style={styles.inscriptionLabel}>ANCIENT STONE INSCRIPTION</Text>
            </View>
            <Text style={styles.inscriptionQuote}>
              "{selectedPlate.inscription}"
            </Text>
            <Text style={styles.plateDescription}>
              {selectedPlate.description}
            </Text>
          </View>

          {/* Relevant Hisui Pokémon of this Type */}
          <View style={styles.samplePokemonSection}>
            <Text style={styles.samplePokemonLabel}>Key Hisui Pokémon:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pokemonChipsRow}>
              {selectedPlate.samplePokemon.map((pokeName) => (
                <TouchableOpacity
                  key={pokeName}
                  style={styles.pokemonChip}
                  onPress={() => onSelectPokemon && onSelectPokemon(pokeName)}
                  activeOpacity={onSelectPokemon ? 0.7 : 1}
                >
                  <Ionicons name="sparkles" size={9} color="#C9A35B" />
                  <Text style={styles.pokemonChipText}>{pokeName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFDF9',
    borderColor: '#E5D9C2',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 14,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#292A2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5D9C2',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#262626',
    letterSpacing: 0.8,
  },
  viewToggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#F8F2E7',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E5D9C2',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFDF9',
    borderColor: '#C9A35B',
    borderWidth: 1,
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5B6B7F',
  },
  toggleBtnTextActive: {
    color: '#262626',
    fontWeight: '800',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  guidanceRingOuter: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#C9A35B33',
    borderStyle: 'dashed',
  },
  guidanceRingInner: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#C9A35B22',
  },
  centerDivineEmblem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDivineSub: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#C9A35B',
    letterSpacing: 1,
    marginTop: 2,
  },
  orbitPlateWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 8,
  },
  gridItemWrap: {
    alignItems: 'center',
    width: '15%',
    marginVertical: 4,
  },
  gridItemLabel: {
    fontSize: 8,
    color: '#5B6B7F',
    fontWeight: '600',
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: '#F8F2E7',
    borderColor: '#C9A35B88',
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  detailCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailTitleCol: {
    flex: 1,
  },
  detailPlateName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#262626',
  },
  detailJpName: {
    fontSize: 10,
    color: '#5B6B7F',
    marginTop: 1,
  },
  typeBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  typeBadgePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inscriptionBox: {
    backgroundColor: '#FFFDF9',
    borderColor: '#E5D9C2',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  inscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  inscriptionLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#C9A35B',
    letterSpacing: 0.8,
  },
  inscriptionQuote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#262626',
    lineHeight: 16,
  },
  plateDescription: {
    fontSize: 10.5,
    color: '#5B6B7F',
    marginTop: 6,
    lineHeight: 15,
  },
  samplePokemonSection: {
    marginTop: 10,
  },
  samplePokemonLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#5B6B7F',
    marginBottom: 6,
  },
  pokemonChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pokemonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFDF9',
    borderColor: '#C9A35B66',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pokemonChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#262626',
  },
});
