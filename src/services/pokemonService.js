import axios from 'axios';
import { pokemonIndex } from '../data/pokemonIndex';
import {
  getCachedPokemonDetails,
  setCachedPokemonDetails,
  getCachedEvolutionChain,
  setCachedEvolutionChain,
  getCachedMove,
  setCachedMove,
  getCachedAbility,
  setCachedAbility,
} from './offlineStorage';
import {
  BUNDLED_MOVES,
  BUNDLED_ABILITIES,
  createOfflinePokemonDetails,
  createOfflineEvolutionChain,
} from '../data/offlineFallbackData';
import { getRegionalEvolutionChain } from '../data/regionalEvolutions.js';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Fast-timeout Axios client to prevent freezing on dead/slow connections
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// Helper to extract ID from PokeAPI URL (e.g. "https://pokeapi.co/api/v2/pokemon-species/1/")
export const getPokemonIdFromUrl = (url) => {
  const parts = url.trim().split('/');
  return parseInt(parts[parts.length - 2], 10);
};

// Security sanitizers: Enforce HTTPS and prevent SSRF / arbitrary URL fetching
export const sanitizePokeApiUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const secureUrl = url.trim().replace(/^http:\/\//i, 'https://');
  if (secureUrl.startsWith('https://pokeapi.co/')) {
    return secureUrl;
  }
  return null;
};

