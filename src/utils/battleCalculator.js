import { pokemonIndex } from '../data/pokemonIndex';
import { calculatePokemonStats, NATURES } from './statCalculator';
import { TYPE_COLORS, ALL_POKEMON_TYPES, TYPE_EFFECTIVENESS } from './teamUtils';

export { TYPE_COLORS, ALL_POKEMON_TYPES };

// ─── Stat Stage Multipliers (-6 to +6) ─────────────────────────────────────────
export const STAT_STAGE_MULTIPLIERS = {
  '-6': 2 / 8,
  '-5': 2 / 7,
  '-4': 2 / 6,
  '-3': 2 / 5,
  '-2': 2 / 4,
  '-1': 2 / 3,
  '0': 2 / 2,
  '1': 3 / 2,
  '2': 4 / 2,
  '3': 5 / 2,
  '4': 6 / 2,
  '5': 7 / 2,
  '6': 8 / 2,
};

// ─── Weather Options ──────────────────────────────────────────────────────────
export const WEATHERS = [
  { id: 'none', name: 'None / Clear', icon: 'sunny-outline', color: '#CBD5E0' },
  { id: 'sun', name: 'Harsh Sun', icon: 'flame', color: '#F08030' },
  { id: 'rain', name: 'Rain', icon: 'rainy', color: '#6890F0' },
  { id: 'sandstorm', name: 'Sandstorm', icon: 'planet-outline', color: '#E0C068' },
  { id: 'snow', name: 'Snow / Hail', icon: 'snow', color: '#98D8D8' },
];

// ─── Terrain Options ──────────────────────────────────────────────────────────
export const TERRAINS = [
  { id: 'none', name: 'None', icon: 'remove-circle-outline', color: '#CBD5E0' },
  { id: 'electric', name: 'Electric', icon: 'flash', color: '#F8D030' },
  { id: 'grassy', name: 'Grassy', icon: 'leaf', color: '#78C850' },
  { id: 'psychic', name: 'Psychic', icon: 'eye', color: '#F85888' },
  { id: 'misty', name: 'Misty', icon: 'cloud', color: '#EE99AC' },
];

// ─── Battle Items ─────────────────────────────────────────────────────────────
export const ATTACKER_ITEMS = [
  { id: 'none', name: 'None', desc: 'No damage modifier' },
  { id: 'life-orb', name: 'Life Orb', desc: '1.3x Damage boost to all attacks' },
  { id: 'choice-band', name: 'Choice Band', desc: '1.5x Attack stat boost (Physical)' },
  { id: 'choice-specs', name: 'Choice Specs', desc: '1.5x Sp. Atk stat boost (Special)' },
  { id: 'expert-belt', name: 'Expert Belt', desc: '1.2x Damage if Super Effective' },
  { id: 'type-boost', name: 'Type Item (Charcoal/Magnet/etc.)', desc: '1.2x Damage to matching move type' },
  { id: 'muscle-band', name: 'Muscle Band', desc: '1.1x Damage to Physical attacks' },
  { id: 'wise-glasses', name: 'Wise Glasses', desc: '1.1x Damage to Special attacks' },
  { id: 'choice-scarf', name: 'Choice Scarf', desc: '1.5x Speed stat boost' },
];

export const DEFENDER_ITEMS = [
  { id: 'none', name: 'None', desc: 'No defensive modifier' },
  { id: 'assault-vest', name: 'Assault Vest', desc: '1.5x Sp. Defense stat' },
  { id: 'eviolite', name: 'Eviolite', desc: '1.5x Defense & Sp. Defense (NFE)' },
  { id: 'focus-sash', name: 'Focus Sash', desc: 'Survives at 1 HP from 100% full health' },
  { id: 'leftovers', name: 'Leftovers', desc: 'Passive HP recovery (1/16 per turn)' },
  { id: 'resist-berry', name: 'Resist Berry', desc: 'Halves (0.5x) Super Effective move damage' },
];

