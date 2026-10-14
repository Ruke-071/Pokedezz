import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export { PikachuFace } from './PikachuFace';
export { PikachuPattern } from './PikachuPattern';
export { PikachuLoader } from './PikachuLoader';
export { PikachuBadge } from './PikachuBadge';

/**
 * Authentic Pikachu Face & Signature Component
 * Renders the iconic black-tipped ears, blushing electric red cheeks,
 * round anime eyes, cat smile, and lightning bolt tail signature.
 */
export const PikachuFaceWidget = ({ showSpeech = true, size = 'medium', style }) => {
  const { theme } = useTheme();
  const [speechText, setSpeechText] = useState('Pika Pika! ⚡');
  const [isBlushing, setIsBlushing] = useState(false);

  const PHRASES = [
    'Pika Pika! ⚡',
    'Pikachuuu! ✨',
    'Volt Tackle! ⚡💥',
    'Thunderbolt Ready! ⚡',
    'Pika-Pi! ❤️',
  ];

  const handlePikachuTap = () => {
    setIsBlushing(true);
    const nextPhrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setSpeechText(nextPhrase);
    setTimeout(() => {
      setIsBlushing(false);
    }, 1200);
  };

  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePikachuTap}
      style={[styles.container, style]}
    >
      {/* ─── EAR ASSEMBLY ─────────────────────────────────────────────────── */}
      <View style={styles.earsRow}>
        {/* Left Ear (Tilted Left) */}
        <View style={[styles.ear, styles.leftEar, isSmall && styles.smallEar]}>
          <View style={[styles.earTip, styles.leftEarTip, isSmall && styles.smallEarTip]} />
        </View>

        {/* Center Space between ears */}
        <View style={{ width: isSmall ? 28 : 46 }} />

        {/* Right Ear (Tilted Right) */}
        <View style={[styles.ear, styles.rightEar, isSmall && styles.smallEar]}>
          <View style={[styles.earTip, styles.rightEarTip, isSmall && styles.smallEarTip]} />
        </View>
      </View>

      {/* ─── PIKACHU HEAD & FACE ──────────────────────────────────────────── */}
      <View style={[styles.faceCard, isSmall && styles.smallFaceCard]}>
        {/* Top Lightning Signature Ribbon */}
        <View style={styles.signatureRow}>
          <Ionicons name="flash" size={13} color="#FF3B30" />
          <Text style={styles.signatureText}>PIKACHU MODE</Text>
          <Ionicons name="flash" size={13} color="#FF3B30" />
        </View>

        {/* Eyes & Cheeks Row */}
        <View style={styles.featuresRow}>
          {/* Left Red Cheek Pouch */}
          <View
            style={[
              styles.cheek,
              isSmall && styles.smallCheek,
              isBlushing && styles.blushingCheek,
            ]}
          >
            <Ionicons name="flash" size={10} color="#FFF" />
          </View>

          {/* Left Eye */}
          <View style={[styles.eye, isSmall && styles.smallEye]}>
            <View style={styles.eyePupilGlance} />
          </View>

          {/* Cute Nose & Mouth Area */}
          <View style={styles.centerMouthArea}>
            <View style={styles.nose} />
            <Text style={styles.catSmile}>3</Text>
          </View>

          {/* Right Eye */}
          <View style={[styles.eye, isSmall && styles.smallEye]}>
            <View style={styles.eyePupilGlance} />
          </View>

          {/* Right Red Cheek Pouch */}
          <View
            style={[
              styles.cheek,
              isSmall && styles.smallCheek,
              isBlushing && styles.blushingCheek,
            ]}
          >
            <Ionicons name="flash" size={10} color="#FFF" />
          </View>
        </View>

        {/* Speech Bubble / Signature Status */}
        {showSpeech && (
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{speechText}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Compact Pikachu Face Stamp / Card Accent
 */
export const PikachuCardAccent = () => {
  return (
    <View style={styles.cardAccentWrap}>
      {/* Mini Ears */}
      <View style={styles.miniEarsRow}>
        <View style={[styles.miniEar, { transform: [{ rotate: '-22deg' }] }]}>
          <View style={styles.miniEarTip} />
        </View>
        <View style={[styles.miniEar, { transform: [{ rotate: '22deg' }] }]}>
          <View style={styles.miniEarTip} />
        </View>
      </View>

      {/* Mini Face Badge */}
      <View style={styles.miniFacePill}>
        <View style={styles.miniCheek} />
        <Ionicons name="flash" size={11} color="#FFD700" />
        <View style={styles.miniCheek} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 6,
  },
  earsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 38,
    zIndex: 2,
    marginBottom: -8,
  },
  ear: {
    width: 20,
    height: 48,
    backgroundColor: '#FFD700',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2A2006',
    overflow: 'hidden',
  },
  leftEar: {
    transform: [{ rotate: '-28deg' }],
  },
  rightEar: {
    transform: [{ rotate: '28deg' }],
  },
  smallEar: {
    width: 14,
    height: 32,
  },
  earTip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#151515',
  },
  leftEarTip: {
    transform: [{ skewX: '-10deg' }],
  },
  rightEarTip: {
    transform: [{ skewX: '10deg' }],
  },
  smallEarTip: {
    height: 12,
  },
  faceCard: {
    width: '94%',
    backgroundColor: '#FFD700',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#4A3B08',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  smallFaceCard: {
    paddingVertical: 8,
    borderRadius: 16,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 8,
  },
  signatureText: {
    color: '#382B02',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
  },
  cheek: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C62828',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  blushingCheek: {
    backgroundColor: '#FF1744',
    transform: [{ scale: 1.2 }],
  },
  smallCheek: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  eye: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E1E1E',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 3,
  },
  smallEye: {
    width: 16,
    height: 16,
    borderRadius: 8,
    padding: 2,
  },
  eyePupilGlance: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  centerMouthArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nose: {
    width: 5,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A1A1A',
    marginBottom: 2,
  },
  catSmile: {
    fontSize: 15,
    fontWeight: '900',
    color: '#422800',
    transform: [{ rotate: '90deg' }],
    marginTop: -2,
  },
  speechBubble: {
    marginTop: 8,
    backgroundColor: '#FFFDE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6C25B',
  },
  speechText: {
    color: '#382B02',
    fontSize: 11,
    fontWeight: '800',
  },
  cardAccentWrap: {
    position: 'absolute',
    top: 4,
    right: 28,
    alignItems: 'center',
    zIndex: 10,
  },
  miniEarsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: -4,
  },
  miniEar: {
    width: 6,
    height: 12,
    backgroundColor: '#FFD700',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
  },
  miniEarTip: {
    height: 4,
    backgroundColor: '#111',
  },
  miniFacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  miniCheek: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF3B30',
  },
});