export const ensureHttps = (url) => {
  if (!url || typeof url !== 'string') return url;
  return url.trim().replace(/^http:\/\//i, 'https://');
};

// Local Type Chart for calculating Weaknesses and Resistances offline
const TYPE_EFFECTIVENESS = {
  normal: {
    doubleDamageFrom: ['fighting'],
    halfDamageFrom: [],
    noDamageFrom: ['ghost']
  },
  fire: {
    doubleDamageFrom: ['water', 'ground', 'rock'],
    halfDamageFrom: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
    noDamageFrom: []
  },
  water: {
    doubleDamageFrom: ['grass', 'electric'],
    halfDamageFrom: ['fire', 'water', 'ice', 'steel'],
    noDamageFrom: []
  },
  electric: {
    doubleDamageFrom: ['ground'],
    halfDamageFrom: ['electric', 'flying', 'steel'],
    noDamageFrom: []
  },
  grass: {
    doubleDamageFrom: ['fire', 'ice', 'poison', 'flying', 'bug'],
    halfDamageFrom: ['water', 'electric', 'grass', 'ground'],
    noDamageFrom: []
  },
  ice: {
    doubleDamageFrom: ['fire', 'fighting', 'rock', 'steel'],
    halfDamageFrom: ['ice'],
    noDamageFrom: []
  },
  fighting: {
    doubleDamageFrom: ['flying', 'psychic', 'fairy'],
    halfDamageFrom: ['bug', 'rock', 'dark'],
    noDamageFrom: ['ghost']
  },
  poison: {
    doubleDamageFrom: ['ground', 'psychic'],
    halfDamageFrom: ['fighting', 'poison', 'bug', 'grass', 'fairy'],
    noDamageFrom: []
  },
  ground: {
    doubleDamageFrom: ['water', 'grass', 'ice'],
    halfDamageFrom: ['poison', 'rock'],
    noDamageFrom: ['electric']
  },
  flying: {
    doubleDamageFrom: ['electric', 'ice', 'rock'],
    halfDamageFrom: ['fighting', 'bug', 'grass'],
    noDamageFrom: ['ground']
  },
  psychic: {
    doubleDamageFrom: ['bug', 'ghost', 'dark'],
    halfDamageFrom: ['fighting', 'psychic'],
    noDamageFrom: []
  },
  bug: {
    doubleDamageFrom: ['fire', 'flying', 'rock'],
    halfDamageFrom: ['fighting', 'ground', 'grass'],
    noDamageFrom: []
  },
  rock: {
    doubleDamageFrom: ['water', 'grass', 'fighting', 'ground', 'steel'],
    halfDamageFrom: ['normal', 'fire', 'poison', 'flying'],
    noDamageFrom: []
  },
  ghost: {
    doubleDamageFrom: ['ghost', 'dark'],
    halfDamageFrom: ['poison', 'bug'],
    noDamageFrom: ['normal', 'fighting']
  },
  dragon: {
    doubleDamageFrom: ['ice', 'dragon', 'fairy'],
    halfDamageFrom: ['fire', 'water', 'electric', 'grass'],
    noDamageFrom: []
  },
  dark: {
    doubleDamageFrom: ['fighting', 'bug', 'fairy'],
    halfDamageFrom: ['ghost', 'dark'],
    noDamageFrom: ['psychic']
  },
  steel: {
    doubleDamageFrom: ['fire', 'fighting', 'ground'],
    halfDamageFrom: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'],
    noDamageFrom: ['poison']
  },
  fairy: {
    doubleDamageFrom: ['poison', 'steel'],
    halfDamageFrom: ['fighting', 'bug', 'dark'],
    noDamageFrom: ['dragon']
  }
};

const ALL_TYPES = Object.keys(TYPE_EFFECTIVENESS);

/**
 * Calculates complete defensive type matchup profile
 */
export const calculateWeaknessesAndResistances = (types) => {
  const multipliers = {};
  ALL_TYPES.forEach(t => multipliers[t] = 1.0);

  types.forEach(type => {
    const tLower = type.toLowerCase();
    const effectiveness = TYPE_EFFECTIVENESS[tLower];
    if (effectiveness) {
      effectiveness.doubleDamageFrom.forEach(attType => multipliers[attType] *= 2.0);
      effectiveness.halfDamageFrom.forEach(attType => multipliers[attType] *= 0.5);
      effectiveness.noDamageFrom.forEach(attType => multipliers[attType] *= 0.0);
    }
  });

  const weaknesses4x = [];
  const weaknesses2x = [];
  const resistancesHalf = [];
  const resistancesQuarter = [];
  const immunities = [];

  Object.entries(multipliers).forEach(([type, multiplier]) => {
    if (multiplier === 4.0) {
      weaknesses4x.push(type);
    } else if (multiplier === 2.0) {
      weaknesses2x.push(type);
    } else if (multiplier === 0.5) {
      resistancesHalf.push(type);
    } else if (multiplier === 0.25) {
      resistancesQuarter.push(type);
    } else if (multiplier === 0.0) {
      immunities.push(type);
    }
  });

  return {
    weaknesses: [...weaknesses4x.map(t => ({ type: t, value: 4 })), ...weaknesses2x.map(t => ({ type: t, value: 2 }))],
    resistances: [...resistancesQuarter.map(t => ({ type: t, value: 0.25 })), ...resistancesHalf.map(t => ({ type: t, value: 0.5 }))],
    immunities: immunities.map(t => ({ type: t, value: 0 }))
  };
};

/**
 * Formats raw PokeAPI response into the application Pokémon Details schema
 */
const formatPokemonDetails = (data, speciesData = null, encountersData = []) => {
  // Process Stats
  const stats = {
    hp: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
    attack: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
    defense: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
    specialAttack: data.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
    specialDefense: data.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
    speed: data.stats.find(s => s.stat.name === 'speed')?.base_stat || 0,
  };

  // Process Types & Abilities
  const types = data.types.map(t => t.type.name);
  const abilities = data.abilities.map(a => ({
    name: a.ability.name,
    isHidden: a.is_hidden
  }));

  // Process Moves
  const movesByVersion = { 'champions': { 'level-up': [], machine: [], egg: [], tutor: [] } };
  const availableVersions = new Set(['champions']);

  data.moves.forEach(m => {
    const moveName = m.move.name;

    m.version_group_details.forEach(vgd => {
      const versionName = vgd.version_group.name;
      const method = vgd.move_learn_method.name;
      const level = vgd.level_learned_at;

      availableVersions.add(versionName);

      if (!movesByVersion[versionName]) {
        movesByVersion[versionName] = { 'level-up': [], machine: [], egg: [], tutor: [] };
      }

      let category = 'level-up';
      if (method === 'machine') category = 'machine';
      else if (method === 'egg') category = 'egg';
      else if (method === 'tutor') category = 'tutor';
      else if (method === 'level-up') category = 'level-up';

      if (movesByVersion[versionName][category]) {
        const existing = movesByVersion[versionName][category].find(x => x.name === moveName);
        if (!existing) {
          movesByVersion[versionName][category].push({ name: moveName, level });
        } else if (level > 0 && (existing.level === 0 || level < existing.level)) {
          existing.level = level;
        }
      }

      const existingChamp = movesByVersion['champions'][category].find(x => x.name === moveName);
      if (!existingChamp) {
        movesByVersion['champions'][category].push({ name: moveName, level });
      } else if (level > 0 && (existingChamp.level === 0 || level < existingChamp.level)) {
        existingChamp.level = level;
      }
    });
  });

  Object.keys(movesByVersion).forEach(v => {
    if (movesByVersion[v]['level-up']) {
      movesByVersion[v]['level-up'].sort((a, b) => a.level - b.level);
    }
  });

  const VERSION_ORDER = [
    'champions',
    'legends-za',
    'the-indigo-disk',
    'the-teal-mask',
    'scarlet-violet',
    'legends-arceus',
    'brilliant-diamond-shining-pearl',
    'sword-shield',
    'lets-go-pikachu-lets-go-eevee',
    'ultra-sun-ultra-moon',
    'sun-moon',
    'omega-ruby-alpha-sapphire',
    'x-y',
    'black-2-white-2',
    'black-white',
    'heartgold-soulsilver',
    'platinum',
    'diamond-pearl',
    'emerald',
    'firered-leafgreen',
    'ruby-sapphire',
    'crystal',
    'gold-silver',
    'yellow',
    'red-blue'
  ];

  const sortedVersions = Array.from(availableVersions).sort((a, b) => {
    const indexA = VERSION_ORDER.indexOf(a);
    const indexB = VERSION_ORDER.indexOf(b);
    const rankA = indexA === -1 ? 999 : indexA;
    const rankB = indexB === -1 ? 999 : indexB;
    return rankA - rankB;
  });

  const moves = {
    availableVersions: sortedVersions,
    byVersion: movesByVersion
  };

  // Process Lore
  const captureRate = speciesData?.capture_rate || 0;
  const flavorTextsByVersion = {
    'champions': `${data.name.toUpperCase()} is a formidable competitor in the Pokémon Champions tournament.`
  };
  const locationsByVersion = {
    'champions': [{ name: "champions-arena", methods: ["tournament"] }]
  };
  const availableLoreVersions = new Set(['champions']);

  if (speciesData?.flavor_text_entries) {
    const enEntries = speciesData.flavor_text_entries.filter(e => e.language.name === 'en');
    if (enEntries.length > 0) {
      flavorTextsByVersion['champions'] = enEntries[enEntries.length - 1].flavor_text.replace(/[\n\f\r]/g, ' ');
    }

    speciesData.flavor_text_entries.forEach(entry => {
      if (entry.language.name === 'en') {
        const vName = entry.version.name;
        flavorTextsByVersion[vName] = entry.flavor_text.replace(/[\n\f\r]/g, ' ');
        availableLoreVersions.add(vName);
      }
    });
  }

  if (encountersData && encountersData.length > 0) {
    encountersData.forEach(enc => {
      const locName = enc.location_area.name;
      enc.version_details.forEach(vd => {
        const vName = vd.version.name;
        availableLoreVersions.add(vName);
        
        if (!locationsByVersion[vName]) {
          locationsByVersion[vName] = [];
        }
        
        const methods = Array.from(new Set(vd.encounter_details.map(ed => ed.method.name)));
        locationsByVersion[vName].push({
          name: locName,
          methods: methods
        });
      });
    });
  }

  const allKnownVersions = new Set([...availableLoreVersions, ...sortedVersions]);
  const isSpecial = speciesData?.is_legendary || speciesData?.is_mythical;
  
  allKnownVersions.forEach(vName => {
    if (!locationsByVersion[vName] || locationsByVersion[vName].length === 0) {
      locationsByVersion[vName] = [{
        name: isSpecial ? "static-encounter-/-story-event" : "gift-/-fossil-/-special-event",
        methods: ["special"]
      }];
      availableLoreVersions.add(vName);
    }
  });

  const sortedLoreVersions = Array.from(availableLoreVersions).sort((a, b) => {
    const indexA = VERSION_ORDER.indexOf(a);
    const indexB = VERSION_ORDER.indexOf(b);
    const rankA = indexA === -1 ? 999 : indexA;
    const rankB = indexB === -1 ? 999 : indexB;
    return rankA - rankB;
  });

  const lore = {
    availableVersions: sortedLoreVersions,
    flavorTexts: flavorTextsByVersion,
    locations: locationsByVersion,
    captureRate
  };

  const cryUrl = data.cries?.latest || data.cries?.legacy || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`;

  const evYield = data.stats
    .filter(s => s.effort > 0)
    .map(s => {
      const names = {
        'hp': 'HP', 'attack': 'Atk', 'defense': 'Def',
        'special-attack': 'Sp. Atk', 'special-defense': 'Sp. Def', 'speed': 'Speed'
      };
      return `${s.effort} ${names[s.stat.name] || s.stat.name}`;
    })
    .join(' · ') || 'None';

  const training = {
    evYield,
    captureRate: speciesData?.capture_rate ?? '?',
    baseHappiness: speciesData?.base_happiness ?? '?',
    baseExperience: data.base_experience ?? '?',
    growthRate: speciesData?.growth_rate?.name?.replace(/-/g, ' ') ?? '?',
  };

  const genderRate = speciesData?.gender_rate ?? -1;
  const femaleRatio = genderRate === -1 ? null : Math.round((genderRate / 8) * 100);
  const maleRatio = femaleRatio === null ? null : 100 - femaleRatio;
  const eggGroups = speciesData?.egg_groups?.map(g => g.name.replace(/-/g, ' ')) ?? [];
  const hatchSteps = speciesData?.hatch_counter != null ? (speciesData.hatch_counter + 1) * 255 : null;

  const breeding = {
    genderless: genderRate === -1,
    maleRatio,
    femaleRatio,
    eggGroups,
    eggCycles: speciesData?.hatch_counter ?? '?',
    hatchSteps,
  };

  return {
    id: data.id,
    name: data.name,
    types,
    stats,
    height: data.height / 10,
    weight: data.weight / 10,
    abilities,
    moves,
    lore,
    cryUrl: ensureHttps(cryUrl),
    training,
    breeding,
    sprites: {
      artwork: ensureHttps(data.sprites?.other?.['official-artwork']?.front_default),
      artworkShiny: ensureHttps(data.sprites?.other?.['official-artwork']?.front_shiny),
      spriteDefault: ensureHttps(data.sprites?.front_default),
      spriteShiny: ensureHttps(data.sprites?.front_shiny)
    },
    isCachedData: false,
    isOfflineFallback: false,
  };
};

/**
 * Background silent revalidation when serving cached data
 */
const triggerSilentRefresh = (pokemonId) => {
  setTimeout(async () => {
    try {
      const response = await apiClient.get(`/pokemon/${pokemonId}`);
      const data = response.data;
      let speciesData = null;
      try {
        const speciesUrl = sanitizePokeApiUrl(data.species?.url) || `${BASE_URL}/pokemon-species/${pokemonId}`;
        const speciesRes = await axios.get(speciesUrl, { timeout: 4000 });
        speciesData = speciesRes.data;
      } catch (e) {}

      let encountersData = [];
      try {
        const encRes = await axios.get(`${BASE_URL}/pokemon/${pokemonId}/encounters`, { timeout: 4000 });
        encountersData = encRes.data;
      } catch (e) {}

      const fresh = formatPokemonDetails(data, speciesData, encountersData);
      await setCachedPokemonDetails(fresh);
    } catch (e) {
      // Offline or network error - ignore silent refresh error
    }
  }, 200);
};

/**
 * Fetch detailed information for a single Pokémon.
 * Offline-first: Checks L1/L2 cache first, then network, then falls back to bundled pokemonIndex.
 */
export const getPokemonDetails = async (pokemonId, forceRefresh = false) => {
  // 1. Check local cache (Memory & AsyncStorage)
  if (!forceRefresh) {
    const cached = await getCachedPokemonDetails(pokemonId);
    if (cached) {
      // Trigger background sync if not already updated in last hour
      const oneHourAgo = Date.now() - 3600000;
      if (!cached.cachedAt || cached.cachedAt < oneHourAgo) {
        triggerSilentRefresh(pokemonId);
      }
      return cached;
    }
  }

  // 2. Network fetch with timeout
  try {
    const response = await apiClient.get(`/pokemon/${pokemonId}`);
    const data = response.data;

    let speciesData = null;
    try {
      const speciesUrl = sanitizePokeApiUrl(data.species?.url) || `${BASE_URL}/pokemon-species/${pokemonId}`;
      const speciesRes = await axios.get(speciesUrl, { timeout: 4000 });
      speciesData = speciesRes.data;
    } catch (e) {
      console.warn("Could not fetch species data", e);
    }

    let encountersData = [];
    try {
      const encRes = await axios.get(`${BASE_URL}/pokemon/${pokemonId}/encounters`, { timeout: 4000 });
      encountersData = encRes.data;
    } catch (e) {
      console.warn("Could not fetch encounters data", e);
    }

    const details = formatPokemonDetails(data, speciesData, encountersData);

    // Save to persistent cache
    await setCachedPokemonDetails(details);
    return details;
  } catch (error) {
    console.warn(`[Offline-First] Network error for Pokémon #${pokemonId}. Serving cached/bundled data.`);
    
    // Check if we have an older cached copy
    const cached = await getCachedPokemonDetails(pokemonId);
    if (cached) return cached;

    // Fall back to bundled pokemonIndex
    return createOfflinePokemonDetails(pokemonId);
  }
};

