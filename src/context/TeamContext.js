import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [team, setTeam] = useState([]); // Array of pokemon objects (containing id, name, types, stats)

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const savedTeam = await AsyncStorage.getItem('@pokemon_team');
        if (savedTeam !== null) {
          setTeam(JSON.parse(savedTeam));
        }
      } catch (e) {
        console.error('Failed to load team', e);
      }
    };
    loadTeam();
  }, []);

  const addToTeam = async (pokemon) => {
    try {
      if (team.length >= 6) {
        return { success: false, message: "Team is full! Maximum 6 Pokémon allowed." };
      }
      
      // Avoid duplicate Pokémon on the team
      if (team.some(p => p.id === pokemon.id)) {
        return { success: false, message: `${pokemon.name.toUpperCase()} is already in your team.` };
      }

      const newTeam = [...team, pokemon];
      setTeam(newTeam);
      await AsyncStorage.setItem('@pokemon_team', JSON.stringify(newTeam));
      return { success: true, message: `${pokemon.name.toUpperCase()} added to your team.` };
    } catch (e) {
      console.error('Failed to add to team', e);
      return { success: false, message: "Something went wrong." };
    }
  };

  const removeFromTeam = async (pokemonId) => {
    try {
      const numericId = parseInt(pokemonId, 10);
      const newTeam = team.filter(p => p.id !== numericId);
      setTeam(newTeam);
      await AsyncStorage.setItem('@pokemon_team', JSON.stringify(newTeam));
      return { success: true, message: "Pokémon removed from team." };
    } catch (e) {
      console.error('Failed to remove from team', e);
      return { success: false, message: "Something went wrong." };
    }
  };

  const isInTeam = (pokemonId) => {
    const numericId = parseInt(pokemonId, 10);
    return team.some(p => p.id === numericId);
  };

  const clearTeam = async () => {
    try {
      setTeam([]);
      await AsyncStorage.removeItem('@pokemon_team');
    } catch (e) {
      console.error('Failed to clear team', e);
    }
  };

  // Helper calculations for team info
  const getTeamStats = () => {
    if (team.length === 0) return null;

    const total = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
    
    team.forEach(p => {
      total.hp += p.stats?.hp || p.hp || 0;
      total.attack += p.stats?.attack || p.attack || 0;
      total.defense += p.stats?.defense || 0;
      total.specialAttack += p.stats?.specialAttack || 0;
      total.specialDefense += p.stats?.specialDefense || 0;
      total.speed += p.stats?.speed || p.speed || 0;
    });

    const count = team.length;
    return {
      total,
      average: {
        hp: Math.round(total.hp / count),
        attack: Math.round(total.attack / count),
        defense: Math.round(total.defense / count),
        specialAttack: Math.round(total.specialAttack / count),
        specialDefense: Math.round(total.specialDefense / count),
        speed: Math.round(total.speed / count),
      }
    };
  };

  const getTeamTypeDistribution = () => {
    const counts = {};
    team.forEach(p => {
      p.types.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  };

  return (
    <TeamContext.Provider value={{
      team,
      addToTeam,
      removeFromTeam,
      isInTeam,
      clearTeam,
      getTeamStats,
      getTeamTypeDistribution
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);
