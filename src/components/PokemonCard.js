import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { championsPokemon } from '../data/championsPokemon';
import { newlyAddedPokemon } from '../data/newlyAdded';
import { TYPE_COLORS } from './FilterModal';

// Helper to determine the official Pokédex species color category for Gen 1,
// falling back to closely aligned type colors for Gen 2-9.
export const getPokemonDexColor = (id, name, primaryType) => {
  const n = name.toLowerCase();
  
  // Regional and special forms color category overrides
  if (n.includes('-alola')) {
    if (n.includes('vulpix') || n.includes('ninetales')) return '#5C90D6'; // Ice Blue
    if (n.includes('sandshrew') || n.includes('sandslash')) return '#5C90D6'; // Ice Blue
    if (n.includes('meowth') || n.includes('persian')) return '#A85CB8'; // Purple
    if (n.includes('marowak')) return '#A85CB8'; // Ghost Purple
    if (n.includes('grimer') || n.includes('muk')) return '#5CB85C'; // Green
    if (n.includes('raichu')) return '#B38D6F'; // Chocolate Brown
    if (n.includes('rattata') || n.includes('raticate')) return '#4A4A4A'; // Black
    if (n.includes('exeggutor')) return '#5CB85C'; // Green
  }
  if (n.includes('-galar')) {
    if (n.includes('ponyta') || n.includes('rapidash')) return '#E682A3'; // Fairy Pink
    if (n.includes('weezing')) return '#A0A0A0'; // Gray/Steel
    if (n.includes('corsola')) return '#DCDCDC'; // Ghost White
    if (n.includes('zigzagoon') || n.includes('linoone') || n.includes('obstagoon')) return '#4A4A4A'; // Black
    if (n.includes('darumaka') || n.includes('darmanitan')) return '#DCDCDC'; // Ice White
    if (n.includes('farfetch') || n.includes('sirfetch')) return '#DCDCDC'; // Leek White
    if (n.includes('articuno')) return '#A85CB8'; // Psychic Purple
    if (n.includes('zapdos')) return '#D9534F'; // Fighting Red
    if (n.includes('moltres')) return '#4A4A4A'; // Dark Black
    if (n.includes('slowpoke') || n.includes('slowbro') || n.includes('slowking')) return '#F0AD4E'; // Yellow
    if (n.includes('mr-mime') || n.includes('mr.mime') || n.includes('mr. mime') || n.includes('rime')) return '#5C90D6'; // Blue/Ice
  }
  if (n.includes('-hisui')) {
    if (n.includes('zorua') || n.includes('zoroark')) return '#DCDCDC'; // White
    if (n.includes('growlithe') || n.includes('arcanine')) return '#4A4A4A'; // Dark Gray
    if (n.includes('voltorb') || n.includes('electrode')) return '#B38D6F'; // Wood Brown
    if (n.includes('sliggoo') || n.includes('goodra')) return '#A0A0A0'; // Steel Gray
    if (n.includes('decidueye')) return '#F0AD4E'; // Autumn Yellow
    if (n.includes('typhlosion')) return '#A85CB8'; // Purple
    if (n.includes('samurott')) return '#4A4A4A'; // Black
    if (n.includes('qwilfish') || n.includes('overqwil')) return '#4A4A4A'; // Black
    if (n.includes('sneasel') || n.includes('sneasler')) return '#A85CB8'; // Purple
    if (n.includes('avalugg')) return '#B38D6F'; // Stone Brown
  }
  if (n.includes('-paldea')) {
    if (n.includes('wooper')) return '#B38D6F'; // Poison Brown
    if (n.includes('tauros')) return '#4A4A4A'; // Black
  }

  // Specific Gen 1 mapping based on official Pokédex Color Categories
  if (id === 1) return '#5CB85C'; // Bulbasaur - Green
  if (id === 2 || id === 3 || id === 10033 || id === 10195) return '#5C90D6'; // Ivysaur, Venusaur - Blue
  
  if (n.includes('charizard-mega-x')) {
    return '#5C90D6'; // Blue for Mega Charizard X!
  }

  if (n.includes('charmander') || n.includes('charmeleon') || n.includes('charizard')) {
    if (n.includes('charmeleon')) return '#D9534F'; // Red
    return '#F0AD4E'; // Yellow/Orange
  }
  
  if (n.includes('squirtle') || n.includes('wartortle') || n.includes('blastoise')) return '#5C90D6'; // Blue
  if (n.includes('caterpie') || n.includes('metapod')) return '#5CB85C'; // Green
  if (n.includes('butterfree')) return '#DCDCDC'; // White
  if (n.includes('weedle') || n.includes('kakuna') || n.includes('beedrill')) {
    if (n.includes('weedle')) return '#B38D6F'; // Brown
    return '#F0AD4E'; // Yellow
  }
  if (n.includes('pidgey') || n.includes('pidgeotto') || n.includes('pidgeot')) return '#B38D6F'; // Brown
  if (n.includes('rattata') || n.includes('raticate')) return '#A85CB8'; // Purple
  if (n.includes('spearow') || n.includes('fearow')) return '#B38D6F'; // Brown
  if (n.includes('ekans') || n.includes('arbok')) return '#A85CB8'; // Purple
  if (n.includes('pikachu') || n.includes('raichu')) return '#F0AD4E'; // Yellow
  if (n.includes('sandshrew') || n.includes('sandslash')) return '#F0AD4E'; // Yellow
  if (n.includes('nidoran') || n.includes('nidorina') || n.includes('nidoqueen') || n.includes('nidoking')) {
    if (n.includes('nidoqueen') || n.includes('nidorina')) return '#5C90D6'; // Blue
    return '#A85CB8'; // Purple
  }
  if (n.includes('clefairy') || n.includes('clefable')) return '#E682A3'; // Pink
  if (n.includes('vulpix') || n.includes('ninetales')) return '#B38D6F'; // Brown
  if (n.includes('jigglypuff') || n.includes('wigglytuff')) return '#E682A3'; // Pink
  if (n.includes('zubat') || n.includes('golbat') || n.includes('crobat')) return '#A85CB8'; // Purple
  if (n.includes('oddish') || n.includes('gloom') || n.includes('vileplume') || n.includes('bellossom')) {
    if (n.includes('vileplume')) return '#D9534F'; // Red
    if (n.includes('bellossom')) return '#5CB85C'; // Green
    return '#5C90D6'; // Blue
  }
  if (n.includes('paras') || n.includes('parasect')) return '#D9534F'; // Red
  if (n.includes('venonat') || n.includes('venomoth')) return '#A85CB8'; // Purple
  if (n.includes('diglett') || n.includes('dugtrio')) return '#B38D6F'; // Brown
  if (n.includes('meowth') || n.includes('persian')) return '#F0AD4E'; // Yellow
  if (n.includes('psyduck') || n.includes('golduck')) {
    if (n.includes('psyduck')) return '#F0AD4E'; // Yellow
    return '#5C90D6'; // Blue
  }
  if (n.includes('mankey') || n.includes('primeape')) return '#B38D6F'; // Brown
  if (n.includes('growlithe') || n.includes('arcanine')) return '#D9534F'; // Red
  if (n.includes('poliwag') || n.includes('poliwhirl') || n.includes('poliwrath') || n.includes('politoed')) return '#5C90D6'; // Blue
  if (n.includes('abra') || n.includes('kadabra') || n.includes('alakazam')) return '#F0AD4E'; // Yellow/Brown
  if (n.includes('machop') || n.includes('machoke') || n.includes('machamp')) return '#A0A0A0'; // Gray
  if (n.includes('bellsprout') || n.includes('weepinbell') || n.includes('victreebel')) return '#5CB85C'; // Green
  if (n.includes('tentacool') || n.includes('tentacruel')) return '#5C90D6'; // Blue
  if (n.includes('geodude') || n.includes('graveler') || n.includes('golem')) return '#A0A0A0'; // Gray
  if (n.includes('ponyta') || n.includes('rapidash')) return '#F0AD4E'; // Yellow
  if (n.includes('slowpoke') || n.includes('slowbro') || n.includes('slowking')) return '#E682A3'; // Pink
  if (n.includes('magnemite') || n.includes('magneton') || n.includes('magnezone')) return '#A0A0A0'; // Gray
  if (n.includes('farfetch')) return '#B38D6F'; // Brown
  if (n.includes('doduo') || n.includes('dodrio')) return '#B38D6F'; // Brown
  if (n.includes('seel') || n.includes('dewgong')) return '#DCDCDC'; // White
  if (n.includes('grimer') || n.includes('muk')) return '#A85CB8'; // Purple
  if (n.includes('shellder') || n.includes('cloyster')) return '#A85CB8'; // Purple
  if (n.includes('gastly') || n.includes('haunter') || n.includes('gengar')) return '#A85CB8'; // Purple
  if (n.includes('onix') || n.includes('steelix')) return '#A0A0A0'; // Gray
  if (n.includes('drowzee') || n.includes('hypno')) return '#F0AD4E'; // Yellow
  if (n.includes('krabby') || n.includes('kingler')) return '#D9534F'; // Red
  if (n.includes('voltorb') || n.includes('electrode')) return '#D9534F'; // Red
  if (n.includes('exeggcute') || n.includes('exeggutor')) return '#F0AD4E'; // Yellow
  if (n.includes('cubone') || n.includes('marowak')) return '#B38D6F'; // Brown
  if (n.includes('hitmonlee') || n.includes('hitmonchan') || n.includes('hitmontop')) return '#B38D6F'; // Brown
  if (n.includes('lickitung') || n.includes('lickilicky')) return '#E682A3'; // Pink
  if (n.includes('koffing') || n.includes('weezing')) return '#A85CB8'; // Purple
  if (n.includes('rhyhorn') || n.includes('rhydon') || n.includes('rhyperior')) return '#A0A0A0'; // Gray
  if (n.includes('chansey') || n.includes('blissey')) return '#E682A3'; // Pink
  if (n.includes('tangela') || n.includes('tangrowth')) return '#5C90D6'; // Blue
  if (n.includes('kangaskhan')) return '#B38D6F'; // Brown
  if (n.includes('horsea') || n.includes('seadra') || n.includes('kingdra')) return '#5C90D6'; // Blue
  if (n.includes('goldeen') || n.includes('seaking')) return '#D9534F'; // Red
  if (n.includes('staryu') || n.includes('starmie')) {
    if (n.includes('staryu')) return '#B38D6F'; // Brown
    return '#A85CB8'; // Purple
  }
  if (n.includes('mr-mime') || n.includes('mime-jr')) return '#E682A3'; // Pink
  if (n.includes('scyther') || n.includes('scizor')) {
    if (n.includes('scizor')) return '#D9534F'; // Red
    return '#5CB85C'; // Green
  }
  if (n.includes('jynx')) return '#D9534F'; // Red
  if (n.includes('electrabuzz') || n.includes('electivire')) return '#F0AD4E'; // Yellow
  if (n.includes('magmar') || n.includes('magmortar')) return '#D9534F'; // Red
  if (n.includes('pinsir')) return '#B38D6F'; // Brown
  if (n.includes('tauros')) return '#B38D6F'; // Brown
  if (n.includes('magikarp') || n.includes('gyarados')) {
    if (n.includes('magikarp')) return '#D9534F'; // Red
    return '#5C90D6'; // Blue
  }
  if (n.includes('lapras')) return '#5C90D6'; // Blue
  if (n.includes('ditto')) return '#A85CB8'; // Purple
  if (n.includes('eevee')) return '#B38D6F'; // Brown
  if (n.includes('vaporeon')) return '#5C90D6'; // Blue
  if (n.includes('jolteon')) return '#F0AD4E'; // Yellow
  if (n.includes('flareon')) return '#D9534F'; // Red
  if (n.includes('porygon')) return '#E682A3'; // Pink
  if (n.includes('omanyte') || n.includes('omastar')) return '#5C90D6'; // Blue
  if (n.includes('kabuto') || n.includes('kabutops')) return '#B38D6F'; // Brown
  if (n.includes('aerodactyl')) return '#A85CB8'; // Purple
  if (n.includes('snorlax')) return '#4A4A4A'; // Black
  if (n.includes('articuno')) return '#5C90D6'; // Blue
  if (n.includes('zapdos')) return '#F0AD4E'; // Yellow
  if (n.includes('moltres')) return '#F0AD4E'; // Yellow
  if (n.includes('dratini') || n.includes('dragonair') || n.includes('dragonite')) {
    if (n.includes('dragonite')) return '#B38D6F'; // Brown
    return '#5C90D6'; // Blue
  }
  if (n.includes('mewtwo')) return '#A85CB8'; // Purple
  if (n.includes('mew')) return '#E682A3'; // Pink

  // Fallback to type mapping if not in specific Gen 1 list
  const typeMap = {
    normal: '#A0A0A0', // Gray
    fire: '#F0AD4E',   // Orange
    water: '#5C90D6',  // Blue
    electric: '#F0AD4E', // Yellow
    grass: '#5CB85C',  // Green
    ice: '#5C90D6',    // Blue
    fighting: '#B38D6F', // Brown
    poison: '#A85CB8', // Purple
    ground: '#B38D6F', // Brown
    flying: '#5C90D6', // Blue
    psychic: '#E682A3', // Pink
    bug: '#5CB85C',    // Green
    rock: '#B38D6F',   // Brown
    ghost: '#A85CB8',  // Purple
    dragon: '#5C90D6', // Blue
    steel: '#A0A0A0',  // Gray
    dark: '#4A4A4A',   // Black
    fairy: '#E682A3',  // Pink
  };
  return typeMap[primaryType.toLowerCase()] || '#A0A0A0';
};