/**
 * Move details: Offline-first with bundled fallback
 */
export const getMoveDetails = async (moveName) => {
  if (!moveName) return null;
  const key = String(moveName).toLowerCase().trim();

  // 1. Check Cache
  const cached = await getCachedMove(key);
  if (cached) return cached;

  // 2. Check Bundled Moves
  if (BUNDLED_MOVES[key]) {
    const bundled = BUNDLED_MOVES[key];
    await setCachedMove(key, bundled);
    return bundled;
  }

  // 3. Network Fetch
  try {
    const response = await apiClient.get(`/move/${key}`);
    const data = response.data;
    
    let effect = '';
    const effectEntry = data.effect_entries?.find(e => e.language.name === 'en');
    if (effectEntry) {
      effect = effectEntry.short_effect.replace('$effect_chance', data.effect_chance || '');
    } else {
      const flavorEntry = data.flavor_text_entries?.find(e => e.language.name === 'en');
      if (flavorEntry) {
        effect = flavorEntry.flavor_text.replace(/[\n\f\r]/g, ' ');
      }
    }

    const result = {
      name: data.name,
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp,
      type: data.type.name,
      damageClass: data.damage_class?.name,
      effect: effect
    };
    
    await setCachedMove(key, result);
    return result;
  } catch (error) {
    return {
      name: moveName,
      power: '--',
      accuracy: '--',
      pp: 20,
      type: 'normal',
      damageClass: 'physical',
      effect: 'Move details unavailable in offline mode.',
      isOfflineFallback: true,
    };
  }
};

