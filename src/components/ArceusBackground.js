import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Arceus Sacred Ring Motif
 * Recreates Arceus's iconic divine 4-spoke cross wheel in gold.
 */
const SacredArceusWheel = ({ size = 180, opacity = 0.08, style }) => {
  const outerR = size;
  const innerR = Math.round(size * 0.72);
  const spokeLen = Math.round(size * 0.95);

  return (
    <View
      style={[
        styles.arceusWheelWrap,
        {
          width: size,
          height: size,
          opacity,
        },
        style,
      ]}
    >
      {/* Outer Divine Golden Ring */}
      <View
        style={[
          styles.wheelOuterCircle,
          {
            width: outerR,
            height: outerR,
            borderRadius: outerR / 2,
            borderColor: '#C9A35B',
          },
        ]}
      />
      {/* Inner Concentric Ring */}
      <View
        style={[
          styles.wheelInnerCircle,
          {
            width: innerR,
            height: innerR,
            borderRadius: innerR / 2,
            borderColor: '#C9A35B',
          },
        ]}
      />

      {/* 4 Diagonal Cross Spokes (The signature 4 arched struts) */}
      <View
        style={[
          styles.wheelSpoke,
          {
            width: spokeLen,
            height: 3,
            backgroundColor: '#C9A35B',
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.wheelSpoke,
          {
            width: spokeLen,
            height: 3,
            backgroundColor: '#C9A35B',
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />

      {/* 4 Cardinal Sacred Gems */}
      <View style={[styles.wheelGem, { top: 6, backgroundColor: '#5B6B7F' }]} />
      <View style={[styles.wheelGem, { bottom: 6, backgroundColor: '#5B6B7F' }]} />
      <View style={[styles.wheelGem, { left: 6, backgroundColor: '#5B6B7F' }]} />
      <View style={[styles.wheelGem, { right: 6, backgroundColor: '#5B6B7F' }]} />
    </View>
  );
};

/**
 * Ancient Japanese Torii Shrine Motif (Silhouette)
 */
const AncientShrineSilhouette = ({ size = 48, color = '#292A2D', opacity = 0.12, style }) => {
  const scale = size / 48;
  return (
    <View style={[styles.shrineWrap, { width: size, height: size * 0.8, opacity }, style]}>
      {/* Top curved lintel (Kasagi) */}
      <View
        style={[
          styles.shrineLintelTop,
          {
            width: 44 * scale,
            height: 3.5 * scale,
            backgroundColor: color,
            borderRadius: 1.5 * scale,
          },
        ]}
      />
      {/* Secondary lintel (Shimaki) */}
      <View
        style={[
          styles.shrineLintelSec,
          {
            width: 38 * scale,
            height: 2.5 * scale,
            backgroundColor: color,
            marginTop: 2 * scale,
          },
        ]}
      />
      {/* Pillars (Hashira) */}
      <View style={[styles.shrinePillarsRow, { width: 30 * scale, height: 26 * scale }]}>
        <View style={[styles.shrinePillar, { width: 3 * scale, backgroundColor: color }]} />
        <View style={[styles.shrineCenterGaku, { width: 4 * scale, height: 6 * scale, backgroundColor: '#C9A35B' }]} />
        <View style={[styles.shrinePillar, { width: 3 * scale, backgroundColor: color }]} />
      </View>
    </View>
  );
};

/**
 * Mountain Silhouettes Layer (Coronet Highlands & Alabaster Icelands)
 */
const MountainRanges = ({ opacity = 0.12 }) => (
  <View style={[styles.mountainLayer, { opacity }]} pointerEvents="none">
    {/* Distant Peak 1 (Coronet) */}
    <View
      style={[
        styles.mountainPeak,
        {
          left: '10%',
          bottom: '22%',
          borderLeftWidth: 120,
          borderRightWidth: 120,
          borderBottomWidth: 140,
          borderBottomColor: '#5B6B7F',
        },
      ]}
    />
    {/* Peak 2 */}
    <View
      style={[
        styles.mountainPeak,
        {
          right: '-5%',
          bottom: '16%',
          borderLeftWidth: 140,
          borderRightWidth: 100,
          borderBottomWidth: 160,
          borderBottomColor: '#7C9A8B',
        },
      ]}
    />
    {/* Peak 3 (Midground) */}
    <View
      style={[
        styles.mountainPeak,
        {
          left: '42%',
          bottom: '12%',
          borderLeftWidth: 90,
          borderRightWidth: 90,
          borderBottomWidth: 110,
          borderBottomColor: '#5B6B7F',
        },
      ]}
    />
    {/* Mist Bands across mountains */}
    <View style={[styles.mistBand, { bottom: '26%', backgroundColor: '#A7C4D9', height: 18 }]} />
    <View style={[styles.mistBand, { bottom: '15%', backgroundColor: '#E5D9C2', height: 24 }]} />
  </View>
);

/**
 * ArceusBackground Component
 * 
 * Renders an atmospheric ancient Hisui field-journal backdrop with:
 * - Aged parchment wash base (#F8F2E7)
 * - Mountain silhouettes, misty valleys, and shrine motifs
 * - Faint golden Arceus celestial wheel in the center-top
 * - Subtle engraved Plate element symbols in the corners
 * - Zero external asset downloads needed; 100% offline vector performance.
 */
export const ArceusBackground = memo(({
  opacity = 0.22,
  subtle = false,
  showMountains = true,
  showWheel = true,
  style,
}) => {
  const effectiveOpacity = subtle ? Math.min(opacity, 0.14) : opacity;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      style={[styles.container, style]}
    >
      {/* Base Parchment Wash Tint */}
      <View style={styles.parchmentBase} />

      {/* Ambient Artwork Canvas with configured opacity */}
      <View style={[styles.canvas, { opacity: effectiveOpacity }]}>
        {/* Mountain Ranges of Hisui */}
        {showMountains && <MountainRanges opacity={0.65} />}

        {/* Central Divine Arceus Sacred Wheel */}
        {showWheel && (
          <SacredArceusWheel
            size={Math.min(SCREEN_WIDTH * 0.72, 280)}
            opacity={0.38}
            style={{
              position: 'absolute',
              top: '8%',
              alignSelf: 'center',
            }}
          />
        )}

        {/* Ancient Shrine Silhouettes */}
        <AncientShrineSilhouette
          size={52}
          color="#292A2D"
          opacity={0.35}
          style={{ position: 'absolute', top: '34%', left: '8%' }}
        />
        <AncientShrineSilhouette
          size={42}
          color="#292A2D"
          opacity={0.25}
          style={{ position: 'absolute', top: '72%', right: '10%' }}
        />

        {/* Subtle Decorative Plate Glyphs in Margins */}
        <View style={[styles.marginGlyph, { top: '4%', left: '6%' }]}>
          <Ionicons name="flame" size={16} color="#C9A35B" />
        </View>
        <View style={[styles.marginGlyph, { top: '4%', right: '6%' }]}>
          <Ionicons name="water" size={16} color="#C9A35B" />
        </View>
        <View style={[styles.marginGlyph, { top: '48%', left: '4%' }]}>
          <Ionicons name="flash" size={16} color="#C9A35B" />
        </View>
        <View style={[styles.marginGlyph, { top: '54%', right: '4%' }]}>
          <Ionicons name="leaf" size={16} color="#C9A35B" />
        </View>
        <View style={[styles.marginGlyph, { bottom: '6%', left: '8%' }]}>
          <Ionicons name="diamond" size={16} color="#C9A35B" />
        </View>
        <View style={[styles.marginGlyph, { bottom: '6%', right: '8%' }]}>
          <Ionicons name="sparkles" size={16} color="#C9A35B" />
        </View>

        {/* Ancient Inscription Calligraphy Bars */}
        <View style={[styles.inkStroke, { top: '18%', left: '7%', width: 22, height: 1.5 }]} />
        <View style={[styles.inkStroke, { top: '20%', left: '7%', width: 34, height: 1.2 }]} />
        <View style={[styles.inkStroke, { top: '80%', right: '8%', width: 28, height: 1.5 }]} />
        <View style={[styles.inkStroke, { top: '82%', right: '8%', width: 18, height: 1.2 }]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  parchmentBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F2E7',
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  arceusWheelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelOuterCircle: {
    position: 'absolute',
    borderWidth: 2.2,
    borderStyle: 'dashed',
  },
  wheelInnerCircle: {
    position: 'absolute',
    borderWidth: 1.4,
  },
  wheelSpoke: {
    position: 'absolute',
    borderRadius: 1.5,
  },
  wheelGem: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1,
    borderColor: '#C9A35B',
  },
  shrineWrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  shrineLintelTop: {
    alignSelf: 'center',
  },
  shrineLintelSec: {
    alignSelf: 'center',
  },
  shrinePillarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 2,
  },
  shrinePillar: {
    height: '100%',
    borderRadius: 1,
  },
  shrineCenterGaku: {
    alignSelf: 'center',
    borderRadius: 1,
  },
  mountainLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  mountainPeak: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  mistBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0.28,
  },
  marginGlyph: {
    position: 'absolute',
    opacity: 0.45,
  },
  inkStroke: {
    position: 'absolute',
    backgroundColor: '#5B6B7F',
    borderRadius: 1,
    opacity: 0.35,
  },
});
