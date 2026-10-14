import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EeveeFace } from './EeveeFace';

/**
 * Single Die-Cut Sticker with White Border and Soft Drop Shadow
 */
const DieCutSticker = ({ children, rotate = '0deg', scale = 1, style }) => (
  <View
    style={[
      styles.dieCutContainer,
      {
        transform: [{ rotate }, { scale }],
      },
      style,
    ]}
  >
    {children}
  </View>
);

/**
 * Eevee Fluffy Tail Sticker
 */
const StickerTail = ({ size = 32 }) => {
  const scale = size / 32;
  return (
    <View style={[styles.tailWrap, { width: 30 * scale, height: 26 * scale }]}>
      <View
        style={[
          styles.tailBrownBase,
          {
            width: 28 * scale,
            height: 20 * scale,
            borderRadius: 10 * scale,
            transform: [{ rotate: '-25deg' }],
          },
        ]}
      />
      {/* Cream fluffy tail tip */}
      <View
        style={[
          styles.tailCreamTip,
          {
            width: 16 * scale,
            height: 14 * scale,
            borderRadius: 7 * scale,
            top: 1 * scale,
            right: 0,
          },
        ]}
      />
    </View>
  );
};

/**
 * Eevee Paw Print Sticker
 */
const StickerPaw = ({ size = 22, color = '#A67C52' }) => {
  const scale = size / 22;
  return (
    <View style={[styles.pawWrap, { width: size, height: size * 0.9 }]}>
      {/* 3 Toes */}
      <View style={styles.pawToesRow}>
        <View style={[styles.pawToe, { width: 4.5 * scale, height: 6 * scale, backgroundColor: color }]} />
        <View style={[styles.pawToe, { width: 5 * scale, height: 7 * scale, backgroundColor: color, marginTop: -2 * scale }]} />
        <View style={[styles.pawToe, { width: 4.5 * scale, height: 6 * scale, backgroundColor: color }]} />
      </View>
      {/* Main Pad */}
      <View style={[styles.pawPad, { width: 12 * scale, height: 9 * scale, borderRadius: 5 * scale, backgroundColor: color }]} />
    </View>
  );
};

/**
 * Leaf Green Accent Sticker
 */
const StickerLeaf = ({ size = 20 }) => (
  <View style={[styles.leafWrap, { width: size, height: size }]}>
    <Ionicons name="leaf" size={size * 0.9} color="#A3D6C6" />
  </View>
);

/**
 * Peach Heart Accent Sticker
 */
const StickerHeart = ({ size = 20 }) => (
  <View style={[styles.heartWrap, { width: size, height: size }]}>
    <Ionicons name="heart" size={size * 0.9} color="#F7A8C3" />
  </View>
);

/**
 * Cozy Poké Ball Sticker
 */
const StickerPokeBall = ({ size = 22 }) => {
  const scale = size / 22;
  return (
    <View style={[styles.pokeBallWrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.pokeBallTop, { height: size / 2, backgroundColor: '#D7B899' }]} />
      <View style={[styles.pokeBallBottom, { height: size / 2, backgroundColor: '#FFF8EE' }]} />
      <View style={[styles.pokeBallBelt, { height: 2.5 * scale }]} />
      <View style={[styles.pokeBallCenterBtn, { width: 6 * scale, height: 6 * scale, borderRadius: 3 * scale }]} />
    </View>
  );
};

/**
 * Eeveelution Elements Mini Stickers
 */