/**
 * Ability details: Offline-first with bundled fallback
 */
export const getAbilityDetails = async (abilityName) => {
  if (!abilityName) return 'No ability data available.';
  const key = String(abilityName).toLowerCase().trim();

  // 1. Check Cache
  const cached = await getCachedAbility(key);
  if (cached) return cached;

  // 2. Check Bundled Abilities
  if (BUNDLED_ABILITIES[key]) {
    const bundled = BUNDLED_ABILITIES[key];
    await setCachedAbility(key, bundled);
    return bundled;
  }

  // 3. Network Fetch
  try {
    const response = await apiClient.get(`/ability/${key}`);
    const data = response.data;
    const entry = data.effect_entries?.find(e => e.language.name === 'en');
    let effectText = entry?.short_effect || entry?.effect || 'No effect data available.';
    
    if (!entry && data.flavor_text_entries) {
      const flavor = data.flavor_text_entries.find(f => f.language.name === 'en');
      if (flavor) effectText = flavor.flavor_text.replace(/[\n\f\r]/g, ' ');
    }

    await setCachedAbility(key, effectText);
    return effectText;
  } catch (error) {
    return `${abilityName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: Ability description unavailable in offline mode.`;
  }
};

const hasDuplicateEvolutionNodes = (node) => {
  if (!node || !Array.isArray(node.evolvesTo)) return false;
  const keys = node.evolvesTo.map(c => `${c.id}-${c.name}`);
  if (new Set(keys).size !== keys.length) return true;
  return node.evolvesTo.some(hasDuplicateEvolutionNodes);
};

