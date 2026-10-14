import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Scalable, recognizable Pikachu Face Component
 * Built purely with React Native primitives for crisp, offline, vector rendering.
 * Features:
 * - Iconic black-tipped ears tilted at authentic angles
 * - Bright Pikachu yellow face (#FFD700) or silhouette mode
 * - Round black anime eyes with specular catchlights and 6 expressive variants:
 *   'happy' | 'wink' | 'surprised' | 'cheeky' | 'sleepy' | 'spark'
 * - Rosy electric red cheek pouches (#FF3B30)
 * - Tiny nose & cute curved smile (:3 or open mouth)
 * - Silhouette mode for subtle background pattern repeats
 */
export const PikachuFace = ({
  size = 56,
  expression = 'happy',
  blushing = false,
  cheekPulse = false,
  interactive = false,
  silhouette = false,
  silhouetteColor = 'rgba(217, 158, 0, 0.16)',
  showEars = true,
  onPress,
  style,
  accessibilityLabel = 'Pikachu Face',
}) => {
  const [currentExpr, setCurrentExpr] = useState(expression);
  const [isBlushing, setIsBlushing] = useState(blushing);

  const scale = size / 56;

  // Calculated vector dimensions
  const earW = 12 * scale;
  const earH = 30 * scale;
  const earTipH = 10 * scale;
  const headW = 50 * scale;
  const headH = 40 * scale;
  const headR = 20 * scale;
  const cheekSize = 13 * scale;
  const eyeSize = 9.5 * scale;
  const pupilSize = 3.8 * scale;

  const handlePress = () => {
    if (interactive) {
      setIsBlushing(true);
      const expressions = ['happy', 'wink', 'surprised', 'cheeky', 'sleepy', 'spark'];
      const next = expressions[(expressions.indexOf(currentExpr) + 1) % expressions.length];
      setCurrentExpr(next);
      setTimeout(() => setIsBlushing(false), 900);
    }
    if (onPress) onPress();
  };

  const activeExpr = interactive ? currentExpr : expression;
  const activeBlush = blushing || isBlushing;

  // If silhouette mode is requested (for subtle seamless background patterns)
  if (silhouette) {
    return (
      <View
        style={[
          styles.root,
          { width: headW + 20 * scale, height: (showEars ? earH + headH - 6 * scale : headH) },
          style,
        ]}
        pointerEvents="none"
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
      >
        {showEars && (
          <View style={[styles.earsRow, { height: earH }]}>
            <View
              style={[
                styles.silhouetteEar,
                styles.leftEar,
                {
                  width: earW,
                  height: earH,
                  borderTopLeftRadius: 8 * scale,
                  borderTopRightRadius: 8 * scale,
                  backgroundColor: silhouetteColor,
                },
              ]}
            />
            <View style={{ width: 18 * scale }} />
            <View
              style={[
                styles.silhouetteEar,
                styles.rightEar,
                {
                  width: earW,
                  height: earH,
                  borderTopLeftRadius: 8 * scale,
                  borderTopRightRadius: 8 * scale,
                  backgroundColor: silhouetteColor,
                },
              ]}
            />
          </View>
        )}
        <View
          style={[
            styles.silhouetteHead,
            {
              width: headW,
              height: headH,
              borderRadius: headR,
              backgroundColor: silhouetteColor,
              marginTop: showEars ? -6 * scale : 0,
            },
          ]}
        />
      </View>
    );
  }

  const renderLeftEye = () => {
    if (activeExpr === 'wink') {
      // Winking curved arc
      return (
        <View
          style={[
            styles.winkEye,
            {
              width: eyeSize,
              height: 4 * scale,
              borderTopWidth: 2.2 * scale,
              borderTopLeftRadius: 4 * scale,
              borderTopRightRadius: 4 * scale,
            },
          ]}
        />
      );
    }
    if (activeExpr === 'cheeky') {
      return (
        <Text style={[styles.squintText, { fontSize: 10 * scale }]}>^</Text>
      );
    }
    if (activeExpr === 'sleepy') {
      return (
        <View
          style={[
            styles.sleepyEye,
            {
              width: eyeSize,
              height: 4 * scale,
              borderBottomWidth: 2.2 * scale,
              borderBottomLeftRadius: 4 * scale,
              borderBottomRightRadius: 4 * scale,
            },
          ]}
        />
      );
    }
    // Normal round anime eye
    return (
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
    );
  };

  const renderRightEye = () => {
    if (activeExpr === 'cheeky') {
      return (
        <Text style={[styles.squintText, { fontSize: 10 * scale }]}>^</Text>
      );
    }
    if (activeExpr === 'sleepy') {
      return (
        <View
          style={[
            styles.sleepyEye,
            {
              width: eyeSize,
              height: 4 * scale,
              borderBottomWidth: 2.2 * scale,
              borderBottomLeftRadius: 4 * scale,
              borderBottomRightRadius: 4 * scale,
            },
          ]}
        />
      );
    }
    // Normal round eye (even during wink)
    return (
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
    );
  };

  const renderMouth = () => {
    if (activeExpr === 'surprised') {
      return (
        <View
          style={[
            styles.surprisedMouth,
            {
              width: 5.5 * scale,
              height: 7.5 * scale,
              borderRadius: 3 * scale,
              borderWidth: 1.2 * scale,
            },
          ]}
        >
          <View
            style={[
              styles.tongueSpot,
              { width: 3.5 * scale, height: 2.5 * scale, borderRadius: 1.5 * scale },
            ]}
          />
        </View>
      );
    }

    if (activeExpr === 'cheeky') {
      return (
        <View style={styles.cheekyMouthWrap}>
          <View
            style={[
              styles.smileHalf,
              {
                width: 7 * scale,
                height: 3 * scale,
                borderBottomLeftRadius: 3.5 * scale,
                borderBottomRightRadius: 3.5 * scale,
                borderWidth: Math.max(1, 1.2 * scale),
              },
            ]}
          />
          <View
            style={[
              styles.tongueOut,
              {
                width: 4.5 * scale,
                height: 4.5 * scale,
                borderBottomLeftRadius: 2.5 * scale,
                borderBottomRightRadius: 2.5 * scale,
              },
            ]}
          />
        </View>
      );
    }

    // Default cute :3 cat smile
    return (
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
    );
  };

  const content = (
    <View
      style={[
        styles.root,
        { width: headW + 20 * scale, height: (showEars ? headH + earH - 6 * scale : headH) },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {/* ─── EARS ROW WITH BLACK TIPS ─────────────────────────────────────────── */}
      {showEars && (
        <View style={[styles.earsRow, { height: earH }]}>
          {/* Left Ear (Tilted Left) */}
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

          {/* Right Ear (Tilted Right) */}
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
      )}

      {/* ─── HEAD & FACIAL FEATURES ────────────────────────────────────────── */}
      <View
        style={[
          styles.head,
          {
            width: headW,
            height: headH,
            borderRadius: headR,
            marginTop: showEars ? -6 * scale : 0,
            borderWidth: Math.max(1, 1.2 * scale),
          },
        ]}
      >
        {/* Cheeks & Eyes Row */}
        <View style={styles.featuresRow}>
          {/* Left Rosy Cheek Pouch */}
          <View
            style={[
              styles.cheek,
              {
                width: cheekSize,
                height: cheekSize,
                borderRadius: cheekSize / 2,
                transform: [{ scale: activeBlush ? 1.25 : 1 }],
              },
              activeBlush && styles.cheekBlushing,
            ]}
          />

          {/* Left Eye */}
          <View style={styles.eyeContainer}>
            {renderLeftEye()}
          </View>

          {/* Center Nose & Smile */}
          <View style={styles.mouthArea}>
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
            {renderMouth()}
          </View>

          {/* Right Eye */}
          <View style={styles.eyeContainer}>
            {renderRightEye()}
          </View>

          {/* Right Rosy Cheek Pouch */}
          <View
            style={[
              styles.cheek,
              {
                width: cheekSize,
                height: cheekSize,
                borderRadius: cheekSize / 2,
                transform: [{ scale: activeBlush ? 1.25 : 1 }],
              },
              activeBlush && styles.cheekBlushing,
            ]}
          />
        </View>
      </View>
    </View>
  );

  if (interactive) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
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
  silhouetteEar: {
    overflow: 'hidden',
  },
  silhouetteHead: {
    alignItems: 'center',
    justifyContent: 'center',
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
  eyeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    backgroundColor: '#1C1917',
    position: 'relative',
  },
  winkEye: {
    borderTopColor: '#1C1917',
  },
  sleepyEye: {
    borderBottomColor: '#1C1917',
  },
  squintText: {
    color: '#1C1917',
    fontWeight: '900',
    lineHeight: 12,
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
  surprisedMouth: {
    backgroundColor: '#3D0A24',
    borderColor: '#272007',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  tongueSpot: {
    backgroundColor: '#FF8A80',
    marginBottom: 0.5,
  },
  cheekyMouthWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  tongueOut: {
    backgroundColor: '#FF8A80',
    borderWidth: 0.8,
    borderColor: '#272007',
    marginTop: -1,
  },
});
