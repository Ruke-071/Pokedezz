import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Expression Stickers for Pikachu Sticker-Sheet:
 * 1. Happy: Classic cheerful anime eyes, black-tipped ears, red cheeks, :3 smile.
 * 2. Wink: One eye winking (^), cheeky open side-smile.
 * 3. Surprised: Wide curious eyes, open oval mouth (:O) with pink tongue.
 * 4. Cheeky: Playful squint eyes (> <), sticking pink tongue out.
 * 5. Sleepy: Relaxed curved eyes (u u), soft blushing cheeks.
 * 6. Determined: Confident brow lines, sharp smile, electric cheek sparks.
 */

// ─── Single Sticker Base with White Die-Cut Border & Drop Shadow ─────────────
const DieCutSticker = ({ children, rotate = '0deg', scale = 1, style }) => (
  <View
    style={[
      styles.dieCutContainer,
      {
        transform: [{ rotate }, { scale }],
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─── Reusable Sticker Pikachu Face ───────────────────────────────────────────
const StickerFace = ({ expression = 'happy', size = 48 }) => {
  const scale = size / 48;
  const headW = 42 * scale;
  const headH = 35 * scale;
  const headR = 17.5 * scale;
  const earW = 10 * scale;
  const earH = 26 * scale;
  const earTipH = 9 * scale;
  const cheekSize = 11 * scale;
  const eyeSize = 8 * scale;

  return (
    <View style={[styles.stickerFaceRoot, { width: headW + 16 * scale, height: headH + earH - 4 * scale }]}>
      {/* ── EARS WITH THICK DARK OUTLINE & BLACK TIPS ── */}
      <View style={[styles.earsRow, { height: earH }]}>
        {/* Left Ear */}
        <View
          style={[
            styles.ear,
            styles.leftEar,
            {
              width: earW,
              height: earH,
              borderTopLeftRadius: 7 * scale,
              borderTopRightRadius: 7 * scale,
              borderWidth: 2 * scale,
            },
          ]}
        >
          <View style={[styles.earTip, styles.leftEarTip, { height: earTipH }]} />
        </View>

        <View style={{ width: 14 * scale }} />

        {/* Right Ear */}
        <View
          style={[
            styles.ear,
            styles.rightEar,
            {
              width: earW,
              height: earH,
              borderTopLeftRadius: 7 * scale,
              borderTopRightRadius: 7 * scale,
              borderWidth: 2 * scale,
            },
          ]}
        >
          <View style={[styles.earTip, styles.rightEarTip, { height: earTipH }]} />
        </View>
      </View>

      {/* ── HEAD WITH THICK OUTLINE ── */}
      <View
        style={[
          styles.head,
          {
            width: headW,
            height: headH,
            borderRadius: headR,
            marginTop: -5 * scale,
            borderWidth: 2.2 * scale,
          },
        ]}
      >
        <View style={styles.featuresRow}>
          {/* Left Cheek */}
          <View
            style={[
              styles.cheek,
              {
                width: cheekSize,
                height: cheekSize,
                borderRadius: cheekSize / 2,
                borderWidth: 1.2 * scale,
              },
            ]}
          />

          {/* Left Eye */}
          {expression === 'wink' ? (
            <View style={[styles.eyeWink, { width: eyeSize, height: 3 * scale }]} />
          ) : expression === 'cheeky' ? (
            <Text style={[styles.squintEyeText, { fontSize: 9 * scale }]}>^</Text>
          ) : expression === 'sleepy' ? (
            <View style={[styles.eyeSleepy, { width: eyeSize, height: 2.5 * scale }]} />
          ) : (
            <View style={[styles.eye, { width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2 }]}>
              <View
                style={[
                  styles.pupil,
                  {
                    width: 3 * scale,
                    height: 3 * scale,
                    borderRadius: 1.5 * scale,
                    top: 1 * scale,
                    left: 1 * scale,
                  },
                ]}
              />
            </View>
          )}

          {/* Center Nose & Mouth */}
          <View style={styles.centerArea}>
            <View style={[styles.nose, { width: 2.5 * scale, height: 2 * scale }]} />

            {expression === 'surprised' ? (
              <View
                style={[
                  styles.surprisedMouth,
                  {
                    width: 6 * scale,
                    height: 8 * scale,
                    borderRadius: 3.5 * scale,
                    borderWidth: 1.5 * scale,
                  },
                ]}
              >
                <View
                  style={[
                    styles.tongueDot,
                    { width: 4 * scale, height: 3 * scale, borderRadius: 2 * scale },
                  ]}
                />
              </View>
            ) : expression === 'cheeky' ? (
              <View style={styles.cheekyMouthWrap}>
                <View
                  style={[
                    styles.smileLine,
                    { width: 7 * scale, height: 3 * scale, borderBottomWidth: 1.5 * scale },
                  ]}
                />
                <View
                  style={[
                    styles.tongueOut,
                    {
                      width: 5 * scale,
                      height: 5 * scale,
                      borderBottomLeftRadius: 3 * scale,
                      borderBottomRightRadius: 3 * scale,
                      borderWidth: 1.2 * scale,
                    },
                  ]}
                />
              </View>
            ) : (
              <View style={styles.smileWrap}>
                <View
                  style={[
                    styles.smileHalf,
                    {
                      width: 4 * scale,
                      height: 3 * scale,
                      borderBottomLeftRadius: 2.5 * scale,
                      borderBottomRightRadius: 2.5 * scale,
                      borderWidth: 1.5 * scale,
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
                      borderWidth: 1.5 * scale,
                    },
                  ]}
                />
              </View>
            )}
          </View>

          {/* Right Eye */}
          {expression === 'cheeky' ? (
            <Text style={[styles.squintEyeText, { fontSize: 9 * scale }]}>^</Text>
          ) : expression === 'sleepy' ? (
            <View style={[styles.eyeSleepy, { width: eyeSize, height: 2.5 * scale }]} />
          ) : (
            <View style={[styles.eye, { width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2 }]}>
              <View
                style={[
                  styles.pupil,
                  {
                    width: 3 * scale,
                    height: 3 * scale,
                    borderRadius: 1.5 * scale,
                    top: 1 * scale,
                    left: 1 * scale,
                  },
                ]}
              />
            </View>
          )}

          {/* Right Cheek */}
          <View
            style={[
              styles.cheek,
              {
                width: cheekSize,
                height: cheekSize,
                borderRadius: cheekSize / 2,
                borderWidth: 1.2 * scale,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

// ─── Lightning Bolt Die-Cut Sticker ──────────────────────────────────────────
const StickerLightning = ({ size = 28 }) => {
  return (
    <View style={[styles.boltStickerWrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="flash" size={size * 0.72} color="#FFD700" style={styles.boltIcon} />
    </View>
  );
};

// ─── Star Spark Die-Cut Sticker ──────────────────────────────────────────────
const StickerSpark = ({ size = 20 }) => {
  return (
    <View style={[styles.sparkStickerWrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="sparkles" size={size * 0.75} color="#FFEB3B" />
    </View>
  );
};

// ─── Bundled Provided Pikachu Sticker Illustration ────────────────────────────
const PIKACHU_STICKER_ASSET = require('../../assets/pikachu-face.png');

const StickerIllustration = ({ size = 48 }) => {
  return (
    <View style={[styles.illustrationStickerWrap, { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 }]}>
      <Image
        source={PIKACHU_STICKER_ASSET}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

// ─── Deterministic Sticker Collage Layout ────────────────────────────────────
// Varied sizes, expressions, and authentic playful tilts inspired by the sticker sheet
const STICKER_SHEET_COLLAGE = [
  // ── Section 1 (Top header zone) ──
  { type: 'illustration', top: '2%', left: '5%', size: 48, rotate: '-12deg' },
  { type: 'bolt', top: '3%', left: '46%', size: 26, rotate: '18deg' },
  { type: 'face', expression: 'wink', top: '4%', left: '74%', size: 44, rotate: '16deg' },
  { type: 'spark', top: '10%', left: '26%', size: 22, rotate: '-8deg' },

  // ── Section 2 (Upper zone) ──
  { type: 'face', expression: 'surprised', top: '13%', left: '48%', size: 42, rotate: '-20deg' },
  { type: 'bolt', top: '16%', left: '12%', size: 28, rotate: '25deg' },
  { type: 'illustration', top: '18%', left: '76%', size: 48, rotate: '14deg' },

  // ── Section 3 (Upper mid zone) ──
  { type: 'face', expression: 'sleepy', top: '27%', left: '4%', size: 44, rotate: '18deg' },
  { type: 'spark', top: '26%', left: '44%', size: 20, rotate: '15deg' },
  { type: 'face', expression: 'happy', top: '29%', left: '60%', size: 50, rotate: '-16deg' },
  { type: 'bolt', top: '34%', left: '86%', size: 26, rotate: '-22deg' },

  // ── Section 4 (Center zone) ──
  { type: 'illustration', top: '39%', left: '18%', size: 52, rotate: '-10deg' },
  { type: 'face', expression: 'wink', top: '41%', left: '68%', size: 44, rotate: '22deg' },
  { type: 'bolt', top: '46%', left: '4%', size: 26, rotate: '-15deg' },
  { type: 'spark', top: '48%', left: '48%', size: 22, rotate: '30deg' },

  // ── Section 5 (Lower mid zone) ──
  { type: 'face', expression: 'cheeky', top: '53%', left: '10%', size: 48, rotate: '-18deg' },
  { type: 'illustration', top: '54%', left: '72%', size: 50, rotate: '12deg' },
  { type: 'bolt', top: '59%', left: '44%', size: 28, rotate: '-24deg' },

  // ── Section 6 (Lower zone) ──
  { type: 'face', expression: 'happy', top: '65%', left: '24%', size: 48, rotate: '16deg' },
  { type: 'spark', top: '66%', left: '82%', size: 22, rotate: '-10deg' },
  { type: 'illustration', top: '69%', left: '60%', size: 46, rotate: '-15deg' },
  { type: 'bolt', top: '74%', left: '6%', size: 26, rotate: '18deg' },

  // ── Section 7 (Bottom zone) ──
  { type: 'face', expression: 'wink', top: '78%', left: '38%', size: 46, rotate: '-12deg' },
  { type: 'illustration', top: '80%', left: '76%', size: 46, rotate: '18deg' },
  { type: 'spark', top: '86%', left: '16%', size: 24, rotate: '12deg' },
  { type: 'bolt', top: '88%', left: '56%', size: 28, rotate: '-18deg' },
  { type: 'face', expression: 'happy', top: '90%', left: '80%', size: 42, rotate: '-14deg' },
];

/**
 * PikachuStickerBackground Component
 * Renders a warm orange sticker-sheet collage of authentic Pikachu faces with
 * different expressions (happy, wink, surprised, cheeky, sleepy, determined),
 * thick dark outlines, white die-cut sticker borders, drop shadows, and lightning bolts.
 * 
 * Non-intrusive: Uses pointerEvents="none" so all buttons, lists, cards, and inputs
 * remain 100% interactive and legible.
 */
export const PikachuStickerBackground = memo(({
  opacity = 0.22,
  warmOrange = true,
  style,
}) => {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.absoluteContainer,
        warmOrange && styles.warmOrangeBackdrop,
        style,
      ]}
    >
      {/* ── Collage Sticker Layer with Calibrated Opacity ── */}
      <View style={[StyleSheet.absoluteFillObject, { opacity }]}>
        {STICKER_SHEET_COLLAGE.map((item, idx) => {
          return (
            <View
              key={`pika-sticker-${idx}`}
              style={[
                styles.stickerPositioner,
                {
                  top: item.top,
                  left: item.left,
                },
              ]}
            >
              <DieCutSticker rotate={item.rotate}>
                {item.type === 'illustration' ? (
                  <StickerIllustration size={item.size} />
                ) : item.type === 'face' ? (
                  <StickerFace expression={item.expression} size={item.size} />
                ) : item.type === 'bolt' ? (
                  <StickerLightning size={item.size} />
                ) : (
                  <StickerSpark size={item.size} />
                )}
              </DieCutSticker>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  warmOrangeBackdrop: {
    backgroundColor: '#E65A0012', // Subtle warm orange tint matching sticker-sheet guide
  },
  stickerPositioner: {
    position: 'absolute',
  },
  // ── Die-Cut White Border & Soft Sticker Shadow ──
  dieCutContainer: {
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#F2E8DC',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Sticker Face Root ──
  stickerFaceRoot: {
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
    borderColor: '#1C1917',
    overflow: 'hidden',
  },
  leftEar: {
    transform: [{ rotate: '-24deg' }],
  },
  rightEar: {
    transform: [{ rotate: '24deg' }],
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
    borderColor: '#1C1917',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
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
    borderColor: '#B71C1C',
  },
  eye: {
    backgroundColor: '#1C1917',
    position: 'relative',
  },
  eyeWink: {
    backgroundColor: '#1C1917',
    borderRadius: 2,
    transform: [{ rotate: '-8deg' }],
  },
  eyeSleepy: {
    backgroundColor: '#1C1917',
    borderRadius: 1.5,
  },
  squintEyeText: {
    color: '#1C1917',
    fontWeight: '900',
  },
  pupil: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  centerArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nose: {
    backgroundColor: '#1C1917',
    borderRadius: 1,
    marginBottom: 1,
  },
  smileWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smileHalf: {
    backgroundColor: 'transparent',
    borderColor: '#1C1917',
    borderTopWidth: 0,
  },
  surprisedMouth: {
    backgroundColor: '#D32F2F',
    borderColor: '#1C1917',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  tongueDot: {
    backgroundColor: '#FF8A80',
  },
  cheekyMouthWrap: {
    alignItems: 'center',
  },
  smileLine: {
    borderColor: '#1C1917',
    backgroundColor: 'transparent',
  },
  tongueOut: {
    backgroundColor: '#FF5252',
    borderColor: '#1C1917',
    borderTopWidth: 0,
    marginTop: -1,
  },
  // ── Die-Cut Lightning Sticker ──
  boltStickerWrap: {
    backgroundColor: '#FF6F0018',
    borderColor: '#1C1917',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltIcon: {
    textShadowColor: '#1C1917',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  // ── Die-Cut Spark Sticker ──
  sparkStickerWrap: {
    backgroundColor: '#FFD70025',
    borderColor: '#1C1917',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Die-Cut Provided Sticker Wrap ──
  illustrationStickerWrap: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1C1917',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
