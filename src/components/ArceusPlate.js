import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getArceusPlateByType } from '../data/arceusPlatesData';

/**
 * ArceusPlate Component
 * 
 * Renders an authentic engraved ancient stone Plate tablet inspired by Pokémon Legends: Arceus.
 * 
 * Features:
 * - Angular tablet silhouette with beveled corners and stone relief
 * - Distinct elemental color core and engraved ancient emblem
 * - Restrained divine gold rim (#C9A35B)
 * - Selected state with radiant golden outline and ambient amber elevation
 * - Accessible labels with screen reader support
 * - Small (~26px), medium (~36px), and large (~52px) sizes
 */
export const ArceusPlate = ({
  type = 'normal',
  size = 'medium',
  selected = false,
  showLabel = false,
  showPlateName = false,
  onPress,
  style,
  disabled = false,
  accessibilityLabel,
}) => {
  const plate = getArceusPlateByType(type);

  // Compute numeric dimensions based on size prop
  let dim = 36;
  let iconSize = 15;
  let fontSize = 9;
  let padH = 6;
  let padV = 3;

  if (size === 'small' || size <= 28) {
    dim = 24;
    iconSize = 11;
    fontSize = 8;
    padH = 4;
    padV = 2;
  } else if (size === 'large' || size >= 48) {
    dim = 52;
    iconSize = 22;
    fontSize = 11;
    padH = 10;
    padV = 5;
  } else if (typeof size === 'number') {
    dim = size;
    iconSize = Math.max(10, Math.round(size * 0.44));
    fontSize = Math.max(8, Math.round(size * 0.28));
  }

  const labelText = showPlateName ? plate.name : plate.typeName.toUpperCase();
  const accLabel = accessibilityLabel || `${plate.name}, ${plate.typeName} type plate${selected ? ', selected' : ''}`;

  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.78}
      accessible={true}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={accLabel}
      accessibilityState={{ selected }}
      style={[
        styles.wrapper,
        showLabel && styles.wrapperWithLabel,
        selected && styles.wrapperSelected,
        style,
      ]}
    >
      {/* Outer Stele/Tablet Body */}
      <View
        style={[
          styles.tabletBody,
          {
            width: showLabel ? 'auto' : dim,
            height: dim,
            borderRadius: Math.round(dim * 0.22),
            borderColor: selected ? '#C9A35B' : '#5B6B7F33',
            borderWidth: selected ? 2 : 1.2,
            backgroundColor: selected ? '#FFFDF8' : '#F4EEE1',
            paddingHorizontal: showLabel ? padH + 4 : 0,
          },
          selected && styles.tabletSelectedShadow,
        ]}
      >
        {/* Inner Gold Filigree Bevel Ring */}
        <View
          style={[
            styles.innerBevel,
            {
              borderRadius: Math.round(dim * 0.16),
              borderColor: selected ? '#C9A35B' : plate.darkColor + '55',
            },
          ]}
        >
          {/* Emblem Gem Center */}
          <View
            style={[
              styles.emblemGem,
              {
                width: Math.round(dim * 0.68),
                height: Math.round(dim * 0.68),
                borderRadius: Math.round(dim * 0.18),
                backgroundColor: plate.color,
                shadowColor: plate.darkColor,
              },
            ]}
          >
            <Ionicons
              name={plate.icon}
              size={iconSize}
              color="#FFFFFF"
            />
          </View>

          {/* Optional Label (Inside Plate Pill) */}
          {showLabel && (
            <Text
              numberOfLines={1}
              style={[
                styles.plateLabelText,
                {
                  fontSize,
                  color: selected ? '#262626' : '#3A3F47',
                  fontWeight: selected ? '800' : '700',
                  marginLeft: 6,
                  marginRight: 4,
                },
              ]}
            >
              {labelText}
            </Text>
          )}
        </View>

        {/* Four Sacred Notches / Engraved Corners */}
        <View style={[styles.cornerNotch, styles.notchTL]} />
        <View style={[styles.cornerNotch, styles.notchTR]} />
        <View style={[styles.cornerNotch, styles.notchBL]} />
        <View style={[styles.cornerNotch, styles.notchBR]} />
      </View>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  wrapperWithLabel: {
    flexDirection: 'row',
  },
  wrapperSelected: {
    transform: [{ scale: 1.02 }],
  },
  tabletBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#292A2D',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.14,
    shadowRadius: 2.5,
  },
  tabletSelectedShadow: {
    elevation: 4,
    shadowColor: '#C9A35B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  innerBevel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1.5,
    borderWidth: 0.8,
  },
  emblemGem: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1.5,
  },
  plateLabelText: {
    letterSpacing: 0.6,
  },
  cornerNotch: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#C9A35B66',
    borderRadius: 1,
  },
  notchTL: {
    top: 1.5,
    left: 1.5,
  },
  notchTR: {
    top: 1.5,
    right: 1.5,
  },
  notchBL: {
    bottom: 1.5,
    left: 1.5,
  },
  notchBR: {
    bottom: 1.5,
    right: 1.5,
  },
});