const EeveelutionBadge = ({ type = 'water', size = 18 }) => {
  let iconName = 'water';
  let iconColor = '#4FC3F7';

  if (type === 'spark') {
    iconName = 'flash';
    iconColor = '#FFD54F';
  } else if (type === 'flame') {
    iconName = 'flame';
    iconColor = '#FF8A65';
  } else if (type === 'moon') {
    iconName = 'moon';
    iconColor = '#FBC02D';
  } else if (type === 'sun') {
    iconName = 'sunny';
    iconColor = '#BA68C8';
  } else if (type === 'ribbon') {
    iconName = 'ribbon';
    iconColor = '#F48FB1';
  } else if (type === 'ice') {
    iconName = 'snow';
    iconColor = '#80DEEA';
  }

  return (
    <View style={[styles.eeveelutionWrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name={iconName} size={size * 0.72} color={iconColor} />
    </View>
  );
};

/**
 * Deterministic Collage Layout Matrix for Eevee Sticker Sheet
 */
const EEVEE_COLLAGE_MOTIFS = [
  // ── Row 1 (Top header zone) ──
  { type: 'face-color', expression: 'happy', size: 46, rotate: '-10deg', top: '2%', left: '5%' },
  { type: 'leaf', size: 20, rotate: '25deg', top: '2.5%', left: '46%' },
  { type: 'heart', size: 20, rotate: '-15deg', top: '3%', left: '74%' },
  { type: 'face-dark-sil', size: 38, rotate: '18deg', top: '8%', left: '26%' },
  { type: 'eeveelution', element: 'ribbon', size: 20, rotate: '-12deg', top: '9%', left: '86%' },

  // ── Row 2 (Upper zone) ──
  { type: 'tail', size: 30, rotate: '15deg', top: '14%', left: '8%' },
  { type: 'face-color', expression: 'wink', size: 44, rotate: '14deg', top: '15%', left: '48%' },
  { type: 'paw', color: '#A67C52', size: 22, rotate: '-22deg', top: '16%', left: '82%' },
  { type: 'pokeball', size: 22, rotate: '10deg', top: '21%', left: '28%' },
  { type: 'face-light-sil', size: 48, rotate: '-16deg', top: '22%', left: '68%' },

  // ── Row 3 (Upper-mid zone) ──
  { type: 'face-color', expression: 'cheerful', size: 44, rotate: '-14deg', top: '28%', left: '4%' },
  { type: 'heart', size: 22, rotate: '20deg', top: '29%', left: '52%' },
  { type: 'eeveelution', element: 'moon', size: 20, rotate: '-18deg', top: '32%', left: '86%' },
  { type: 'face-dark-sil', size: 40, rotate: '22deg', top: '35%', left: '26%' },
  { type: 'leaf', size: 20, rotate: '-30deg', top: '37%', left: '72%' },

  // ── Row 4 (Center zone) ──
  { type: 'tail', size: 32, rotate: '-20deg', top: '42%', left: '12%' },
  { type: 'face-color', expression: 'sleepy', size: 46, rotate: '12deg', top: '43%', left: '50%' },
  { type: 'paw', color: '#F7A8C3', size: 20, rotate: '16deg', top: '44%', left: '82%' },
  { type: 'face-light-sil', size: 50, rotate: '-15deg', top: '50%', left: '28%' },
  { type: 'pokeball', size: 22, rotate: '-12deg', top: '52%', left: '72%' },

  // ── Row 5 (Lower-mid zone) ──
  { type: 'face-color', expression: 'surprised', size: 42, rotate: '-22deg', top: '57%', left: '6%' },
  { type: 'eeveelution', element: 'water', size: 20, rotate: '14deg', top: '58%', left: '44%' },
  { type: 'face-color', expression: 'happy', size: 46, rotate: '16deg', top: '60%', left: '70%' },
  { type: 'leaf', size: 22, rotate: '18deg', top: '65%', left: '22%' },
  { type: 'face-dark-sil', size: 42, rotate: '-18deg', top: '67%', left: '84%' },

  // ── Row 6 (Lower zone) ──
  { type: 'tail', size: 30, rotate: '24deg', top: '73%', left: '14%' },
  { type: 'heart', size: 22, rotate: '-16deg', top: '74%', left: '52%' },
  { type: 'paw', color: '#A67C52', size: 22, rotate: '20deg', top: '76%', left: '76%' },
  { type: 'face-color', expression: 'wink', size: 44, rotate: '-12deg', top: '81%', left: '34%' },
  { type: 'eeveelution', element: 'flame', size: 20, rotate: '-22deg', top: '83%', left: '88%' },

  // ── Row 7 (Bottom zone) ──
  { type: 'face-color', expression: 'cheerful', size: 42, rotate: '16deg', top: '89%', left: '10%' },
  { type: 'leaf', size: 20, rotate: '-15deg', top: '91%', left: '58%' },
  { type: 'face-dark-sil', size: 40, rotate: '-20deg', top: '93%', left: '80%' },
  { type: 'pokeball', size: 20, rotate: '15deg', top: '94%', left: '38%' },
];

/**
 * EeveePattern / EeveeStickerBackground Component
 * Renders a cozy Eevee sticker-sheet background with die-cut white borders,
 * soft shadows, multiple expressions, fluffy tails, paws, hearts, leaves,
 * and decorative Eeveelution accents.
 */
export const EeveePattern = memo(({
  opacity = 0.20,
  subtle = false,
  showCozyBase = true,
  style,
}) => {
  const effectiveOpacity = subtle ? Math.min(opacity, 0.14) : opacity;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.container,
        showCozyBase && styles.cozyCreamBase,
        style,
      ]}
    >
      <View style={[styles.patternCanvas, { opacity: effectiveOpacity }]}>
        {EEVEE_COLLAGE_MOTIFS.map((item, index) => {
          let stickerElement = null;

          if (item.type === 'face-color') {
            stickerElement = (
              <DieCutSticker rotate={item.rotate}>
                <EeveeFace
                  size={item.size}
                  expression={item.expression}
                />
              </DieCutSticker>
            );
          } else if (item.type === 'face-dark-sil') {
            stickerElement = (
              <EeveeFace
                size={item.size}
                silhouette={true}
                silhouetteColor="rgba(166, 124, 82, 0.22)"
                style={{ transform: [{ rotate: item.rotate }] }}
              />
            );
          } else if (item.type === 'face-light-sil') {
            stickerElement = (
              <EeveeFace
                size={item.size}
                silhouette={true}
                silhouetteColor="rgba(255, 255, 255, 0.65)"
                style={{ transform: [{ rotate: item.rotate }] }}
              />
            );
          } else if (item.type === 'tail') {
            stickerElement = (
              <DieCutSticker rotate={item.rotate}>
                <StickerTail size={item.size} />
              </DieCutSticker>
            );
          } else if (item.type === 'paw') {
            stickerElement = (
              <DieCutSticker rotate={item.rotate}>
                <StickerPaw size={item.size} color={item.color} />
              </DieCutSticker>
            );
          } else if (item.type === 'leaf') {
            stickerElement = (
              <DieCutSticker rotate={item.rotate}>
                <StickerLeaf size={item.size} />
              </DieCutSticker>
            );
          } else if (item.type === 'heart') {
            stickerElement = (
              <DieCutSticker rotate={item.rotate}>
                <StickerHeart size={item.size} />
              </DieCutSticker>
            );
          } else if (item.type === 'pokeball') {
            stickerElement = (
              <DieCutSticker rotate={item.rotate}>
                <StickerPokeBall size={item.size} />
              </DieCutSticker>
            );
          } else if (item.type === 'eeveelution') {
            stickerElement = (
              <DieCutSticker rotate={item.rotate}>
                <EeveelutionBadge type={item.element} size={item.size} />
              </DieCutSticker>
            );
          }

          return (
            <View
              key={`eevee-motif-${index}`}
              style={[
                styles.motifPosition,
                {
                  top: item.top,
                  left: item.left,
                },
              ]}
            >
              {stickerElement}
            </View>
          );
        })}
      </View>
    </View>
  );
});

