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

/**
 * ArceusLoader Component
 * 
 * Elegant ancient Hisui loading indicator featuring:
 * - Slowly rotating and gently pulsing golden Arceus celestial wheel
 * - Central divine emblem / jewel that shifts with primordial luster
 * - Subtle drifting gold particles
 * - Inscription-style loading text ('Consulting the Pokédex...' / 'Exploring Hisui...')
 * - Compact and fullScreen variants
 * - 60fps native-driver animations with full cleanup
 */
export const ArceusLoader = ({
  size = 56,
  message = 'Consulting ancient Pokédex...',
  fullScreen = false,
  compact = false,
  accessibilityLabel = 'Consulting ancient Pokédex...',
  style,
}) => {
  const { theme } = useTheme();

  // Animation refs
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;

  const isCompact = compact || size <= 36;
  const actualSize = isCompact ? Math.min(size, 34) : size;

  useEffect(() => {
    // 1. Smooth 360-degree rotation of Arceus wheel
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Gentle divine pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.96,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Drifting gold dust particle 1
    const p1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(particle1, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(particle1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Drifting gold dust particle 2
    const p2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(particle2, {
          toValue: 1,
          duration: 2300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(particle2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    spinLoop.start();
    pulseLoop.start();
    p1Loop.start();
    p2Loop.start();

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
      p1Loop.stop();
      p2Loop.stop();
    };
  }, []);

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const p1TranslateY = particle1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const p1Opacity = particle1.interpolate({
    inputRange: [0, 0.4, 0.9, 1],
    outputRange: [0, 0.8, 0.4, 0],
  });

  const p2TranslateY = particle2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22],
  });
  const p2Opacity = particle2.interpolate({
    inputRange: [0, 0.3, 0.85, 1],
    outputRange: [0, 0.9, 0.3, 0],
  });

  const content = (
    <View
      style={[
        styles.loaderInner,
        isCompact && styles.compactLoader,
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={{ width: actualSize + 16, height: actualSize + 16, alignItems: 'center', justifyContent: 'center' }}>
        {/* Floating Divine Sparkle Particles */}
        {!isCompact && (
          <>
            <Animated.View
              style={[
                styles.particle,
                {
                  top: 2,
                  left: 6,
                  opacity: p1Opacity,
                  transform: [{ translateY: p1TranslateY }],
                },
              ]}
            >
              <Ionicons name="sparkles" size={10} color="#C9A35B" />
            </Animated.View>
            <Animated.View
              style={[
                styles.particle,
                {
                  top: 4,
                  right: 8,
                  opacity: p2Opacity,
                  transform: [{ translateY: p2TranslateY }],
                },
              ]}
            >
              <Ionicons name="sparkles" size={9} color="#E5D9C2" />
            </Animated.View>
          </>
        )}

        {/* Rotating Arceus Wheel */}
        <Animated.View
          style={[
            styles.wheelContainer,
            {
              width: actualSize,
              height: actualSize,
              borderRadius: actualSize / 2,
              transform: [{ rotate: spinInterpolation }],
            },
          ]}
        >
          {/* Outer Gold Ring with 4 Cardinal Jewels */}
          <View
            style={[
              styles.wheelRing,
              {
                width: actualSize,
                height: actualSize,
                borderRadius: actualSize / 2,
                borderColor: '#C9A35B',
              },
            ]}
          />
          {/* Inner Golden Rim */}
          <View
            style={[
              styles.wheelInnerRim,
              {
                width: Math.round(actualSize * 0.72),
                height: Math.round(actualSize * 0.72),
                borderRadius: Math.round(actualSize * 0.36),
                borderColor: '#C9A35B',
              },
            ]}
          />

          {/* 4 Diagonal Spokes */}
          <View
            style={[
              styles.spoke,
              {
                width: Math.round(actualSize * 0.9),
                height: 2,
                backgroundColor: '#C9A35B',
                transform: [{ rotate: '45deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.spoke,
              {
                width: Math.round(actualSize * 0.9),
                height: 2,
                backgroundColor: '#C9A35B',
                transform: [{ rotate: '-45deg' }],
              },
            ]}
          />
        </Animated.View>

        {/* Pulsing Central Sacred Tablet Core */}
        <Animated.View
          style={[
            styles.centerCore,
            {
              width: Math.round(actualSize * 0.44),
              height: Math.round(actualSize * 0.44),
              borderRadius: Math.round(actualSize * 0.14),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons
            name="prism"
            size={Math.round(actualSize * 0.28)}
            color="#FFFFFF"
          />
        </Animated.View>
      </View>

      {/* Message Inscription */}
      {!isCompact && !!message && (
        <View style={styles.messageWrap}>
          <Text style={styles.messageTitle}>{message}</Text>
          <Text style={styles.messageSub}>HISUI SURVEY RECORD</Text>
        </View>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreenOverlay}>
        <View style={styles.fullScreenCard}>
          {content}
        </View>
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  loaderInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  compactLoader: {
    padding: 2,
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wheelRing: {
    borderWidth: 2,
    borderStyle: 'dashed',
    position: 'absolute',
  },
  wheelInnerRim: {
    borderWidth: 1.2,
    position: 'absolute',
  },
  spoke: {
    position: 'absolute',
    borderRadius: 1,
  },
  centerCore: {
    position: 'absolute',
    backgroundColor: '#C9A35B',
    borderWidth: 1,
    borderColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#C9A35B',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  particle: {
    position: 'absolute',
    zIndex: 10,
  },
  messageWrap: {
    marginTop: 10,
    alignItems: 'center',
  },
  messageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#262626',
    letterSpacing: 0.4,
  },
  messageSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C9A35B',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 242, 231, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  fullScreenCard: {
    backgroundColor: '#FFFDF9',
    borderColor: '#C9A35B',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#292A2D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
