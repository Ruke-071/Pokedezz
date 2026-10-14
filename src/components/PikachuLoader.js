import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PikachuFace } from './PikachuFace';

/**
 * Custom Pikachu-Style Loading Indicator
 * 
 * Features:
 * - Recognizable Pikachu Face as the hero visual
 * - Smooth floating / bouncing physics loop
 * - Animated blushing red cheek pouches with glow pulse
 * - Intermittent electric spark / lightning accents
 * - Configurable size, optional loading message, and accessibility support
 * - Compact variant for inline pagination / footers and fullScreen overlay
 */
export const PikachuLoader = ({
  size = 56,
  message = 'Loading Pokémon...',
  fullScreen = false,
  compact = false,
  accessibilityLabel = 'Loading Pokémon...',
  style,
}) => {
  const { theme } = useTheme();

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const cheekPulseAnim = useRef(new Animated.Value(1)).current;
  const sparkAnim1 = useRef(new Animated.Value(0)).current;
  const sparkAnim2 = useRef(new Animated.Value(0)).current;

  const isCompact = compact || size <= 36;
  const actualSize = isCompact ? Math.min(size, 36) : size;

  useEffect(() => {
    // 1. Gentle floating / bouncing physics
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -7,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 3,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Animated electric cheek pouch pulse
    const cheekLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cheekPulseAnim, {
          toValue: 1.25,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(cheekPulseAnim, {
          toValue: 1.0,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Intermittent electric sparks
    const sparkLoop1 = Animated.loop(
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(sparkAnim1, {
          toValue: 1,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(sparkAnim1, {
          toValue: 0,
          duration: 350,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ])
    );

    const sparkLoop2 = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(sparkAnim2, {
          toValue: 1,
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(sparkAnim2, {
          toValue: 0,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(300),
      ])
    );

    floatLoop.start();
    cheekLoop.start();
    sparkLoop1.start();
    sparkLoop2.start();

    return () => {
      floatLoop.stop();
      cheekLoop.stop();
      sparkLoop1.stop();
      sparkLoop2.stop();
    };
  }, [floatAnim, cheekPulseAnim, sparkAnim1, sparkAnim2]);

  const content = (
    <View
      style={[styles.container, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Animated Floating Pikachu Face Assembly */}
      <Animated.View
        style={[
          styles.mascotWrapper,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        {/* Left Electric Spark Accent */}
        {!isCompact && (
          <Animated.View
            style={[
              styles.sparkLeft,
              {
                opacity: sparkAnim1,
                transform: [
                  {
                    scale: sparkAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1.2],
                    }),
                  },
                  { rotate: '-18deg' },
                ],
              },
            ]}
          >
            <Ionicons name="flash" size={16} color="#FFD700" />
          </Animated.View>
        )}

        {/* The Scalable Pikachu Face */}
        <PikachuFace
          size={actualSize}
          blushing={true}
        />

        {/* Right Electric Spark Accent */}
        {!isCompact && (
          <Animated.View
            style={[
              styles.sparkRight,
              {
                opacity: sparkAnim2,
                transform: [
                  {
                    scale: sparkAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1.2],
                    }),
                  },
                  { rotate: '22deg' },
                ],
              },
            ]}
          >
            <Ionicons name="flash" size={14} color="#FF3B30" />
          </Animated.View>
        )}
      </Animated.View>

      {/* Loading Message */}
      {message && !isCompact ? (
        <View style={styles.messageWrap}>
          <Text style={[styles.messageText, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>
          <View style={styles.electricDotsRow}>
            <View style={[styles.dot, { backgroundColor: '#FFD700' }]} />
            <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} />
            <View style={[styles.dot, { backgroundColor: '#FFD700' }]} />
          </View>
        </View>
      ) : null}
    </View>
  );

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreenOverlay,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkLeft: {
    position: 'absolute',
    top: 2,
    left: -18,
    zIndex: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  sparkRight: {
    position: 'absolute',
    top: 8,
    right: -16,
    zIndex: 10,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  messageWrap: {
    alignItems: 'center',
    marginTop: 10,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  electricDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