// ─── Curated Competitive Moves Database (100+ Moves) ──────────────────────────
export const COMPETITIVE_MOVES = [
  // Normal
  { name: 'Double-Edge', type: 'normal', category: 'physical', power: 120, accuracy: 100 },
  { name: 'Body Slam', type: 'normal', category: 'physical', power: 85, accuracy: 100 },
  { name: 'Facade', type: 'normal', category: 'physical', power: 70, accuracy: 100 },
  { name: 'Extreme Speed', type: 'normal', category: 'physical', power: 80, accuracy: 100, priority: 2 },
  { name: 'Hyper Voice', type: 'normal', category: 'special', power: 90, accuracy: 100 },
  { name: 'Boomburst', type: 'normal', category: 'special', power: 140, accuracy: 100 },
  { name: 'Blood Moon', type: 'normal', category: 'special', power: 140, accuracy: 100 },

  // Fire
  { name: 'Flamethrower', type: 'fire', category: 'special', power: 90, accuracy: 100 },
  { name: 'Fire Blast', type: 'fire', category: 'special', power: 110, accuracy: 85 },
  { name: 'Overheat', type: 'fire', category: 'special', power: 130, accuracy: 90 },
  { name: 'Flare Blitz', type: 'fire', category: 'physical', power: 120, accuracy: 100 },
  { name: 'Fire Punch', type: 'fire', category: 'physical', power: 75, accuracy: 100 },
  { name: 'Bitter Blade', type: 'fire', category: 'physical', power: 90, accuracy: 100 },
  { name: 'Torch Song', type: 'fire', category: 'special', power: 80, accuracy: 100 },
  { name: 'Heat Wave', type: 'fire', category: 'special', power: 95, accuracy: 90 },

  // Water
  { name: 'Surf', type: 'water', category: 'special', power: 90, accuracy: 100 },
  { name: 'Hydro Pump', type: 'water', category: 'special', power: 110, accuracy: 80 },
  { name: 'Scald', type: 'water', category: 'special', power: 80, accuracy: 100 },
  { name: 'Waterfall', type: 'water', category: 'physical', power: 80, accuracy: 100 },
  { name: 'Liquidation', type: 'water', category: 'physical', power: 85, accuracy: 100 },
  { name: 'Aqua Jet', type: 'water', category: 'physical', power: 40, accuracy: 100, priority: 1 },
  { name: 'Wave Crash', type: 'water', category: 'physical', power: 120, accuracy: 100 },
  { name: 'Hydro Steam', type: 'water', category: 'special', power: 90, accuracy: 100 },
  { name: 'Surging Strikes', type: 'water', category: 'physical', power: 75, accuracy: 100 },

  // Grass
  { name: 'Giga Drain', type: 'grass', category: 'special', power: 75, accuracy: 100 },
  { name: 'Energy Ball', type: 'grass', category: 'special', power: 90, accuracy: 100 },
  { name: 'Leaf Storm', type: 'grass', category: 'special', power: 130, accuracy: 90 },
  { name: 'Wood Hammer', type: 'grass', category: 'physical', power: 120, accuracy: 100 },
  { name: 'Seed Bomb', type: 'grass', category: 'physical', power: 80, accuracy: 100 },
  { name: 'Power Whip', type: 'grass', category: 'physical', power: 120, accuracy: 85 },
  { name: 'Flower Trick', type: 'grass', category: 'physical', power: 70, accuracy: 100 },
  { name: 'Grassy Glide', type: 'grass', category: 'physical', power: 55, accuracy: 100 },

  // Electric
  { name: 'Thunderbolt', type: 'electric', category: 'special', power: 90, accuracy: 100 },
  { name: 'Thunder', type: 'electric', category: 'special', power: 110, accuracy: 70 },
  { name: 'Volt Switch', type: 'electric', category: 'special', power: 70, accuracy: 100 },
  { name: 'Wild Charge', type: 'electric', category: 'physical', power: 90, accuracy: 100 },
  { name: 'Supercell Slam', type: 'electric', category: 'physical', power: 100, accuracy: 95 },
  { name: 'Electro Drift', type: 'electric', category: 'special', power: 100, accuracy: 100 },
  { name: 'Plasma Fists', type: 'electric', category: 'physical', power: 100, accuracy: 100 },

  // Ice
  { name: 'Ice Beam', type: 'ice', category: 'special', power: 90, accuracy: 100 },
  { name: 'Blizzard', type: 'ice', category: 'special', power: 110, accuracy: 70 },
  { name: 'Freeze-Dry', type: 'ice', category: 'special', power: 70, accuracy: 100 },
  { name: 'Ice Spinner', type: 'ice', category: 'physical', power: 80, accuracy: 100 },
  { name: 'Icicle Crash', type: 'ice', category: 'physical', power: 85, accuracy: 90 },
  { name: 'Ice Shard', type: 'ice', category: 'physical', power: 40, accuracy: 100, priority: 1 },
  { name: 'Triple Axel', type: 'ice', category: 'physical', power: 120, accuracy: 90 },
  { name: 'Glacial Lance', type: 'ice', category: 'physical', power: 120, accuracy: 100 },

  // Fighting
  { name: 'Close Combat', type: 'fighting', category: 'physical', power: 120, accuracy: 100 },
  { name: 'Drain Punch', type: 'fighting', category: 'physical', power: 75, accuracy: 100 },
  { name: 'High Jump Kick', type: 'fighting', category: 'physical', power: 130, accuracy: 90 },
  { name: 'Sacred Sword', type: 'fighting', category: 'physical', power: 90, accuracy: 100 },
  { name: 'Focus Blast', type: 'fighting', category: 'special', power: 120, accuracy: 70 },
  { name: 'Aura Sphere', type: 'fighting', category: 'special', power: 80, accuracy: 100 },
  { name: 'Collision Course', type: 'fighting', category: 'physical', power: 100, accuracy: 100 },
  { name: 'Wicked Blow', type: 'dark', category: 'physical', power: 75, accuracy: 100 },
  { name: 'Body Press', type: 'fighting', category: 'physical', power: 80, accuracy: 100 },

  // Poison
  { name: 'Sludge Bomb', type: 'poison', category: 'special', power: 90, accuracy: 100 },
  { name: 'Sludge Wave', type: 'poison', category: 'special', power: 95, accuracy: 100 },
  { name: 'Gunk Shot', type: 'poison', category: 'physical', power: 120, accuracy: 80 },
  { name: 'Poison Jab', type: 'poison', category: 'physical', power: 80, accuracy: 100 },
  { name: 'Mortal Spin', type: 'poison', category: 'physical', power: 30, accuracy: 100 },

  // Ground
  { name: 'Earthquake', type: 'ground', category: 'physical', power: 100, accuracy: 100 },
  { name: 'Earth Power', type: 'ground', category: 'special', power: 90, accuracy: 100 },
  { name: 'High Horsepower', type: 'ground', category: 'physical', power: 95, accuracy: 95 },
  { name: 'Headlong Rush', type: 'ground', category: 'physical', power: 120, accuracy: 100 },
  { name: 'Precipice Blades', type: 'ground', category: 'physical', power: 120, accuracy: 85 },

  // Flying
  { name: 'Brave Bird', type: 'flying', category: 'physical', power: 120, accuracy: 100 },
  { name: 'Acrobatics', type: 'flying', category: 'physical', power: 110, accuracy: 100 },
  { name: 'Air Slash', type: 'flying', category: 'special', power: 75, accuracy: 95 },
  { name: 'Hurricane', type: 'flying', category: 'special', power: 110, accuracy: 70 },
  { name: 'Bleakwind Storm', type: 'flying', category: 'special', power: 100, accuracy: 80 },

  // Psychic
  { name: 'Psychic', type: 'psychic', category: 'special', power: 90, accuracy: 100 },
  { name: 'Psyshock', type: 'psychic', category: 'special', power: 80, accuracy: 100 },
  { name: 'Zen Headbutt', type: 'psychic', category: 'physical', power: 80, accuracy: 90 },
  { name: 'Psychic Fangs', type: 'psychic', category: 'physical', power: 85, accuracy: 100 },
  { name: 'Expanding Force', type: 'psychic', category: 'special', power: 80, accuracy: 100 },

  // Bug
  { name: 'Bug Buzz', type: 'bug', category: 'special', power: 90, accuracy: 100 },
  { name: 'U-turn', type: 'bug', category: 'physical', power: 70, accuracy: 100 },
  { name: 'First Impression', type: 'bug', category: 'physical', power: 90, accuracy: 100, priority: 2 },
  { name: 'Leech Life', type: 'bug', category: 'physical', power: 80, accuracy: 100 },
  { name: 'Megahorn', type: 'bug', category: 'physical', power: 120, accuracy: 85 },

  // Rock
  { name: 'Stone Edge', type: 'rock', category: 'physical', power: 100, accuracy: 80 },
  { name: 'Rock Slide', type: 'rock', category: 'physical', power: 75, accuracy: 90 },
  { name: 'Power Gem', type: 'rock', category: 'special', power: 80, accuracy: 100 },
  { name: 'Head Smash', type: 'rock', category: 'physical', power: 150, accuracy: 80 },
  { name: 'Diamond Storm', type: 'rock', category: 'physical', power: 100, accuracy: 95 },

  // Ghost
  { name: 'Shadow Ball', type: 'ghost', category: 'special', power: 80, accuracy: 100 },
  { name: 'Shadow Claw', type: 'ghost', category: 'physical', power: 70, accuracy: 100 },
  { name: 'Shadow Sneak', type: 'ghost', category: 'physical', power: 40, accuracy: 100, priority: 1 },
  { name: 'Poltergeist', type: 'ghost', category: 'physical', power: 110, accuracy: 90 },
  { name: 'Astral Barrage', type: 'ghost', category: 'special', power: 120, accuracy: 100 },
  { name: 'Rage Fist', type: 'ghost', category: 'physical', power: 100, accuracy: 100 },
  { name: 'Last Respects', type: 'ghost', category: 'physical', power: 100, accuracy: 100 },

  // Dragon
  { name: 'Draco Meteor', type: 'dragon', category: 'special', power: 130, accuracy: 90 },
  { name: 'Dragon Pulse', type: 'dragon', category: 'special', power: 85, accuracy: 100 },
  { name: 'Dragon Claw', type: 'dragon', category: 'physical', power: 80, accuracy: 100 },
  { name: 'Outrage', type: 'dragon', category: 'physical', power: 120, accuracy: 100 },
  { name: 'Scale Shot', type: 'dragon', category: 'physical', power: 100, accuracy: 90 },
  { name: 'Glaive Rush', type: 'dragon', category: 'physical', power: 120, accuracy: 100 },

  // Dark
  { name: 'Dark Pulse', type: 'dark', category: 'special', power: 80, accuracy: 100 },
  { name: 'Crunch', type: 'dark', category: 'physical', power: 80, accuracy: 100 },
  { name: 'Knock Off', type: 'dark', category: 'physical', power: 65, accuracy: 100 },
  { name: 'Sucker Punch', type: 'dark', category: 'physical', power: 70, accuracy: 100, priority: 1 },
  { name: 'Foul Play', type: 'dark', category: 'physical', power: 95, accuracy: 100 },
  { name: 'Kowtow Cleave', type: 'dark', category: 'physical', power: 85, accuracy: 100 },

  // Steel
  { name: 'Flash Cannon', type: 'steel', category: 'special', power: 80, accuracy: 100 },
  { name: 'Iron Head', type: 'steel', category: 'physical', power: 80, accuracy: 100 },
  { name: 'Heavy Slam', type: 'steel', category: 'physical', power: 100, accuracy: 100 },
  { name: 'Make It Rain', type: 'steel', category: 'special', power: 120, accuracy: 100 },
  { name: 'Gigaton Hammer', type: 'steel', category: 'physical', power: 160, accuracy: 100 },
  { name: 'Bullet Punch', type: 'steel', category: 'physical', power: 40, accuracy: 100, priority: 1 },

  // Fairy
  { name: 'Moonblast', type: 'fairy', category: 'special', power: 95, accuracy: 100 },
  { name: 'Dazzling Gleam', type: 'fairy', category: 'special', power: 80, accuracy: 100 },
  { name: 'Play Rough', type: 'fairy', category: 'physical', power: 90, accuracy: 90 },
  { name: 'Spirit Break', type: 'fairy', category: 'physical', power: 75, accuracy: 100 },
];

