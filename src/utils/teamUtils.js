import { pokemonIndex } from '../data/pokemonIndex.js';

export const TYPE_COLORS = {
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

export const ALL_POKEMON_TYPES = Object.keys(TYPE_COLORS);

export const TYPE_EFFECTIVENESS = {
  normal: { doubleDamageFrom: ['fighting'], halfDamageFrom: [], noDamageFrom: ['ghost'] },
  fire: { doubleDamageFrom: ['water', 'ground', 'rock'], halfDamageFrom: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], noDamageFrom: [] },
  water: { doubleDamageFrom: ['electric', 'grass'], halfDamageFrom: ['fire', 'water', 'ice', 'steel'], noDamageFrom: [] },
  electric: { doubleDamageFrom: ['ground'], halfDamageFrom: ['electric', 'flying', 'steel'], noDamageFrom: [] },
  grass: { doubleDamageFrom: ['fire', 'ice', 'poison', 'flying', 'bug'], halfDamageFrom: ['water', 'electric', 'grass', 'ground'], noDamageFrom: [] },
  ice: { doubleDamageFrom: ['fire', 'fighting', 'rock', 'steel'], halfDamageFrom: ['ice'], noDamageFrom: [] },
  fighting: { doubleDamageFrom: ['flying', 'psychic', 'fairy'], halfDamageFrom: ['bug', 'rock', 'dark'], noDamageFrom: [] },
  poison: { doubleDamageFrom: ['ground', 'psychic'], halfDamageFrom: ['grass', 'fighting', 'poison', 'bug', 'fairy'], noDamageFrom: [] },
  ground: { doubleDamageFrom: ['water', 'grass', 'ice'], halfDamageFrom: ['poison', 'rock'], noDamageFrom: ['electric'] },
  flying: { doubleDamageFrom: ['electric', 'ice', 'rock'], halfDamageFrom: ['grass', 'fighting', 'bug'], noDamageFrom: ['ground'] },
  psychic: { doubleDamageFrom: ['bug', 'ghost', 'dark'], halfDamageFrom: ['fighting', 'psychic'], noDamageFrom: [] },
  bug: { doubleDamageFrom: ['fire', 'flying', 'rock'], halfDamageFrom: ['fighting', 'ground', 'grass'], noDamageFrom: [] },
  rock: { doubleDamageFrom: ['water', 'grass', 'fighting', 'ground', 'steel'], halfDamageFrom: ['normal', 'fire', 'poison', 'flying'], noDamageFrom: [] },
  ghost: { doubleDamageFrom: ['ghost', 'dark'], halfDamageFrom: ['poison', 'bug'], noDamageFrom: ['normal', 'fighting'] },
  dragon: { doubleDamageFrom: ['ice', 'dragon', 'fairy'], halfDamageFrom: ['fire', 'water', 'electric', 'grass'], noDamageFrom: [] },
  dark: { doubleDamageFrom: ['fighting', 'bug', 'fairy'], halfDamageFrom: ['ghost', 'dark'], noDamageFrom: ['psychic'] },
  steel: { doubleDamageFrom: ['fire', 'fighting', 'ground'], halfDamageFrom: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], noDamageFrom: ['poison'] },
  fairy: { doubleDamageFrom: ['poison', 'steel'], halfDamageFrom: ['fighting', 'bug', 'dark'], noDamageFrom: ['dragon'] }
};

export const PLAY_STYLES = [
  'Story Mode',
  'Competitive',
  'Champions',
  'Hyper Offense',
  'Balanced',
  'Trick Room',
  'Rain Dance',
  'Sun / Fire',
  'Monotype',
];

export const PLAY_STYLE_ICONS = {
  'Story Mode': 'book-outline',
  'Competitive': 'trophy-outline',
  'Champions': 'medal-outline',
  'Hyper Offense': 'flash-outline',
  'Balanced': 'shield-checkmark-outline',
  'Trick Room': 'hourglass-outline',
  'Rain Dance': 'rainy-outline',
  'Sun / Fire': 'sunny-outline',
  'Monotype': 'layers-outline',
};

