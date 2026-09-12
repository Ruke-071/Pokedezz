/**
 * Pokémon Stat Calculator Engine
 * Implements authentic Gen 3+ Pokémon stat formulas:
 * 
 * HP Formula:
 *   HP = floor(((2 * Base + IV + floor(EV / 4)) * Level) / 100) + Level + 10
 *   (Exception: Shedinja Base HP = 1 always yields 1 HP)
 * 
 * Other Stats (Attack, Defense, Sp. Atk, Sp. Def, Speed):
 *   Stat = floor((floor(((2 * Base + IV + floor(EV / 4)) * Level) / 100) + 5) * NatureMultiplier)
 */

export const STAT_KEYS = ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'];

export const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  spAtk: 'Sp. Atk',
  spDef: 'Sp. Def',
  speed: 'Speed',
};

export const STAT_COLORS = {
  hp: '#FF5252',
  attack: '#FF7A00',
  defense: '#FFCB05',
  spAtk: '#4D62E8',
  spDef: '#4CAF50',
  speed: '#00D2D3',
};

// All 25 Pokémon Natures with boosted (+10%) and hindered (-10%) stats
export const NATURES = [
  { name: 'Hardy', increased: null, decreased: null },
  { name: 'Lonely', increased: 'attack', decreased: 'defense' },
  { name: 'Brave', increased: 'attack', decreased: 'speed' },
  { name: 'Adamant', increased: 'attack', decreased: 'spAtk' },
  { name: 'Naughty', increased: 'attack', decreased: 'spDef' },
  { name: 'Bold', increased: 'defense', decreased: 'attack' },
  { name: 'Docile', increased: null, decreased: null },
  { name: 'Relaxed', increased: 'defense', decreased: 'speed' },
  { name: 'Impish', increased: 'defense', decreased: 'spAtk' },
  { name: 'Lax', increased: 'defense', decreased: 'spDef' },
  { name: 'Timid', increased: 'speed', decreased: 'attack' },
  { name: 'Hasty', increased: 'speed', decreased: 'defense' },
  { name: 'Serious', increased: null, decreased: null },
  { name: 'Jolly', increased: 'speed', decreased: 'spAtk' },
  { name: 'Naive', increased: 'speed', decreased: 'spDef' },
  { name: 'Modest', increased: 'spAtk', decreased: 'attack' },
  { name: 'Mild', increased: 'spAtk', decreased: 'defense' },
  { name: 'Quiet', increased: 'spAtk', decreased: 'speed' },
  { name: 'Bashful', increased: null, decreased: null },
  { name: 'Rash', increased: 'spAtk', decreased: 'spDef' },
  { name: 'Calm', increased: 'spDef', decreased: 'attack' },
  { name: 'Gentle', increased: 'spDef', decreased: 'defense' },
  { name: 'Sassy', increased: 'spDef', decreased: 'speed' },
  { name: 'Careful', increased: 'spDef', decreased: 'spAtk' },
  { name: 'Quirky', increased: null, decreased: null },
];

/**
 * Get nature multiplier for a specific stat key
 * @param {string} natureName
 * @param {string} statKey ('hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed')
 * @returns {number} 1.1 (boosted), 0.9 (hindered), or 1.0 (neutral)
 */
export const getNatureMultiplier = (natureName, statKey) => {
  if (statKey === 'hp') return 1.0; // HP is never modified by nature
  const nature = NATURES.find(n => n.name.toLowerCase() === natureName?.toLowerCase());
  if (!nature || !nature.increased || nature.increased === nature.decreased) {
    return 1.0;
  }
  if (nature.increased === statKey) return 1.1;
  if (nature.decreased === statKey) return 0.9;
  return 1.0;
};

/**
 * Calculate HP stat
 * @param {number} base
 * @param {number} iv (0 - 31)
 * @param {number} ev (0 - 252)
 * @param {number} level (1 - 100)
 * @returns {number}
 */
export const calculateHp = (base, iv = 31, ev = 0, level = 100) => {
  const safeBase = Number(base) || 0;
  if (safeBase === 1) return 1; // Shedinja special case
  const safeIv = Math.max(0, Math.min(31, Number(iv) || 0));
  const safeEv = Math.max(0, Math.min(252, Number(ev) || 0));
  const safeLvl = Math.max(1, Math.min(100, Number(level) || 100));

  return Math.floor(((2 * safeBase + safeIv + Math.floor(safeEv / 4)) * safeLvl) / 100) + safeLvl + 10;
};

/**
 * Calculate non-HP stat
 * @param {number} base
 * @param {number} iv (0 - 31)
 * @param {number} ev (0 - 252)
 * @param {number} level (1 - 100)
 * @param {number} natureMultiplier (0.9, 1.0, 1.1)
 * @returns {number}
 */