// ─── Calculate Move Type Effectiveness Against Dual Types ─────────────────────
export const calculateTypeEffectiveness = (moveType, defenderTypes = [], defenderAbility = 'none') => {
  if (!moveType || defenderTypes.length === 0) return 1.0;
  const mt = moveType.toLowerCase();

  // Ability Immunities
  if (defenderAbility === 'levitate' && mt === 'ground') return 0;
  if (defenderAbility === 'flash-fire' && mt === 'fire') return 0;
  if (['water-absorb', 'storm-drain', 'dry-skin'].includes(defenderAbility) && mt === 'water') return 0;
  if (['volt-absorb', 'motor-drive', 'lightning-rod'].includes(defenderAbility) && mt === 'electric') return 0;
  if (defenderAbility === 'sap-sipper' && mt === 'grass') return 0;
  if (defenderAbility === 'earth-eater' && mt === 'ground') return 0;

  let multiplier = 1.0;

  defenderTypes.forEach(dt => {
    const targetType = dt.toLowerCase();
    const eff = TYPE_EFFECTIVENESS[targetType];
    if (!eff) return;

    if (eff.noDamageFrom.includes(mt)) {
      multiplier *= 0;
    } else if (eff.doubleDamageFrom.includes(mt)) {
      multiplier *= 2;
    } else if (eff.halfDamageFrom.includes(mt)) {
      multiplier *= 0.5;
    }
  });

  // Wonder Guard only allows super effective hits
  if (defenderAbility === 'wonder-guard' && multiplier <= 1.0) {
    return 0;
  }

  return multiplier;
};