const parseEvolutionChain = (node, targetPokemon = null) => {
  const defaultId = getPokemonIdFromUrl(node.species?.url);
  const defaultName = node.species?.name || 'pokemon';

  const targetName = targetPokemon?.name?.toLowerCase() || '';
  const isTargetRegional =
    targetName.includes('-alola') ||
    targetName.includes('-galar') ||
    targetName.includes('-hisui') ||
    targetName.includes('-paldea');

  const current = {
    id: defaultId,
    name: defaultName,
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [],
  };

  if (node.evolves_to && node.evolves_to.length > 0) {
    const nextChildren = [];
    const seenChildKeys = new Set();

    node.evolves_to.forEach(childNode => {
      const childSpeciesId = getPokemonIdFromUrl(childNode.species?.url);
      const childSpeciesName = childNode.species?.name || '';
      const detailsList = childNode.evolution_details || [];

      if (detailsList.length === 0) {
        const childEntry = {
          id: childSpeciesId,
          name: childSpeciesName,
          minLevel: null,
          trigger: null,
          item: null,
          region: null,
          evolvesTo: [],
        };
        childEntry.evolvesTo = parseEvolutionChain(childNode, targetPokemon).evolvesTo;
        const k = `${childEntry.id}-${childEntry.name}`;
        if (!seenChildKeys.has(k)) {
          seenChildKeys.add(k);
          nextChildren.push(childEntry);
        }
        return;
      }

      detailsList.forEach(details => {
        let childId = childSpeciesId;
        let childName = childSpeciesName;
        let regionName = details.region?.name || null;

        const reqForm = details.required_pokemon_form?.name || null;
        const evoForm = details.evolved_pokemon_form?.name || null;

        // If an explicit evolved form is specified (e.g. raichu-alola, muk-alola, marowak-alola)
        if (evoForm) {
          const matched = pokemonIndex.find(p => p.name.toLowerCase() === evoForm.toLowerCase());
          if (matched) {
            childId = matched.id;
            childName = matched.name;
          } else {
            childName = evoForm;
          }
          if (evoForm.includes('-alola')) regionName = 'alola';
          if (evoForm.includes('-galar')) regionName = 'galar';
          if (evoForm.includes('-hisui')) regionName = 'hisui';
          if (evoForm.includes('-paldea')) regionName = 'paldea';
        }

        // If target is a standard Pokémon, skip evolution paths that branch from a regional base species
        if (!isTargetRegional && reqForm && (reqForm.includes('-alola') || reqForm.includes('-galar') || reqForm.includes('-hisui') || reqForm.includes('-paldea'))) {
          const baseHasRegional = pokemonIndex.some(p => p.speciesId === defaultId && p.id > 10000);
          if (baseHasRegional) {
            return;
          }
        }

        const minLevel = details.min_level || null;
        const trigger = details.trigger?.name || null;
        const item = details.item?.name || null;

        const childEntry = {
          id: childId,
          name: childName,
          minLevel,
          trigger,
          item,
          region: regionName,
          evolvesTo: [],
        };

        const k = `${childEntry.id}-${childEntry.name}`;
        if (!seenChildKeys.has(k)) {
          seenChildKeys.add(k);
          if (childNode.evolves_to && childNode.evolves_to.length > 0) {
            childEntry.evolvesTo = parseEvolutionChain(childNode, targetPokemon).evolvesTo;
          }
          nextChildren.push(childEntry);
        }
      });
    });

    current.evolvesTo = nextChildren;
  }

  return current;
};

