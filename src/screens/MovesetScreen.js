import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { TYPE_COLORS } from '../components/FilterModal';
import { getMoveDetails } from '../services/pokemonService';

const MoveListItem = ({ move, theme, onPress, typeColor, levelPrefix }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let mounted = true;
    getMoveDetails(move.name).then(res => {
      if(mounted) setDetails(res);
    }).catch(e => console.warn(e));
    return () => { mounted = false; };
  }, [move.name]);

  const moveTypeColor = details ? (TYPE_COLORS[details.type] || theme.colors.primary) : '#555';
  const dmgClass = details ? (details.damageClass || 'Status').toUpperCase() : 'STATUS';

  return (
    <TouchableOpacity 
      style={styles.moveCardContainer}
      activeOpacity={0.7}
      onPress={() => onPress(move.name)}
    >
      <View style={[styles.levelCircle, { borderColor: moveTypeColor, backgroundColor: theme.colors.background }]}>
        <Text style={[styles.levelCircleText, { color: theme.colors.text }]}>{levelPrefix}</Text>
      </View>
      
      <View style={[styles.moveCardContent, { shadowColor: moveTypeColor }]}>
        <View style={[styles.moveTitleBlock, { backgroundColor: moveTypeColor }]}>
          <Text style={[styles.moveTitleText, { color: '#fff', flex: 1 }]} numberOfLines={1}>
            {move.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Text>
          <View style={styles.moveBadgesContainer}>
            {details && (
              <View style={[styles.moveBadge, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                <Text style={styles.moveBadgeText}>{details.type.toUpperCase()}</Text>
              </View>
            )}
            <View style={[styles.moveBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={[styles.moveBadgeText, { color: '#fff' }]}>{dmgClass}</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.moveStatsBlock, { backgroundColor: theme.colors.card }]}>
          {details ? (
            <>
              <View style={styles.statItem}>
                <Text style={styles.moveStatTextLight}>ATTACK</Text>
                <Text style={[styles.moveStatTextBold, { color: theme.colors.text }]}>{details.power || '--'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.moveStatTextLight}>ACCURACY</Text>
                <Text style={[styles.moveStatTextBold, { color: theme.colors.text }]}>{details.accuracy ? `${details.accuracy}%` : '--'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.moveStatTextLight}>PP</Text>
                <Text style={[styles.moveStatTextBold, { color: theme.colors.text }]}>{details.pp || '--'}</Text>
              </View>
            </>
          ) : (
            <View style={{ flex: 1, paddingVertical: 5, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.textSecondary} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const MovesetScreen = ({ route }) => {
  const { moves, name, primaryType } = route.params;
  const { theme } = useTheme();
  const [selectedVersion, setSelectedVersion] = useState('champions');
  const [activeTab, setActiveTab] = useState('level-up');
  
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingMove, setIsLoadingMove] = useState(false);
  const [moveDetails, setMoveDetails] = useState(null);

  const typeColor = TYPE_COLORS[primaryType?.toLowerCase()] || theme.colors.primary;

  const handleMovePress = async (moveName) => {
    setIsModalVisible(true);
    setIsLoadingMove(true);
    setMoveDetails(null);
    try {
      const details = await getMoveDetails(moveName);
      setMoveDetails(details);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoadingMove(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {name.charAt(0).toUpperCase() + name.slice(1)} Movesets
        </Text>
      </View>

      <View style={styles.content}>
        {/* Dynamic Data Loading */}
        {(() => {
          const currentVersionMoves = moves.byVersion[selectedVersion] || {};
          const availableTabs = [];
          if (currentVersionMoves['level-up']?.length > 0) availableTabs.push({ id: 'level-up', label: 'Level Up', prefix: '' });
          if (currentVersionMoves['machine']?.length > 0) availableTabs.push({ id: 'machine', label: 'TM / HM', prefix: 'TM' });
          if (currentVersionMoves['egg']?.length > 0) availableTabs.push({ id: 'egg', label: 'Egg', prefix: 'Egg' });
          if (currentVersionMoves['tutor']?.length > 0) availableTabs.push({ id: 'tutor', label: 'Tutor', prefix: 'Tutor' });
          
          if (availableTabs.length === 0) {
             return (
               <View style={{ paddingHorizontal: 20 }}>
                 <View style={styles.dropdownRow}>
                   <TouchableOpacity 
                     style={styles.dropdownTriggerInline}
                     onPress={() => setIsVersionModalOpen(true)}
                   >
                     <Text style={[styles.dropdownTriggerTextInline, { color: theme.colors.text }]}>
                       {selectedVersion.replace(/-/g, ' ').toUpperCase()}
                     </Text>
                     <Ionicons name="caret-down" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 6 }} />
                   </TouchableOpacity>
                 </View>
                 <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 20 }}>No moves available in this version.</Text>
               </View>
             );
          }

          const displayTab = availableTabs.find(t => t.id === activeTab) ? activeTab : availableTabs[0].id;
          const currentTabPrefix = availableTabs.find(t => t.id === displayTab)?.prefix || '';

          return (
            <>
              {/* Inline Dropdown Row for Method and Version */}
              <View style={[styles.dropdownRow, { paddingHorizontal: 20 }]}>
                <TouchableOpacity 
                  style={styles.dropdownTriggerInline}
                  onPress={() => setIsMethodModalOpen(true)}
                >
                  <Text style={[styles.dropdownTriggerTextInline, { color: theme.colors.text }]}>
                    {availableTabs.find(t => t.id === displayTab)?.label || 'Level Up'}
                  </Text>
                  <Ionicons name="caret-down" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 6 }} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownTriggerInline}
                  onPress={() => setIsVersionModalOpen(true)}
                >
                  <Text style={[styles.dropdownTriggerTextInline, { color: theme.colors.text }]}>
                    {selectedVersion.replace(/-/g, ' ').toUpperCase()}
                  </Text>
                  <Ionicons name="caret-down" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>

              {/* Method Selector Modal */}
              <Modal visible={isMethodModalOpen} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsMethodModalOpen(false)}>
                  <Pressable style={[styles.dropdownModalContainer, { backgroundColor: theme.colors.card }]}>
                    <View style={[styles.modalHeader, { backgroundColor: typeColor }]}>
                      <Text style={styles.modalTitle}>Select Learn Method</Text>
                      <TouchableOpacity onPress={() => setIsMethodModalOpen(false)}>
                        <Ionicons name="close" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView style={{ maxHeight: 300 }}>
                      {availableTabs.map(tab => {
                        const isActive = displayTab === tab.id;
                        return (
                          <TouchableOpacity
                            key={`method-${tab.id}`}
                            style={[
                              styles.dropdownItem,
                              isActive && { backgroundColor: typeColor + '20' }
                            ]}
                            onPress={() => {
                              setActiveTab(tab.id);
                              setIsMethodModalOpen(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText, 
                              { color: theme.colors.text },
                              isActive && { color: typeColor, fontWeight: '800' }
                            ]}>
                              {tab.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </Pressable>
                </TouchableOpacity>
              </Modal>

              <ScrollView style={styles.movesScrollContainer} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 12, paddingTop: 5 }}>
                {currentVersionMoves[displayTab].map((move, index) => (
                  <MoveListItem 
                    key={`${displayTab}-${move.name}-${index}`} 
                    move={move} 
                    theme={theme} 
                    onPress={handleMovePress} 
                    typeColor={typeColor}
                    levelPrefix={displayTab === 'level-up' ? (move.level > 0 ? move.level.toString() : '-') : (currentTabPrefix || '-')}
                  />
                ))}
              </ScrollView>
            </>
          );
        })()}
      </View>

      {/* Version Selector Modal */}
      <Modal visible={isVersionModalOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsVersionModalOpen(false)}>
          <Pressable style={[styles.dropdownModalContainer, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.modalHeader, { backgroundColor: typeColor }]}>
              <Text style={styles.modalTitle}>Select Game Version</Text>
              <TouchableOpacity onPress={() => setIsVersionModalOpen(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {moves.availableVersions.map(version => {
                const isActive = selectedVersion === version;
                return (
                  <TouchableOpacity
                    key={`dd-${version}`}
                    style={[
                      styles.dropdownItem,
                      isActive && { backgroundColor: typeColor + '20' }
                    ]}
                    onPress={() => {
                      setSelectedVersion(version);
                      setIsVersionModalOpen(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText, 
                      { color: theme.colors.text },
                      isActive && { color: typeColor, fontWeight: '800' }
                    ]}>
                      {version.replace(/-/g, ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </TouchableOpacity>
      </Modal>

      {/* Move Details Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            {isLoadingMove ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: theme.colors.textSecondary, marginTop: 10 }}>Loading Move Data...</Text>
              </View>
            ) : moveDetails ? (
              <View>
                <View style={[styles.modalHeader, { backgroundColor: TYPE_COLORS[moveDetails.type] || theme.colors.primary }]}>
                  <Text style={styles.modalTitle}>{moveDetails.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Text>
                  <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.moveTypeRow}>
                    <View style={[styles.moveTypeBadge, { backgroundColor: TYPE_COLORS[moveDetails.type] || theme.colors.primary }]}>
                      <Text style={styles.moveTypeBadgeText}>{moveDetails.type.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.moveTypeBadge, { backgroundColor: '#555' }]}>
                      <Text style={styles.moveTypeBadgeText}>{(moveDetails.damageClass || 'Status').toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.moveStatsRow}>
                    <View style={styles.moveStatCol}>
                      <Text style={[styles.moveStatVal, { color: theme.colors.text }]}>{moveDetails.power || '-'}</Text>
                      <Text style={[styles.moveStatLabel, { color: theme.colors.textSecondary }]}>Power</Text>
                    </View>
                    <View style={styles.moveStatCol}>
                      <Text style={[styles.moveStatVal, { color: theme.colors.text }]}>{moveDetails.accuracy || '-'}</Text>
                      <Text style={[styles.moveStatLabel, { color: theme.colors.textSecondary }]}>Accuracy</Text>
                    </View>
                    <View style={styles.moveStatCol}>
                      <Text style={[styles.moveStatVal, { color: theme.colors.text }]}>{moveDetails.pp}</Text>
                      <Text style={[styles.moveStatLabel, { color: theme.colors.textSecondary }]}>PP</Text>
                    </View>
                  </View>

                  <Text style={[styles.moveEffectTitle, { color: theme.colors.text }]}>Effect</Text>
                  <Text style={[styles.moveEffectText, { color: theme.colors.textSecondary }]}>
                    {moveDetails.effect || 'No effect description available.'}
                  </Text>
                </View>
              </View>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownTriggerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownModalContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 40,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    gap: 20,
  },
  dropdownTriggerInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownTriggerTextInline: {
    fontSize: 16,
    fontWeight: '600',
  },
  moveCardContainer: {
    marginBottom: 12,
    paddingLeft: 22,
    position: 'relative',
  },
  levelCircle: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelCircleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  moveCardContent: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  moveTitleBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 30,
    paddingRight: 12,
  },
  moveTitleText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  moveBadgesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  moveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moveBadgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  moveStatsBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 30,
    paddingRight: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#00000015',
  },
  moveStatTextLight: {
    fontSize: 9,
    color: '#888',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  moveStatTextBold: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  modalBody: {
    padding: 20,
  },
  moveTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  moveTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  moveTypeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  moveStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#00000008',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  moveStatCol: {
    alignItems: 'center',
  },
  moveStatVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  moveStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  moveEffectTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  moveEffectText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
