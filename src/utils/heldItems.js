/**
 * Pokémon Held Items Engine
 * Implements competitive held item stat modifications (Choice items, Assault Vest, Eviolite,
 * Booster Energy, species-specific items like Light Ball & Thick Club, Pinch Berries, Terrain Seeds, etc.)
 */
const STAT_KEYS = ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'];

const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  spAtk: 'Sp. Atk',
  spDef: 'Sp. Def',
  speed: 'Speed',
};

export const ITEM_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'choice', name: 'Choice' },
  { id: 'defensive', name: 'Defensive' },
  { id: 'species', name: 'Species' },
  { id: 'berry', name: 'Berries' },
  { id: 'terrain', name: 'Seeds' },
  { id: 'battle', name: 'Battle & Orbs' },
  { id: 'custom', name: 'Custom' },
];

export const HELD_ITEMS = [
  {
    id: 'none',
    name: 'None',
    category: 'all',
    sprite: null,
    description: 'No item held. Stats remain at their standard calculated values.',
    badge: 'No Item',
    multipliers: {},
  },
  // ── Choice Items ──────────────────────────────────────────────────────────
  {
    id: 'choice-band',
    name: 'Choice Band',
    category: 'choice',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-band.png',
    description: 'Boosts Attack by 50% (1.5×), but holder can only use the first move selected.',
    badge: '+50% Attack (1.5×)',
    multipliers: { attack: 1.5 },
  },
  {
    id: 'choice-specs',
    name: 'Choice Specs',
    category: 'choice',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-specs.png',
    description: 'Boosts Sp. Atk by 50% (1.5×), but holder can only use the first move selected.',
    badge: '+50% Sp. Atk (1.5×)',
    multipliers: { spAtk: 1.5 },
  },
  {
    id: 'choice-scarf',
    name: 'Choice Scarf',
    category: 'choice',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-scarf.png',
    description: 'Boosts Speed by 50% (1.5×), but holder can only use the first move selected.',
    badge: '+50% Speed (1.5×)',
    multipliers: { speed: 1.5 },
  },

  // ── Defensive Items ───────────────────────────────────────────────────────
  {
    id: 'assault-vest',
    name: 'Assault Vest',
    category: 'defensive',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/assault-vest.png',
    description: 'Boosts Sp. Def by 50% (1.5×), but prevents the holder from using status moves.',
    badge: '+50% Sp. Def (1.5×)',
    multipliers: { spDef: 1.5 },
  },
  {
    id: 'eviolite',
    name: 'Eviolite',
    category: 'defensive',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/eviolite.png',
    description: 'Boosts Defense and Sp. Def by 50% (1.5×) if the holder is capable of evolving.',
    badge: '+50% Def & Sp. Def',
    isEviolite: true,
    multipliers: { defense: 1.5, spDef: 1.5 },
  },

  // ── Species-Specific Items ────────────────────────────────────────────────
  {
    id: 'light-ball',
    name: 'Light Ball',
    category: 'species',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/light-ball.png',
    description: 'Doubles Attack and Sp. Atk (2.0×) when held by Pikachu.',
    badge: '2.0× Atk & Sp. Atk (Pikachu)',
    species: ['pikachu'],
    multipliers: { attack: 2.0, spAtk: 2.0 },
  },
  {
    id: 'thick-club',
    name: 'Thick Club',
    category: 'species',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thick-club.png',
    description: 'Doubles Attack (2.0×) when held by Cubone or Marowak.',
    badge: '2.0× Atk (Cubone / Marowak)',
    species: ['cubone', 'marowak'],
    multipliers: { attack: 2.0 },
  },
  {
    id: 'deep-sea-tooth',
    name: 'Deep Sea Tooth',
    category: 'species',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/deep-sea-tooth.png',
    description: 'Doubles Sp. Atk (2.0×) when held by Clamperl.',
    badge: '2.0× Sp. Atk (Clamperl)',
    species: ['clamperl'],
    multipliers: { spAtk: 2.0 },
  },
  {
    id: 'deep-sea-scale',
    name: 'Deep Sea Scale',
    category: 'species',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/deep-sea-scale.png',
    description: 'Doubles Sp. Def (2.0×) when held by Clamperl.',
    badge: '2.0× Sp. Def (Clamperl)',
    species: ['clamperl'],
    multipliers: { spDef: 2.0 },
  },
  {
    id: 'soul-dew',
    name: 'Soul Dew (Classic)',
    category: 'species',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/soul-dew.png',
    description: 'Boosts Sp. Atk and Sp. Def by 50% (1.5×) when held by Latios or Latias.',
    badge: '+50% SpA & SpD (Latios/Latias)',
    species: ['latios', 'latias'],
    multipliers: { spAtk: 1.5, spDef: 1.5 },
  },
  {
    id: 'quick-powder',
    name: 'Quick Powder',
    category: 'species',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-powder.png',
    description: 'Doubles Speed (2.0×) when held by untransformed Ditto.',
    badge: '2.0× Speed (Ditto)',
    species: ['ditto'],
    multipliers: { speed: 2.0 },
  },
  {
    id: 'metal-powder',
    name: 'Metal Powder',
    category: 'species',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/metal-powder.png',
    description: 'Doubles Defense (2.0×) when held by untransformed Ditto.',
    badge: '2.0× Defense (Ditto)',
    species: ['ditto'],
    multipliers: { defense: 2.0 },
  },

  // ── Paradox / Booster Energy ──────────────────────────────────────────────
  {
    id: 'booster-energy',
    name: 'Booster Energy',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/booster-energy.png',
    description: 'Activates Protosynthesis / Quark Drive: boosts highest non-HP stat by 30% (or 50% if Speed).',
    badge: 'Protosynthesis / Quark Drive',
    isBoosterEnergy: true,
    multipliers: {},
  },

  // ── Pinch Stat Berries (+1 Stage = 1.5×) ──────────────────────────────────
  {
    id: 'salac-berry',
    name: 'Salac Berry',
    category: 'berry',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/salac-berry.png',
    description: 'Raises Speed by 1 stage (1.5×) when HP drops to 25% or below.',
    badge: '+50% Speed (+1 Stage)',
    multipliers: { speed: 1.5 },
  },
  {
    id: 'liechi-berry',
    name: 'Liechi Berry',
    category: 'berry',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/liechi-berry.png',
    description: 'Raises Attack by 1 stage (1.5×) when HP drops to 25% or below.',
    badge: '+50% Attack (+1 Stage)',
    multipliers: { attack: 1.5 },
  },
  {
    id: 'petaya-berry',
    name: 'Petaya Berry',
    category: 'berry',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/petaya-berry.png',
    description: 'Raises Sp. Atk by 1 stage (1.5×) when HP drops to 25% or below.',
    badge: '+50% Sp. Atk (+1 Stage)',
    multipliers: { spAtk: 1.5 },
  },
  {
    id: 'ganlon-berry',
    name: 'Ganlon Berry',
    category: 'berry',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ganlon-berry.png',
    description: 'Raises Defense by 1 stage (1.5×) when HP drops to 25% or below.',
    badge: '+50% Defense (+1 Stage)',
    multipliers: { defense: 1.5 },
  },
  {
    id: 'apicot-berry',
    name: 'Apicot Berry',
    category: 'berry',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/apicot-berry.png',
    description: 'Raises Sp. Def by 1 stage (1.5×) when HP drops to 25% or below.',
    badge: '+50% Sp. Def (+1 Stage)',
    multipliers: { spDef: 1.5 },
  },
  {
    id: 'kee-berry',
    name: 'Kee Berry',
    category: 'berry',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kee-berry.png',
    description: 'Raises Defense by 1 stage (1.5×) when hit by a physical attack.',
    badge: '+50% Defense (+1 Stage)',
    multipliers: { defense: 1.5 },
  },
  {
    id: 'maranga-berry',
    name: 'Maranga Berry',
    category: 'berry',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/maranga-berry.png',
    description: 'Raises Sp. Def by 1 stage (1.5×) when hit by a special attack.',
    badge: '+50% Sp. Def (+1 Stage)',
    multipliers: { spDef: 1.5 },
  },
  {
    id: 'starf-berry',
    name: 'Starf Berry',
    category: 'berry',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/starf-berry.png',
    description: 'Sharply raises a random stat by 2 stages (2.0×) in a pinch (≤ 25% HP).',
    badge: '+2 Stages (2.0×)',
    multipliers: { attack: 2.0 },
  },

  // ── Terrain Seeds (+1 Stage = 1.5×) ───────────────────────────────────────
  {
    id: 'electric-seed',
    name: 'Electric Seed',
    category: 'terrain',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/electric-seed.png',
    description: 'Raises Defense by 1 stage (1.5×) upon entering Electric Terrain.',
    badge: '+50% Defense on Elec Terrain',
    multipliers: { defense: 1.5 },
  },
  {
    id: 'grassy-seed',
    name: 'Grassy Seed',
    category: 'terrain',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/grassy-seed.png',
    description: 'Raises Defense by 1 stage (1.5×) upon entering Grassy Terrain.',
    badge: '+50% Defense on Grassy Terrain',
    multipliers: { defense: 1.5 },
  },
  {
    id: 'misty-seed',
    name: 'Misty Seed',
    category: 'terrain',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/misty-seed.png',
    description: 'Raises Sp. Def by 1 stage (1.5×) upon entering Misty Terrain.',
    badge: '+50% Sp. Def on Misty Terrain',
    multipliers: { spDef: 1.5 },
  },
  {
    id: 'psychic-seed',
    name: 'Psychic Seed',
    category: 'terrain',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/psychic-seed.png',
    description: 'Raises Sp. Def by 1 stage (1.5×) upon entering Psychic Terrain.',
    badge: '+50% Sp. Def on Psychic Terrain',
    multipliers: { spDef: 1.5 },
  },

  // ── Battle Policies & Reactive Items ──────────────────────────────────────
  {
    id: 'weakness-policy',
    name: 'Weakness Policy',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/weakness-policy.png',
    description: 'Sharply raises Attack and Sp. Atk by 2 stages (2.0×) when struck by a super-effective move.',
    badge: '+2 Atk & Sp. Atk (2.0×)',
    multipliers: { attack: 2.0, spAtk: 2.0 },
  },
  {
    id: 'throat-spray',
    name: 'Throat Spray',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/throat-spray.png',
    description: 'Raises Sp. Atk by 1 stage (1.5×) after using a sound-based move.',
    badge: '+50% Sp. Atk (+1 Stage)',
    multipliers: { spAtk: 1.5 },
  },
  {
    id: 'blunder-policy',
    name: 'Blunder Policy',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/blunder-policy.png',
    description: 'Sharply raises Speed by 2 stages (2.0×) when holder misses an attack due to accuracy.',
    badge: '+2 Speed (2.0×)',
    multipliers: { speed: 2.0 },
  },
  {
    id: 'room-service',
    name: 'Room Service',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/room-service.png',
    description: 'Lowers Speed by 1 stage (0.67×) when Trick Room takes effect.',
    badge: '-33% Speed (Trick Room)',
    multipliers: { speed: 0.67 },
  },

  // ── Status Orbs (Guts / Marvel Scale / Quick Feet) ────────────────────────
  {
    id: 'flame-orb-guts',
    name: 'Flame Orb (Guts)',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flame-orb.png',
    description: 'Inflicts Burn at end of turn. In conjunction with Guts ability, boosts Attack by 50% (1.5×).',
    badge: '+50% Attack (Guts Active)',
    multipliers: { attack: 1.5 },
  },
  {
    id: 'toxic-orb-guts',
    name: 'Toxic Orb (Guts)',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/toxic-orb.png',
    description: 'Inflicts Bad Poison at end of turn. In conjunction with Guts ability, boosts Attack by 50% (1.5×).',
    badge: '+50% Attack (Guts Active)',
    multipliers: { attack: 1.5 },
  },
  {
    id: 'flame-orb-marvel-scale',
    name: 'Flame Orb (Marvel Scale)',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flame-orb.png',
    description: 'Inflicts Burn at end of turn. In conjunction with Marvel Scale, boosts Defense by 50% (1.5×).',
    badge: '+50% Defense (Marvel Scale)',
    multipliers: { defense: 1.5 },
  },
  {
    id: 'toxic-orb-quick-feet',
    name: 'Toxic Orb (Quick Feet)',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/toxic-orb.png',
    description: 'Inflicts Bad Poison at end of turn. In conjunction with Quick Feet, boosts Speed by 50% (1.5×).',
    badge: '+50% Speed (Quick Feet)',
    multipliers: { speed: 1.5 },
  },

  // ── Speed Reducers / Iron Ball ────────────────────────────────────────────
  {
    id: 'iron-ball',
    name: 'Iron Ball',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/iron-ball.png',
    description: 'Halves holder’s Speed (-50% / 0.5×) and grounds Flying-type or Levitate holders.',
    badge: '-50% Speed (0.5×)',
    multipliers: { speed: 0.5 },
  },
  {
    id: 'macho-brace',
    name: 'Macho Brace',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/macho-brace.png',
    description: 'Halves Speed in battle (0.5×) while doubling EV yield from training.',
    badge: '-50% Speed (0.5×)',
    multipliers: { speed: 0.5 },
  },
  {
    id: 'power-weight',
    name: 'Power Weight',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-weight.png',
    description: 'Halves Speed in battle (0.5×) while awarding +8 HP EVs.',
    badge: '-50% Speed in Battle',
    multipliers: { speed: 0.5 },
  },
  {
    id: 'power-bracer',
    name: 'Power Bracer',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-bracer.png',
    description: 'Halves Speed in battle (0.5×) while awarding +8 Attack EVs.',
    badge: '-50% Speed in Battle',
    multipliers: { speed: 0.5 },
  },
  {
    id: 'power-belt',
    name: 'Power Belt',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-belt.png',
    description: 'Halves Speed in battle (0.5×) while awarding +8 Defense EVs.',
    badge: '-50% Speed in Battle',
    multipliers: { speed: 0.5 },
  },
  {
    id: 'power-lens',
    name: 'Power Lens',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-lens.png',
    description: 'Halves Speed in battle (0.5×) while awarding +8 Sp. Atk EVs.',
    badge: '-50% Speed in Battle',
    multipliers: { speed: 0.5 },
  },
  {
    id: 'power-band',
    name: 'Power Band',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-band.png',
    description: 'Halves Speed in battle (0.5×) while awarding +8 Sp. Def EVs.',
    badge: '-50% Speed in Battle',
    multipliers: { speed: 0.5 },
  },
  {
    id: 'power-anklet',
    name: 'Power Anklet',
    category: 'battle',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-anklet.png',
    description: 'Halves Speed in battle (0.5×) while awarding +8 Speed EVs.',
    badge: '-50% Speed in Battle',
    multipliers: { speed: 0.5 },
  },

  // ── Custom Modifier ───────────────────────────────────────────────────────
  {
    id: 'custom',
    name: 'Custom Modifier',
    category: 'custom',
    sprite: null,
    description: 'Custom stat multiplier (e.g. 1.2×, 1.3× Life Orb, 1.5×, 2.0× or stages) for theoretical or custom builds.',
    badge: 'Custom',
    isCustom: true,
    multipliers: {},
  },
];

