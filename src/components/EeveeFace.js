import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Scalable, recognizable Eevee Face & Sticker Component
 * Built purely with React Native primitives for crisp, offline, vector rendering.
 * 
 * Features:
 * - Iconic long fox-like ears tilted authentically with inner ear shading
 * - Cute forehead fur tuft
 * - Warm Eevee brown head (#A67C52) with dark outlines (#4A3320)
 * - Large expressive anime eyes with specular catchlights and 6 variants:
 *   'happy' | 'wink' | 'surprised' | 'cheerful' | 'sleepy' | 'spark'
 * - Rosy peach blush accents (#F7A8C3)
 * - Fluffy cream neck collar / ruff (#FFF8EE)
 * - Silhouette mode for subtle background pattern repeats
 */
export const EeveeFace = ({
  size = 56,
  expression = 'happy',
  blushing = false,
  interactive = false,
  silhouette = false,
  silhouetteColor = 'rgba(166, 124, 82, 0.18)',
  showEars = true,
  showCollar = true,
  onPress,
  style,
  accessibilityLabel = 'Eevee Face',
}) => {
  const [currentExpr, setCurrentExpr] = useState(expression);
  const [isBlushing, setIsBlushing] = useState(blushing);

  const scale = size / 56;

  // Calculated vector dimensions
  const earW = 14 * scale;
  const earH = 36 * scale;
  const headW = 46 * scale;
  const headH = 38 * scale;
  const headR = 19 * scale;
  const collarW = 54 * scale;
  const collarH = 14 * scale;
  const eyeSize = 10 * scale;
  const pupilSize = 4 * scale;
  const cheekSize = 10 * scale;

  const handlePress = () => {
    if (interactive) {
      setIsBlushing(true);
      const expressions = ['happy', 'wink', 'surprised', 'cheerful', 'sleepy', 'spark'];
      const next = expressions[(expressions.indexOf(currentExpr) + 1) % expressions.length];
      setCurrentExpr(next);
      setTimeout(() => setIsBlushing(false), 900);
    }
    if (onPress) onPress();
  };

  const activeExpr = interactive ? currentExpr : expression;
  const activeBlush = blushing || isBlushing;

  // Silhouette mode for subtle seamless pattern repeats
  if (silhouette) {
    return (
      <View
        style={[
          styles.root,
          {
            width: headW + 28 * scale,
            height: (showEars ? earH + headH + (showCollar ? 6 * scale : 0) - 8 * scale : headH),
          },
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
                  borderTopLeftRadius: 12 * scale,
                  borderTopRightRadius: 4 * scale,
                  borderBottomLeftRadius: 6 * scale,
                  backgroundColor: silhouetteColor,
                },
              ]}
            />
            <View style={{ width: 14 * scale }} />
            <View
              style={[
                styles.silhouetteEar,
                styles.rightEar,
                {
                  width: earW,
                  height: earH,
                  borderTopRightRadius: 12 * scale,
                  borderTopLeftRadius: 4 * scale,
                  borderBottomRightRadius: 6 * scale,
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
              marginTop: showEars ? -10 * scale : 0,
            },
          ]}
        />
        {showCollar && (
          <View
            style={[
              styles.silhouetteCollar,
              {
                width: collarW,
                height: collarH,
                borderRadius: collarH / 2,
                backgroundColor: silhouetteColor,
                marginTop: -4 * scale,
              },
            ]}
          />
        )}
      </View>
    );
  }

  const renderLeftEye = () => {
    if (activeExpr === 'wink') {
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
    if (activeExpr === 'cheerful') {
      return (
        <Text style={[styles.cheerfulEyeText, { fontSize: 11 * scale }]}>^</Text>
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
    return (
      <View
        style={[
          styles.eye,
          {
            width: eyeSize,
            height: eyeSize * 1.15,
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
        {/* Secondary mini catchlight */}
        <View
          style={[
            styles.miniCatchlight,
            {
              width: 1.8 * scale,
              height: 1.8 * scale,
              borderRadius: 0.9 * scale,
              bottom: 1.5 * scale,
              right: 1.5 * scale,
            },
          ]}
        />
      </View>
    );
  };

  const renderRightEye = () => {
    if (activeExpr === 'cheerful') {
      return (
        <Text style={[styles.cheerfulEyeText, { fontSize: 11 * scale }]}>^</Text>
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
    return (
      <View
        style={[
          styles.eye,
          {
            width: eyeSize,
            height: eyeSize * 1.15,
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
        <View
          style={[
            styles.miniCatchlight,
            {
              width: 1.8 * scale,
              height: 1.8 * scale,
              borderRadius: 0.9 * scale,
              bottom: 1.5 * scale,
              right: 1.5 * scale,
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
              width: 5 * scale,
              height: 6 * scale,
              borderRadius: 2.5 * scale,
              borderWidth: 1.2 * scale,
            },
          ]}
        >
          <View
            style={[
              styles.tongueSpot,
              { width: 3 * scale, height: 2 * scale, borderRadius: 1.5 * scale },
            ]}
          />
        </View>
      );
    }

    // Default cute kitten smile
    return (
      <View style={styles.smileWrap}>
        <View
          style={[
            styles.smileHalf,
            {
              width: 4 * scale,
              height: 3 * scale,
              borderBottomLeftRadius: 2.5 * scale,
              borderBottomRightRadius: 2.5 * scale,
              borderWidth: Math.max(1, 1.2 * scale),
            },
          ]}
        />
        <View
          style={[
            styles.smileHalf,
            {
              width: 4 * scale,
              height: 3 * scale,
              borderBottomLeftRadius: 2.5 * scale,
              borderBottomRightRadius: 2.5 * scale,
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
        {
          width: headW + 28 * scale,
          height: (showEars ? headH + earH + (showCollar ? 6 * scale : 0) - 8 * scale : headH),
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {/* ─── EARS WITH CARAMEL INNER SHADING ───────────────────────────────── */}
      {showEars && (
        <View style={[styles.earsRow, { height: earH }]}>
          {/* Left Ear */}
          <View
            style={[
              styles.ear,
              styles.leftEar,
              {
                width: earW,
                height: earH,
                borderTopLeftRadius: 12 * scale,
                borderTopRightRadius: 4 * scale,
                borderBottomLeftRadius: 6 * scale,
                borderWidth: Math.max(1, 1.2 * scale),
              },
            ]}
          >
            {/* Inner Ear Shading */}
            <View
              style={[
                styles.innerEar,
                {
                  width: earW * 0.55,
                  height: earH * 0.65,
                  borderTopLeftRadius: 8 * scale,
                  borderTopRightRadius: 3 * scale,
                  backgroundColor: '#6D4C2F',
                },
              ]}
            />
          </View>

          {/* Forehead Fur Tuft Gap */}
          <View style={[styles.foreheadTuftWrap, { width: 14 * scale }]}>
            <View
              style={[
                styles.tuftPiece,
                {
                  width: 5 * scale,
                  height: 9 * scale,
                  borderRadius: 3 * scale,
                  transform: [{ rotate: '-15deg' }],
                },
              ]}
            />
            <View
              style={[
                styles.tuftPiece,
                {
                  width: 6 * scale,
                  height: 11 * scale,
                  borderRadius: 3.5 * scale,
                  marginTop: -2 * scale,
                },
              ]}
            />
            <View
              style={[
                styles.tuftPiece,
                {
                  width: 5 * scale,
                  height: 9 * scale,
                  borderRadius: 3 * scale,
                  transform: [{ rotate: '15deg' }],
                },
              ]}
            />
          </View>

          {/* Right Ear */}
          <View
            style={[
              styles.ear,
              styles.rightEar,
              {
                width: earW,
                height: earH,
                borderTopRightRadius: 12 * scale,
                borderTopLeftRadius: 4 * scale,
                borderBottomRightRadius: 6 * scale,
                borderWidth: Math.max(1, 1.2 * scale),
              },
            ]}
          >
            {/* Inner Ear Shading */}
            <View
              style={[
                styles.innerEar,
                {
                  width: earW * 0.55,
                  height: earH * 0.65,
                  borderTopRightRadius: 8 * scale,
                  borderTopLeftRadius: 3 * scale,
                  backgroundColor: '#6D4C2F',
                },
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
            marginTop: showEars ? -10 * scale : 0,
            borderWidth: Math.max(1, 1.2 * scale),
          },
        ]}
      >
        <View style={styles.featuresRow}>
          {/* Left Peach Blush */}
          <View
            style={[
              styles.cheek,
              {
                width: cheekSize,
                height: cheekSize * 0.7,
                borderRadius: cheekSize / 2,
                transform: [{ scale: activeBlush ? 1.3 : 1 }],
              },
              activeBlush && styles.cheekBlushing,
            ]}
          />

          {/* Left Eye */}
          <View style={styles.eyeContainer}>
            {renderLeftEye()}
          </View>

          {/* Center Nose & Mouth */}
          <View style={styles.mouthArea}>
            <View
              style={[
                styles.nose,
                {
                  width: 2.5 * scale,
                  height: 2 * scale,
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

          {/* Right Peach Blush */}
          <View
            style={[
              styles.cheek,
              {
                width: cheekSize,
                height: cheekSize * 0.7,
                borderRadius: cheekSize / 2,
                transform: [{ scale: activeBlush ? 1.3 : 1 }],
              },
              activeBlush && styles.cheekBlushing,
            ]}
          />
        </View>
      </View>

      {/* ─── FLUFFY CREAM COLLAR RUFF ──────────────────────────────────────── */}
      {showCollar && (
        <View
          style={[
            styles.collarRuff,
            {
              width: collarW,
              height: collarH,
              borderRadius: collarH / 2,
              marginTop: -5 * scale,
              borderWidth: Math.max(1, 1.2 * scale),
            },
          ]}
        >
          {/* Fluffy scalloped mane puffs */}
          <View style={[styles.ruffFluff, { width: 12 * scale, height: 10 * scale, borderRadius: 5 * scale }]} />
          <View style={[styles.ruffFluff, { width: 14 * scale, height: 11 * scale, borderRadius: 6 * scale, marginTop: 1 * scale }]} />
          <View style={[styles.ruffFluff, { width: 12 * scale, height: 10 * scale, borderRadius: 5 * scale }]} />
        </View>
      )}
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
    backgroundColor: '#A67C52',
    borderColor: '#4A3320',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteEar: {
    overflow: 'hidden',
  },
  silhouetteHead: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteCollar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftEar: {
    transform: [{ rotate: '-32deg' }],
  },
  rightEar: {
    transform: [{ rotate: '32deg' }],
  },
  innerEar: {
    alignSelf: 'center',
    marginTop: 4,
  },
  foreheadTuftWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: -4,
    zIndex: 3,
  },
  tuftPiece: {
    backgroundColor: '#A67C52',
    borderWidth: 0.8,
    borderColor: '#4A3320',
  },
  head: {
    backgroundColor: '#A67C52',
    borderColor: '#4A3320',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#6D4C2F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2.5,
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
    backgroundColor: 'rgba(247, 168, 195, 0.65)',
  },
  cheekBlushing: {
    backgroundColor: '#F7A8C3',
    shadowColor: '#F7A8C3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  eyeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    backgroundColor: '#3E2718',
    position: 'relative',
    overflow: 'hidden',
  },
  winkEye: {
    borderTopColor: '#3E2718',
  },
  sleepyEye: {
    borderBottomColor: '#3E2718',
  },
  cheerfulEyeText: {
    color: '#3E2718',
    fontWeight: '900',
    lineHeight: 12,
  },
  pupil: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  miniCatchlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  mouthArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nose: {
    backgroundColor: '#2E1C0C',
  },
  smileWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smileHalf: {
    backgroundColor: 'transparent',
    borderColor: '#2E1C0C',
    borderTopWidth: 0,
  },
  surprisedMouth: {
    backgroundColor: '#4A1D24',
    borderColor: '#2E1C0C',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  tongueSpot: {
    backgroundColor: '#F7A8C3',
    marginBottom: 0.5,
  },
  collarRuff: {
    backgroundColor: '#FFF8EE',
    borderColor: '#D7B899',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    shadowColor: '#6D4C2F',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  ruffFluff: {
    backgroundColor: '#FFF8EE',
    marginHorizontal: -1,
  },
});