export const EeveeStickerBackground = EeveePattern;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  cozyCreamBase: {
    backgroundColor: '#F5EAD7', // Cozy cream base
  },
  patternCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  motifPosition: {
    position: 'absolute',
  },
  // ── Die-Cut White Sticker Border & Shadow ──
  dieCutContainer: {
    backgroundColor: '#FFFFFF',
    padding: 2.5,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#EFE4D6',
    shadowColor: '#543D28',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.22,
    shadowRadius: 2.5,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Tail Sticker ──
  tailWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tailBrownBase: {
    backgroundColor: '#A67C52',
    borderColor: '#4A3320',
    borderWidth: 1,
  },
  tailCreamTip: {
    position: 'absolute',
    backgroundColor: '#FFF8EE',
    borderColor: '#D7B899',
    borderWidth: 1,
  },
  // ── Paw Sticker ──
  pawWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawToesRow: {
    flexDirection: 'row',
    gap: 2.5,
    marginBottom: 1,
  },
  pawToe: {
    borderRadius: 3,
  },
  pawPad: {
    marginTop: 0.5,
  },
  // ── Leaf & Heart ──
  leafWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Poké Ball ──
  pokeBallWrap: {
    borderWidth: 1.2,
    borderColor: '#4A3320',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeBallTop: {
    width: '100%',
  },
  pokeBallBottom: {
    width: '100%',
  },
  pokeBallBelt: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#4A3320',
  },
  pokeBallCenterBtn: {
    position: 'absolute',
    backgroundColor: '#FFF8EE',
    borderWidth: 1,
    borderColor: '#4A3320',
  },
  // ── Eeveelution Elements ──
  eeveelutionWrap: {
    backgroundColor: '#FFF8EE',
    borderColor: '#D7B899',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