// Curated signature abilities for prominent Pokémon
export const POKEMON_SIGNATURE_ABILITIES = {
  6: { name: 'Solar Power', desc: 'In harsh sunlight, boosts Sp. Atk by 50% at the cost of HP each turn.' },
  25: { name: 'Lightning Rod', desc: 'Draws in all Electric-type moves to boost Sp. Atk and nullify damage.' },
  94: { name: 'Cursed Body', desc: 'May disable a move used on the Pokémon (30% chance).' },
  130: { name: 'Intimidate', desc: 'Lowers opposing Pokémon’s Attack stat by 1 stage upon entering battle.' },
  143: { name: 'Thick Fat', desc: 'Halves damage taken from Fire-type and Ice-type moves.' },
  448: { name: 'Inner Focus', desc: 'Protects the Pokémon from flinching and prevents Attack drops.' },
  445: { name: 'Rough Skin', desc: 'Inflicts damage to the attacker upon being hit by physical contact.' },
  887: { name: 'Infiltrator', desc: 'Bypasses the opposing Pokémon’s barriers, screens, and Substitute.' },
  823: { name: 'Mirror Armor', desc: 'Bounces back only the stat-lowering effects that the Pokémon receives.' },
  987: { name: 'Protosynthesis', desc: 'Boosts the Pokémon’s most proficient stat in harsh sunlight or with Booster Energy.' },
  983: { name: 'Supreme Overlord', desc: 'Boosts Attack and Sp. Atk slightly for each defeated ally on the team.' },
  1017: { name: 'Defiant', desc: 'Sharply boosts Attack (+2 stages) when its stats are lowered by an opponent.' },
  442: { name: 'Pressure', desc: 'Raises opposing Pokémon’s PP usage by 1 point per move.' },
  407: { name: 'Natural Cure', desc: 'All status conditions heal automatically when switching out of battle.' },
  468: { name: 'Serene Grace', desc: 'Doubles the chance of secondary effects occurring from moves (60% flinch on Air Slash).' },
  350: { name: 'Marvel Scale', desc: 'Boosts Defense by 50% if the Pokémon is inflicted with a status condition.' },
};

/**
 * Calculates defensive multipliers for a single Pokémon
 */
export const getPokemonDefensiveMultipliers = (types = []) => {
  const multipliers = {};
  ALL_POKEMON_TYPES.forEach(t => multipliers[t] = 1.0);

  types.forEach(type => {
    const tLower = typeof type === 'string' ? type.toLowerCase() : (type?.name || 'normal').toLowerCase();
    const effectiveness = TYPE_EFFECTIVENESS[tLower];
    if (effectiveness) {
      effectiveness.doubleDamageFrom.forEach(attType => multipliers[attType] *= 2.0);
      effectiveness.halfDamageFrom.forEach(attType => multipliers[attType] *= 0.5);
      effectiveness.noDamageFrom.forEach(attType => multipliers[attType] *= 0.0);
    }
  });

  return multipliers;
};

/**
 * Comprehensive Team Defensive Coverage Matrix
 * Calculates how the entire team handles all 18 attacking types
 */
