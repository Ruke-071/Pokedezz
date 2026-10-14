import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PikachuFace } from './PikachuFace';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Curated seamless pattern cell motifs:
 * Varied sizes, expressions ('happy', 'wink', 'surprised', 'cheeky', 'sleepy'),
 * orientations (-25° to +25°), slightly lighter/darker silhouettes,
 * full color faces with rosy red cheeks and black-tipped ears, plus subtle lightning bolts.
 */
const PATTERN_MOTIFS = [
  // Row 1 (Top header zone)
  { type: 'face-color', expression: 'happy', size: 44, rotate: '-12deg', top: '1.5%', left: '4%' },
  { type: 'bolt', size: 18, rotate: '15deg', top: '2.5%', left: '46%' },
  { type: 'face-dark-sil', size: 36, rotate: '20deg', top: '2%', left: '76%' },
  { type: 'spark', size: 15, rotate: '-10deg', top: '7%', left: '26%' },
  { type: 'face-light-sil', size: 48, rotate: '-18deg', top: '8%', left: '62%' },

  // Row 2 (Upper zone)
  { type: 'face-color', expression: 'wink', size: 40, rotate: '16deg', top: '13%', left: '8%' },
  { type: 'face-dark-sil', size: 52, rotate: '-15deg', top: '14%', left: '42%' },
  { type: 'bolt', size: 20, rotate: '-25deg', top: '16%', left: '86%' },
  { type: 'face-color', expression: 'surprised', size: 38, rotate: '-22deg', top: '21%', left: '24%' },
  { type: 'spark', size: 16, rotate: '18deg', top: '22%', left: '74%' },

  // Row 3 (Upper-mid zone)
  { type: 'face-light-sil', size: 56, rotate: '14deg', top: '27%', left: '5%' },
  { type: 'face-color', expression: 'cheeky', size: 42, rotate: '-10deg', top: '28%', left: '52%' },
  { type: 'bolt', size: 19, rotate: '30deg', top: '32%', left: '88%' },
  { type: 'face-dark-sil', size: 36, rotate: '24deg', top: '35%', left: '28%' },
  { type: 'spark', size: 14, rotate: '-15deg', top: '37%', left: '70%' },

  // Row 4 (Center zone)
  { type: 'face-color', expression: 'sleepy', size: 44, rotate: '-18deg', top: '42%', left: '10%' },
  { type: 'bolt', size: 22, rotate: '-12deg', top: '43%', left: '46%' },
  { type: 'face-light-sil', size: 50, rotate: '16deg', top: '44%', left: '78%' },
  { type: 'face-color', expression: 'happy', size: 46, rotate: '20deg', top: '50%', left: '32%' },
  { type: 'spark', size: 16, rotate: '22deg', top: '51%', left: '60%' },

  // Row 5 (Lower-mid zone)
  { type: 'face-dark-sil', size: 42, rotate: '-24deg', top: '57%', left: '6%' },
  { type: 'face-color', expression: 'wink', size: 44, rotate: '12deg', top: '58%', left: '68%' },
  { type: 'bolt', size: 20, rotate: '18deg', top: '63%', left: '38%' },
  { type: 'face-light-sil', size: 54, rotate: '-14deg', top: '65%', left: '84%' },
  { type: 'face-color', expression: 'surprised', size: 40, rotate: '15deg', top: '68%', left: '16%' },

  // Row 6 (Lower zone)
  { type: 'spark', size: 16, rotate: '-20deg', top: '74%', left: '54%' },
  { type: 'face-dark-sil', size: 48, rotate: '22deg', top: '75%', left: '78%' },
  { type: 'face-color', expression: 'cheeky', size: 42, rotate: '-16deg', top: '77%', left: '8%' },
  { type: 'bolt', size: 22, rotate: '-28deg', top: '82%', left: '42%' },
  { type: 'face-light-sil', size: 46, rotate: '18deg', top: '84%', left: '68%' },

  // Row 7 (Bottom zone)
  { type: 'face-color', expression: 'sleepy', size: 42, rotate: '14deg', top: '89%', left: '22%' },
  { type: 'spark', size: 15, rotate: '15deg', top: '91%', left: '86%' },
  { type: 'bolt', size: 18, rotate: '10deg', top: '93%', left: '4%' },
  { type: 'face-dark-sil', size: 40, rotate: '-18deg', top: '94%', left: '56%' },
];

/**
 * PikachuPattern Component
 * 
 * Renders a seamless, repeating Pikachu-face background with varied sizes,
 * authentic expressions (happy, wink, surprised, cheeky, sleepy),
 * tilted orientations, lighter/darker silhouettes, red cheek accents,
 * black-tipped ears, and subtle electric lightning details.
 * 
 * Features:
 * - Soft yellow base (#FFF9E6)
 * - Subtle opacity behind text (default: 0.18 for optimal legibility)
 * - Vector-based, offline, zero network requests
 * - pointerEvents="none" so all buttons, lists, cards, and gestures remain 100% responsive
 */
export const PikachuPattern = memo(({
  opacity = 0.18,
  subtle = false,
  showSoftBase = true,
  style,
}) => {
  const effectiveOpacity = subtle ? Math.min(opacity, 0.13) : opacity;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.container,
        showSoftBase && styles.softYellowBase,
        style,
      ]}
    >
      <View style={[styles.patternCanvas, { opacity: effectiveOpacity }]}>
        {PATTERN_MOTIFS.map((item, index) => {
          let motifElement = null;

          if (item.type === 'face-color') {
            motifElement = (
              <PikachuFace
                size={item.size}
                expression={item.expression}
                style={{ transform: [{ rotate: item.rotate }] }}
              />
            );
          } else if (item.type === 'face-dark-sil') {
            // Darker Pikachu silhouette (#E0A800 / golden amber)
            motifElement = (
              <PikachuFace
                size={item.size}
                silhouette={true}
                silhouetteColor="rgba(217, 158, 0, 0.22)"
                style={{ transform: [{ rotate: item.rotate }] }}
              />
            );
          } else if (item.type === 'face-light-sil') {
            // Lighter Pikachu silhouette (soft white glow)
            motifElement = (
              <PikachuFace
                size={item.size}
                silhouette={true}
                silhouetteColor="rgba(255, 255, 255, 0.65)"
                style={{ transform: [{ rotate: item.rotate }] }}
              />
            );
          } else if (item.type === 'bolt') {
            motifElement = (
              <View style={[styles.boltWrap, { transform: [{ rotate: item.rotate }] }]}>
                <Ionicons name="flash" size={item.size} color="#FFC107" />
              </View>
            );
          } else if (item.type === 'spark') {
            motifElement = (
              <View style={[styles.sparkWrap, { transform: [{ rotate: item.rotate }] }]}>
                <Ionicons name="sparkles" size={item.size} color="#FFD700" />
              </View>
            );
          }

          return (
            <View
              key={`pika-motif-${index}`}
              style={[
                styles.motifPosition,
                {
                  top: item.top,
                  left: item.left,
                },
              ]}
            >
              {motifElement}
            </View>
          );
        })}
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
  softYellowBase: {
    backgroundColor: '#FFF9E6',
  },
  patternCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  motifPosition: {
    position: 'absolute',
  },
  boltWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