/**
 * Check if a Pokémon is eligible for Eviolite (i.e. Not Fully Evolved / can evolve).
 * Includes popular NFE Pokémon and general evolution heuristics.
 */
export const checkCanEvolve = (pokemon) => {
  if (!pokemon) return true;
  const name = (pokemon.name || '').toLowerCase();
  
  // Known list of prominent Eviolite users and pre-evolutions
  const nfeKeywords = [
    'chansey', 'porygon2', 'dusclops', 'bisharp', 'gligar', 'scyther', 'magneton',
    'haunter', 'doublade', 'rhydon', 'clefairy', 'tangela', 'type-null', 'magmar',
    'electabuzz', 'misdreavus', 'murkrow', 'sneasel', 'roselia', 'piloswine', 'togetic',
    'golbat', 'seadra', 'kadabra', 'machoke', 'graveler', 'pikachu', 'eevee', 'vulpix',
    'growlithe', 'slowpoke', 'dratini', 'dragonair', 'larvitar', 'pupitar', 'bagon',
    'shelgon', 'beldum', 'metang', 'gible', 'gabite', 'deino', 'zweilous', 'goomy',
    'sliggoo', 'jangmo-o', 'hakamo-o', 'dreepy', 'drakloak', 'frigibax', 'arctibax',
    'bulbasaur', 'ivysaur', 'charmander', 'charmeleon', 'squirtle', 'wartortle',
    'caterpie', 'metapod', 'weedle', 'kakuna', 'pidgey', 'pidgeotto', 'rattata',
    'spearow', 'ekans', 'sandshrew', 'nidoran', 'nidorina', 'nidorino', 'cleffa',
    'igglybuff', 'jigglypuff', 'zubat', 'oddish', 'gloom', 'paras', 'venonat',
    'diglett', 'meowth', 'psyduck', 'mankey', 'primeape', 'poliwag', 'poliwhirl',
    'abra', 'machop', 'bellsprout', 'weepinbell', 'tentacool', 'geodude', 'ponyta',
    'magnemite', 'doduo', 'seel', 'grimer', 'shellder', 'gastly', 'onix', 'drowzee',
    'krabby', 'voltorb', 'exeggcute', 'cubone', 'koffing', 'rhyhorn', 'horsea',
    'goldeen', 'staryu', 'scyther', 'smoochum', 'elekid', 'magby', 'magikarp',
    'omanyte', 'kabuto', 'corsola-galar', 'wooper', 'quagsire', 'teddiursa', 'swinub',
    'remoraid', 'houndour', 'phanpy', 'tyrogue', 'smoochum', 'treecko', 'grovyle',
    'torchic', 'combusken', 'mudkip', 'marshtomp', 'poochyena', 'zigzagoon', 'wurmple',
    'silcoon', 'cascoon', 'lotad', 'lombre', 'seedot', 'nuzleaf', 'taillow', 'wingull',
    'ralts', 'kirlia', 'surskit', 'shroomish', 'slakoth', 'vigoroth', 'nincada',
    'whismur', 'loudred', 'makuhita', 'nosepass', 'skitty', 'aron', 'lairon', 'meditite',
    'electrike', 'gulpin', 'carvanha', 'wailmer', 'numel', 'spoink', 'trapinch', 'vibrava',
    'cacnea', 'swablu', 'corphish', 'baltoy', 'lileep', 'anorith', 'feebas', 'shuppet',
    'duskull', 'snorunt', 'spheal', 'sealeo', 'clamperl', 'turtwig', 'grotle', 'chimchar',
    'monferno', 'piplup', 'prinplup', 'starly', 'staravia', 'bidoof', 'kricketot', 'shinx',
    'luxio', 'budew', 'cranidos', 'shieldon', 'burmy', 'combee', 'buizel', 'cherubi',
    'shellos', 'drifloon', 'buneary', 'glameow', 'chingling', 'stunky', 'bronzor', 'bonsly',
    'mime-jr', 'happiny', 'gible', 'munchlax', 'riolu', 'hippopotas', 'skorupi', 'croagunk',
    'finneon', 'mantyke', 'snover', 'snivy', 'servine', 'tepig', 'pignite', 'oshawott',
    'dewott', 'patrat', 'lillipup', 'herdier', 'purrloin', 'pansage', 'pansear', 'panpour',
    'munna', 'pidove', 'tranquill', 'blitzle', 'roggenrola', 'boldore', 'drilbur', 'timburr',
    'gurdurr', 'tympole', 'palpitoad', 'sewaddle', 'swadloon', 'venipede', 'whirlipede',
    'cottonee', 'petilil', 'sandile', 'krokorok', 'dwebble', 'scraggy', 'yamask', 'tirtouga',
    'archen', 'trubbish', 'zorua', 'minccino', 'gothita', 'gothorita', 'solosis', 'duosion',
    'ducklett', 'vanillite', 'vanillish', 'deerling', 'karrablast', 'foongus', 'frillish',
    'joltik', 'ferroseed', 'klink', 'klang', 'tynamo', 'eelektrik', 'elgyem', 'litwick',
    'lampent', 'axew', 'fraxure', 'cubchoo', 'shelmet', 'mienfoo', 'pawniard', 'rufflet',
    'vullaby', 'chespin', 'quilladin', 'fennekin', 'braixen', 'froakie', 'frogadier',
    'bunnelby', 'fletchling', 'fletchinder', 'scatterbug', 'spewpa', 'litleo', 'flabebe',
    'floette', 'skiddo', 'pancham', 'espurr', 'honedge', 'spritzee', 'swirlix', 'inkay',
    'binacle', 'skrelp', 'clauncher', 'helioptile', 'tyrunt', 'amaura', 'goomy', 'pumpkaboo',
    'bergmite', 'noibat', 'rowlet', 'dartrix', 'litten', 'torracat', 'popplio', 'brionne',
    'pikipek', 'trumbeak', 'yungoos', 'grubbin', 'charjabug', 'crabrawler', 'cutiefly',
    'rockruff', 'mareanie', 'mudbray', 'dewpider', 'fomantis', 'morelull', 'salandit',
    'stufful', 'bounsweet', 'steenee', 'wimpod', 'sandygast', 'cosmog', 'cosmoem',
    'poipole', 'grookey', 'thwackey', 'scorbunny', 'raboot', 'sobble', 'drizzile',
    'skwovet', 'rookidee', 'corvisquire', 'blipbug', 'dottler', 'nickit', 'gossifleur',
    'wooloo', 'chewtle', 'yamper', 'rolycoly', 'carkol', 'applin', 'silicobra', 'arrokuda',
    'toxel', 'sizzlipede', 'clobbopus', 'sinistea', 'hatenna', 'hattrem', 'impidimp',
    'morgrem', 'milcery', 'snom', 'cufant', 'sprigatito', 'floragato', 'fuecoco', 'crocalor',
    'quaxly', 'quaxwell', 'lechonk', 'tarountula', 'nymble', 'pawmi', 'pawmo', 'tandemaus',
    'fidough', 'smoliv', 'dolliv', 'nacli', 'naclstack', 'charcadet', 'tadbulb', 'wattrel',
    'maschiff', 'shroodle', 'capsakid', 'rellor', 'flittle', 'tinkatink', 'tinkatuff',
    'wiglett', 'finizen', 'varoom', 'glimmet', 'greavard', 'cetoddle', 'dondozo', 'tatsugiri'
  ];

  return nfeKeywords.some(keyword => name.includes(keyword));
};