export const calculateTeamDefensiveCoverage = (members = []) => {
  if (!members || members.length === 0) {
    return {
      typeBreakdown: [],
      majorWeaknesses: [],
      unresistedTypes: [],
      superResistedTypes: [],
      totalImmunities: 0,
    };
  }

  const typeBreakdown = ALL_POKEMON_TYPES.map(attType => {
    const weakList = [];
    const resistList = [];
    const immuneList = [];

    members.forEach(member => {
      const mults = getPokemonDefensiveMultipliers(member.types || []);
      const val = mults[attType];

      if (val === 0) {
        immuneList.push({ name: member.name, id: member.id });
      } else if (val > 1) {
        weakList.push({ name: member.name, id: member.id, multiplier: val });
      } else if (val < 1) {
        resistList.push({ name: member.name, id: member.id, multiplier: val });
      }
    });

    const weakCount = weakList.length;
    const resistCount = resistList.length;
    const immuneCount = immuneList.length;
    const netScore = resistCount + (immuneCount * 2) - weakCount;

    let status = 'balanced';
    if (weakCount >= 3 && resistCount === 0 && immuneCount === 0) {
      status = 'danger'; // Major team hazard!
    } else if (weakCount > resistCount + immuneCount) {
      status = 'warning';
    } else if (immuneCount > 0) {
      status = 'immune';
    } else if (resistCount > weakCount) {
      status = 'resisted';
    }

    return {
      type: attType,
      weakCount,
      weakList,
      resistCount,
      resistList,
      immuneCount,
      immuneList,
      netScore,
      status,
    };
  });

  // Sort breakdown: major hazards first
  typeBreakdown.sort((a, b) => {
    if (a.status === 'danger' && b.status !== 'danger') return -1;
    if (b.status === 'danger' && a.status !== 'danger') return 1;
    return a.netScore - b.netScore;
  });

  const majorWeaknesses = typeBreakdown.filter(t => t.status === 'danger' || t.weakCount >= 3);
  const unresistedTypes = typeBreakdown.filter(t => t.weakCount > 0 && t.resistCount === 0 && t.immuneCount === 0);
  const superResistedTypes = typeBreakdown.filter(t => t.resistCount + t.immuneCount >= 3);
  const totalImmunities = typeBreakdown.reduce((sum, t) => sum + t.immuneCount, 0);

  return {
    typeBreakdown,
    majorWeaknesses,
    unresistedTypes,
    superResistedTypes,
    totalImmunities,
  };
};

/**
 * Calculates complete team stats comparison and top performer awards
 */
export const calculateTeamStats = (members = []) => {
  if (!members || members.length === 0) {
    return {
      totals: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, bst: 0 },
      averages: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, bst: 0 },
      topPerformers: {},
    };
  }

  const totals = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, bst: 0 };
  const statKeys = ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'];

  const topPerformers = {
    hp: { val: -1, pokemon: null, role: 'Team Tank 💚' },
    attack: { val: -1, pokemon: null, role: 'Physical Sweeper ⚔️' },
    defense: { val: -1, pokemon: null, role: 'Physical Wall 🛡️' },
    spAtk: { val: -1, pokemon: null, role: 'Special Sweeper 🔮' },
    spDef: { val: -1, pokemon: null, role: 'Special Wall 🏰' },
    speed: { val: -1, pokemon: null, role: 'Speed Lead ⚡' },
    bst: { val: -1, pokemon: null, role: 'Team MVP ⭐' },
  };

  members.forEach(p => {
    const hp = p.hp || p.stats?.hp || 50;
    const attack = p.attack || p.stats?.attack || 50;
    const defense = p.defense || p.stats?.defense || 50;
    const spAtk = p.spAtk || p.stats?.specialAttack || 50;
    const spDef = p.spDef || p.stats?.specialDefense || 50;
    const speed = p.speed || p.stats?.speed || 50;
    const bst = p.total || (hp + attack + defense + spAtk + spDef + speed);

    totals.hp += hp;
    totals.attack += attack;
    totals.defense += defense;
    totals.spAtk += spAtk;
    totals.spDef += spDef;
    totals.speed += speed;
    totals.bst += bst;

    if (hp > topPerformers.hp.val) topPerformers.hp = { val: hp, pokemon: p, role: 'Team Tank 💚' };
    if (attack > topPerformers.attack.val) topPerformers.attack = { val: attack, pokemon: p, role: 'Physical Sweeper ⚔️' };
    if (defense > topPerformers.defense.val) topPerformers.defense = { val: defense, pokemon: p, role: 'Physical Wall 🛡️' };
    if (spAtk > topPerformers.spAtk.val) topPerformers.spAtk = { val: spAtk, pokemon: p, role: 'Special Sweeper 🔮' };
    if (spDef > topPerformers.spDef.val) topPerformers.spDef = { val: spDef, pokemon: p, role: 'Special Wall 🏰' };
    if (speed > topPerformers.speed.val) topPerformers.speed = { val: speed, pokemon: p, role: 'Speed Lead ⚡' };
    if (bst > topPerformers.bst.val) topPerformers.bst = { val: bst, pokemon: p, role: 'Team MVP ⭐' };
  });

  const count = members.length;
  const averages = {
    hp: Math.round(totals.hp / count),
    attack: Math.round(totals.attack / count),
    defense: Math.round(totals.defense / count),
    spAtk: Math.round(totals.spAtk / count),
    spDef: Math.round(totals.spDef / count),
    speed: Math.round(totals.speed / count),
    bst: Math.round(totals.bst / count),
  };

  return {
    totals,
    averages,
    topPerformers,
  };
};

