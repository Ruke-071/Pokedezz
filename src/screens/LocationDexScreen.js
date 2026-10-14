import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import {
  LOCATION_DEX,
  REGIONS,
  CLIMATES,
  VERSION_MAP,
  formatLocationAreaName,
  findPokemonLocations,
} from '../data/locationDexData';
import { POKEMON_1025_HABITAT_INDEX } from '../data/pokemonHabitatDex';
import { PikachuPattern, EeveePattern, ArceusBackground } from '../components';

const POPULAR_SEARCHES = [
  'pikachu',
  'eevee',
  'lucario',
  'gible',
  'bagon',
  'larvitar',
  'dreepy',
  'chansey',
  'mewtwo',
  'charizard',
  'snorlax',
  'ditto',
  'gastly',
  'lapras',
  'gyarados',
  'koraidon',
  'pecharunt',
  'arceus',
];

const GEN_FILTERS = [
  { id: 'all', name: 'All 1025', count: 1025 },
  { id: 1, name: 'Gen 1', range: '#0001 - #0151', count: 151, region: 'Kanto' },
  { id: 2, name: 'Gen 2', range: '#0152 - #0251', count: 100, region: 'Johto' },
  { id: 3, name: 'Gen 3', range: '#0252 - #0386', count: 135, region: 'Hoenn' },
  { id: 4, name: 'Gen 4', range: '#0387 - #0493', count: 107, region: 'Sinnoh' },
  { id: 5, name: 'Gen 5', range: '#0494 - #0649', count: 156, region: 'Unova' },
  { id: 6, name: 'Gen 6', range: '#0650 - #0721', count: 72, region: 'Kalos' },
  { id: 7, name: 'Gen 7', range: '#0722 - #0809', count: 88, region: 'Alola' },
  { id: 8, name: 'Gen 8', range: '#0810 - #0905', count: 96, region: 'Galar' },
  { id: 9, name: 'Gen 9', range: '#0906 - #1025', count: 120, region: 'Paldea' },
];

const TYPE_COLORS = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

// In-memory cache for fast switching
const LIVE_ENCOUNTERS_MEM_CACHE = new Map();
const LIVE_AREAS_MEM_CACHE = new Map();