// ─── Complete 18-Type Matchup Analysis for Defender ───────────────────────────
export const calculateDefenderTypeMatrix = (defenderTypes = [], defenderAbility = 'none') => {
  const result = {
    superSuperEffective: [], // 4x
    superEffective: [],      // 2x
    neutral: [],             // 1x
    resisted: [],            // 0.5x
    doubleResisted: [],      // 0.25x
    immune: [],              // 0x
  };

  ALL_POKEMON_TYPES.forEach(type => {
    const eff = calculateTypeEffectiveness(type, defenderTypes, defenderAbility);
    if (eff === 0) {
      result.immune.push({ type, multiplier: 0 });
    } else if (eff >= 4) {
      result.superSuperEffective.push({ type, multiplier: 4 });
    } else if (eff >= 2) {
      result.superEffective.push({ type, multiplier: 2 });
    } else if (eff === 1) {
      result.neutral.push({ type, multiplier: 1 });
    } else if (eff === 0.5) {
      result.resisted.push({ type, multiplier: 0.5 });
    } else if (eff <= 0.25) {
      result.doubleResisted.push({ type, multiplier: 0.25 });
    }
  });

  return result;
};

// ─── Calculate Effective Stat with Stages & Boosts ────────────────────────────
export const getEffectiveStat = (rawStat, stage = 0) => {
  const clampedStage = Math.max(-6, Math.min(6, stage));
  const mult = STAT_STAGE_MULTIPLIERS[String(clampedStage)] || 1.0;
  return Math.floor(rawStat * mult);
};