/**
 * Returns ability name and description for any Pokémon
 */
export const getPokemonAbilityInfo = (pokemon) => {
  if (!pokemon) return { name: 'Unknown', desc: 'No ability data' };

  if (POKEMON_SIGNATURE_ABILITIES[pokemon.id]) {
    return POKEMON_SIGNATURE_ABILITIES[pokemon.id];
  }

  // Check if Pokémon has abilities array from PokeAPI
  if (Array.isArray(pokemon.abilities) && pokemon.abilities.length > 0) {
    const first = pokemon.abilities[0];
    const name = typeof first === 'string' ? first : (first?.name || first?.ability?.name || 'Inner Focus');
    const formatted = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { name: formatted, desc: 'Increases battle capability and team synergy.' };
  }

  // Synthesize based on primary type
  const primary = (pokemon.types?.[0] || 'normal').toLowerCase();
  switch (primary) {
    case 'fire': return { name: 'Blaze', desc: 'Powers up Fire-type moves by 50% in a pinch (≤ 1/3 HP).' };
    case 'water': return { name: 'Torrent', desc: 'Powers up Water-type moves by 50% in a pinch (≤ 1/3 HP).' };
    case 'grass': return { name: 'Overgrow', desc: 'Powers up Grass-type moves by 50% in a pinch (≤ 1/3 HP).' };
    case 'electric': return { name: 'Static', desc: 'Contact with this Pokémon may cause paralysis.' };
    case 'dragon': return { name: 'Rough Skin', desc: 'Hurts attackers on physical contact.' };
    case 'ghost': return { name: 'Levitate', desc: 'Gives full immunity to Ground-type attacks and hazards.' };
    case 'steel': return { name: 'Sturdy', desc: 'Cannot be knocked out in one hit from full HP.' };
    default: return { name: 'Inner Focus', desc: 'Protects from flinching and prevents stat intimidation.' };
  }
};

/**
 * Pre-configured Play Style Teams for immediate user exploration
 */
export const getInitialPresetTeams = () => {
  const getByIds = (ids) => ids.map(id => pokemonIndex.find(p => p.id === id)).filter(Boolean);

  return [
    {
      id: 'story-mode',
      name: 'Story Mode',
      playStyle: 'Story Mode',
      description: 'Iconic all-around adventure team with high versatility and coverage.',
      members: getByIds([6, 25, 94, 130, 143, 448]), // Charizard, Pikachu, Gengar, Gyarados, Snorlax, Lucario
      createdAt: Date.now() - 300000,
      updatedAt: Date.now() - 300000,
    },
    {
      id: 'competitive',
      name: 'Competitive VGC',
      playStyle: 'Competitive',
      description: 'Top-tier tournament meta team with extreme speed, bulk, and overwhelming offensive pressure.',
      members: getByIds([445, 887, 823, 987, 983, 1017]), // Garchomp, Dragapult, Corviknight, Flutter Mane, Kingambit, Ogerpon
      createdAt: Date.now() - 200000,
      updatedAt: Date.now() - 200000,
    },
    {
      id: 'champions',
      name: 'Champions (Cynthia)',
      playStyle: 'Champions',
      description: 'Legendary Sinnoh Champion Cynthia lineup featuring flawless type synergy and sweeping power.',
      members: getByIds([442, 407, 468, 448, 350, 445]), // Spiritomb, Roserade, Togekiss, Lucario, Milotic, Garchomp
      createdAt: Date.now() - 100000,
      updatedAt: Date.now() - 100000,
    },
  ];
};