export const LocationDexScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('pokemon-index'); // 'pokemon-index' | 'locations' | 'find-pokemon'
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedClimate, setSelectedClimate] = useState('all');
  const [selectedGen, setSelectedGen] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState({}); // { [locId]: 'all' | 'grass' ... }

  // Live "Where to Catch" state
  const [liveEncountersLoading, setLiveEncountersLoading] = useState(false);
  const [liveEncounters, setLiveEncounters] = useState([]);
  const [livePokemonMeta, setLivePokemonMeta] = useState(null); // { id, name }

  // Live location-area expanded states: { [locId]: { loading, data, error } }
  const [expandedAreaStates, setExpandedAreaStates] = useState({});

  // Inline expanded Pokémon habitat in 1025 index
  const [expandedPokemonId, setExpandedPokemonId] = useState(null);

  const debounceTimerRef = useRef(null);

  // Filter 1025 Pokémon Index
  const filteredPokemon1025 = useMemo(() => {
    return POKEMON_1025_HABITAT_INDEX.filter((pk) => {
      if (selectedGen !== 'all' && pk.generation !== selectedGen) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = pk.name.includes(q) || pk.displayName.toLowerCase().includes(q);
        const matchesId =
          String(pk.id) === q ||
          String(pk.id).padStart(4, '0').includes(q) ||
          `#${String(pk.id).padStart(4, '0')}`.includes(q);
        const matchesLoc = pk.primaryLocation.toLowerCase().includes(q);
        const matchesRegion = pk.region.toLowerCase().includes(q);
        const matchesType = pk.types.some((t) => t.includes(q));
        return matchesName || matchesId || matchesLoc || matchesRegion || matchesType;
      }
      return true;
    });
  }, [selectedGen, searchQuery]);

  // Filter curated locations
  const filteredLocations = useMemo(() => {
    return LOCATION_DEX.filter((loc) => {
      if (selectedRegion !== 'all' && loc.region !== selectedRegion) {
        return false;
      }
      if (selectedClimate !== 'all' && loc.climate !== selectedClimate) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = loc.name.toLowerCase().includes(q);
        const matchesDesc = loc.description.toLowerCase().includes(q);
        const matchesRegion = loc.region.toLowerCase().includes(q);
        const matchesClimate = loc.climate.toLowerCase().includes(q);
        const matchesEncounters = loc.encounters.some(
          (enc) => enc.name.toLowerCase().includes(q) || String(enc.id).includes(q)
        );
        return matchesName || matchesDesc || matchesRegion || matchesClimate || matchesEncounters;
      }
      return true;
    });
  }, [selectedRegion, selectedClimate, searchQuery]);

  // "Where to Catch" local search results
  const localPokemonSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return findPokemonLocations(searchQuery);
  }, [searchQuery]);

  // Fetch live PokeAPI encounters for searched Pokémon
  useEffect(() => {
    if (activeTab !== 'find-pokemon') return;

    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) {
      setLiveEncounters([]);
      setLivePokemonMeta(null);
      setLiveEncountersLoading(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setLiveEncountersLoading(true);

      // Check in-memory cache
      if (LIVE_ENCOUNTERS_MEM_CACHE.has(trimmed)) {
        const cached = LIVE_ENCOUNTERS_MEM_CACHE.get(trimmed);
        setLiveEncounters(cached.encounters);
        setLivePokemonMeta(cached.meta);
        setLiveEncountersLoading(false);
        return;
      }

      // Check persistent storage
      try {
        const storageKey = `@pokedezz_live_encounters_${trimmed}`;
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          LIVE_ENCOUNTERS_MEM_CACHE.set(trimmed, parsed);
          setLiveEncounters(parsed.encounters);
          setLivePokemonMeta(parsed.meta);
          setLiveEncountersLoading(false);
          return;
        }
      } catch (e) {
        // Storage read error; proceed to network
      }

      try {
        // First fetch basic pokemon info to get official ID
        let pokeId = trimmed;
        let pokeName = trimmed;
        try {
          const pokeRes = await axios.get(`https://pokeapi.co/api/v2/pokemon/${trimmed}`, { timeout: 5000 });
          pokeId = pokeRes.data.id;
          pokeName = pokeRes.data.name;
        } catch (e) {
          // If searching by prefix or partial, continue with query
        }

        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokeId}/encounters`, {
          timeout: 6000,
        });

        const rawList = res.data || [];
        const parsedList = rawList.map((item) => {
          const rawAreaName = item.location_area?.name || '';
          const formattedName = formatLocationAreaName(rawAreaName);

          const versionList = (item.version_details || []).map((vd) => {
            const vName = vd.version.name;
            const meta = VERSION_MAP[vName] || { name: vName, region: 'other', color: '#78909C' };
            const methods = [...new Set(vd.encounter_details.map((ed) => ed.method.name))];
            const minLevel = Math.min(...vd.encounter_details.map((ed) => ed.min_level));
            const maxLevel = Math.max(...vd.encounter_details.map((ed) => ed.max_level));
            return {
              version: vName,
              displayName: meta.name,
              region: meta.region,
              color: meta.color,
              methods,
              minLevel: isFinite(minLevel) ? minLevel : null,
              maxLevel: isFinite(maxLevel) ? maxLevel : null,
              chance: vd.max_chance ? `${vd.max_chance}%` : null,
            };
          });

          // Detect region from versions
          let detectedRegion = 'other';
          for (const v of versionList) {
            if (v.region && v.region !== 'other') {
              detectedRegion = v.region;
              break;
            }
          }

          return {
            id: rawAreaName,
            name: formattedName,
            rawAreaName,
            region: detectedRegion,
            versions: versionList,
          };
        });

        const metaObj = { id: pokeId, name: pokeName };
        setLiveEncounters(parsedList);
        setLivePokemonMeta(metaObj);

        // Cache result
        const toCache = { encounters: parsedList, meta: metaObj };
        LIVE_ENCOUNTERS_MEM_CACHE.set(trimmed, toCache);
        AsyncStorage.setItem(`@pokedezz_live_encounters_${trimmed}`, JSON.stringify(toCache)).catch(() => {});
      } catch (e) {
        setLiveEncounters([]);
      } finally {
        setLiveEncountersLoading(false);
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, activeTab]);

  // Load all live encounters for a specific location-area
  const toggleLoadAreaLiveEncounters = async (loc) => {
    const areaKey = loc.pokeapiArea;
    if (!areaKey) return;

    if (expandedAreaStates[loc.id]?.expanded) {
      setExpandedAreaStates((prev) => ({
        ...prev,
        [loc.id]: { ...prev[loc.id], expanded: false },
      }));
      return;
    }

    if (LIVE_AREAS_MEM_CACHE.has(areaKey)) {
      setExpandedAreaStates((prev) => ({
        ...prev,
        [loc.id]: {
          loading: false,
          expanded: true,
          data: LIVE_AREAS_MEM_CACHE.get(areaKey),
          error: null,
        },
      }));
      return;
    }

    setExpandedAreaStates((prev) => ({
      ...prev,
      [loc.id]: { loading: true, expanded: true, data: null, error: null },
    }));

    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/location-area/${areaKey}`, { timeout: 6000 });
      const rawEncounters = res.data?.pokemon_encounters || [];

      const parsedEncounters = rawEncounters.map((p) => {
        const id = p.pokemon.url.split('/').filter(Boolean).pop();
        const methods = [
          ...new Set(p.version_details.flatMap((vd) => vd.encounter_details.map((ed) => ed.method.name))),
        ];
        const versions = p.version_details.map((vd) => vd.version.name);
        return {
          id: Number(id),
          name: p.pokemon.name,
          methods,
          versions,
        };
      });

      LIVE_AREAS_MEM_CACHE.set(areaKey, parsedEncounters);
      setExpandedAreaStates((prev) => ({
        ...prev,
        [loc.id]: {
          loading: false,
          expanded: true,
          data: parsedEncounters,
          error: null,
        },
      }));
    } catch (e) {
      setExpandedAreaStates((prev) => ({
        ...prev,
        [loc.id]: {
          loading: false,
          expanded: true,
          data: null,
          error: 'Could not fetch live area encounters. Offline or area unavailable.',
        },
      }));
    }
  };

  const getRegionMeta = (regId) => {
    return REGIONS.find((r) => r.id === regId) || REGIONS[0];
  };

  const getMethodIcon = (method) => {
    const m = (method || '').toLowerCase();
    if (m.includes('grass') || m.includes('walk')) return 'leaf-outline';
    if (m.includes('surf') || m.includes('water')) return 'water-outline';
    if (m.includes('rod') || m.includes('fish')) return 'fish-outline';
    if (m.includes('cave')) return 'moon-outline';
    if (m.includes('rock')) return 'hammer-outline';
    if (m.includes('tree') || m.includes('headbutt')) return 'bonfire-outline';
    if (m.includes('alpha') || m.includes('noble')) return 'flame-outline';
    return 'sparkles-outline';
  };

  const getChanceColor = (chance) => {
    const c = (chance || '').toLowerCase();
    if (c.includes('common') && !c.includes('uncommon')) return '#4CAF50';
    if (c.includes('uncommon')) return '#2196F3';
    if (c.includes('rare') && !c.includes('very')) return '#9C27B0';
    if (c.includes('very rare')) return '#E91E63';
    if (c.includes('legendary') || c.includes('alpha') || c.includes('mythical') || c.includes('supreme'))
      return '#FF9800';
    return '#78909C';
  };

  const handleSelectPokemonForWhereToCatch = (pk) => {
    setSearchQuery(pk.name);
    setActiveTab('find-pokemon');
  };

  // ─── Render item for 1025 Pokémon Habitat Index ──────────────────────────────
  const renderPokemon1025Item = ({ item }) => {
    const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;
    const formattedId = String(item.id).padStart(4, '0');
    const regMeta = getRegionMeta(item.region);
    const isExpanded = expandedPokemonId === item.id;

    return (
      <View
        style={[
          styles.pk1025Card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.pk1025HeaderRow}
          onPress={() => setExpandedPokemonId(isExpanded ? null : item.id)}
          activeOpacity={0.8}
        >
          {/* Avatar Sprite */}
          <TouchableOpacity
            style={[styles.avatarBox, { backgroundColor: isDarkMode ? '#282830' : '#EFEFF5' }]}
            onPress={() => navigation.navigate('PokemonDetail', { id: item.id, name: item.name })}
          >
            <Image source={{ uri: artworkUrl }} style={styles.encounterSprite} resizeMode="contain" />
          </TouchableOpacity>

          {/* Details */}
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.encounterId, { color: theme.colors.textSecondary }]}>#{formattedId}</Text>
                <Text style={[styles.encounterName, { color: theme.colors.text }]} numberOfLines={1}>
                  {item.displayName}
                </Text>
              </View>

              {/* Region Pill */}
              <View
                style={[
                  styles.regionPill,
                  { backgroundColor: `${regMeta.color}1A`, borderColor: regMeta.color },
                ]}
              >
                <Text style={[styles.regionPillText, { color: regMeta.color, fontSize: 10 }]}>
                  {regMeta.name} • Gen {item.generation}
                </Text>
              </View>
            </View>

            {/* Type Badges */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              {item.types.map((t) => {
                const bg = TYPE_COLORS[t] || '#78909C';
                return (
                  <View key={t} style={[styles.typePill, { backgroundColor: bg }]}>
                    <Text style={styles.typePillText}>{t}</Text>
                  </View>
                );
              })}

              <View
                style={[
                  styles.climateMiniBadge,
                  { backgroundColor: isDarkMode ? '#2C2C36' : '#ECECF4' },
                ]}
              >
                <Ionicons name="navigate-outline" size={10} color={theme.colors.textSecondary} />
                <Text style={[styles.climateMiniText, { color: theme.colors.textSecondary }]}>
                  {item.climate}
                </Text>
              </View>
            </View>

            {/* Primary Location */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Ionicons name="location-sharp" size={12} color="#E53935" />
              <Text
                style={[styles.pk1025LocationText, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.primaryLocation}
              </Text>
            </View>
          </View>

          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Expanded Habitat Guide */}
        {isExpanded && (
          <View
            style={[
              styles.pk1025ExpandedSection,
              { backgroundColor: isDarkMode ? '#17171F' : '#F4F4FA', borderColor: theme.colors.border },
            ]}
          >
            <View style={{ gap: 4 }}>
              <Text style={[styles.habitatSectionTitle, { color: theme.colors.primary }]}>
                Habitats & Encounter Conditions
              </Text>
              <Text style={[styles.habitatDescText, { color: theme.colors.textSecondary }]}>
                {item.habitatDesc}
              </Text>
            </View>

            <View style={styles.pk1025ActionButtonsRow}>
              <TouchableOpacity
                style={[styles.pk1025ActionBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleSelectPokemonForWhereToCatch(item)}
              >
                <Ionicons name="search-circle-outline" size={14} color="#FFF" />
                <Text style={styles.pk1025ActionBtnText}>Full Catch Locations Guide</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pk1025ActionBtnSec,
                  { backgroundColor: isDarkMode ? '#262632' : '#E8E8F0', borderColor: theme.colors.border },
                ]}
                onPress={() => navigation.navigate('PokemonDetail', { id: item.id, name: item.name })}
              >
                <Ionicons name="stats-chart-outline" size={13} color={theme.colors.text} />
                <Text style={[styles.pk1025ActionBtnSecText, { color: theme.colors.text }]}>
                  Stats & Moves
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEncounterItem = (enc) => {
    const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${enc.id}.png`;
    const formattedId = String(enc.id).padStart(4, '0');
    const chanceColor = getChanceColor(enc.chance);

    return (
      <TouchableOpacity
        key={`${enc.id}-${enc.name}-${enc.method}`}
        style={[
          styles.encounterCard,
          { backgroundColor: isDarkMode ? '#1E1E24' : '#F9F9FC', borderColor: theme.colors.border },
        ]}
        onPress={() => navigation.navigate('PokemonDetail', { id: enc.id, name: enc.name })}
        activeOpacity={0.75}
      >
        <View style={[styles.avatarBox, { backgroundColor: isDarkMode ? '#282830' : '#EFEFF5' }]}>
          <Image source={{ uri: artworkUrl }} style={styles.encounterSprite} resizeMode="contain" />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.encounterId, { color: theme.colors.textSecondary }]}>#{formattedId}</Text>
              <Text style={[styles.encounterName, { color: theme.colors.text }]} numberOfLines={1}>
                {enc.name.replace('-', ' ')}
              </Text>
            </View>
            <View style={[styles.chanceBadge, { backgroundColor: `${chanceColor}1A`, borderColor: chanceColor }]}>
              <Text style={[styles.chanceBadgeText, { color: chanceColor }]}>{enc.chance}</Text>
            </View>
          </View>

          <View style={styles.encounterDetailsRow}>
            <View style={[styles.methodBadge, { backgroundColor: isDarkMode ? '#2C2C36' : '#ECECF4' }]}>
              <Ionicons name={getMethodIcon(enc.method)} size={11} color={theme.colors.textSecondary} />
              <Text style={[styles.methodBadgeText, { color: theme.colors.text }]}>{enc.method}</Text>
            </View>
            <Text style={[styles.levelText, { color: theme.colors.textSecondary }]}>{enc.level}</Text>
            {enc.time && (
              <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>• {enc.time}</Text>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderLocationCard = ({ item }) => {
    const regionMeta = getRegionMeta(item.region);
    const activeMethod = selectedMethodFilter[item.id] || 'all';

    const availableMethods = ['all', ...new Set(item.encounters.map((e) => e.method))];
    const visibleEncounters =
      activeMethod === 'all'
        ? item.encounters
        : item.encounters.filter((e) => e.method === activeMethod);

    const areaState = expandedAreaStates[item.id];
    const isLiveExpanded = areaState?.expanded;

    return (
      <View style={[styles.locCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        {/* Top Badges */}
        <View style={styles.locCardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <View style={[styles.climatePill, { backgroundColor: item.badgeColor }]}>
                <Ionicons name={item.icon || 'location-outline'} size={12} color="#FFF" />
                <Text style={styles.climatePillText}>{item.climate}</Text>
              </View>
              <View
                style={[
                  styles.regionPill,
                  { backgroundColor: `${regionMeta.color}22`, borderColor: regionMeta.color },
                ]}
              >
                <Text style={[styles.regionPillText, { color: regionMeta.color }]}>
                  {regionMeta.name} • {regionMeta.gen}
                </Text>
              </View>
            </View>

            <Text style={[styles.locName, { color: theme.colors.text }]}>{item.name}</Text>
          </View>
        </View>

        {/* Description / Lore */}
        <Text style={[styles.locDesc, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>

        {/* Key Items Found */}
        {item.keyItems && item.keyItems.length > 0 && (
          <View style={styles.keyItemsRow}>
            <Ionicons name="gift-outline" size={14} color="#FF9800" />
            <Text style={[styles.keyItemsLabel, { color: theme.colors.textSecondary }]}>Key Items:</Text>
            <View style={styles.keyItemsChips}>
              {item.keyItems.map((ki) => (
                <View
                  key={ki}
                  style={[styles.keyItemChip, { backgroundColor: isDarkMode ? '#2A2A2A' : '#FFF3E0' }]}
                >
                  <Text style={[styles.keyItemText, { color: '#E65100' }]}>{ki}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Encounter Methods Sub-Filter Pills */}
        <View style={styles.encountersHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="paw-outline" size={16} color={item.badgeColor} />
            <Text style={[styles.encountersTitle, { color: theme.colors.text }]}>
              Wild Encounters ({item.encounters.length})
            </Text>
          </View>

          {item.pokeapiArea && (
            <TouchableOpacity
              style={[
                styles.liveAreaBtn,
                {
                  backgroundColor: isLiveExpanded
                    ? theme.colors.primary
                    : isDarkMode
                    ? '#2C2C36'
                    : '#EAEAF2',
                },
              ]}
              onPress={() => toggleLoadAreaLiveEncounters(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isLiveExpanded ? 'chevron-up-outline' : 'globe-outline'}
                size={12}
                color={isLiveExpanded ? '#FFF' : theme.colors.text}
              />
              <Text
                style={[
                  styles.liveAreaBtnText,
                  { color: isLiveExpanded ? '#FFF' : theme.colors.text },
                ]}
              >
                {isLiveExpanded ? 'Hide Live Data' : 'Full PokeAPI Table'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Method Switcher */}
        {availableMethods.length > 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.methodsRow}
          >
            {availableMethods.map((m) => {
              const isSelected = activeMethod === m;
              const count =
                m === 'all'
                  ? item.encounters.length
                  : item.encounters.filter((e) => e.method === m).length;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.methodFilterPill,
                    isSelected && { backgroundColor: item.badgeColor },
                    { borderColor: theme.colors.border },
                  ]}
                  onPress={() =>
                    setSelectedMethodFilter((prev) => ({
                      ...prev,
                      [item.id]: m,
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.methodFilterText,
                      { color: isSelected ? '#FFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {m === 'all' ? 'All' : m} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Encounters List */}
        <View style={styles.encountersContainer}>
          {visibleEncounters.map(renderEncounterItem)}
        </View>

        {/* Live PokeAPI Area Encounters Container */}
        {isLiveExpanded && (
          <View
            style={[
              styles.liveAreaExpandedBox,
              { backgroundColor: isDarkMode ? '#15151A' : '#F0F0F8', borderColor: theme.colors.primary },
            ]}
          >
            <View style={styles.liveAreaExpandedHeader}>
              <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
              <Text style={[styles.liveAreaExpandedTitle, { color: theme.colors.primary }]}>
                PokeAPI Live Area Encounters ({item.pokeapiArea})
              </Text>
            </View>

            {areaState.loading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary, marginTop: 6 }]}>
                  Loading complete encounter table from PokeAPI...
                </Text>
              </View>
            ) : areaState.error ? (
              <Text style={[styles.errorText, { color: '#E53935' }]}>{areaState.error}</Text>
            ) : areaState.data && areaState.data.length > 0 ? (
              <View style={styles.liveAreaGrid}>
                {areaState.data.map((livePk) => {
                  const artwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${livePk.id}.png`;
                  return (
                    <TouchableOpacity
                      key={`live-pk-${livePk.id}-${livePk.name}`}
                      style={[
                        styles.livePkChip,
                        { backgroundColor: isDarkMode ? '#22222B' : '#FFF', borderColor: theme.colors.border },
                      ]}
                      onPress={() => navigation.navigate('PokemonDetail', { id: livePk.id, name: livePk.name })}
                    >
                      <Image source={{ uri: artwork }} style={styles.livePkSprite} resizeMode="contain" />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.livePkName, { color: theme.colors.text }]} numberOfLines={1}>
                          {livePk.name.replace('-', ' ')}
                        </Text>
                        <Text style={[styles.livePkMethods, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                          {livePk.methods.join(', ')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                No additional wild encounter records found for this area.
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Background Pattern */}
      {theme.isPikachu && <PikachuPattern subtle={true} opacity={0.16} />}
      {theme.isEevee && <EeveePattern subtle={true} opacity={0.16} />}
      {theme.isArceus && <ArceusBackground subtle={true} opacity={0.16} />}

      {/* Top Main Mode Tabs: 3 Modes */}
      <View
        style={[
          styles.topTabsBar,
          { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.modeTab,
            activeTab === 'pokemon-index' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 },
          ]}
          onPress={() => setActiveTab('pokemon-index')}
        >
          <Ionicons
            name="list-outline"
            size={18}
            color={activeTab === 'pokemon-index' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.modeTabText,
              {
                color: activeTab === 'pokemon-index' ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: activeTab === 'pokemon-index' ? '800' : '600',
              },
            ]}
          >
            1025 Dex Index
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeTab,
            activeTab === 'locations' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 },
          ]}
          onPress={() => setActiveTab('locations')}
        >
          <Ionicons
            name="map-outline"
            size={18}
            color={activeTab === 'locations' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.modeTabText,
              {
                color: activeTab === 'locations' ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: activeTab === 'locations' ? '800' : '600',
              },
            ]}
          >
            Routes & Caves
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeTab,
            activeTab === 'find-pokemon' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 },
          ]}
          onPress={() => setActiveTab('find-pokemon')}
        >
          <Ionicons
            name="search-circle-outline"
            size={19}
            color={activeTab === 'find-pokemon' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.modeTabText,
              {
                color: activeTab === 'find-pokemon' ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: activeTab === 'find-pokemon' ? '800' : '600',
              },
            ]}
          >
            Where to Catch
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
        ]}
      >
        <View
          style={[
            styles.searchBox,
            { backgroundColor: isDarkMode ? '#222' : '#F5F5F5', borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder={
              activeTab === 'pokemon-index'
                ? 'Search by Dex # (1-1025), name, type, or region...'
                : activeTab === 'locations'
                ? 'Search routes, caves, regions, or Pokémon...'
                : 'Search any Pokémon to find its franchise wild habitats...'
            }
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* 1025 INDEX MODE: Generation Filter Scroll */}
        {activeTab === 'pokemon-index' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.regionsScroll}
          >
            {GEN_FILTERS.map((gen) => {
              const isSelected = selectedGen === gen.id;
              return (
                <TouchableOpacity
                  key={gen.id}
                  style={[
                    styles.regionTab,
                    isSelected && { backgroundColor: theme.colors.primary },
                    { borderColor: theme.colors.border },
                  ]}
                  onPress={() => setSelectedGen(gen.id)}
                >
                  <Text
                    style={[
                      styles.regionTabText,
                      { color: isSelected ? '#FFF' : theme.colors.text },
                    ]}
                  >
                    {gen.name} ({gen.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* LOCATIONS MODE: Filter Bars */}
        {activeTab === 'locations' && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.regionsScroll}
            >
              {REGIONS.map((reg) => {
                const isSelected = selectedRegion === reg.id;
                const locCount =
                  reg.id === 'all'
                    ? LOCATION_DEX.length
                    : LOCATION_DEX.filter((l) => l.region === reg.id).length;
                return (
                  <TouchableOpacity
                    key={reg.id}
                    style={[
                      styles.regionTab,
                      isSelected && { backgroundColor: reg.color },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setSelectedRegion(reg.id)}
                  >
                    <Text
                      style={[
                        styles.regionTabText,
                        { color: isSelected ? '#FFF' : theme.colors.text },
                      ]}
                    >
                      {reg.name} ({locCount})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.climatesScroll}
            >
              {CLIMATES.map((cl) => {
                const isSelected = selectedClimate === cl.id;
                return (
                  <TouchableOpacity
                    key={cl.id}
                    style={[
                      styles.climateFilterPill,
                      isSelected && { backgroundColor: theme.colors.primary },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setSelectedClimate(cl.id)}
                  >
                    <Ionicons
                      name={cl.icon}
                      size={13}
                      color={isSelected ? '#FFF' : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.climateFilterText,
                        { color: isSelected ? '#FFF' : theme.colors.textSecondary },
                      ]}
                    >
                      {cl.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* FIND POKÉMON MODE: Popular Shortcuts */}
        {activeTab === 'find-pokemon' && (
          <View style={{ paddingTop: 4 }}>
            <Text style={[styles.popularLabel, { color: theme.colors.textSecondary }]}>
              Popular Wild Encounters:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularRow}
            >
              {POPULAR_SEARCHES.map((pk) => (
                <TouchableOpacity
                  key={pk}
                  style={[styles.popularChip, { backgroundColor: isDarkMode ? '#2A2A2A' : '#EDE7F6' }]}
                  onPress={() => setSearchQuery(pk)}
                >
                  <Text style={[styles.popularChipText, { color: theme.colors.text }]}>
                    {pk.charAt(0).toUpperCase() + pk.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ─── TAB 1: 1025 POKÉMON HABITAT INDEX ───────────────────────────────── */}
      {activeTab === 'pokemon-index' && (
        <FlatList
          data={filteredPokemon1025}
          keyExtractor={(item) => `pk-1025-${item.id}`}
          renderItem={renderPokemon1025Item}
          contentContainerStyle={styles.locationsList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          maxToRenderPerBatch={25}
          windowSize={10}
          ListHeaderComponent={
            <View style={styles.indexCountBanner}>
              <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
              <Text style={[styles.indexCountBannerText, { color: theme.colors.textSecondary }]}>
                Showing {filteredPokemon1025.length} of 1,025 Pokémon with full habitat & location records
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Pokémon found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Try adjusting your Dex number or search query.
              </Text>
            </View>
          }
        />
      )}

      {/* ─── TAB 2: LOCATIONS VIEW ─────────────────────────────────────────── */}
      {activeTab === 'locations' && (
        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => item.id}
          renderItem={renderLocationCard}
          contentContainerStyle={styles.locationsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="map-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No locations found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Try selecting a different region or adjusting your search term.
              </Text>
            </View>
          }
        />
      )}

      {/* ─── TAB 3: WHERE TO CATCH VIEW ─────────────────────────────────────── */}
      {activeTab === 'find-pokemon' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.locationsList}>
          {searchQuery.trim().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={54} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Search any Pokémon above
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Find all routes, caves, and waters across regions where it can be caught!
              </Text>
            </View>
          ) : (
            <>
              {/* Pokémon Hero Header Card if available */}
              {livePokemonMeta && (
                <TouchableOpacity
                  style={[
                    styles.pokemonHeroCard,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  ]}
                  onPress={() =>
                    navigation.navigate('PokemonDetail', {
                      id: livePokemonMeta.id,
                      name: livePokemonMeta.name,
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${livePokemonMeta.id}.png`,
                    }}
                    style={styles.pokemonHeroSprite}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pokemonHeroId, { color: theme.colors.textSecondary }]}>
                      #{String(livePokemonMeta.id).padStart(4, '0')}
                    </Text>
                    <Text style={[styles.pokemonHeroName, { color: theme.colors.text }]}>
                      {livePokemonMeta.name.replace('-', ' ')}
                    </Text>
                    <Text style={[styles.pokemonHeroHint, { color: theme.colors.primary }]}>
                      Tap to view complete stats & evolutions →
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* SECTION 1: Local Curated Habitat Guides */}
              {localPokemonSearchResults.length > 0 && (
                <View style={{ gap: 10 }}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="book-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>
                      Curated Regional Habitat Guides ({localPokemonSearchResults.length})
                    </Text>
                  </View>

                  {localPokemonSearchResults.map((res) => {
                    const loc = res.location;
                    const regMeta = getRegionMeta(loc.region);

                    return (
                      <View
                        key={`local-${loc.id}`}
                        style={[
                          styles.locCard,
                          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={[styles.climatePill, { backgroundColor: loc.badgeColor }]}>
                              <Text style={styles.climatePillText}>{loc.climate}</Text>
                            </View>
                            <View
                              style={[
                                styles.regionPill,
                                { backgroundColor: `${regMeta.color}22`, borderColor: regMeta.color },
                              ]}
                            >
                              <Text style={[styles.regionPillText, { color: regMeta.color }]}>
                                {regMeta.name} • {regMeta.gen}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <Text style={[styles.locName, { color: theme.colors.text, marginTop: 4 }]}>
                          {loc.name}
                        </Text>
                        <Text style={[styles.locDesc, { color: theme.colors.textSecondary }]}>
                          {loc.description}
                        </Text>

                        <View style={styles.encountersContainer}>
                          {res.encounters.map(renderEncounterItem)}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* SECTION 2: Franchise-Wide Live PokeAPI Wild Encounters */}
              <View style={{ gap: 10, marginTop: 8 }}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="globe-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>
                    Franchise Wild Encounters across Games
                  </Text>
                  {liveEncountersLoading && (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 6 }} />
                  )}
                </View>

                {liveEncountersLoading && liveEncounters.length === 0 ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary, marginTop: 6 }]}>
                      Searching all games & encounter tables...
                    </Text>
                  </View>
                ) : liveEncounters.length > 0 ? (
                  liveEncounters.map((area) => {
                    const regMeta = getRegionMeta(area.region);
                    return (
                      <View
                        key={`live-area-${area.id}`}
                        style={[
                          styles.locCard,
                          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={[styles.locName, { color: theme.colors.text, fontSize: 17, marginTop: 0 }]}>
                            {area.name}
                          </Text>
                          {area.region !== 'other' && (
                            <View
                              style={[
                                styles.regionPill,
                                { backgroundColor: `${regMeta.color}22`, borderColor: regMeta.color },
                              ]}
                            >
                              <Text style={[styles.regionPillText, { color: regMeta.color }]}>
                                {regMeta.name}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Version Groups and methods */}
                        <View style={{ gap: 8, marginTop: 4 }}>
                          {area.versions.map((ver) => (
                            <View
                              key={ver.version}
                              style={[
                                styles.versionRow,
                                {
                                  backgroundColor: isDarkMode ? '#1E1E26' : '#F7F7FD',
                                  borderColor: theme.colors.border,
                                },
                              ]}
                            >
                              <View style={[styles.versionBadge, { backgroundColor: ver.color }]}>
                                <Text style={styles.versionBadgeText}>{ver.displayName}</Text>
                              </View>

                              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                {ver.methods.map((m) => (
                                  <View key={m} style={[styles.methodBadge, { backgroundColor: isDarkMode ? '#2C2C36' : '#E8E8F0' }]}>
                                    <Ionicons name={getMethodIcon(m)} size={11} color={theme.colors.textSecondary} />
                                    <Text style={[styles.methodBadgeText, { color: theme.colors.text }]}>{m}</Text>
                                  </View>
                                ))}

                                {ver.minLevel && (
                                  <Text style={[styles.levelText, { color: theme.colors.textSecondary }]}>
                                    Lv. {ver.minLevel}{ver.maxLevel && ver.maxLevel !== ver.minLevel ? ` - ${ver.maxLevel}` : ''}
                                  </Text>
                                )}

                                {ver.chance && (
                                  <Text style={[styles.chanceBadgeText, { color: '#4CAF50' }]}>
                                    {ver.chance}
                                  </Text>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })
                ) : !liveEncountersLoading && localPokemonSearchResults.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                      No wild encounter records found for "{searchQuery}"
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                      This Pokémon may be an evolution, starter gift, fossil revive, or event exclusive.
                    </Text>
                  </View>
                ) : null}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topTabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  modeTabText: {
    fontSize: 12,
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  regionsScroll: {
    gap: 8,
  },
  regionTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  regionTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  climatesScroll: {
    gap: 6,
    paddingTop: 2,
  },
  climateFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  climateFilterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  popularLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  popularRow: {
    gap: 6,
  },
  popularChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  indexCountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  indexCountBannerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationsList: {
    padding: 12,
    paddingBottom: 40,
    gap: 12,
  },
  pk1025Card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pk1025HeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  pk1025LocationText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  pk1025ExpandedSection: {
    borderTopWidth: 1,
    padding: 12,
    gap: 10,
  },
  habitatSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  habitatDescText: {
    fontSize: 12,
    lineHeight: 18,
  },
  pk1025ActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  pk1025ActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  pk1025ActionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pk1025ActionBtnSec: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  pk1025ActionBtnSecText: {
    fontSize: 12,
    fontWeight: '700',
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typePillText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  climateMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  climateMiniText: {
    fontSize: 10,
    fontWeight: '600',
  },
  locCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  locCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  climatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  climatePillText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  regionPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  regionPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  locName: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
  locDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  keyItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 2,
  },
  keyItemsLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  keyItemsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  keyItemChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  keyItemText: {
    fontSize: 11,
    fontWeight: '700',
  },
  encountersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: 10,
  },
  encountersTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  liveAreaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  liveAreaBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  methodsRow: {
    gap: 6,
    paddingVertical: 4,
  },
  methodFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  methodFilterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  encountersContainer: {
    gap: 8,
    marginTop: 4,
  },
  encounterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encounterSprite: {
    width: 44,
    height: 44,
  },
  encounterId: {
    fontSize: 11,
    fontWeight: '700',
  },
  encounterName: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  chanceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  chanceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  encounterDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  levelText: {
    fontSize: 11,
  },
  timeText: {
    fontSize: 11,
  },
  liveAreaExpandedBox: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  liveAreaExpandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveAreaExpandedTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  liveAreaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  livePkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  livePkSprite: {
    width: 32,
    height: 32,
  },
  livePkName: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  livePkMethods: {
    fontSize: 10,
  },
  pokemonHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  pokemonHeroSprite: {
    width: 60,
    height: 60,
  },
  pokemonHeroId: {
    fontSize: 12,
    fontWeight: '700',
  },
  pokemonHeroName: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  pokemonHeroHint: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  versionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  versionBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
