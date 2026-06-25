import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Load favorites from local storage
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('@favorite_pokemon');
        if (savedFavorites !== null) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    loadFavorites();
  }, []);

  const addFavorite = async (pokemonId) => {
    try {
      const numericId = parseInt(pokemonId, 10);
      if (!favorites.includes(numericId)) {
        const newFavorites = [...favorites, numericId];
        setFavorites(newFavorites);
        await AsyncStorage.setItem('@favorite_pokemon', JSON.stringify(newFavorites));
      }
    } catch (e) {
      console.error('Failed to add favorite', e);
    }
  };

  const removeFavorite = async (pokemonId) => {
    try {
      const numericId = parseInt(pokemonId, 10);
      const newFavorites = favorites.filter(id => id !== numericId);
      setFavorites(newFavorites);
      await AsyncStorage.setItem('@favorite_pokemon', JSON.stringify(newFavorites));
    } catch (e) {
      console.error('Failed to remove favorite', e);
    }
  };

  const isFavorite = (pokemonId) => {
    const numericId = parseInt(pokemonId, 10);
    return favorites.includes(numericId);
  };

  const toggleFavorite = async (pokemonId) => {
    const numericId = parseInt(pokemonId, 10);
    if (isFavorite(numericId)) {
      await removeFavorite(numericId);
    } else {
      await addFavorite(numericId);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
