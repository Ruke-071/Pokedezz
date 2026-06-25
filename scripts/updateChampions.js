import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseList = [
"venusaur", "charizard", "blastoise", "beedrill", "pidgeot", "arbok", "pikachu", "raichu", "raichu-alola", "clefable", "ninetales", "ninetales-alola", "arcanine", "alakazam", "machamp", "victreebel", "slowbro", "gengar", "kangaskhan", "starmie", "pinsir", "tauros", "gyarados", "ditto", "vaporeon", "jolteon", "flareon", "aerodactyl", "snorlax", "dragonite",
"meganium", "typhlosion", "feraligatr", "ariados", "ampharos", "azumarill", "politoed", "espeon", "umbreon", "slowking", "forretress", "steelix", "scizor", "heracross", "skarmory", "houndoom", "tyranitar",
"sceptile", "blaziken", "swampert", "pelipper", "gardevoir", "mawile", "breloom", "flygon", "metagross", "salamence", "milotic", "absol",
"staraptor", "froslass", "rotom", "togekiss", "lucario", "garchomp",
"musharna", "scolipede", "scrafty", "eelektross", "excadrill", "whimsicott", "haxorus", "volcarona",
"pyroar", "malamar", "barbaracle", "dragalge", "talonflame", "sylveon", "aurorus", "aegislash",
"incineroar", "lycanroc", "oranguru",
"grimmsnarl", "falinks", "dragapult",
"arcanine-hisui", "samurott-hisui", "overqwil", "basculegion-male", "basculegion-female", "sneasler",
"annihilape", "farigiraf", "kingambit", "gholdengo", "sinistcha", "archaludon", "hydrapple", "houndstone", "meowscarada", "skeledirge", "quaquaval", "maushold", "glimmora", "dondozo",
"corviknight", "torkoal", "rotom-wash", "floette-eternal", "kommo-o", "palafin", "garganacl", "toxapex", "cinderace"
];

const indexContent = fs.readFileSync(path.join(__dirname, '../src/data/pokemonIndex.js'), 'utf-8');
const pokemonIndexStr = indexContent.substring(indexContent.indexOf('export const pokemonIndex = ') + 28).trim().replace(/;$/, '');
const pokemonIndex = JSON.parse(pokemonIndexStr);

const championsSet = new Set(baseList);

pokemonIndex.forEach(p => {
    const isMega = p.name.includes('-mega');
    const isAlola = p.name.includes('-alola');
    const isGalar = p.name.includes('-galar');
    const isHisui = p.name.includes('-hisui');
    const isPaldea = p.name.includes('-paldea');
    
    if (isMega || isAlola || isGalar || isHisui || isPaldea) {
        const baseName = p.name.split('-')[0];
        if (championsSet.has(baseName)) {
            championsSet.add(p.name);
        }
    }
});

const sortedChampions = Array.from(championsSet);
const content = `/**
 * List of Pokémon playable in Pokémon Champions.
 * Stored in lowercase to match PokeAPI names exactly.
 */
export const championsPokemon = ${JSON.stringify(sortedChampions, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/championsPokemon.js'), content);
console.log('Done writing ' + sortedChampions.length + ' champions!');
