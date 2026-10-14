import React, { useEffect, useRef, useState } from 'react';
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
import { EeveeFace } from './EeveeFace';

/**
 * Custom Eevee-Style Loading Indicator
 * 
 * Features:
 * - Gently bouncing Eevee sticker
 * - Blinking eyes and subtle tail / head bob movement
 * - Floating hearts, green leaves, and sparkles
 * - Optional loading text
 * - Compact variant for inline pagination / footers and fullScreen overlay
 * - Lightweight 60fps animations with useNativeDriver: true
 */
export const EeveeLoader = ({
  size = 56,
  message = 'Loading Pokémon...',
  fullScreen = false,
  compact = false,
  accessibilityLabel = 'Loading Pokémon...',
  style,
}) => {
  const { theme } = useTheme();

  // Animation values
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const tailWagAnim = useRef(new Animated.Value(0)).current;
  const particleAnim1 = useRef(new Animated.Value(0)).current;
  const particleAnim2 = useRef(new Animated.Value(0)).current;
  const particleAnim3 = useRef(new Animated.Value(0)).current;

  // Blinking eyes state
  const [isBlinking, setIsBlinking] = useState(false);

  const isCompact = compact || size <= 36;
  const actualSize = isCompact ? Math.min(size, 34) : size;

  useEffect(() => {
    // 1. Gentle floating / bouncing physics loop
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -7,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 2,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Subtle tail wag animation
    const tailLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tailWagAnim, {
          toValue: 1,
          duration: 450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tailWagAnim, {
          toValue: -1,
          duration: 450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Floating particles (hearts, leaves, sparkles)
    const p1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim1, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const p2Loop = Animated.loop(
      Animated.sequence([
        Animated.delay(450),
        Animated.timing(particleAnim2, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const p3Loop = Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(particleAnim3, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim3, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    bounceLoop.start();
    tailLoop.start();
    p1Loop.start();
    p2Loop.start();
    p3Loop.start();

    // 4. Periodic eye blink timer
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 160);
    }, 2800);

    return () => {
      bounceLoop.stop();
      tailLoop.stop();
      p1Loop.stop();
      p2Loop.stop();
      p3Loop.stop();
      clearInterval(blinkInterval);
    };
  }, []);

  const tailRotation = tailWagAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-14deg', '14deg'],
  });

  const p1TranslateY = particleAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });
  const p1Opacity = particleAnim1.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 0.8, 0],
  });

  const p2TranslateY = particleAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -32],
  });
  const p2Opacity = particleAnim2.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 0.8, 0],
  });

  const p3TranslateY = particleAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -26],
  });
  const p3Opacity = particleAnim3.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 0.8, 0],
  });

  const content = (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreenContainer,
        fullScreen && { backgroundColor: theme.colors.background + 'EE' },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.animationArea}>
        {/* Floating Particles (Hearts, Leaves, Sparkles) */}
        {!isCompact && (
          <>
            {/* Left Leaf Particle */}
            <Animated.View
              style={[
                styles.particle,
                styles.particleLeft,
                {
                  opacity: p1Opacity,
                  transform: [{ translateY: p1TranslateY }, { rotate: '-15deg' }],
                },
              ]}
            >
              <Ionicons name="leaf" size={14} color="#A3D6C6" />
            </Animated.View>

            {/* Top Peach Heart Particle */}
            <Animated.View
              style={[
                styles.particle,
                styles.particleTop,
                {
                  opacity: p2Opacity,
                  transform: [{ translateY: p2TranslateY }, { scale: 1.1 }],
                },
              ]}
            >
              <Ionicons name="heart" size={13} color="#F7A8C3" />
            </Animated.View>

            {/* Right Sparkle Particle */}
            <Animated.View
              style={[
                styles.particle,
                styles.particleRight,
                {
                  opacity: p3Opacity,
                  transform: [{ translateY: p3TranslateY }, { rotate: '20deg' }],
                },
              ]}
            >
              <Ionicons name="sparkles" size={13} color="#D7B899" />
            </Animated.View>
          </>
        )}

        {/* Bouncing Eevee Sticker */}
        <Animated.View
          style={[
            styles.eeveeWrap,
            {
              transform: [{ translateY: bounceAnim }],
            },
          ]}
        >
          {/* Subtle Wagging Tail in Background */}
          {!isCompact && (
            <Animated.View
              style={[
                styles.tailBehind,
                {
                  transform: [{ rotate: tailRotation }],
                },
              ]}
            >
              <View style={styles.tailTipCream} />
            </Animated.View>
          )}

          {/* Eevee Face Sticker */}
          <View style={styles.dieCutBorder}>
            <EeveeFace
              size={actualSize}
              expression={isBlinking ? 'sleepy' : 'happy'}
              blushing={true}
            />
          </View>
        </Animated.View>
      </View>

      {/* Optional Loading Message */}
      {message && !isCompact ? (
        <View style={styles.messageWrap}>
          <Text style={[styles.messageText, { color: theme.colors.text }]}>
            {message}
          </Text>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: '#A67C52' }]} />
            <View style={[styles.dot, { backgroundColor: '#D7B899' }]} />
            <View style={[styles.dot, { backgroundColor: '#A3D6C6' }]} />
          </View>
        </View>
      ) : null}
    </View>
  );

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  animationArea: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  eeveeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dieCutBorder: {
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#EFE4D6',
    shadowColor: '#543D28',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  tailBehind: {
    position: 'absolute',
    bottom: 2,
    right: -10,
    width: 22,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#A67C52',
    borderWidth: 1,
    borderColor: '#4A3320',
    zIndex: -1,
  },
  tailTipCream: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 11,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF8EE',
  },
  particle: {
    position: 'absolute',
    zIndex: 10,
  },
  particleLeft: {
    top: 4,
    left: 4,
  },
  particleTop: {
    top: -8,
    alignSelf: 'center',
  },
  particleRight: {
    top: 6,
    right: 4,
  },
  messageWrap: {
    alignItems: 'center',
    marginTop: 10,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