/**
 * Calculates in-battle effective stats considering the held item
 * 
 * @param {Object} calculatedStats Base calculated stats ({ hp, attack, defense, spAtk, spDef, speed })
 * @param {Object} heldItem The held item configuration object
 * @param {Object} pokemon The selected Pokémon object
 * @param {Object} customConfig User custom settings { stat: 'attack', multiplier: 1.5 }
 * @param {Boolean} evioliteForceOverride User manual toggle for Eviolite eligibility
 * @returns {Object} { stats, multipliers, statDiffs, total, diffTotal, isActive, statusMessage, badge }
 */
export const calculateItemStats = ({
  calculatedStats = {},
  heldItem = null,
  pokemon = null,
  customConfig = { stat: 'attack', multiplier: 1.5 },
  evioliteEligible = null, // null = auto detect, true/false = manual
}) => {
  const item = heldItem || HELD_ITEMS[0];
  const safeStats = {
    hp: calculatedStats.hp || 0,
    attack: calculatedStats.attack || 0,
    defense: calculatedStats.defense || 0,
    spAtk: calculatedStats.spAtk || 0,
    spDef: calculatedStats.spDef || 0,
    speed: calculatedStats.speed || 0,
  };

  if (!item || item.id === 'none') {
    return {
      stats: { ...safeStats },
      multipliers: { hp: 1.0, attack: 1.0, defense: 1.0, spAtk: 1.0, spDef: 1.0, speed: 1.0 },
      statDiffs: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
      total: Object.values(safeStats).reduce((a, b) => a + b, 0),
      diffTotal: 0,
      isActive: false,
      statusMessage: null,
      badge: null,
    };
  }

  const appliedMultipliers = { hp: 1.0, attack: 1.0, defense: 1.0, spAtk: 1.0, spDef: 1.0, speed: 1.0 };
  let isActive = true;
  let statusMessage = null;
  let activeBadge = item.badge;

  // 1. Custom Item
  if (item.isCustom) {
    const targetStat = customConfig.stat || 'attack';
    const mult = Number(customConfig.multiplier) || 1.5;
    if (targetStat !== 'hp') {
      appliedMultipliers[targetStat] = mult;
      activeBadge = `${mult >= 1 ? '+' : ''}${Math.round((mult - 1) * 100)}% ${STAT_LABELS[targetStat]}`;
      statusMessage = `Custom modifier: ${mult}× to ${STAT_LABELS[targetStat]}.`;
    }
  }
  // 2. Species-Specific Items
  else if (item.species && item.species.length > 0) {
    const pokeName = (pokemon?.name || '').toLowerCase();
    const isMatch = item.species.some(s => pokeName.includes(s));
    if (!isMatch) {
      isActive = false;
      const formattedSpecies = item.species.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' or ');
      statusMessage = `Inactive: ${item.name} only activates for ${formattedSpecies}.`;
    } else {
      Object.entries(item.multipliers || {}).forEach(([k, v]) => {
        appliedMultipliers[k] = v;
      });
      statusMessage = `Active: ${item.name} doubles ${pokemon?.name ? pokemon.name.toUpperCase() : 'Pokémon'}’s stats!`;
    }
  }
  // 3. Eviolite Check
  else if (item.isEviolite) {
    const canEvolve = evioliteEligible !== null ? evioliteEligible : checkCanEvolve(pokemon);
    if (!canEvolve) {
      isActive = false;
      statusMessage = `Inactive: Eviolite only activates for Pokémon that can still evolve.`;
    } else {
      appliedMultipliers.defense = 1.5;
      appliedMultipliers.spDef = 1.5;
      statusMessage = `Active: +50% Defense and Special Defense for evolving Pokémon.`;
    }
  }
  // 4. Booster Energy (Protosynthesis / Quark Drive)
  else if (item.isBoosterEnergy) {
    const nonHpKeys = ['attack', 'defense', 'spAtk', 'spDef', 'speed'];
    let highestKey = 'attack';
    let highestVal = -1;
    nonHpKeys.forEach(k => {
      if ((safeStats[k] || 0) > highestVal) {
        highestVal = safeStats[k] || 0;
        highestKey = k;
      }
    });

    const boost = highestKey === 'speed' ? 1.5 : 1.3;
    appliedMultipliers[highestKey] = boost;
    const boostPct = highestKey === 'speed' ? '+50%' : '+30%';
    activeBadge = `${boostPct} ${STAT_LABELS[highestKey]}`;
    statusMessage = `Active: Boosts highest stat (${STAT_LABELS[highestKey]} ${highestVal}) by ${boostPct}.`;
  }
  // 5. Standard Item Multipliers
  else if (item.multipliers) {
    Object.entries(item.multipliers).forEach(([k, v]) => {
      appliedMultipliers[k] = v;
    });
    statusMessage = item.description;
  }

  // Calculate final effective stats (using standard Pokémon floor)
  const finalStats = {};
  const statDiffs = {};
  STAT_KEYS.forEach(key => {
    if (key === 'hp' || !isActive) {
      finalStats[key] = safeStats[key];
      statDiffs[key] = 0;
    } else {
      const mult = appliedMultipliers[key] || 1.0;
      finalStats[key] = Math.floor(safeStats[key] * mult);
      statDiffs[key] = finalStats[key] - safeStats[key];
    }
  });

  const total = Object.values(finalStats).reduce((a, b) => a + b, 0);
  const rawTotal = Object.values(safeStats).reduce((a, b) => a + b, 0);
  const diffTotal = total - rawTotal;

  return {
    stats: finalStats,
    multipliers: appliedMultipliers,
    statDiffs,
    total,
    diffTotal,
    isActive,
    statusMessage,
    badge: activeBadge,
  };
};
