import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pokemonIndex } from '../data/pokemonIndex';

const CAUGHT_STORAGE_KEY = '@pokedezz_caught_pokemon';
const DISCOVERED_STORAGE_KEY = '@pokedezz_discovered_pokemon';
const SHINIES_STORAGE_KEY = '@pokedezz_shiny_pokemon';

export const CollectionContext = createContext();

export const CollectionProvider = ({ children }) => {
  const [caught, setCaught] = useState([]);
  const [discovered, setDiscovered] = useState([]);
  const [shinies, setShinies] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load collection data from AsyncStorage on startup
  useEffect(() => {
    const loadCollection = async () => {
      try {
        const [savedCaught, savedDiscovered, savedShinies] = await Promise.all([
          AsyncStorage.getItem(CAUGHT_STORAGE_KEY),
          AsyncStorage.getItem(DISCOVERED_STORAGE_KEY),
          AsyncStorage.getItem(SHINIES_STORAGE_KEY),
        ]);

        if (savedCaught) {
          const parsed = JSON.parse(savedCaught);
          if (Array.isArray(parsed)) {
            setCaught(parsed.filter(id => Number.isInteger(id) && id > 0));
          }
        }

        if (savedDiscovered) {
          const parsed = JSON.parse(savedDiscovered);
          if (Array.isArray(parsed)) {
            setDiscovered(parsed.filter(id => Number.isInteger(id) && id > 0));
          }
        }

        if (savedShinies) {
          const parsed = JSON.parse(savedShinies);
          if (Array.isArray(parsed)) {
            setShinies(parsed.filter(id => Number.isInteger(id) && id > 0));
          }
        }
      } catch (err) {
        console.error('Error loading Pokédex collection:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCollection();
  }, []);

  // Check methods
  const isCaught = useCallback((pokemonId) => {
    const num = parseInt(pokemonId, 10);
    return Number.isInteger(num) && caught.includes(num);
  }, [caught]);

  const isDiscovered = useCallback((pokemonId) => {
    const num = parseInt(pokemonId, 10);
    return Number.isInteger(num) && (discovered.includes(num) || caught.includes(num));
  }, [discovered, caught]);

  const isShiny = useCallback((pokemonId) => {
    const num = parseInt(pokemonId, 10);
    return Number.isInteger(num) && shinies.includes(num);
  }, [shinies]);

  // Toggle Caught
  const toggleCaught = useCallback(async (pokemonId) => {
    const num = parseInt(pokemonId, 10);
    if (!Number.isInteger(num) || num <= 0) return;

    setCaught(prev => {
      const exists = prev.includes(num);
      const next = exists ? prev.filter(id => id !== num) : [...prev, num];
      AsyncStorage.setItem(CAUGHT_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    // Catching also automatically marks as discovered
    setDiscovered(prev => {
      if (!prev.includes(num)) {
        const next = [...prev, num];
        AsyncStorage.setItem(DISCOVERED_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      }
      return prev;
    });
  }, []);

  // Mark Discovered (when viewed in Pokédex)
  const markDiscovered = useCallback((pokemonId) => {
    const num = parseInt(pokemonId, 10);
    if (!Number.isInteger(num) || num <= 0) return;

    setDiscovered(prev => {
      if (!prev.includes(num)) {
        const next = [...prev, num];
        AsyncStorage.setItem(DISCOVERED_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      }
      return prev;
    });
  }, []);

  // Toggle Shiny Caught
  const toggleShiny = useCallback(async (pokemonId) => {
    const num = parseInt(pokemonId, 10);
    if (!Number.isInteger(num) || num <= 0) return;

    setShinies(prev => {
      const exists = prev.includes(num);
      const next = exists ? prev.filter(id => id !== num) : [...prev, num];
      AsyncStorage.setItem(SHINIES_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    // Having a shiny also counts as caught & discovered
    setCaught(prev => {
      if (!prev.includes(num)) {
        const next = [...prev, num];
        AsyncStorage.setItem(CAUGHT_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      }
      return prev;
    });

    setDiscovered(prev => {
      if (!prev.includes(num)) {
        const next = [...prev, num];
        AsyncStorage.setItem(DISCOVERED_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      }
      return prev;
    });
  }, []);

  // Batch mark caught
  const batchMarkCaught = useCallback(async (pokemonIds, markAsCaught = true) => {
    const validIds = pokemonIds.map(id => parseInt(id, 10)).filter(id => Number.isInteger(id) && id > 0);
    if (validIds.length === 0) return;

    setCaught(prev => {
      const set = new Set(prev);
      validIds.forEach(id => {
        if (markAsCaught) set.add(id);
        else set.delete(id);
      });
      const next = Array.from(set);
      AsyncStorage.setItem(CAUGHT_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    if (markAsCaught) {
      setDiscovered(prev => {
        const set = new Set(prev);
        validIds.forEach(id => set.add(id));
        const next = Array.from(set);
        AsyncStorage.setItem(DISCOVERED_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    }
  }, []);

  // Clear all collection data
  const clearCollection = useCallback(async () => {
    setCaught([]);
    setDiscovered([]);
    setShinies([]);
    await Promise.all([
      AsyncStorage.removeItem(CAUGHT_STORAGE_KEY),
      AsyncStorage.removeItem(DISCOVERED_STORAGE_KEY),
      AsyncStorage.removeItem(SHINIES_STORAGE_KEY),
    ]);
  }, []);

  const value = useMemo(() => ({
    caught,
    discovered,
    shinies,
    isLoaded,
    isCaught,
    isDiscovered,
    isShiny,
    toggleCaught,
    markDiscovered,
    toggleShiny,
    batchMarkCaught,
    clearCollection,
  }), [
    caught,
    discovered,
    shinies,
    isLoaded,
    isCaught,
    isDiscovered,
    isShiny,
    toggleCaught,
    markDiscovered,
    toggleShiny,
    batchMarkCaught,
    clearCollection,
  ]);

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
};
