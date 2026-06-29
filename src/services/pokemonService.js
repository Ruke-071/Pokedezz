import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Helper to extract ID from PokeAPI URL (e.g. "https://pokeapi.co/api/v2/pokemon-species/1/")
export const getPokemonIdFromUrl = (url) => {
  const parts = url.trim().split('/');
  return parseInt(parts[parts.length - 2], 10);
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
  steel: {
    doubleDamageFrom: ['fire', 'fighting', 'ground'],
    halfDamageFrom: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'],
    noDamageFrom: ['poison']
  },
  dark: {
    doubleDamageFrom: ['fighting', 'bug', 'fairy'],
    halfDamageFrom: ['ghost', 'dark'],
    noDamageFrom: ['psychic']
  },
  fairy: {
    doubleDamageFrom: ['poison', 'steel'],
    halfDamageFrom: ['fighting', 'bug', 'dark'],
    noDamageFrom: ['dragon']
  }
};

const ALL_TYPES = Object.keys(TYPE_EFFECTIVENESS);

export const calculateWeaknessesAndResistances = (types) => {
  const multipliers = {};
  
  // Initialize all types with 1.0 multiplier
  ALL_TYPES.forEach(type => {
    multipliers[type] = 1.0;
  });

  // Calculate effectiveness for each of the Pokémon's types
  types.forEach(pokemonType => {
    const typeLower = pokemonType.toLowerCase();
    const relations = TYPE_EFFECTIVENESS[typeLower];
    
    if (relations) {
      relations.doubleDamageFrom.forEach(attacker => {
        multipliers[attacker] *= 2.0;
      });
      relations.halfDamageFrom.forEach(attacker => {
        multipliers[attacker] *= 0.5;
      });
      relations.noDamageFrom.forEach(attacker => {
        multipliers[attacker] *= 0.0;
      });
    }
  });

  // Categorize multipliers
  const weaknesses2x = [];
  const weaknesses4x = [];
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
 * Fetch detailed information for a single Pokémon.
 */
export const getPokemonDetails = async (pokemonId) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon/${pokemonId}`);
    const data = response.data;

    // Fetch Species details (for flavor text and capture rate)
    let speciesData = null;
    try {
      const speciesUrl = data.species?.url || `${BASE_URL}/pokemon-species/${pokemonId}`;
      const speciesRes = await axios.get(speciesUrl);
      speciesData = speciesRes.data;
    } catch (e) {
      console.warn("Could not fetch species data", e);
    }

    // Fetch Encounters
    let encountersData = [];
    try {
      const encRes = await axios.get(`${BASE_URL}/pokemon/${pokemonId}/encounters`);
      encountersData = encRes.data;
    } catch (e) {
      console.warn("Could not fetch encounters data", e);
    }

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
      // If a version isn't in our ordered list, throw it to the bottom
      const rankA = indexA === -1 ? 999 : indexA;
      const rankB = indexB === -1 ? 999 : indexB;
      return rankA - rankB;
    });

    const moves = {
      availableVersions: sortedVersions,
      byVersion: movesByVersion
    };

    // Process Lore (Pokedex and Encounters)
    const captureRate = speciesData?.capture_rate || 0;
    const flavorTextsByVersion = {
      'champions': `${data.name.toUpperCase()} is a formidable competitor in the Pokémon Champions tournament.`
    };
    const locationsByVersion = {
      'champions': [{ name: "champions-arena", methods: ["tournament"] }]
    };
    const availableLoreVersions = new Set(['champions']);

    if (speciesData?.flavor_text_entries) {
      // Find the most recent english entry to use for Champions
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

    // --- SMART FALLBACK FOR EVENT/STATIC POKEMON ---
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

    // EV yield string (e.g. "1 Sp. Atk, 2 HP")
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

    // gender_rate: -1 = genderless, 0-8 proportion of female (out of 8)
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
      cryUrl,
      training,
      breeding,
      sprites: {
        artwork: data.sprites?.other?.['official-artwork']?.front_default,
        artworkShiny: data.sprites?.other?.['official-artwork']?.front_shiny,
        spriteDefault: data.sprites?.front_default,
        spriteShiny: data.sprites?.front_shiny
      }
    };
  } catch (error) {
    console.error("Error fetching Pokémon details:", error);
    throw error;
  }
};

const moveCache = {};
export const getMoveDetails = async (moveName) => {
  if (moveCache[moveName]) return moveCache[moveName];
  try {
    const response = await axios.get(`${BASE_URL}/move/${moveName}`);
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
    
    moveCache[moveName] = result;
    return result;
  } catch (error) {
    console.error("Error fetching move details:", error);
    throw error;
  }
};

const abilityCache = {};
export const getAbilityDetails = async (abilityName) => {
  if (abilityCache[abilityName]) return abilityCache[abilityName];
  try {
    const response = await axios.get(`${BASE_URL}/ability/${abilityName}`);
    const data = response.data;
    const entry = data.effect_entries?.find(e => e.language.name === 'en');
    let effectText = entry?.short_effect || entry?.effect || 'No effect data available.';
    
    if (!entry && data.flavor_text_entries) {
      const flavor = data.flavor_text_entries.find(f => f.language.name === 'en');
      if (flavor) effectText = flavor.flavor_text.replace(/[\n\f\r]/g, ' ');
    }

    abilityCache[abilityName] = effectText;
    return effectText;
  } catch (error) {
    console.error(`Error fetching ability ${abilityName}:`, error);
    return 'Failed to load ability data.';
  }
};

const parseEvolutionChain = (node) => {
  const defaultId = getPokemonIdFromUrl(node.species.url);
  const defaultName = node.species.name;
  
  const results = [];
  
  if (node.evolution_details && node.evolution_details.length > 0) {
    // This handles species that branch into regional forms (like Pikachu -> Raichu / Alolan Raichu)
    node.evolution_details.forEach(details => {
      let currentId = defaultId;
      let currentName = defaultName;
      let isRegional = false;
      let regionName = null;

      if (details.evolved_form) {
         currentId = getPokemonIdFromUrl(details.evolved_form.url);
         currentName = details.evolved_form.name;
         isRegional = true;
      }
      if (details.region) {
         regionName = details.region.name;
      }

      const minLevel = details.min_level || null;
      const trigger = details.trigger?.name || null;
      const item = details.item?.name || null;
      
      const current = { 
        id: currentId, 
        name: currentName, 
        minLevel, 
        trigger, 
        item, 
        region: regionName,
        evolvesTo: [] 
      };

      // Only the base species typically continues the evolution chain in PokeAPI
      if (!isRegional && node.evolves_to && node.evolves_to.length > 0) {
        current.evolvesTo = node.evolves_to.flatMap(parseEvolutionChain);
      }
      
      results.push(current);
    });
  } else {
    // Base form (e.g. root node like Pichu)
    const current = { 
      id: defaultId, 
      name: defaultName, 
      minLevel: null, 
      trigger: null, 
      item: null, 
      region: null,
      evolvesTo: [] 
    };
    if (node.evolves_to && node.evolves_to.length > 0) {
      current.evolvesTo = node.evolves_to.flatMap(parseEvolutionChain);
    }
    results.push(current);
  }
  
  return results;
};

/**
 * Fetch and parse evolution chain for a Pokémon species.
 */
import { pokemonIndex } from '../data/pokemonIndex';

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

const getMegaStoneName = (megaName) => {
  const key = megaName.replace('-mega', '');
  return MEGA_STONES[key] || (key + 'ite');
};

export const getPokemonEvolutionChain = async (pokemonId) => {
  try {
    let speciesUrl = `${BASE_URL}/pokemon-species/${pokemonId}`;
    
    // 1. If pokemonId > 10000, fetch the base pokemon to find the species URL
    if (pokemonId > 10000) {
      const pRes = await axios.get(`${BASE_URL}/pokemon/${pokemonId}`);
      if (pRes.data.species?.url) {
        speciesUrl = pRes.data.species.url;
      }
    }

    // 2. Fetch species details to get the evolution chain URL
    const speciesRes = await axios.get(speciesUrl);
    const chainUrl = speciesRes.data.evolution_chain?.url;

    let rootNode = null;
    if (!chainUrl) {
      // No evolution chain
      rootNode = { id: pokemonId, name: speciesRes.data.name, minLevel: null, trigger: null, item: null, region: null, evolvesTo: [] };
    } else {
      // 3. Fetch the chain details
      const chainRes = await axios.get(chainUrl);
      
      // 4. Parse the chain recursively
      rootNode = parseEvolutionChain(chainRes.data.chain)[0];
    }

    // No longer injecting megas into standard evolution chain.
    // They will be displayed in their own section.

    return rootNode;

  } catch (error) {
    console.error(`Error fetching evolution chain for ID ${pokemonId}`, error);
    // Return a single fallback stage rather than crashing
    return null;
  }
};