const MEGA_STONES = {
  'venusaur': 'venusaurite', 'charizard-x': 'charizardite x', 'charizard-y': 'charizardite y',
  'blastoise': 'blastoisinite', 'beedrill': 'beedrillite', 'pidgeot': 'pidgeotite',
  'alakazam': 'alakazite', 'slowbro': 'slowbronite', 'gengar': 'gengarite',
  'kangaskhan': 'kangaskhanite', 'pinsir': 'pinsirite', 'gyarados': 'gyaradosite',
  'aerodactyl': 'aerodactylite', 'mewtwo-x': 'mewtwonite x', 'mewtwo-y': 'mewtwonite y',
  'ampharos': 'ampharosite', 'steelix': 'steelixite', 'scizor': 'scizorite',
  'heracross': 'heracronite', 'houndoom': 'houndoominite', 'tyranitar': 'tyranitarite',
  'sceptile': 'sceptilite', 'blaziken': 'blazikenite', 'swampert': 'swampertite',
  'gardevoir': 'gardevoirite', 'sableye': 'sablenite', 'mawile': 'mawilite',
  'aggron': 'aggronite', 'medicham': 'medichamite', 'manectric': 'manectite',
  'sharpedo': 'sharpedonite', 'camerupt': 'cameruptite', 'altaria': 'altarianite',
  'banette': 'banettite', 'absol': 'absolite', 'glalie': 'glalitite',
  'salamence': 'salamencite', 'metagross': 'metagrossite', 'latias': 'latiasite',
  'latios': 'latiosite', 'rayquaza': 'meteorite', 'lopunny': 'lopunnite',
  'garchomp': 'garchompite', 'lucario': 'lucarionite', 'abomasnow': 'abomasite',
  'gallade': 'galladite', 'audino': 'audinite', 'diancie': 'diancite'
};

