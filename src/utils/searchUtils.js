/**
 * Advanced Pokémon Search Matcher
 * Provides multi-token, alias, and prefix/suffix-agnostic matching:
 * - Direct names ("charizard", "lucario")
 * - Reversed prefixes ("mega charizard", "gmax blastoise", "alolan raichu")
 * - Generic searches ("mega pokemon", "gmax pokemon", "legendary pokemon")
 * - Multi-word / type tokens ("fire dragon", "mega fire")
 * - Pokédex numbers ("6", "#006", "025")
 */

const FILLER_WORDS = new Set(['pokemon', 'pokémon', 'form', 'forme']);

const VARIANT_ALIASES = {
  gigantamax: 'gmax',
  gmax: 'gmax',
  mega: 'mega',
  alolan: 'alola',
  alola: 'alola',
  galarian: 'galar',
  galar: 'galar',
  hisuian: 'hisui',
  hisui: 'hisui',
  paldean: 'paldea',
  paldea: 'paldea',
};

/**
 * Checks if a Pokémon object matches a search query string.
 * @param {Object} pokemon - Pokémon object from pokemonIndex
 * @param {string} rawQuery - Search input string from user
 * @returns {boolean}
 */
export const matchesPokemonSearch = (pokemon, rawQuery) => {
  if (!rawQuery || !rawQuery.trim()) return true;
  if (!pokemon) return false;

  const cleanQuery = rawQuery.toLowerCase().trim().replace(/#/g, '');
  if (!cleanQuery) return true;

  // 1. Direct ID check (#6, 6, 006)
  const idStr = String(pokemon.id || '');
  const speciesIdStr = String(pokemon.speciesId || pokemon.id || '');
  const paddedId = idStr.padStart(3, '0');
  const paddedSpecies = speciesIdStr.padStart(3, '0');

  if (
    idStr === cleanQuery ||
    paddedId === cleanQuery ||
    speciesIdStr === cleanQuery ||
    paddedSpecies === cleanQuery
  ) {
    return true;
  }

  // 2. Tokenize query words
  const rawTokens = cleanQuery.split(/[\s\-_]+/).filter(Boolean);
  if (rawTokens.length === 0) return true;

  // Filter out filler words like "pokemon"
  const nonFillerTokens = rawTokens.filter(t => !FILLER_WORDS.has(t));
  if (nonFillerTokens.length === 0) {
    // If query consists purely of filler words like "pokemon" or "forme", treat as all-match
    return true;
  }
  const queryTokens = nonFillerTokens;

  // 3. Prepare searchable strings from the Pokémon
  const rawName = (pokemon.name || '').toLowerCase();
  const nameParts = rawName.split(/[\-_]+/);
  const rawNameSpaced = nameParts.join(' ');
  const variant = (pokemon.variant || '').toLowerCase();
  const types = (pokemon.types || []).map(t =>
    (typeof t === 'string' ? t : (t?.name || t?.type?.name || '')).toLowerCase()
  );

  // 4. Verify that EVERY token in query matches something about this Pokémon
  return queryTokens.every(token => {
    // Check ID match
    if (idStr.includes(token) || paddedId.includes(token)) return true;

    // Check alias mapping (e.g. "gigantamax" -> "gmax", "alolan" -> "alola")
    const alias = VARIANT_ALIASES[token];
    if (alias) {
      if (variant === alias) return true;
      if (rawName.includes(alias)) return true;
    }

    // Direct token substring in name (e.g. "charizard" in "charizard-mega-x", or "mega" in "charizard-mega-x")
    if (rawName.includes(token) || rawNameSpaced.includes(token)) return true;

    // Check variant
    if (variant && variant.includes(token)) return true;

    // Check types
    if (types.some(t => t.includes(token))) return true;

    // Check status attributes
    if (token === 'legendary' && pokemon.isLegendary) return true;
    if (token === 'mythical' && pokemon.isMythical) return true;

    return false;
  });
};
