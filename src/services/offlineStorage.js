/**
 * Offline Storage & Caching Service
 * Implements a high-performance 2-tier cache (L1 Memory + L2 AsyncStorage)
 * for Pokémon details, evolution chains, moves, and abilities.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@poke_offline_v1_';
const INDEX_KEY = '@poke_offline_index_v1';

// L1 In-Memory Caches for instantaneous sync access
const MAX_MEMORY_CACHE_ITEMS = 150;

const memoryCache = {
  details: new Map(),
  evolution: new Map(),
  moves: new Map(),
  abilities: new Map(),
};

const safeMemorySet = (cacheMap, key, value) => {
  if (cacheMap.size >= MAX_MEMORY_CACHE_ITEMS) {
    const oldestKey = cacheMap.keys().next().value;
    if (oldestKey !== undefined) {
      cacheMap.delete(oldestKey);
    }
  }
  cacheMap.set(key, value);
};

/**
 * Helper to manage the index of cached keys
 */
const getCacheIndex = async () => {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : { details: [], evolution: [], moves: [], abilities: [] };
  } catch (e) {
    return { details: [], evolution: [], moves: [], abilities: [] };
  }
};

const updateCacheIndex = async (type, key) => {
  try {
    const index = await getCacheIndex();
    if (!index[type]) index[type] = [];
    if (!index[type].includes(key)) {
      index[type].push(key);
      await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
    }
  } catch (e) {
    // Non-critical, ignore index update error
  }
};

// ── Pokémon Details Cache ───────────────────────────────────────────────────

export const getCachedPokemonDetails = async (idOrName) => {
  if (!idOrName) return null;
  const keyStr = String(idOrName).toLowerCase().trim();

  // 1. L1 Memory Hit
  if (memoryCache.details.has(keyStr)) {
    return memoryCache.details.get(keyStr);
  }

  // 2. L2 AsyncStorage Hit
  try {
    const storageKey = `${CACHE_PREFIX}details_${keyStr}`;
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) {
      const data = JSON.parse(raw);
      // Populate memory cache for both ID and Name for fast dual lookups
      if (data.id) safeMemorySet(memoryCache.details, String(data.id), data);
      if (data.name) safeMemorySet(memoryCache.details, data.name.toLowerCase(), data);
      return data;
    }
  } catch (e) {
    console.warn('Error reading cached details from AsyncStorage', e);
  }

  return null;
};

export const setCachedPokemonDetails = async (data) => {
  if (!data || !data.id) return;
  const idStr = String(data.id);
  const nameStr = data.name ? data.name.toLowerCase() : null;

  // Stamp with cached flag & timestamp
  const payload = {
    ...data,
    isCachedData: true,
    cachedAt: Date.now(),
  };

  // Save to L1 Memory
  safeMemorySet(memoryCache.details, idStr, payload);
  if (nameStr) safeMemorySet(memoryCache.details, nameStr, payload);

  // Save to L2 AsyncStorage
  try {
    const storageKeyId = `${CACHE_PREFIX}details_${idStr}`;
    await AsyncStorage.setItem(storageKeyId, JSON.stringify(payload));
    await updateCacheIndex('details', idStr);

    if (nameStr) {
      const storageKeyName = `${CACHE_PREFIX}details_${nameStr}`;
      await AsyncStorage.setItem(storageKeyName, JSON.stringify(payload));
      await updateCacheIndex('details', nameStr);
    }
  } catch (e) {
    console.warn('Error persisting cached details to AsyncStorage', e);
  }
};

// ── Evolution Chain Cache ───────────────────────────────────────────────────

export const getCachedEvolutionChain = async (pokemonId) => {
  if (!pokemonId) return null;
  const idStr = String(pokemonId);

  if (memoryCache.evolution.has(idStr)) {
    return memoryCache.evolution.get(idStr);
  }

  try {
    const storageKey = `${CACHE_PREFIX}evo_${idStr}`;
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) {
      const data = JSON.parse(raw);
      safeMemorySet(memoryCache.evolution, idStr, data);
      return data;
    }
  } catch (e) {
    console.warn('Error reading cached evo chain from AsyncStorage', e);
  }

  return null;
};