export const getMegaStoneName = (megaName) => {
  const key = megaName.replace('-mega', '');
  return MEGA_STONES[key] || (key + 'ite');
};

/**
 * Evolution chain: Offline-first with bundled fallback
 */
export const getPokemonEvolutionChain = async (pokemonId, forceRefresh = false) => {
  // 1. Check if this is a known regional Pokémon form (Alolan, Galarian, Hisuian, Paldean)
  const regionalChain = getRegionalEvolutionChain(pokemonId);
  if (regionalChain) {
    await setCachedEvolutionChain(pokemonId, regionalChain);
    return regionalChain;
  }

  // 2. Check local Cache (validate against stale duplicate nodes)
  if (!forceRefresh) {
    const cached = await getCachedEvolutionChain(pokemonId);
    if (cached && !hasDuplicateEvolutionNodes(cached)) {
      return cached;
    }
  }

  // Look up target Pokémon in index to understand regional context
  const targetPokemon = pokemonIndex.find(
    p => p.id === Number(pokemonId) || p.name.toLowerCase() === String(pokemonId).toLowerCase()
  );

  // 3. Network Fetch
  try {
    let speciesUrl = `${BASE_URL}/pokemon-species/${pokemonId}`;
    
    if (pokemonId > 10000) {
      const pRes = await apiClient.get(`/pokemon/${pokemonId}`);
      if (pRes.data.species?.url) {
        speciesUrl = sanitizePokeApiUrl(pRes.data.species.url) || speciesUrl;
      }
    }

    const speciesRes = await axios.get(speciesUrl, { timeout: 4000 });
    const chainUrl = sanitizePokeApiUrl(speciesRes.data.evolution_chain?.url);

    let rootNode = null;
    if (!chainUrl) {
      rootNode = { id: pokemonId, name: speciesRes.data.name, minLevel: null, trigger: null, item: null, region: null, evolvesTo: [] };
    } else {
      const chainRes = await axios.get(chainUrl, { timeout: 4000 });
      rootNode = parseEvolutionChain(chainRes.data.chain, targetPokemon);
    }

    if (rootNode) {
      await setCachedEvolutionChain(pokemonId, rootNode);
    }
    return rootNode;
  } catch (error) {
    console.warn(`[Offline-First] Evolution chain network error for ID ${pokemonId}. Using cached/fallback.`);
    const cached = await getCachedEvolutionChain(pokemonId);
    if (cached) return cached;
    return createOfflineEvolutionChain(pokemonId);
  }
};


/**
 * Pre-cache an entire Pokémon (details + evolution) into local storage
 */
export const precachePokemon = async (pokemonId) => {
  try {
    const [details, evo] = await Promise.all([
      getPokemonDetails(pokemonId, true),
      getPokemonEvolutionChain(pokemonId, true),
    ]);
    return { success: true, details, evo };
  } catch (e) {
    return { success: false, error: e };
  }
};
