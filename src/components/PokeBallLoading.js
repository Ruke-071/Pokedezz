import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PikachuLoader } from './PikachuLoader';
import { EeveeLoader } from './EeveeLoader';
import { ArceusLoader } from './ArceusLoader';

export const PokeBallLoading = ({
  size = 56,
  message = 'Searching Pokédex...',
  fullScreen = false,
  showBelt = true,
}) => {
  const { theme } = useTheme();

  if (theme.isPikachu) {
    return (
      <PikachuLoader
        size={size}
        message={message}
        fullScreen={fullScreen}
      />
    );
  }

  if (theme.isEevee) {
    return (
      <EeveeLoader
        size={size}
        message={message}
        fullScreen={fullScreen}
      />
    );
  }

  if (theme.isArceus) {
    return (
      <ArceusLoader
        size={size}
        message={message || 'Consulting ancient Pokédex...'}
        fullScreen={fullScreen}
      />
    );
  }

  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 360 degree smooth wobble & spin animation
    const spinLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.1,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -0.1,
          duration: 350,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle breathing/pulse animation on the center button
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    spinLoop.start();
    pulseLoop.start();

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [rotateAnim, pulseAnim]);

  const spinInterpolation = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-360deg', '0deg', '360deg'],
  });

  const ballRadius = size / 2;
  const beltHeight = Math.max(3, Math.round(size * 0.12));
  const centerButtonOuterSize = Math.max(12, Math.round(size * 0.36));
  const centerButtonInnerSize = Math.max(6, Math.round(size * 0.18));

  const content = (
    <View style={styles.contentWrap}>
      <Animated.View
        style={[
          styles.ballContainer,
          {
            width: size,
            height: size,
            borderRadius: ballRadius,
            transform: [{ rotate: spinInterpolation }],
            shadowColor: theme.colors.primary,
          },
        ]}
      >
        {/* Top Half (Red / Theme Accent) */}
        <View
          style={[
            styles.halfTop,
            {
              backgroundColor: theme.colors.pokedexRed || theme.colors.primary || '#EF5350',
              borderTopLeftRadius: ballRadius,
              borderTopRightRadius: ballRadius,
            },
          ]}
        />

        {/* Center Divider Belt */}
        {showBelt && (
          <View
            style={[
              styles.belt,
              {
                height: beltHeight,
                top: (size - beltHeight) / 2,
              },
            ]}
          />
        )}

        {/* Bottom Half (White) */}
        <View
          style={[
            styles.halfBottom,
            {
              borderBottomLeftRadius: ballRadius,
              borderBottomRightRadius: ballRadius,
            },
          ]}
        />

        {/* Center Button Housing */}
        <View
          style={[
            styles.centerButtonOuter,
            {
              width: centerButtonOuterSize,
              height: centerButtonOuterSize,
              borderRadius: centerButtonOuterSize / 2,
              top: (size - centerButtonOuterSize) / 2,
              left: (size - centerButtonOuterSize) / 2,
            },
          ]}
        >
          {/* Inner Glowing Center LED */}
          <Animated.View
            style={[
              styles.centerButtonInner,
              {
                width: centerButtonInnerSize,
                height: centerButtonInnerSize,
                borderRadius: centerButtonInnerSize / 2,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        </View>
      </Animated.View>

      {message ? (
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreenOverlay, { backgroundColor: theme.colors.background }]}>
        {content}
      </View>
    );
  }

  return <View style={styles.inlineWrap}>{content}</View>;
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  inlineWrap: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballContainer: {
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  halfTop: {
    width: '100%',
    height: '50%',
  },
  halfBottom: {
    width: '100%',
    height: '50%',
    backgroundColor: '#FFFFFF',
  },
  belt: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    zIndex: 2,
  },
  centerButtonOuter: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#1A1A1A',
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonInner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#718096',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    letterSpacing: 0.3,
  },
});
