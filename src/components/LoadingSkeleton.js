import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const SkeletonItem = ({ style }) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          backgroundColor: theme.colors.skeleton,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export const PokemonCardSkeleton = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <SkeletonItem style={styles.badge} />
        <SkeletonItem style={styles.heart} />
      </View>
      <SkeletonItem style={styles.image} />
      <SkeletonItem style={styles.name} />
      <View style={styles.typesRow}>
        <SkeletonItem style={styles.typeBadge} />
        <SkeletonItem style={styles.typeBadge} />
      </View>
      <View style={styles.statsRow}>
        <SkeletonItem style={styles.statLine} />
        <SkeletonItem style={styles.statLine} />
        <SkeletonItem style={styles.statLine} />
      </View>
    </View>
  );
};

export const PokemonGridSkeleton = () => {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={index} style={styles.gridCol}>
          <PokemonCardSkeleton />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 8,
  },
  card: {
    borderRadius: 16,
    padding: 12,
    margin: 8,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    minHeight: 220,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  badge: {
    width: 60,
    height: 18,
    borderRadius: 9,
  },
  heart: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginVertical: 8,
  },
  name: {
    width: 100,
    height: 18,
    marginBottom: 8,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  typeBadge: {
    width: 50,
    height: 18,
    borderRadius: 9,
  },
  statsRow: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  statLine: {
    width: '80%',
    height: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  gridCol: {
    width: '50%',
  },
});
