import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getInitialPresetTeams,
  calculateTeamDefensiveCoverage,
  calculateTeamStats,
} from '../utils/teamUtils.js';

const STORAGE_KEY_TEAMS = '@pokemon_saved_teams_v2';
const STORAGE_KEY_ACTIVE_ID = '@pokemon_active_team_id_v2';
const LEGACY_STORAGE_KEY = '@pokemon_team';

export const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState('story-mode');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize and load saved teams from storage
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const [savedTeamsJson, savedActiveId, legacyTeamJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_TEAMS),
          AsyncStorage.getItem(STORAGE_KEY_ACTIVE_ID),
          AsyncStorage.getItem(LEGACY_STORAGE_KEY),
        ]);

        let loadedTeams = null;
        if (savedTeamsJson) {
          try {
            const parsed = JSON.parse(savedTeamsJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedTeams = parsed;
            }
          } catch (e) {}
        }

        // Fallback to initial curated preset teams
        if (!loadedTeams) {
          loadedTeams = getInitialPresetTeams();

          // If user had a legacy team from before, merge it into Story Mode!
          if (legacyTeamJson) {
            try {
              const legacy = JSON.parse(legacyTeamJson);
              if (Array.isArray(legacy) && legacy.length > 0) {
                loadedTeams[0].members = legacy.slice(0, 6);
              }
            } catch (e) {}
          }

          await AsyncStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(loadedTeams));
        }

        setTeams(loadedTeams);

        const initialActiveId =
          savedActiveId && loadedTeams.some(t => t.id === savedActiveId)
            ? savedActiveId
            : loadedTeams[0].id;

        setActiveTeamId(initialActiveId);
        await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_ID, initialActiveId);
      } catch (e) {
        console.error('Failed to load teams:', e);
        const defaults = getInitialPresetTeams();
        setTeams(defaults);
        setActiveTeamId(defaults[0].id);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTeams();
  }, []);

  // Persist teams to storage helper
  const persistTeams = async (updatedTeams) => {
    setTeams(updatedTeams);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(updatedTeams));
    } catch (e) {
      console.error('Failed to persist teams:', e);
    }
  };

  // Switch active team
  const selectTeam = async (teamId) => {
    setActiveTeamId(teamId);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_ID, teamId);
    } catch (e) {}
  };

  // Active team and members memo
  const activeTeam = useMemo(() => {
    return teams.find(t => t.id === activeTeamId) || teams[0] || null;
  }, [teams, activeTeamId]);

  // Backward compatible `team` array (members of current active team)
  const team = useMemo(() => {
    return activeTeam?.members || [];
  }, [activeTeam]);

  // Create a new team
  const createTeam = async (name = 'New Team', playStyle = 'Competitive', description = '') => {
    const id = `team_${Date.now()}`;
    const newTeam = {
      id,
      name: name.trim() || 'Untitled Squad',
      playStyle: playStyle || 'Competitive',
      description: description || 'Custom competitive battle squad.',
      members: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextTeams = [...teams, newTeam];
    await persistTeams(nextTeams);
    await selectTeam(id);
    return { success: true, team: newTeam };
  };

  // Update team metadata (name, play style, description)
  const updateTeam = async (teamId, updates = {}) => {
    const nextTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          ...updates,
          updatedAt: Date.now(),
        };
      }
      return t;
    });
    await persistTeams(nextTeams);
    return { success: true };
  };

  // Delete a team (protects the last team)
  const deleteTeam = async (teamId) => {
    if (teams.length <= 1) {
      return { success: false, message: 'You must have at least one team.' };
    }

    const nextTeams = teams.filter(t => t.id !== teamId);
    await persistTeams(nextTeams);

    if (activeTeamId === teamId) {
      const fallbackId = nextTeams[0].id;
      await selectTeam(fallbackId);
    }
    return { success: true };
  };

  // Duplicate an existing team
  const duplicateTeam = async (teamId) => {
    const target = teams.find(t => t.id === teamId);
    if (!target) return { success: false, message: 'Team not found.' };

    const newId = `team_${Date.now()}`;
    const cloned = {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      members: [...target.members],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextTeams = [...teams, cloned];
    await persistTeams(nextTeams);
    await selectTeam(newId);
    return { success: true, team: cloned };
  };

  // Add Pokémon to a team (defaults to active team)
  const addToTeam = async (pokemon, targetTeamId = null) => {
    const tId = targetTeamId || activeTeamId;
    const targetTeam = teams.find(t => t.id === tId);

    if (!targetTeam) return { success: false, message: 'Team not found.' };

    if (targetTeam.members.length >= 6) {
      return { success: false, message: 'Team is full! Maximum 6 Pokémon allowed.' };
    }

    if (targetTeam.members.some(p => p.id === pokemon.id)) {
      return { success: false, message: `${pokemon.name.toUpperCase()} is already in this team.` };
    }

    const nextTeams = teams.map(t => {
      if (t.id === tId) {
        return {
          ...t,
          members: [...t.members, pokemon],
          updatedAt: Date.now(),
        };
      }
      return t;
    });

    await persistTeams(nextTeams);
    return { success: true, message: `${pokemon.name.toUpperCase()} added to ${targetTeam.name}.` };
  };

  // Remove Pokémon from a team
  const removeFromTeam = async (pokemonId, targetTeamId = null) => {
    const tId = targetTeamId || activeTeamId;
    const numericId = parseInt(pokemonId, 10);

    const nextTeams = teams.map(t => {
      if (t.id === tId) {
        return {
          ...t,
          members: t.members.filter(p => p.id !== numericId),
          updatedAt: Date.now(),
        };
      }
      return t;
    });

    await persistTeams(nextTeams);
    return { success: true, message: 'Pokémon removed from team.' };
  };

  // Replace a specific slot (0-5) with a Pokémon
  const replaceTeamSlot = async (slotIndex, pokemon, targetTeamId = null) => {
    const tId = targetTeamId || activeTeamId;
    const targetTeam = teams.find(t => t.id === tId);
    if (!targetTeam) return { success: false, message: 'Team not found.' };

    // Avoid duplicate Pokémon on the team
    if (targetTeam.members.some((p, i) => p.id === pokemon.id && i !== slotIndex)) {
      return { success: false, message: `${pokemon.name.toUpperCase()} is already in another slot.` };
    }

    const nextMembers = [...targetTeam.members];
    if (slotIndex < nextMembers.length) {
      nextMembers[slotIndex] = pokemon;
    } else {
      nextMembers.push(pokemon);
    }

    const nextTeams = teams.map(t => {
      if (t.id === tId) {
        return {
          ...t,
          members: nextMembers,
          updatedAt: Date.now(),
        };
      }
      return t;
    });

    await persistTeams(nextTeams);
    return { success: true, message: `${pokemon.name.toUpperCase()} placed in slot ${slotIndex + 1}.` };
  };

  // Reorder slots
  const reorderTeam = async (fromIndex, toIndex, targetTeamId = null) => {
    const tId = targetTeamId || activeTeamId;
    const targetTeam = teams.find(t => t.id === tId);
    if (!targetTeam) return;

    const list = [...targetTeam.members];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    const nextTeams = teams.map(t => {
      if (t.id === tId) {
        return {
          ...t,
          members: list,
          updatedAt: Date.now(),
        };
      }
      return t;
    });

    await persistTeams(nextTeams);
  };

  // Clear all Pokémon from team
  const clearTeam = async (targetTeamId = null) => {
    const tId = targetTeamId || activeTeamId;
    const nextTeams = teams.map(t => {
      if (t.id === tId) {
        return { ...t, members: [], updatedAt: Date.now() };
      }
      return t;
    });
    await persistTeams(nextTeams);
  };

  // Check if Pokémon is in current active team
  const isInTeam = (pokemonId, targetTeamId = null) => {
    const tId = targetTeamId || activeTeamId;
    const target = teams.find(t => t.id === tId);
    if (!target) return false;
    const numericId = parseInt(pokemonId, 10);
    return target.members.some(p => p.id === numericId);
  };

  // Team Defensive Type Coverage Analysis
  const getTeamDefensiveCoverage = (members = null) => {
    const targetMembers = members || team;
    return calculateTeamDefensiveCoverage(targetMembers);
  };

  // Team Stats and Averages
  const getTeamStats = (members = null) => {
    const targetMembers = members || team;
    return calculateTeamStats(targetMembers);
  };

  // Team Type Distribution
  const getTeamTypeDistribution = (members = null) => {
    const targetMembers = members || team;
    const counts = {};
    targetMembers.forEach(p => {
      (p.types || []).forEach(t => {
        const key = typeof t === 'string' ? t.toLowerCase() : (t?.name || 'normal').toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return counts;
  };

  return (
    <TeamContext.Provider
      value={{
        isLoaded,
        teams,
        activeTeamId,
        activeTeam,
        team, // Backward-compatible members array of active team
        selectTeam,
        createTeam,
        updateTeam,
        deleteTeam,
        duplicateTeam,
        addToTeam,
        removeFromTeam,
        replaceTeamSlot,
        reorderTeam,
        clearTeam,
        isInTeam,
        getTeamDefensiveCoverage,
        getTeamStats,
        getTeamTypeDistribution,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);
