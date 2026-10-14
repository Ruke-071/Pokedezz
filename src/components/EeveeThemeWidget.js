import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { EeveeFace } from './EeveeFace';

/**
 * Interactive Eevee Widget
 * Renders an Eevee banner with speech bubble that reacts to user taps!
 */
export const EeveeThemeWidget = ({ style }) => {
  const { theme } = useTheme();
  const [speechText, setSpeechText] = useState('Eev-vee! 🍃');
  const [isBlushing, setIsBlushing] = useState(false);
  const [expression, setExpression] = useState('happy');

  const PHRASES = [
    { text: 'Eev-vee! 🍃', expr: 'happy' },
    { text: 'Vee-vee! ✨', expr: 'wink' },
    { text: 'Fluffy Tail Wag! 🐾', expr: 'cheerful' },
    { text: 'Eev-Eev! ❤️', expr: 'cheerful' },
    { text: 'Ready to Evolve! 🌟', expr: 'surprised' },
  ];

  const handleEeveeTap = () => {
    setIsBlushing(true);
    const next = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setSpeechText(next.text);
    setExpression(next.expr);
    setTimeout(() => {
      setIsBlushing(false);
    }, 1200);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleEeveeTap}
      style={[styles.container, style]}
    >
      <View style={styles.card}>
        <View style={styles.headerRibbon}>
          <Ionicons name="leaf" size={13} color="#A3D6C6" />
          <Text style={styles.ribbonTitle}>EEVEE STICKER MODE</Text>
          <Ionicons name="heart" size={12} color="#F7A8C3" />
        </View>

        <View style={styles.contentRow}>
          <EeveeFace
            size={52}
            expression={expression}
            blushing={isBlushing}
          />
          <View style={styles.speechContainer}>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>{speechText}</Text>
            </View>
            <Text style={styles.tapPrompt}>Tap Eevee to interact! 🐾</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  card: {
    backgroundColor: '#FFF8EE',
    borderColor: '#D7B899',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 12,
    shadowColor: '#543D28',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  headerRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ribbonTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#855E39',
    letterSpacing: 0.8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  speechContainer: {
    flex: 1,
    marginLeft: 14,
    alignItems: 'flex-start',
  },
  speechBubble: {
    backgroundColor: '#F5EAD7',
    borderColor: '#D7B899',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderBottomLeftRadius: 3,
  },
  speechText: {
    color: '#4A3320',
    fontSize: 13,
    fontWeight: '800',
  },
  tapPrompt: {
    color: '#A67C52',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 5,
    marginLeft: 2,
  },
});
