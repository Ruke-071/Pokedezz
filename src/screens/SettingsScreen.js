import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Linking,
  ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const openPokeApi = () => {
    Linking.openURL('https://pokeapi.co');
  };

  const openExpo = () => {
    Linking.openURL('https://expo.dev');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Theme Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="moon" size={20} color={theme.colors.primary} style={styles.settingIcon} />
                <View>
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>Switch between light and dark themes</Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Champions Information Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>POKÉMON CHAMPIONS</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.infoBlock}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>What is Pokémon Champions?</Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Pokémon Champions is an action-packed custom battle-arena game mode. 
                This Pokédex app automatically tags and filters Pokémon that are currently playable in Champions (🏆) 
                and highlights any recently added combatants (✨).
              </Text>
            </View>
          </View>
        </View>

        {/* About App Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>ABOUT APPLICATION</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            
            {/* Version */}
            <View style={[styles.listItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.listItemLeft}>
                <Ionicons name="information-circle" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>Version</Text>
              </View>
              <Text style={[styles.listItemRight, { color: theme.colors.textSecondary }]}>1.0.0 (Production)</Text>
            </View>

            {/* PokeAPI */}
            <TouchableOpacity onPress={openPokeApi} style={[styles.listItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.listItemLeft}>
                <Ionicons name="globe" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>Data Source</Text>
              </View>
              <View style={styles.listItemRightRow}>
                <Text style={[styles.listItemRightLink, { color: theme.colors.info }]}>PokeAPI.co</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Framework */}
            <TouchableOpacity onPress={openExpo} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Ionicons name="phone-portrait" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>Built With</Text>
              </View>
              <View style={styles.listItemRightRow}>
                <Text style={[styles.listItemRightLink, { color: theme.colors.info }]}>React Native + Expo</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    paddingLeft: 6,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  infoBlock: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listItemRight: {
    fontSize: 13,
    fontWeight: '500',
  },
  listItemRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listItemRightLink: {
    fontSize: 13,
    fontWeight: '600',
  },
});
