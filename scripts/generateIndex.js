const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Determine Generation based on species ID (up to 1025, which is Pecharunt, Gen 9)
function getGeneration(id) {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  if (id <= 1025) return 9;
  return 10; // Future fallback
}

const speciesCache = {};

async function fetchSpeciesData(url) {
  if (speciesCache[url]) {
    return speciesCache[url];
  }
  try {
    const res = await axios.get(url);
    speciesCache[url] = res.data;
    return res.data;
  } catch (error) {
    console.error(`Error fetching species data from ${url}: ${error.message}`);
    return null;
  }
}

async function fetchPokemonData(url) {
  try {
    const pokemonRes = await axios.get(url);
    const pokemon = pokemonRes.data;
    
    let species = null;
    if (pokemon.species && pokemon.species.url) {
      species = await fetchSpeciesData(pokemon.species.url);
    }

    // Get types
    const types = pokemon.types.map(t => t.type.name);

    // Get HP, Attack, Speed stats
    const hp = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
    const attack = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const speed = pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat || 0;

    const speciesId = species ? species.id : pokemon.id;

    return {
      id: pokemon.id,
      name: pokemon.name,
      types: types,
      hp: hp,
      attack: attack,
      speed: speed,
      generation: getGeneration(speciesId),
      isLegendary: species ? (species.is_legendary || false) : false,
      isMythical: species ? (species.is_mythical || false) : false
    };
  } catch (error) {
    console.error(`Error fetching Pokemon from ${url}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('Fetching all Pokemon list...');
  const listRes = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=10000');
  const pokemonList = listRes.data.results;
  
  console.log(`Found ${pokemonList.length} Pokemon variants. Starting to fetch details...`);

  const BATCH_SIZE = 40;
  const results = [];

  for (let i = 0; i < pokemonList.length; i += BATCH_SIZE) {
    const batchUrls = pokemonList.slice(i, i + BATCH_SIZE).map(p => p.url);
    
    console.log(`Fetching batch ${i + 1} to ${Math.min(i + BATCH_SIZE, pokemonList.length)} of ${pokemonList.length}...`);
    
    const promises = batchUrls.map(url => fetchPokemonData(url));
    const batchResults = await Promise.all(promises);
    
    for (const res of batchResults) {
      if (res) {
        results.push(res);
      }
    }
    
    // Pause to respect PokeAPI limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Sort results by ID to ensure correct order
  results.sort((a, b) => a.id - b.id);

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'pokemonIndex.js');
  const outputContent = `/**
 * Pre-generated index of Pokémon from Generation 1 to 9, including mega evolutions and regional forms.
 * Generated automatically using PokeAPI data.
 */
export const pokemonIndex = ${JSON.stringify(results, null, 2)};
`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, outputContent, 'utf-8');

  console.log(`Successfully generated index with ${results.length} Pokémon! Saved to ${outputPath}`);
}

main();