export const getSolidCardBg = (dexColor, isDark) => {
  const lightMap = {
    '#5CB85C': '#A9DFB2', // Green
    '#5C90D6': '#A3C6EC', // Blue
    '#D9534F': '#F5AFA8', // Red
    '#F0AD4E': '#FBD5A6', // Yellow
    '#A85CB8': '#E0B3EB', // Purple
    '#E682A3': '#F5B9CB', // Pink
    '#A0A0A0': '#CDCDCD', // Gray
    '#B38D6F': '#D0BAA7', // Brown
    '#4A4A4A': '#969696', // Black -> Gray
    '#DCDCDC': '#E3E3E3', // White
  };

  const darkMap = {
    '#5CB85C': '#182C18', // Green
    '#5C90D6': '#182332', // Blue
    '#D9534F': '#321818', // Red
    '#F0AD4E': '#322618', // Yellow
    '#A85CB8': '#261832', // Purple
    '#E682A3': '#321D25', // Pink
    '#A0A0A0': '#232323', // Gray
    '#B38D6F': '#28201A', // Brown
    '#4A4A4A': '#151515', // Black
    '#DCDCDC': '#2C2C2C', // White
  };

  return isDark ? (darkMap[dexColor] || '#222') : (lightMap[dexColor] || '#F9F9F9');
};