export const calculateStat = (base, iv = 31, ev = 0, level = 100, natureMultiplier = 1.0) => {
  const safeBase = Number(base) || 0;
  const safeIv = Math.max(0, Math.min(31, Number(iv) || 0));
  const safeEv = Math.max(0, Math.min(252, Number(ev) || 0));
  const safeLvl = Math.max(1, Math.min(100, Number(level) || 100));

  const rawStat = Math.floor(((2 * safeBase + safeIv + Math.floor(safeEv / 4)) * safeLvl) / 100) + 5;
  return Math.floor(rawStat * natureMultiplier);
};

/**
 * Calculate all 6 stats for a Pokémon
 */
export const calculatePokemonStats = ({
  baseStats = {},
  ivs = { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 },
  evs = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
  level = 100,
  nature = 'Hardy'
}) => {
  // Normalize baseStats keys (handle spAtk/specialAttack and spDef/specialDefense)
  const normalizedBase = {
    hp: baseStats.hp || 0,
    attack: baseStats.attack || 0,
    defense: baseStats.defense || 0,
    spAtk: baseStats.spAtk ?? baseStats.specialAttack ?? 0,
    spDef: baseStats.spDef ?? baseStats.specialDefense ?? 0,
    speed: baseStats.speed || 0,
  };

  const finalStats = {
    hp: calculateHp(normalizedBase.hp, ivs.hp, evs.hp, level),
    attack: calculateStat(normalizedBase.attack, ivs.attack, evs.attack, level, getNatureMultiplier(nature, 'attack')),
    defense: calculateStat(normalizedBase.defense, ivs.defense, evs.defense, level, getNatureMultiplier(nature, 'defense')),
    spAtk: calculateStat(normalizedBase.spAtk, ivs.spAtk, evs.spAtk, level, getNatureMultiplier(nature, 'spAtk')),
    spDef: calculateStat(normalizedBase.spDef, ivs.spDef, evs.spDef, level, getNatureMultiplier(nature, 'spDef')),
    speed: calculateStat(normalizedBase.speed, ivs.speed, evs.speed, level, getNatureMultiplier(nature, 'speed')),
  };

  const total = Object.values(finalStats).reduce((sum, val) => sum + val, 0);
  const baseTotal = Object.values(normalizedBase).reduce((sum, val) => sum + val, 0);

  return {
    stats: finalStats,
    total,
    baseStats: normalizedBase,
    baseTotal,
  };
};

/**
 * Get min and max possible value for each stat at a given level
 */
export const getStatRange = (base, statKey, level = 100) => {
  const safeBase = Number(base) || 0;
  if (statKey === 'hp') {
    if (safeBase === 1) return { min: 1, max: 1 };
    const min = calculateHp(safeBase, 0, 0, level);
    const max = calculateHp(safeBase, 31, 252, level);
    return { min, max };
  } else {
    const min = calculateStat(safeBase, 0, 0, level, 0.9);
    const max = calculateStat(safeBase, 31, 252, level, 1.1);
    return { min, max };
  }
};

/**
 * Calculate total EVs used and check if within the 510 limit
 */
export const getEvBudget = (evs = {}) => {
  const total = STAT_KEYS.reduce((sum, key) => sum + (Number(evs[key]) || 0), 0);
  return {
    total,
    max: 510,
    remaining: Math.max(0, 510 - total),
    isOverLimit: total > 510,
  };
};

/**
 * Quick competitive presets
 */
export const IV_PRESETS = [
  {
    name: 'Max IVs (31)',
    ivs: { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 },
  },
  {
    name: 'No Good Atk (0 Atk)',
    ivs: { hp: 31, attack: 0, defense: 31, spAtk: 31, spDef: 31, speed: 31 },
  },
  {
    name: 'Trick Room (0 Spe)',
    ivs: { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 0 },
  },
  {
    name: 'Min IVs (0)',
    ivs: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
  },
];

export const EV_PRESETS = [
  {
    name: 'Physical Sweeper',
    desc: '252 Atk / 252 Spe / 4 HP',
    nature: 'Jolly',
    evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 },
  },
  {
    name: 'Special Sweeper',
    desc: '252 SpA / 252 Spe / 4 HP',
    nature: 'Timid',
    evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 },
  },
  {
    name: 'Physical Wall',
    desc: '252 HP / 252 Def / 4 SpD',
    nature: 'Impish',
    evs: { hp: 252, attack: 0, defense: 252, spAtk: 0, spDef: 4, speed: 0 },
  },
  {
    name: 'Special Wall',
    desc: '252 HP / 252 SpD / 4 Def',
    nature: 'Calm',
    evs: { hp: 252, attack: 0, defense: 4, spAtk: 0, spDef: 252, speed: 0 },
  },
  {
    name: 'Bulky Attacker',
    desc: '252 HP / 252 Atk / 4 Spe',
    nature: 'Adamant',
    evs: { hp: 252, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 4 },
  },
  {
    name: 'Reset (0 EVs)',
    desc: 'All stats set to 0',
    nature: 'Hardy',
    evs: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
  },
];
