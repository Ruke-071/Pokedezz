import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const StatBar = ({ label, value, maxVal = 255, color }) => {
  const { theme } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  // Calculate percentage
  const percentage = Math.min((value / maxVal) * 100, 100);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false, // width is layout, cannot use native driver
    }).start();
  }, [percentage, widthAnim]);

  // Determine label abbreviation
  const getAbbr = (statName) => {
    switch (statName.toLowerCase()) {
      case 'hp': return 'HP';
      case 'attack': return 'ATK';
      case 'defense': return 'DEF';
      case 'specialattack':
      case 'special-attack': return 'SATK';
      case 'specialdefense':
      case 'special-defense': return 'SDEF';
      case 'speed': return 'SPD';
      default: return statName.toUpperCase().slice(0, 4);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {getAbbr(label)}
      </Text>
      
      <Text style={[styles.value, { color: theme.colors.text }]}>
        {value}
      </Text>

      <View style={[styles.barContainer, { backgroundColor: theme.dark ? '#2D3748' : '#E2E8F0' }]}>
        <Animated.View
          style={[
            styles.fillBar,
            {
              backgroundColor: color || theme.colors.primary,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    width: '100%',
  },
  label: {
    width: 45,
    fontSize: 12,
    fontWeight: '700',
  },
  value: {
    width: 35,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginRight: 10,
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 4,
  },
});
