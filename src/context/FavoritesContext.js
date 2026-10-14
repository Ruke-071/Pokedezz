import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { precachePokemon } from '../services/pokemonService';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isPrecaching, setIsPrecaching] = useState(false);
  const [precacheProgress, setPrecacheProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    // Load favorites from local storage
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('@favorite_pokemon');
        if (savedFavorites !== null) {
          const parsed = JSON.parse(savedFavorites);
          if (Array.isArray(parsed)) {
            const validIds = parsed.filter(id => Number.isInteger(id) && id > 0);
            setFavorites(validIds);
            // Silently ensure favorites are cached in background
            if (validIds.length > 0) {
              backgroundWarmupFavorites(validIds);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    loadFavorites();
  }, []);

  // Background non-blocking warm-up for favorites
  const backgroundWarmupFavorites = (ids) => {
    setTimeout(async () => {
      for (const id of ids.slice(0, 10)) {
        try {
          await precachePokemon(id);
        } catch (e) {}
      }
    }, 1500);
  };

  const addFavorite = async (pokemonId) => {
    try {
      const numericId = parseInt(pokemonId, 10);
      if (!Number.isInteger(numericId) || numericId <= 0) return;

      if (!favorites.includes(numericId)) {
        const newFavorites = [...favorites, numericId];
        setFavorites(newFavorites);
        await AsyncStorage.setItem('@favorite_pokemon', JSON.stringify(newFavorites));

        // Automatically pre-cache this favorited Pokémon for 100% offline access
        precachePokemon(numericId).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to add favorite', e);
    }
  };

  const removeFavorite = async (pokemonId) => {
    try {
      const numericId = parseInt(pokemonId, 10);
      if (!Number.isInteger(numericId) || numericId <= 0) return;

      const newFavorites = favorites.filter(id => id !== numericId);
      setFavorites(newFavorites);
      await AsyncStorage.setItem('@favorite_pokemon', JSON.stringify(newFavorites));
    } catch (e) {
      console.error('Failed to remove favorite', e);
    }
  };

  const isFavorite = useCallback((pokemonId) => {
    const numericId = parseInt(pokemonId, 10);
    if (!Number.isInteger(numericId)) return false;
    return favorites.includes(numericId);
  }, [favorites]);

  const toggleFavorite = async (pokemonId) => {
    const numericId = parseInt(pokemonId, 10);
    if (!Number.isInteger(numericId) || numericId <= 0) return;
    if (isFavorite(numericId)) {
      await removeFavorite(numericId);
    } else {
      await addFavorite(numericId);
    }
  };

  /**
   * Pre-caches all favorited Pokémon so they can be viewed offline
   */
  const precacheAllFavorites = async () => {
    if (favorites.length === 0 || isPrecaching) return;
    setIsPrecaching(true);
    setPrecacheProgress({ current: 0, total: favorites.length });

    for (let i = 0; i < favorites.length; i++) {
      const id = favorites[i];
      try {
        await precachePokemon(id);
      } catch (e) {
        // Continue with next
      }
      setPrecacheProgress({ current: i + 1, total: favorites.length });
    }

    setIsPrecaching(false);
  };

  const clearAllFavorites = async () => {
    try {
      setFavorites([]);
      await AsyncStorage.removeItem('@favorite_pokemon');
    } catch (e) {
      console.error('Failed to clear favorites', e);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
        precacheAllFavorites,
        clearAllFavorites,
        isPrecaching,
        precacheProgress,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
