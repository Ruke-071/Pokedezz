import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EeveeFace } from './EeveeFace';
import { EeveeBadge } from './EeveeBadge';
import { EeveeThemeWidget } from './EeveeThemeWidget';

export { EeveeFace } from './EeveeFace';
export { EeveePattern, EeveeStickerBackground } from './EeveePattern';
export { EeveeLoader } from './EeveeLoader';
export { EeveeBadge } from './EeveeBadge';
export { EeveeThemeWidget } from './EeveeThemeWidget';

/**
 * Decorative card accent for Eevee theme
 */
export const EeveeCardAccent = ({ style }) => {
  return (
    <View style={[styles.cardAccentWrap, style]}>
      <EeveeBadge variant="corner" size={14} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardAccentWrap: {
    position: 'absolute',
    top: 4,
    right: 28,
    alignItems: 'center',
    zIndex: 10,
  },
});
