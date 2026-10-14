/**
 * Moves and Abilities Comprehensive Database
 * Powered by allMovesAndAbilities.js (934+ core moves and 310+ abilities)
 */
import { ALL_MOVES, ALL_ABILITIES } from './allMovesAndAbilities.js';
import { pokemonIndex } from './pokemonIndex.js';

export const MOVES_DATABASE = ALL_MOVES;
export const ABILITIES_DATABASE = ALL_ABILITIES;

/**
 * Returns representative Pokémon that learn/share affinity with this move.
 */
export const getLearnersForMove = (move) => {
  if (!move) return [];
  const moveType = (move.type || '').toLowerCase();

  return pokemonIndex
    .filter(p => {
      const pTypes = (p.types || []).map(t => (typeof t === 'string' ? t : t.name).toLowerCase());
      return pTypes.includes(moveType);
    })
    .slice(0, 40);
};

/**
 * Returns all Pokémon that possess this ability using exact PokeAPI ID mappings.
 */
export const getPokemonForAbility = (ability) => {
  if (!ability) return [];

  if (ability.pokemonIds && ability.pokemonIds.length > 0) {
    const idSet = new Set(ability.pokemonIds);
    return pokemonIndex
      .filter(p => idSet.has(p.id) || idSet.has(p.speciesId))
      .slice(0, 50);
  }

  // Fallback to name search
  const abId = (ability.id || '').toLowerCase();
  return pokemonIndex.filter(p => p.name.toLowerCase().includes(abId)).slice(0, 30);
};
