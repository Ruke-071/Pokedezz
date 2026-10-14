import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PikachuFace } from './PikachuFace';

/**
 * PikachuBadge Component
 * Displays a compact, stylish Pikachu face emblem with optional status text
 * or electric lightning accents.
 */
export const PikachuBadge = ({
  text = 'PIKA',
  size = 'small',
  showIcon = true,
  style,
}) => {
  const isSmall = size === 'small';
  const faceSize = isSmall ? 20 : 28;

  return (
    <View style={[styles.badge, isSmall && styles.badgeSmall, style]}>
      <PikachuFace size={faceSize} />
      {text ? (
        <Text style={[styles.badgeText, isSmall && styles.badgeTextSmall]}>
          {text}
        </Text>
      ) : null}
      {showIcon && (
        <Ionicons
          name="flash"
          size={isSmall ? 10 : 13}
          color="#FF3B30"
          style={styles.icon}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70028',
    borderColor: '#FFD70088',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    gap: 4,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  badgeText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  badgeTextSmall: {
    fontSize: 9.5,
  },
  icon: {
    marginLeft: 1,
  },
});
