import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Switch,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCollection } from '../context/CollectionContext';
import { useTeam } from '../context/TeamContext';
import { navigate } from '../navigation/navigationRef';
import { PikachuFace } from './PikachuFace';
import { PikachuPattern } from './PikachuPattern';
import { PikachuBadge } from './PikachuBadge';
import { EeveeFace } from './EeveeFace';
import { EeveePattern } from './EeveePattern';
import { EeveeBadge } from './EeveeBadge';
import { ArceusBackground } from './ArceusBackground';
import { ArceusPlate } from './ArceusPlate';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(325, width * 0.84);

export const Sidebar = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isOpen, closeSidebar } = useSidebar();
  const { favorites } = useFavorites();
  const { caught, totalCount } = useCollection();
  const { teams } = useTeam();

  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setModalVisible(false);
        }
      });
    }
  }, [isOpen]);

  const handleNavigate = (screenName) => {
    closeSidebar();
    setTimeout(() => {
      navigate(screenName);
    }, 180);
  };

  // Structured Navigation Groups
  const navSections = [
    {
      id: 'encyclopedia',
      title: 'DEX & ENCYCLOPEDIA',
      icon: 'library-outline',
      items: [
        {
          id: 'home',
          screen: 'Home',
          title: 'Pokédex',
          subtitle: 'All 1,025 Pokémon database',
          imageIcon: require('../../assets/legends-arceus-pokedex-fixed.png'),
          icon: 'book-outline',
          color: '#E6C25B',
          badge: '1025',
        },
        {
          id: 'pokedex-stats',
          screen: 'PokedexStats',
          title: 'Pokédex Statistics',
          subtitle: 'Progress, milestones & badges',
          icon: 'stats-chart-outline',
          color: '#00BCD4',
          badge: caught && caught.length > 0 ? `${caught.length}` : 'New',
          badgeColor: '#00BCD4',
        },
        {
          id: 'type-dex',
          screen: 'TypeDex',
          title: 'Type Dex',
          subtitle: 'Matchups, traits & type rosters',
          icon: 'layers-outline',
          color: '#E91E63',
          badge: '18 Types',
          badgeColor: '#E91E63',
        },
        {
          id: 'move-ability-db',
          screen: 'MoveAbilityDatabase',
          title: 'Move & Ability DB',
          subtitle: 'Search moves, mechanics & learners',
          icon: 'book-outline',
          color: '#673AB7',
          badge: 'DB',
          badgeColor: '#673AB7',
        },
        {
          id: 'location-dex',
          screen: 'LocationDex',
          title: 'Location Dex',
          subtitle: 'Regions, climates & encounter tables',
          icon: 'map-outline',
          color: '#00BFA5',
          badge: 'Habitats',
          badgeColor: '#00BFA5',
        },
        {
          id: 'item-dex',
          screen: 'ItemDex',
          title: 'Item Dex',
          subtitle: '160+ held items, stones & berries',
          icon: 'cube-outline',
          color: '#FF9800',
          badge: '160+',
          badgeColor: '#FF9800',
        },
        {
          id: 'nature-dex',
          screen: 'NatureDex',
          title: 'Nature Dex',
          subtitle: 'All 25 natures, stats & flavors',
          icon: 'leaf-outline',
          color: '#8BC34A',
          badge: '25 Natures',
          badgeColor: '#8BC34A',
        },
      ],
    },
    {
      id: 'competitive',
      title: 'BATTLE & STRATEGY',
      icon: 'trophy-outline',
      items: [
        {
          id: 'battle-calc',
          screen: 'BattleCalculator',
          title: 'Battle Calculator',
          subtitle: 'Damage engine & competitive rolls',
          icon: 'flash-outline',
          color: '#FF7A00',
          badge: 'VS',
          badgeColor: '#FF7A00',
        },
        {
          id: 'stat-calc',
          screen: 'StatCalculator',
          title: 'Stat Calculator',
          subtitle: 'EV, IV & Nature formula stats',
          icon: 'calculator-outline',
          color: '#4CAF50',
          badge: 'Gen 3+',
          badgeColor: '#4CAF50',
        },
        {
          id: 'team-builder',
          screen: 'TeamBuilder',
          title: 'Team Builder',
          subtitle: 'Synergy & coverage analyzer',
          icon: 'shield-checkmark-outline',
          color: '#4D62E8',
          badge: teams && teams.length > 0 ? `${teams.length}` : null,
          badgeColor: '#4D62E8',
        },
        {
          id: 'compare',
          screen: 'Compare',
          title: 'Compare Pokémon',
          subtitle: 'Side-by-side stats & matchups',
          icon: 'git-compare-outline',
          color: '#9C27B0',
        },
      ],
    },
    {
      id: 'personal',
      title: 'COLLECTION & PREFERENCES',
      icon: 'person-outline',
      items: [
        {
          id: 'favorites',
          screen: 'Favorites',
          title: 'Favorites',
          subtitle: 'Your starred Pokémon collection',
          icon: 'star-outline',
          color: '#FFCB05',
          badge: favorites && favorites.length > 0 ? `${favorites.length}` : null,
          badgeColor: '#FFB300',
        },
        {
          id: 'settings',
          screen: 'Settings',
          title: 'Settings',
          subtitle: 'Themes, Pikachu, Arceus & cache',
          icon: 'settings-outline',
          color: '#78909C',
        },
      ],
    },
  ];

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={modalVisible}
      onRequestClose={closeSidebar}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Drawer Container */}
        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: theme.colors.card,
              borderRightColor: theme.colors.border,
              transform: [{ translateX: slideAnim }],
              paddingTop: insets.top + 8,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          {theme.isPikachu && <PikachuPattern subtle={true} opacity={0.14} />}
          {theme.isEevee && <EeveePattern subtle={true} opacity={0.14} />}
          {theme.isArceus && <ArceusBackground subtle={true} opacity={0.14} />}
          {/* Header */}
          <View style={[styles.drawerHeader, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerBrandRow}>
              <View style={[
                styles.brandLogoWrap,
                {
                  backgroundColor: theme.isPikachu ? '#FFD70026' : theme.isEevee ? '#A67C5226' : theme.isArceus ? '#C9A35B26' : theme.isObsidian ? 'rgba(227, 75, 82, 0.16)' : `${theme.colors.primary}26`,
                  borderColor: theme.isPikachu ? '#FFD700' : theme.isEevee ? '#A67C52' : theme.isArceus ? '#C9A35B' : theme.isObsidian ? '#E34B52' : theme.colors.primary,
                  overflow: 'hidden',
                }
              ]}>
                {theme.isPikachu ? (
                  <PikachuFace size={26} />
                ) : theme.isEevee ? (
                  <EeveeFace size={26} showCollar={false} />
                ) : theme.isArceus ? (
                  <ArceusPlate type="normal" size={26} />
                ) : (
                  <Image
                    source={require('../../assets/legends-arceus-pokedex-fixed.png')}
                    style={{ width: 28, height: 28, borderRadius: 5 }}
                    resizeMode="contain"
                  />
                )}
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.brandTitle, { color: theme.colors.text }]}>Pokédezz</Text>
                  {theme.isPikachu && (
                    <View style={{ backgroundColor: '#FF3B30', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 }}>
                      <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>⚡ PIKA</Text>
                    </View>
                  )}
                  {theme.isEevee && (
                    <View style={{ backgroundColor: '#A67C52', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 }}>
                      <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>🐾 EEVEE</Text>
                    </View>
                  )}
                  {theme.isArceus && (
                    <View style={{ backgroundColor: '#C9A35B', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 }}>
                      <Text style={{ color: '#262626', fontSize: 9, fontWeight: '900' }}>✨ HISUI</Text>
                    </View>
                  )}
                  {theme.isObsidian && (
                    <View style={{ backgroundColor: '#E34B52', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 }}>
                      <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>OBSIDIAN</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.brandSubtitle, { color: theme.isPikachu ? '#FFD700' : theme.isEevee ? '#A67C52' : theme.isArceus ? '#C9A35B' : theme.isObsidian ? '#E34B52' : theme.colors.textSecondary }]}>
                  {theme.isPikachu ? '⚡ Pikachu Signature Mode' : theme.isEevee ? '🐾 Eevee Cozy Sticker Mode' : theme.isArceus ? '📜 Legends of Hisui Guide' : theme.isObsidian ? 'Obsidian Dark Edition' : 'Competitive & Dex Suite'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={closeSidebar}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Quick Trainer Stats Bar */}
            <View style={[styles.trainerSnapRow, { backgroundColor: theme.isObsidian ? '#151D27' : (isDarkMode ? '#17171E' : '#F4F5F9'), borderColor: theme.colors.border }]}>
              <View style={styles.snapCol}>
                <Text style={[styles.snapNum, { color: theme.colors.primary }]}>{caught?.length || 0}</Text>
                <Text style={[styles.snapLbl, { color: theme.colors.textSecondary }]}>Caught</Text>
              </View>
              <View style={[styles.snapDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.snapCol}>
                <Text style={[styles.snapNum, { color: '#FFB300' }]}>{favorites?.length || 0}</Text>
                <Text style={[styles.snapLbl, { color: theme.colors.textSecondary }]}>Starred</Text>
              </View>
              <View style={[styles.snapDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.snapCol}>
                <Text style={[styles.snapNum, { color: '#4D62E8' }]}>{teams?.length || 0}</Text>
                <Text style={[styles.snapLbl, { color: theme.colors.textSecondary }]}>Teams</Text>
              </View>
            </View>
          </View>

          {/* Navigation Sections List */}
          <ScrollView
            style={styles.navScroll}
            contentContainerStyle={styles.navScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {navSections.map((section, secIdx) => (
              <View key={section.id} style={styles.sectionWrap}>
                {/* Section Header */}
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name={section.icon} size={13} color={theme.colors.primary} />
                  <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
                    {section.title}
                  </Text>
                </View>

                {/* Section Items */}
                {section.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.navItem,
                      {
                        backgroundColor: theme.isObsidian ? '#151D27' : theme.colors.background,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => handleNavigate(item.screen)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: `${item.color}18`, borderColor: item.color, overflow: 'hidden' }]}>
                      {theme.isPikachu && (item.id === 'home' || item.id === 'favorites') ? (
                        <PikachuFace size={20} expression={item.id === 'favorites' ? 'wink' : 'happy'} blushing={item.id === 'favorites'} />
                      ) : theme.isEevee && (item.id === 'home' || item.id === 'favorites') ? (
                        <EeveeFace size={20} expression={item.id === 'favorites' ? 'wink' : 'cheerful'} blushing={item.id === 'favorites'} showCollar={false} />
                      ) : item.imageIcon ? (
                        <Image
                          source={item.imageIcon}
                          style={{ width: 22, height: 22, borderRadius: 4 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons name={item.icon} size={18} color={item.color} />
                      )}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.navItemTitle, { color: theme.colors.text }]}>{item.title}</Text>
                      <Text numberOfLines={1} style={[styles.navItemSubtitle, { color: theme.colors.textSecondary }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                    {item.badge && (
                      theme.isPikachu ? (
                        <PikachuBadge text={item.badge} size="tiny" />
                      ) : theme.isEevee ? (
                        <EeveeBadge text={item.badge} size="tiny" />
                      ) : (
                        <View style={[styles.badgeWrap, { backgroundColor: item.badgeColor ? `${item.badgeColor}22` : '#88888822', borderColor: item.badgeColor || '#888' }]}>
                          <Text style={[styles.badgeText, { color: item.badgeColor || theme.colors.textSecondary }]}>
                            {item.badge}
                          </Text>
                        </View>
                      )
                    )}
                  </TouchableOpacity>
                ))}

                {secIdx < navSections.length - 1 && (
                  <View style={[styles.sectionDivider, { backgroundColor: theme.colors.border }]} />
                )}
              </View>
            ))}
          </ScrollView>

          {/* Footer with Dark Mode Toggle */}
          <View style={[styles.drawerFooter, { borderTopColor: theme.colors.border }]}>
            <View style={styles.themeToggleRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons
                  name={isDarkMode ? 'moon' : 'sunny'}
                  size={18}
                  color={isDarkMode ? '#9C27B0' : '#FF9800'}
                />
                <Text style={[styles.themeLabel, { color: theme.colors.text }]}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ true: theme.colors.primary, false: '#CBD5E0' }}
              />
            </View>
            <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
              Pokédezz v1.0 • Offline Ready
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: 1,
    elevation: 16,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    justifyContent: 'space-between',
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerSnapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  snapCol: {
    flex: 1,
    alignItems: 'center',
  },
  snapNum: {
    fontSize: 14,
    fontWeight: '900',
  },
  snapLbl: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  snapDivider: {
    width: 1,
    height: 18,
  },
  navScroll: {
    flex: 1,
  },
  navScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
  },
  sectionWrap: {
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionDivider: {
    height: 1,
    marginVertical: 10,
    opacity: 0.6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 7,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  navItemSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  badgeWrap: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
});
