import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PikachuFace } from './PikachuFace';

/**
 * PikachuBadge Component
 * Reusable badge featuring a mini Pikachu face, optional lightning or heart accents,
 * and high-contrast typography.
 * 
 * Variants:
 * - 'pill': Rounded pill badge with subtle yellow tint and golden border
 * - 'favorite': Interactive or indicator badge with blushing Pikachu face & heart
 * - 'corner': Decorative card corner badge
 * - 'button': Pill button wrapper with Pikachu face prefix
 * - 'outline': Subtle outline badge with electric yellow/red border
 */
export const PikachuBadge = ({
  text,
  variant = 'pill',
  size = 'small',
  favorited = false,
  expression = 'happy',
  showIcon = true,
  onPress,
  style,
  textStyle,
}) => {
  const isTiny = size === 'tiny';
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const faceSize = isTiny ? 14 : isSmall ? 18 : isLarge ? 30 : 24;

  const content = (
    <View
      style={[
        styles.badgeBase,
        variant === 'pill' && styles.pillBadge,
        variant === 'favorite' && (favorited ? styles.favoriteActiveBadge : styles.favoriteInactiveBadge),
        variant === 'corner' && styles.cornerBadge,
        variant === 'button' && styles.buttonBadge,
        variant === 'outline' && styles.outlineBadge,
        isTiny && styles.tinyPadding,
        isSmall && styles.smallPadding,
        isLarge && styles.largePadding,
        style,
      ]}
    >
      <PikachuFace
        size={faceSize}
        expression={favorited ? 'wink' : expression}
        blushing={favorited}
      />
      {text ? (
        <Text
          style={[
            styles.badgeText,
            isTiny && styles.tinyText,
            isSmall && styles.smallText,
            isLarge && styles.largeText,
            variant === 'favorite' && favorited && styles.favoriteActiveText,
            textStyle,
          ]}
        >
          {text}
        </Text>
      ) : null}
      {showIcon && (
        variant === 'favorite' ? (
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={isTiny ? 10 : isSmall ? 12 : 15}
            color={favorited ? '#FF3B30' : '#8E7B45'}
            style={styles.icon}
          />
        ) : (
          <Ionicons
            name="flash"
            size={isTiny ? 9 : isSmall ? 11 : 14}
            color="#FF3B30"
            style={styles.icon}
          />
        )
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pillBadge: {
    backgroundColor: '#FFF2C6',
    borderColor: '#F6D565',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  favoriteActiveBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderColor: '#FF3B30',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  favoriteInactiveBadge: {
    backgroundColor: 'rgba(255, 249, 230, 0.85)',
    borderColor: '#FFE082',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cornerBadge: {
    backgroundColor: '#FFF2C6',
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F6D565',
  },
  buttonBadge: {
    backgroundColor: '#FFD700',
    borderColor: '#E6A800',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  outlineBadge: {
    backgroundColor: 'transparent',
    borderColor: '#F6D565',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tinyPadding: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    gap: 2,
  },
  smallPadding: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    gap: 3,
  },
  largePadding: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  badgeText: {
    color: '#3D2F07',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  tinyText: {
    fontSize: 9,
  },
  smallText: {
    fontSize: 10,
  },
  largeText: {
    fontSize: 13,
  },
  favoriteActiveText: {
    color: '#FF3B30',
  },
  icon: {
    marginLeft: 1,
  },
});
