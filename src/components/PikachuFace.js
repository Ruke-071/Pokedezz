import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Scalable, recognizable Pikachu Face Component
 * Built purely with React Native primitives for crisp, offline, vector rendering.
 * Features:
 * - Iconic black-tipped ears tilted at authentic angles
 * - Bright Pikachu yellow face (#FFD700)
 * - Round black anime eyes with white specular catchlights
 * - Bright rosy electric red cheek pouches (#FF3B30)
 * - Tiny nose & cute curved smile
 */
export const PikachuFace = ({
  size = 56,
  blushing = false,
  cheekPulse = false,
  interactive = false,
  onPress,
  style,
  accessibilityLabel = 'Pikachu Face',
}) => {
  const scale = size / 56;

  // Calculated dimensions
  const earW = 12 * scale;
  const earH = 30 * scale;
  const earTipH = 10 * scale;
  const headW = 50 * scale;
  const headH = 40 * scale;
  const headR = 20 * scale;
  const cheekSize = 13 * scale;
  const eyeSize = 9 * scale;
  const pupilSize = 3.5 * scale;

  const content = (
    <View
      style={[
        styles.root,
        { width: headW + 20 * scale, height: headH + earH - 6 * scale },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {/* ─── EARS ROW ──────────────────────────────────────────────────────── */}
      <View style={[styles.earsRow, { height: earH }]}>
        {/* Left Ear */}
        <View
          style={[
            styles.ear,
            styles.leftEar,
            {
              width: earW,
              height: earH,
              borderTopLeftRadius: 8 * scale,
              borderTopRightRadius: 8 * scale,
              borderWidth: Math.max(1, 1.2 * scale),
            },
          ]}
        >
          <View
            style={[
              styles.earTip,
              styles.leftEarTip,
              { height: earTipH },
            ]}
          />
        </View>

        {/* Ear Gap */}
        <View style={{ width: 18 * scale }} />

        {/* Right Ear */}
        <View
          style={[
            styles.ear,
            styles.rightEar,
            {
              width: earW,
              height: earH,
              borderTopLeftRadius: 8 * scale,
              borderTopRightRadius: 8 * scale,
              borderWidth: Math.max(1, 1.2 * scale),
            },
          ]}
        >
          <View
            style={[
              styles.earTip,
              styles.rightEarTip,
              { height: earTipH },
            ]}
          />
        </View>
      </View>

      {/* ─── HEAD & FACE ───────────────────────────────────────────────────── */}
      <View
        style={[
          styles.head,
          {
            width: headW,
            height: headH,
            borderRadius: headR,
            marginTop: -6 * scale,
            borderWidth: Math.max(1, 1.2 * scale),
          },
        ]}
      >
        {/* Cheeks & Eyes Row */}
        <View style={styles.featuresRow}>
          {/* Left Cheek */}
          <View
            style={[
              styles.cheek,
              {
                width: cheekSize,
                height: cheekSize,
                borderRadius: cheekSize / 2,
                transform: [{ scale: blushing ? 1.25 : 1 }],
              },
              blushing && styles.cheekBlushing,
            ]}
          />

          {/* Left Eye */}
          <View
            style={[
              styles.eye,
              {
                width: eyeSize,
                height: eyeSize,
                borderRadius: eyeSize / 2,
              },
            ]}
          >
            <View
              style={[
                styles.pupil,
                {
                  width: pupilSize,
                  height: pupilSize,
                  borderRadius: pupilSize / 2,
                  top: 1 * scale,
                  left: 1.5 * scale,
                },
              ]}
            />
          </View>

          {/* Center Nose & Smile */}
          <View style={styles.mouthArea}>
            {/* Tiny nose */}
            <View
              style={[
                styles.nose,
                {
                  width: 3 * scale,
                  height: 2.2 * scale,
                  borderRadius: 1 * scale,
                  marginBottom: 1.5 * scale,
                },
              ]}
            />
            {/* Smile W-curve */}
            <View style={styles.smileWrap}>
              <View
                style={[
                  styles.smileHalf,
                  {
                    width: 4.5 * scale,
                    height: 3.5 * scale,
                    borderBottomLeftRadius: 3 * scale,
                    borderBottomRightRadius: 3 * scale,
                    borderWidth: Math.max(1, 1.2 * scale),
                  },
                ]}
              />
              <View
                style={[
                  styles.smileHalf,
                  {
                    width: 4.5 * scale,
                    height: 3.5 * scale,
                    borderBottomLeftRadius: 3 * scale,
                    borderBottomRightRadius: 3 * scale,
                    borderWidth: Math.max(1, 1.2 * scale),
                  },
                ]}
              />
            </View>
          </View>

          {/* Right Eye */}
          <View
            style={[
              styles.eye,
              {
                width: eyeSize,
                height: eyeSize,
                borderRadius: eyeSize / 2,
              },
            ]}
          >
            <View
              style={[
                styles.pupil,
                {
                  width: pupilSize,
                  height: pupilSize,
                  borderRadius: pupilSize / 2,
                  top: 1 * scale,
                  left: 1.5 * scale,
                },
              ]}
            />
          </View>

          {/* Right Cheek */}
          <View
            style={[
              styles.cheek,
              {
                width: cheekSize,
                height: cheekSize,
                borderRadius: cheekSize / 2,
                transform: [{ scale: blushing ? 1.25 : 1 }],
              },
              blushing && styles.cheekBlushing,
            ]}
          />
        </View>
      </View>
    </View>
  );

  if (interactive) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  earsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1,
  },
  ear: {
    backgroundColor: '#FFD700',
    borderColor: '#3D2F07',
    overflow: 'hidden',
  },
  leftEar: {
    transform: [{ rotate: '-26deg' }],
  },
  rightEar: {
    transform: [{ rotate: '26deg' }],
  },
  earTip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1917',
  },
  leftEarTip: {
    transform: [{ skewX: '-8deg' }],
  },
  rightEarTip: {
    transform: [{ skewX: '8deg' }],
  },
  head: {
    backgroundColor: '#FFD700',
    borderColor: '#3D2F07',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 2,
  },
  cheek: {
    backgroundColor: '#FF3B30',
    borderWidth: 0.5,
    borderColor: '#D32F2F',
  },
  cheekBlushing: {
    backgroundColor: '#FF1744',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  eye: {
    backgroundColor: '#1C1917',
    position: 'relative',
  },
  pupil: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  mouthArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nose: {
    backgroundColor: '#272007',
  },
  smileWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smileHalf: {
    backgroundColor: 'transparent',
    borderColor: '#272007',
    borderTopWidth: 0,
  },
});
