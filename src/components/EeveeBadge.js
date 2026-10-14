import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EeveeFace } from './EeveeFace';

/**
 * EeveeBadge Component
 * Reusable badge featuring a mini Eevee face, optional leaf, heart, or paw accents,
 * and warm caramel/cream typography.
 * 
 * Variants:
 * - 'pill': Rounded pill badge with cream/caramel tint and border
 * - 'favorite': Indicator badge with blushing Eevee face & peach heart
 * - 'corner': Decorative card corner badge
 * - 'button': Pill button wrapper with Eevee face prefix
 * - 'outline': Subtle outline badge with warm brown border
 */
export const EeveeBadge = ({
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
      <EeveeFace
        size={faceSize}
        expression={favorited ? 'wink' : expression}
        blushing={favorited}
        showCollar={!isTiny}
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
            color={favorited ? '#F7A8C3' : '#855E39'}
            style={styles.icon}
          />
        ) : (
          <Ionicons
            name="leaf"
            size={isTiny ? 9 : isSmall ? 11 : 14}
            color="#A3D6C6"
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
    backgroundColor: '#FFF8EE',
    borderColor: '#D7B899',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  favoriteActiveBadge: {
    backgroundColor: 'rgba(247, 168, 195, 0.18)',
    borderColor: '#F7A8C3',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  favoriteInactiveBadge: {
    backgroundColor: 'rgba(255, 248, 238, 0.85)',
    borderColor: '#E8D2BE',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cornerBadge: {
    backgroundColor: '#FFF8EE',
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D7B899',
  },
  buttonBadge: {
    backgroundColor: '#A67C52',
    borderColor: '#6D4C2F',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#543D28',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  outlineBadge: {
    backgroundColor: 'transparent',
    borderColor: '#D7B899',
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
    color: '#4A3320',
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
    color: '#E27396',
  },
  icon: {
    marginLeft: 1,
  },
});