export const getSolidCircleBg = (dexColor, isDark) => {
  const lightMap = {
    '#5CB85C': '#E2F3E5', // Green
    '#5C90D6': '#E5EFFB', // Blue
    '#D9534F': '#FCECEB', // Red
    '#F0AD4E': '#FDF5E9', // Yellow
    '#A85CB8': '#F5ECF9', // Purple
    '#E682A3': '#FCEEF2', // Pink
    '#A0A0A0': '#F0F0F0', // Gray
    '#B38D6F': '#F6F2EF', // Brown
    '#4A4A4A': '#ECECEC', // Black -> Gray
    '#DCDCDC': '#FAFAFA', // White
  };

  const darkMap = {
    '#5CB85C': '#284628', // Green
    '#5C90D6': '#283B4F', // Blue
    '#D9534F': '#4F2828', // Red
    '#F0AD4E': '#4F3F28', // Yellow
    '#A85CB8': '#3F284F', // Purple
    '#E682A3': '#4F303B', // Pink
    '#A0A0A0': '#3E3E3E', // Gray
    '#B38D6F': '#44342A', // Brown
    '#4A4A4A': '#242424', // Black
    '#DCDCDC': '#404040', // White
  };

  return isDark ? (darkMap[dexColor] || '#333') : (lightMap[dexColor] || '#EAEAEA');
};