// ─── Gen 9 Authentic Battle Damage Formula ────────────────────────────────────
export const calculateBattleDamage = ({
  attacker,          // Object with stats, types, level, etc.
  defender,          // Object with stats, types, level, etc.
  move,              // { name, type, category: 'physical'|'special', power }
  attackerStage = 0, // -6 to +6 stat stage
  defenderStage = 0, // -6 to +6 stat stage
  isCrit = false,
  weather = 'none',  // 'none' | 'sun' | 'rain' | 'sandstorm' | 'snow'
  terrain = 'none',  // 'none' | 'electric' | 'grassy' | 'psychic' | 'misty'
  attackerItem = 'none',
  defenderItem = 'none',
  attackerAbility = 'none',
  defenderAbility = 'none',
  isBurned = false,
  hasReflect = false,
  hasLightScreen = false,
  isDoubles = false,
}) => {
  if (!attacker || !defender || !move || !move.power || move.power <= 0) {
    return {
      damageRolls: [0],
      minDamage: 0,
      maxDamage: 0,
      minPercent: 0,
      maxPercent: 0,
      effectiveness: 1.0,
      isStab: false,
      koDescription: 'No damage dealt',
      hitsToKo: null,
      attackerSpeed: 0,
      defenderSpeed: 0,
      speedAdvantage: 'tie',
    };
  }

  const level = attacker.level || 100;
  const power = Number(move.power) || 50;
  const isPhysical = move.category === 'physical';

  // 1. Raw Stats
  let attackStat = isPhysical ? attacker.stats.attack : attacker.stats.spAtk;
  let defenseStat = isPhysical ? defender.stats.defense : defender.stats.spDef;

  // 2. Stat Stages (-6 to +6)
  // On crits, negative attack stages and positive defense stages are ignored
  let effectiveAttackerStage = attackerStage;
  let effectiveDefenderStage = defenderStage;
  if (isCrit) {
    if (effectiveAttackerStage < 0) effectiveAttackerStage = 0;
    if (effectiveDefenderStage > 0) effectiveDefenderStage = 0;
  }

  attackStat = getEffectiveStat(attackStat, effectiveAttackerStage);
  defenseStat = getEffectiveStat(defenseStat, effectiveDefenderStage);

  // 3. Ability boosts to raw stats
  if (attackerAbility === 'huge-power' || attackerAbility === 'pure-power') {
    if (isPhysical) attackStat *= 2;
  }
  if (attackerAbility === 'guts' && isBurned && isPhysical) {
    attackStat = Math.floor(attackStat * 1.5);
  }

  // Defender Ability/Weather stat boosts
  if (weather === 'sandstorm' && defender.types.includes('rock') && !isPhysical) {
    defenseStat = Math.floor(defenseStat * 1.5);
  }
  if (weather === 'snow' && defender.types.includes('ice') && isPhysical) {
    defenseStat = Math.floor(defenseStat * 1.5);
  }
  if (defenderAbility === 'thick-fat' && (move.type === 'fire' || move.type === 'ice')) {
    attackStat = Math.floor(attackStat * 0.5);
  }

  // 4. Item stat boosts
  if (attackerItem === 'choice-band' && isPhysical) {
    attackStat = Math.floor(attackStat * 1.5);
  } else if (attackerItem === 'choice-specs' && !isPhysical) {
    attackStat = Math.floor(attackStat * 1.5);
  }

  if (defenderItem === 'assault-vest' && !isPhysical) {
    defenseStat = Math.floor(defenseStat * 1.5);
  } else if (defenderItem === 'eviolite') {
    defenseStat = Math.floor(defenseStat * 1.5);
  }

  // 5. Base Damage Formula
  // ( (2 * Level / 5 + 2) * Power * Attack / Defense ) / 50 + 2
  let baseDamage = Math.floor(
    (Math.floor((2 * level) / 5 + 2) * power * attackStat) / Math.max(1, defenseStat)
  );
  baseDamage = Math.floor(baseDamage / 50) + 2;

  // 6. Doubles Spread Modifier (0.75x)
  if (isDoubles) {
    baseDamage = Math.floor(baseDamage * 0.75);
  }

  // 7. Weather Multiplier
  let weatherMult = 1.0;
  if (weather === 'sun') {
    if (move.type === 'fire') weatherMult = 1.5;
    else if (move.type === 'water') weatherMult = 0.5;
  } else if (weather === 'rain') {
    if (move.type === 'water') weatherMult = 1.5;
    else if (move.type === 'fire') weatherMult = 0.5;
  }
  baseDamage = Math.floor(baseDamage * weatherMult);

  // 8. Critical Hit (1.5x in Gen 6+)
  if (isCrit) {
    baseDamage = Math.floor(baseDamage * 1.5);
  }

  // 9. STAB (Same Type Attack Bonus)
  const isStab = attacker.types.some(t => t.toLowerCase() === move.type.toLowerCase());
  let stabMult = 1.0;
  if (isStab) {
    stabMult = attackerAbility === 'adaptability' ? 2.0 : 1.5;
  }

  // 10. Type Effectiveness Multiplier
  const effectiveness = calculateTypeEffectiveness(move.type, defender.types, defenderAbility);

  // If immune, damage is 0
  if (effectiveness === 0) {
    return {
      damageRolls: Array(16).fill(0),
      minDamage: 0,
      maxDamage: 0,
      minPercent: 0,
      maxPercent: 0,
      effectiveness: 0,
      isStab,
      koDescription: 'Does not affect ' + (defender.name || 'target') + ' (0x)',
      hitsToKo: null,
      attackerSpeed: attacker.stats.speed,
      defenderSpeed: defender.stats.speed,
      speedAdvantage: 'tie',
    };
  }

  // 11. Burn Penalty (0.5x to physical attacks, unless Guts)
  let burnMult = 1.0;
  if (isBurned && isPhysical && attackerAbility !== 'guts') {
    burnMult = 0.5;
  }

  // 12. Screen Reduction (Reflect / Light Screen: 0.5x in singles, 0.66x in doubles)
  let screenMult = 1.0;
  if (!isCrit) {
    if (isPhysical && hasReflect) screenMult = isDoubles ? 0.66 : 0.5;
    if (!isPhysical && hasLightScreen) screenMult = isDoubles ? 0.66 : 0.5;
  }

  // 13. Terrain Modifiers
  let terrainMult = 1.0;
  if (terrain === 'electric' && move.type === 'electric') terrainMult = 1.3;
  if (terrain === 'grassy') {
    if (move.type === 'grass') terrainMult = 1.3;
    if (['earthquake', 'bulldoze', 'magnitude'].includes(move.name.toLowerCase())) terrainMult = 0.5;
  }
  if (terrain === 'psychic' && move.type === 'psychic') terrainMult = 1.3;
  if (terrain === 'misty' && move.type === 'dragon') terrainMult = 0.5;

  // 14. Other Item Modifiers
  let itemDamageMult = 1.0;
  if (attackerItem === 'life-orb') itemDamageMult *= 1.3;
  if (attackerItem === 'expert-belt' && effectiveness > 1.0) itemDamageMult *= 1.2;
  if (attackerItem === 'type-boost') itemDamageMult *= 1.2;
  if (attackerItem === 'muscle-band' && isPhysical) itemDamageMult *= 1.1;
  if (attackerItem === 'wise-glasses' && !isPhysical) itemDamageMult *= 1.1;

  if (defenderItem === 'resist-berry' && effectiveness > 1.0) {
    itemDamageMult *= 0.5;
  }

  // 15. Other Ability Modifiers
  let abilityDamageMult = 1.0;
  if (attackerAbility === 'sheer-force') abilityDamageMult *= 1.3;
  if (attackerAbility === 'tinted-lens' && effectiveness < 1.0) abilityDamageMult *= 2.0;
  if (attackerAbility === 'technician' && power <= 60) abilityDamageMult *= 1.5;

  if (['solid-rock', 'filter', 'prism-armor'].includes(defenderAbility) && effectiveness > 1.0) {
    abilityDamageMult *= 0.75;
  }
  if (['multiscale', 'shadow-shield'].includes(defenderAbility)) {
    abilityDamageMult *= 0.5; // At 100% HP
  }

  // Combine multipliers into the pre-roll base
  const totalMult = stabMult * effectiveness * burnMult * screenMult * terrainMult * itemDamageMult * abilityDamageMult;

  // 16. Calculate all 16 Random Rolls (85% to 100%)
  const defenderMaxHp = Math.max(1, defender.stats.hp);
  const damageRolls = [];

  for (let r = 85; r <= 100; r++) {
    let rollDamage = Math.floor((baseDamage * r) / 100);
    rollDamage = Math.floor(rollDamage * totalMult);
    rollDamage = Math.max(1, rollDamage); // At least 1 damage if not immune

    // Focus Sash check (can't OHKO from full HP)
    if (defenderItem === 'focus-sash' && rollDamage >= defenderMaxHp) {
      rollDamage = defenderMaxHp - 1;
    }

    damageRolls.push(rollDamage);
  }

  const minDamage = damageRolls[0];
  const maxDamage = damageRolls[damageRolls.length - 1];

  const minPercent = Number(((minDamage / defenderMaxHp) * 100).toFixed(1));
  const maxPercent = Number(((maxDamage / defenderMaxHp) * 100).toFixed(1));

  // 17. Calculate KO Probability
  let koDescription = '';
  let hitsToKo = null;

  const ohkoRolls = damageRolls.filter(d => d >= defenderMaxHp).length;
  if (ohkoRolls === 16) {
    koDescription = 'Guaranteed OHKO (100%)';
    hitsToKo = 1;
  } else if (ohkoRolls > 0) {
    const chance = ((ohkoRolls / 16) * 100).toFixed(1);
    koDescription = `${chance}% chance to OHKO`;
    hitsToKo = 1;
  } else {
    // Check 2HKO
    let twoHkoRolls = 0;
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        if (damageRolls[i] + damageRolls[j] >= defenderMaxHp) {
          twoHkoRolls++;
        }
      }
    }
    const twoHkoChance = ((twoHkoRolls / 256) * 100).toFixed(1);
    if (twoHkoRolls === 256) {
      koDescription = 'Guaranteed 2HKO (100%)';
      hitsToKo = 2;
    } else if (twoHkoRolls > 0) {
      koDescription = `${twoHkoChance}% chance to 2HKO`;
      hitsToKo = 2;
    } else {
      const minHits = Math.ceil(defenderMaxHp / maxDamage);
      const maxHits = Math.ceil(defenderMaxHp / minDamage);
      hitsToKo = minHits;
      koDescription = minHits === maxHits ? `Guaranteed ${minHits}HKO` : `Possible ${minHits}-${maxHits}HKO`;
    }
  }

  // 18. Speed Advantage Calculation
  let attackerSpeed = attacker.stats.speed;
  let defenderSpeed = defender.stats.speed;

  if (attackerItem === 'choice-scarf') attackerSpeed = Math.floor(attackerSpeed * 1.5);
  if (defenderItem === 'choice-scarf') defenderSpeed = Math.floor(defenderSpeed * 1.5);

  let speedAdvantage = 'tie';
  if (attackerSpeed > defenderSpeed) speedAdvantage = 'attacker';
  else if (defenderSpeed > attackerSpeed) speedAdvantage = 'defender';

  return {
    damageRolls,
    minDamage,
    maxDamage,
    minPercent,
    maxPercent,
    effectiveness,
    isStab,
    koDescription,
    hitsToKo,
    attackerSpeed,
    defenderSpeed,
    speedAdvantage,
    defenderMaxHp,
  };
};