export const setCachedEvolutionChain = async (pokemonId, data) => {
  if (!pokemonId || !data) return;
  const idStr = String(pokemonId);

  safeMemorySet(memoryCache.evolution, idStr, data);

  try {
    const storageKey = `${CACHE_PREFIX}evo_${idStr}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    await updateCacheIndex('evolution', idStr);
  } catch (e) {
    console.warn('Error persisting evo chain to AsyncStorage', e);
  }
};

// ── Move Details Cache ───────────────────────────────────────────────────────

export const getCachedMove = async (moveName) => {
  if (!moveName) return null;
  const key = String(moveName).toLowerCase().trim();

  if (memoryCache.moves.has(key)) {
    return memoryCache.moves.get(key);
  }

  try {
    const storageKey = `${CACHE_PREFIX}move_${key}`;
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) {
      const data = JSON.parse(raw);
      safeMemorySet(memoryCache.moves, key, data);
      return data;
    }
  } catch (e) {
    // Ignore error
  }

  return null;
};

export const setCachedMove = async (moveName, data) => {
  if (!moveName || !data) return;
  const key = String(moveName).toLowerCase().trim();

  safeMemorySet(memoryCache.moves, key, data);

  try {
    const storageKey = `${CACHE_PREFIX}move_${key}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    await updateCacheIndex('moves', key);
  } catch (e) {
    // Ignore error
  }
};

// ── Ability Details Cache ───────────────────────────────────────────────────

export const getCachedAbility = async (abilityName) => {
  if (!abilityName) return null;
  const key = String(abilityName).toLowerCase().trim();

  if (memoryCache.abilities.has(key)) {
    return memoryCache.abilities.get(key);
  }

  try {
    const storageKey = `${CACHE_PREFIX}ability_${key}`;
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) {
      safeMemorySet(memoryCache.abilities, key, raw);
      return raw;
    }
  } catch (e) {
    // Ignore error
  }

  return null;
};

export const setCachedAbility = async (abilityName, text) => {
  if (!abilityName || !text) return;
  const key = String(abilityName).toLowerCase().trim();

  safeMemorySet(memoryCache.abilities, key, text);

  try {
    const storageKey = `${CACHE_PREFIX}ability_${key}`;
    await AsyncStorage.setItem(storageKey, text);
    await updateCacheIndex('abilities', key);
  } catch (e) {
    // Ignore error
  }
};

// ── Cache Statistics & Cleanup ───────────────────────────────────────────────

export const getOfflineCacheStats = async () => {
  try {
    const index = await getCacheIndex();
    // Unique pokemon (since details stores both ID and name)
    const uniquePokemon = new Set(
      (index.details || []).filter(k => !isNaN(parseInt(k, 10)))
    );

    return {
      pokemonCount: uniquePokemon.size,
      evolutionCount: (index.evolution || []).length,
      movesCount: (index.moves || []).length,
      abilitiesCount: (index.abilities || []).length,
      totalEntries:
        (index.details || []).length +
        (index.evolution || []).length +
        (index.moves || []).length +
        (index.abilities || []).length,
    };
  } catch (e) {
    return { pokemonCount: 0, evolutionCount: 0, movesCount: 0, abilitiesCount: 0, totalEntries: 0 };
  }
};

export const clearOfflineCache = async () => {
  try {
    // Clear Memory
    memoryCache.details.clear();
    memoryCache.evolution.clear();
    memoryCache.moves.clear();
    memoryCache.abilities.clear();

    // Clear AsyncStorage keys
    const index = await getCacheIndex();
    const allKeys = [];
    (index.details || []).forEach(k => allKeys.push(`${CACHE_PREFIX}details_${k}`));
    (index.evolution || []).forEach(k => allKeys.push(`${CACHE_PREFIX}evo_${k}`));
    (index.moves || []).forEach(k => allKeys.push(`${CACHE_PREFIX}move_${k}`));
    (index.abilities || []).forEach(k => allKeys.push(`${CACHE_PREFIX}ability_${k}`));
    allKeys.push(INDEX_KEY);

    await AsyncStorage.multiRemove(allKeys);
    return true;
  } catch (e) {
    console.error('Error clearing offline cache', e);
    return false;
  }
};