export const PokemonCard = React.memo(({ pokemon, onPress }) => {
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();

  const nameLower = pokemon.name.toLowerCase();
  const isChamp = championsPokemon.includes(nameLower);
  const isNew = newlyAddedPokemon.includes(nameLower);
  const favorited = isFavorite(pokemon.id);

  // Format name: replace hyphens with spaces and capitalize each word
  let displayName = pokemon.name;
  if (pokemon.name.toLowerCase().includes('-gmax')) {
    displayName = `Gigantamax ${pokemon.name.replace('-gmax', '')}`;
  } else if (pokemon.name.toLowerCase().includes('-mega')) {
    displayName = `Mega ${pokemon.name.replace('-mega', '')}`;
  }
  const capitalizedName = displayName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const primaryType = pokemon.types[0];
  const typeColor = TYPE_COLORS[primaryType.toLowerCase()] || '#A8A878';
  const dexColor = getPokemonDexColor(pokemon.speciesId ?? pokemon.id, pokemon.name, primaryType);

  // Dynamic card background based on Pokedex color and theme
  const getCardBgColor = () => {
    return getSolidCardBg(dexColor, theme.dark);
  };

  const getImageBgColor = () => {
    return getSolidCircleBg(dexColor, theme.dark);
  };

  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(pokemon)}
      style={[
        styles.card,
        {
          backgroundColor: getCardBgColor(),
          borderColor: dexColor,
          borderWidth: 1.5,
        }
      ]}
    >
      {/* Top Header Row: ID & Favorite Button */}
      <View style={styles.cardHeader}>
        <Text style={[styles.idText, { color: theme.colors.textSecondary }]}>
          #{String(pokemon.speciesId ?? pokemon.id).padStart(4, '0')}
        </Text>
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleFavorite(pokemon.id)}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={18}
            color={favorited ? '#FF5252' : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Image Container */}
      <View style={[styles.imageContainer, { backgroundColor: getImageBgColor() }]}>
        <Image
          source={{ uri: artworkUrl }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
      </View>

      {/* Badges Container */}
      <View style={styles.badgesWrapper}>
        {isChamp && (
          <View style={[styles.badge, styles.champBadge]}>
            <Text style={styles.badgeText}>🏆 Champions</Text>
          </View>
        )}
        {isNew && (
          <View style={[styles.badge, styles.newBadge]}>
            <Text style={styles.badgeText}>✨ New</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text numberOfLines={1} style={[styles.nameText, { color: theme.colors.text }]}>
        {capitalizedName}
      </Text>

      {/* Type Badges */}
      <View style={styles.typesRow}>
        {pokemon.types.map(t => {
          const tc = TYPE_COLORS[t.toLowerCase()] || '#A8A878';
          return (
            <View key={t} style={[styles.typeBadge, { backgroundColor: tc }]}>
              <Text style={styles.typeText}>{t.toUpperCase()}</Text>
            </View>
          );
        })}
      </View>

    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    margin: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  idText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'System',
  },
  heartButton: {
    padding: 4,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  pokemonImage: {
    width: 75,
    height: 75,
  },
  badgesWrapper: {
    flexDirection: 'row',
    gap: 4,
    height: 18,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  champBadge: {
    backgroundColor: '#FFD700',
  },
  newBadge: {
    backgroundColor: '#1AD1B7',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#000000',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    fontFamily: 'System',
  },
  typesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
