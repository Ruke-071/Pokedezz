import { pokemonIndex } from './pokemonIndex.js';

/**
 * Canon regional evolution trees for all regional Pokémon variants
 * (Alolan, Galarian, Hisuian, Paldean).
 *
 * Each variant maps to its authentic regional evolution chain with:
 * - Proper regional base stage ID (e.g., Grimer Alola #10112)
 * - Proper regional evolved stage ID (e.g., Muk Alola #10113)
 * - Authentic sprites, official artwork links, levels, and evolution items
 */
export const REGIONAL_EVOLUTION_CHAINS = {
  // ── Standard & Regional Counterpart Lines ──────────────────────────────────
  'grimer': {
    id: 88,
    name: 'grimer',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 89, name: 'muk', minLevel: 38, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'muk': {
    id: 88,
    name: 'grimer',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 89, name: 'muk', minLevel: 38, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'rattata': {
    id: 19,
    name: 'rattata',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 20, name: 'raticate', minLevel: 20, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'raticate': {
    id: 19,
    name: 'rattata',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 20, name: 'raticate', minLevel: 20, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'sandshrew': {
    id: 27,
    name: 'sandshrew',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 28, name: 'sandslash', minLevel: 22, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'sandslash': {
    id: 27,
    name: 'sandshrew',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 28, name: 'sandslash', minLevel: 22, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'vulpix': {
    id: 37,
    name: 'vulpix',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 38, name: 'ninetales', minLevel: null, trigger: 'use-item', item: 'fire-stone', region: null, evolvesTo: [] }
    ]
  },
  'ninetales': {
    id: 37,
    name: 'vulpix',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 38, name: 'ninetales', minLevel: null, trigger: 'use-item', item: 'fire-stone', region: null, evolvesTo: [] }
    ]
  },

  'diglett': {
    id: 50,
    name: 'diglett',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 51, name: 'dugtrio', minLevel: 26, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'dugtrio': {
    id: 50,
    name: 'diglett',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 51, name: 'dugtrio', minLevel: 26, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'meowth': {
    id: 52,
    name: 'meowth',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 53, name: 'persian', minLevel: 28, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'persian': {
    id: 52,
    name: 'meowth',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 53, name: 'persian', minLevel: 28, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'geodude': {
    id: 74,
    name: 'geodude',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 75,
        name: 'graveler',
        minLevel: 25,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 76, name: 'golem', minLevel: null, trigger: 'trade', item: null, region: null, evolvesTo: [] }
        ]
      }
    ]
  },
  'graveler': {
    id: 74,
    name: 'geodude',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 75,
        name: 'graveler',
        minLevel: 25,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 76, name: 'golem', minLevel: null, trigger: 'trade', item: null, region: null, evolvesTo: [] }
        ]
      }
    ]
  },
  'golem': {
    id: 74,
    name: 'geodude',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 75,
        name: 'graveler',
        minLevel: 25,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 76, name: 'golem', minLevel: null, trigger: 'trade', item: null, region: null, evolvesTo: [] }
        ]
      }
    ]
  },

  'pikachu': {
    id: 25,
    name: 'pikachu',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 26, name: 'raichu', minLevel: null, trigger: 'use-item', item: 'thunder-stone', region: null, evolvesTo: [] },
      { id: 10100, name: 'raichu-alola', minLevel: null, trigger: 'use-item', item: 'thunder-stone', region: 'alola', evolvesTo: [] }
    ]
  },
  'raichu': {
    id: 25,
    name: 'pikachu',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 26, name: 'raichu', minLevel: null, trigger: 'use-item', item: 'thunder-stone', region: null, evolvesTo: [] },
      { id: 10100, name: 'raichu-alola', minLevel: null, trigger: 'use-item', item: 'thunder-stone', region: 'alola', evolvesTo: [] }
    ]
  },

  'exeggcute': {
    id: 102,
    name: 'exeggcute',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 103, name: 'exeggutor', minLevel: null, trigger: 'use-item', item: 'leaf-stone', region: null, evolvesTo: [] },
      { id: 10114, name: 'exeggutor-alola', minLevel: null, trigger: 'use-item', item: 'leaf-stone', region: 'alola', evolvesTo: [] }
    ]
  },
  'exeggutor': {
    id: 102,
    name: 'exeggcute',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 103, name: 'exeggutor', minLevel: null, trigger: 'use-item', item: 'leaf-stone', region: null, evolvesTo: [] },
      { id: 10114, name: 'exeggutor-alola', minLevel: null, trigger: 'use-item', item: 'leaf-stone', region: 'alola', evolvesTo: [] }
    ]
  },

  'cubone': {
    id: 104,
    name: 'cubone',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 105, name: 'marowak', minLevel: 28, trigger: 'level-up', item: null, region: null, evolvesTo: [] },
      { id: 10115, name: 'marowak-alola', minLevel: 28, trigger: 'level-up', item: null, region: 'alola', evolvesTo: [] }
    ]
  },
  'marowak': {
    id: 104,
    name: 'cubone',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 105, name: 'marowak', minLevel: 28, trigger: 'level-up', item: null, region: null, evolvesTo: [] },
      { id: 10115, name: 'marowak-alola', minLevel: 28, trigger: 'level-up', item: null, region: 'alola', evolvesTo: [] }
    ]
  },

  // ── Alolan Lines ──────────────────────────────────────────────────────────
  'grimer-alola': {
    id: 10112,
    name: 'grimer-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10113, name: 'muk-alola', minLevel: 38, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'muk-alola': {
    id: 10112,
    name: 'grimer-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10113, name: 'muk-alola', minLevel: 38, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'rattata-alola': {
    id: 10091,
    name: 'rattata-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10092, name: 'raticate-alola', minLevel: 20, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'raticate-alola': {
    id: 10091,
    name: 'rattata-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10092, name: 'raticate-alola', minLevel: 20, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'raticate-totem-alola': {
    id: 10091,
    name: 'rattata-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10093, name: 'raticate-totem-alola', minLevel: 20, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'sandshrew-alola': {
    id: 10101,
    name: 'sandshrew-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10102, name: 'sandslash-alola', minLevel: null, trigger: 'use-item', item: 'ice-stone', region: null, evolvesTo: [] }
    ]
  },
  'sandslash-alola': {
    id: 10101,
    name: 'sandshrew-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10102, name: 'sandslash-alola', minLevel: null, trigger: 'use-item', item: 'ice-stone', region: null, evolvesTo: [] }
    ]
  },

  'vulpix-alola': {
    id: 10103,
    name: 'vulpix-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10104, name: 'ninetales-alola', minLevel: null, trigger: 'use-item', item: 'ice-stone', region: null, evolvesTo: [] }
    ]
  },
  'ninetales-alola': {
    id: 10103,
    name: 'vulpix-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10104, name: 'ninetales-alola', minLevel: null, trigger: 'use-item', item: 'ice-stone', region: null, evolvesTo: [] }
    ]
  },

  'diglett-alola': {
    id: 10105,
    name: 'diglett-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10106, name: 'dugtrio-alola', minLevel: 26, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'dugtrio-alola': {
    id: 10105,
    name: 'diglett-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10106, name: 'dugtrio-alola', minLevel: 26, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'meowth-alola': {
    id: 10107,
    name: 'meowth-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10108, name: 'persian-alola', minLevel: null, trigger: 'level-up', item: 'high-friendship', region: null, evolvesTo: [] }
    ]
  },
  'persian-alola': {
    id: 10107,
    name: 'meowth-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      { id: 10108, name: 'persian-alola', minLevel: null, trigger: 'level-up', item: 'high-friendship', region: null, evolvesTo: [] }
    ]
  },

  'geodude-alola': {
    id: 10109,
    name: 'geodude-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      {
        id: 10110,
        name: 'graveler-alola',
        minLevel: 25,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 10111, name: 'golem-alola', minLevel: null, trigger: 'trade', item: null, region: null, evolvesTo: [] }
        ]
      }
    ]
  },
  'graveler-alola': {
    id: 10109,
    name: 'geodude-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      {
        id: 10110,
        name: 'graveler-alola',
        minLevel: 25,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 10111, name: 'golem-alola', minLevel: null, trigger: 'trade', item: null, region: null, evolvesTo: [] }
        ]
      }
    ]
  },
  'golem-alola': {
    id: 10109,
    name: 'geodude-alola',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'alola',
    evolvesTo: [
      {
        id: 10110,
        name: 'graveler-alola',
        minLevel: 25,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 10111, name: 'golem-alola', minLevel: null, trigger: 'trade', item: null, region: null, evolvesTo: [] }
        ]
      }
    ]
  },

  'raichu-alola': {
    id: 172,
    name: 'pichu',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 25,
        name: 'pikachu',
        minLevel: null,
        trigger: 'level-up',
        item: 'friendship',
        region: null,
        evolvesTo: [
          { id: 10100, name: 'raichu-alola', minLevel: null, trigger: 'use-item', item: 'thunder-stone', region: 'alola', evolvesTo: [] }
        ]
      }
    ]
  },

  'exeggutor-alola': {
    id: 102,
    name: 'exeggcute',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 10114, name: 'exeggutor-alola', minLevel: null, trigger: 'use-item', item: 'leaf-stone', region: 'alola', evolvesTo: [] }
    ]
  },

  'marowak-alola': {
    id: 104,
    name: 'cubone',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 10115, name: 'marowak-alola', minLevel: 28, trigger: 'level-up', item: null, region: 'alola', evolvesTo: [] }
    ]
  },

  // ── Galarian Lines ────────────────────────────────────────────────────────
  'meowth-galar': {
    id: 10161,
    name: 'meowth-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 863, name: 'perrserker', minLevel: 28, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'perrserker': {
    id: 10161,
    name: 'meowth-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 863, name: 'perrserker', minLevel: 28, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'ponyta-galar': {
    id: 10162,
    name: 'ponyta-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 10163, name: 'rapidash-galar', minLevel: 40, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'rapidash-galar': {
    id: 10162,
    name: 'ponyta-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 10163, name: 'rapidash-galar', minLevel: 40, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'slowpoke-galar': {
    id: 10164,
    name: 'slowpoke-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 10165, name: 'slowbro-galar', minLevel: null, trigger: 'use-item', item: 'galarica-cuff', region: 'galar', evolvesTo: [] },
      { id: 10172, name: 'slowking-galar', minLevel: null, trigger: 'use-item', item: 'galarica-wreath', region: 'galar', evolvesTo: [] }
    ]
  },
  'slowbro-galar': {
    id: 10164,
    name: 'slowpoke-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 10165, name: 'slowbro-galar', minLevel: null, trigger: 'use-item', item: 'galarica-cuff', region: 'galar', evolvesTo: [] }
    ]
  },
  'slowking-galar': {
    id: 10164,
    name: 'slowpoke-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 10172, name: 'slowking-galar', minLevel: null, trigger: 'use-item', item: 'galarica-wreath', region: 'galar', evolvesTo: [] }
    ]
  },

  'farfetchd-galar': {
    id: 10166,
    name: 'farfetchd-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 865, name: 'sirfetchd', minLevel: null, trigger: '3-crits', item: 'leek', region: null, evolvesTo: [] }
    ]
  },
  'sirfetchd': {
    id: 10166,
    name: 'farfetchd-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 865, name: 'sirfetchd', minLevel: null, trigger: '3-crits', item: 'leek', region: null, evolvesTo: [] }
    ]
  },

  'weezing-galar': {
    id: 109,
    name: 'koffing',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 10167, name: 'weezing-galar', minLevel: 35, trigger: 'level-up', item: null, region: 'galar', evolvesTo: [] }
    ]
  },

  'mr-mime-galar': {
    id: 439,
    name: 'mime-jr',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 10168,
        name: 'mr-mime-galar',
        minLevel: null,
        trigger: 'level-up',
        item: 'knows-mimic',
        region: 'galar',
        evolvesTo: [
          { id: 866, name: 'mr-rime', minLevel: 42, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
        ]
      }
    ]
  },
  'mr-rime': {
    id: 439,
    name: 'mime-jr',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 10168,
        name: 'mr-mime-galar',
        minLevel: null,
        trigger: 'level-up',
        item: 'knows-mimic',
        region: 'galar',
        evolvesTo: [
          { id: 866, name: 'mr-rime', minLevel: 42, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
        ]
      }
    ]
  },

  'corsola-galar': {
    id: 10173,
    name: 'corsola-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 864, name: 'cursola', minLevel: 38, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'cursola': {
    id: 10173,
    name: 'corsola-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 864, name: 'cursola', minLevel: 38, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'zigzagoon-galar': {
    id: 10174,
    name: 'zigzagoon-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      {
        id: 10175,
        name: 'linoone-galar',
        minLevel: 20,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 862, name: 'obstagoon', minLevel: 35, trigger: 'level-up', item: 'night', region: null, evolvesTo: [] }
        ]
      }
    ]
  },
  'linoone-galar': {
    id: 10174,
    name: 'zigzagoon-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      {
        id: 10175,
        name: 'linoone-galar',
        minLevel: 20,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 862, name: 'obstagoon', minLevel: 35, trigger: 'level-up', item: 'night', region: null, evolvesTo: [] }
        ]
      }
    ]
  },
  'obstagoon': {
    id: 10174,
    name: 'zigzagoon-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      {
        id: 10175,
        name: 'linoone-galar',
        minLevel: 20,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 862, name: 'obstagoon', minLevel: 35, trigger: 'level-up', item: 'night', region: null, evolvesTo: [] }
        ]
      }
    ]
  },

  'darumaka-galar': {
    id: 10176,
    name: 'darumaka-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 10177, name: 'darmanitan-galar-standard', minLevel: null, trigger: 'use-item', item: 'ice-stone', region: null, evolvesTo: [] }
    ]
  },
  'darmanitan-galar-standard': {
    id: 10176,
    name: 'darumaka-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 10177, name: 'darmanitan-galar-standard', minLevel: null, trigger: 'use-item', item: 'ice-stone', region: null, evolvesTo: [] }
    ]
  },

  'yamask-galar': {
    id: 10179,
    name: 'yamask-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 867, name: 'runerigus', minLevel: null, trigger: 'stone-sculpture', item: 'take-damage', region: null, evolvesTo: [] }
    ]
  },
  'runerigus': {
    id: 10179,
    name: 'yamask-galar',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'galar',
    evolvesTo: [
      { id: 867, name: 'runerigus', minLevel: null, trigger: 'stone-sculpture', item: 'take-damage', region: null, evolvesTo: [] }
    ]
  },

  // ── Hisuian Lines ─────────────────────────────────────────────────────────
  'growlithe-hisui': {
    id: 10229,
    name: 'growlithe-hisui',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'hisui',
    evolvesTo: [
      { id: 10230, name: 'arcanine-hisui', minLevel: null, trigger: 'use-item', item: 'fire-stone', region: null, evolvesTo: [] }
    ]
  },
  'arcanine-hisui': {
    id: 10229,
    name: 'growlithe-hisui',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'hisui',
    evolvesTo: [
      { id: 10230, name: 'arcanine-hisui', minLevel: null, trigger: 'use-item', item: 'fire-stone', region: null, evolvesTo: [] }
    ]
  },

  'voltorb-hisui': {
    id: 10231,
    name: 'voltorb-hisui',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'hisui',
    evolvesTo: [
      { id: 10232, name: 'electrode-hisui', minLevel: null, trigger: 'use-item', item: 'leaf-stone', region: null, evolvesTo: [] }
    ]
  },
  'electrode-hisui': {
    id: 10231,
    name: 'voltorb-hisui',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'hisui',
    evolvesTo: [
      { id: 10232, name: 'electrode-hisui', minLevel: null, trigger: 'use-item', item: 'leaf-stone', region: null, evolvesTo: [] }
    ]
  },

  'typhlosion-hisui': {
    id: 155,
    name: 'cyndaquil',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 156,
        name: 'quilava',
        minLevel: 14,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 10233, name: 'typhlosion-hisui', minLevel: 36, trigger: 'level-up', item: null, region: 'hisui', evolvesTo: [] }
        ]
      }
    ]
  },

  'qwilfish-hisui': {
    id: 10234,
    name: 'qwilfish-hisui',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'hisui',
    evolvesTo: [
      { id: 904, name: 'overqwil', minLevel: null, trigger: 'barb-barrage', item: 'strong-style', region: null, evolvesTo: [] }
    ]
  },
  'overqwil': {
    id: 10234,
    name: 'qwilfish-hisui',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'hisui',
    evolvesTo: [
      { id: 904, name: 'overqwil', minLevel: null, trigger: 'barb-barrage', item: 'strong-style', region: null, evolvesTo: [] }
    ]
  },

  'sneasel-hisui': {
    id: 10235,
    name: 'sneasel-hisui',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'hisui',
    evolvesTo: [
      { id: 903, name: 'sneasler', minLevel: null, trigger: 'use-item', item: 'razor-claw-day', region: null, evolvesTo: [] }
    ]
  },
  'sneasler': {
    id: 10235,
    name: 'sneasel-hisui',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'hisui',
    evolvesTo: [
      { id: 903, name: 'sneasler', minLevel: null, trigger: 'use-item', item: 'razor-claw-day', region: null, evolvesTo: [] }
    ]
  },

  'samurott-hisui': {
    id: 501,
    name: 'oshawott',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 502,
        name: 'dewott',
        minLevel: 17,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 10236, name: 'samurott-hisui', minLevel: 36, trigger: 'level-up', item: null, region: 'hisui', evolvesTo: [] }
        ]
      }
    ]
  },

  'lilligant-hisui': {
    id: 548,
    name: 'petilil',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 10237, name: 'lilligant-hisui', minLevel: null, trigger: 'use-item', item: 'sun-stone', region: 'hisui', evolvesTo: [] }
    ]
  },

  'zorua-hisui': {
    id: 10238,
    name: 'zorua-hisui',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'hisui',
    evolvesTo: [
      { id: 10239, name: 'zoroark-hisui', minLevel: 30, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'zoroark-hisui': {
    id: 10238,
    name: 'zorua-hisui',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'hisui',
    evolvesTo: [
      { id: 10239, name: 'zoroark-hisui', minLevel: 30, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },

  'braviary-hisui': {
    id: 627,
    name: 'rufflet',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 10240, name: 'braviary-hisui', minLevel: 54, trigger: 'level-up', item: null, region: 'hisui', evolvesTo: [] }
    ]
  },

  'sliggoo-hisui': {
    id: 704,
    name: 'goomy',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 10241,
        name: 'sliggoo-hisui',
        minLevel: 40,
        trigger: 'level-up',
        item: null,
        region: 'hisui',
        evolvesTo: [
          { id: 10242, name: 'goodra-hisui', minLevel: 50, trigger: 'level-up', item: 'rain', region: 'hisui', evolvesTo: [] }
        ]
      }
    ]
  },
  'goodra-hisui': {
    id: 704,
    name: 'goomy',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 10241,
        name: 'sliggoo-hisui',
        minLevel: 40,
        trigger: 'level-up',
        item: null,
        region: 'hisui',
        evolvesTo: [
          { id: 10242, name: 'goodra-hisui', minLevel: 50, trigger: 'level-up', item: 'rain', region: 'hisui', evolvesTo: [] }
        ]
      }
    ]
  },

  'avalugg-hisui': {
    id: 712,
    name: 'bergmite',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      { id: 10243, name: 'avalugg-hisui', minLevel: 37, trigger: 'level-up', item: null, region: 'hisui', evolvesTo: [] }
    ]
  },

  'decidueye-hisui': {
    id: 722,
    name: 'rowlet',
    minLevel: null,
    trigger: null,
    item: null,
    region: null,
    evolvesTo: [
      {
        id: 723,
        name: 'dartrix',
        minLevel: 17,
        trigger: 'level-up',
        item: null,
        region: null,
        evolvesTo: [
          { id: 10244, name: 'decidueye-hisui', minLevel: 36, trigger: 'level-up', item: null, region: 'hisui', evolvesTo: [] }
        ]
      }
    ]
  },

  // ── Paldean Lines ─────────────────────────────────────────────────────────
  'wooper-paldea': {
    id: 10253,
    name: 'wooper-paldea',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'paldea',
    evolvesTo: [
      { id: 980, name: 'clodsire', minLevel: 20, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  },
  'clodsire': {
    id: 10253,
    name: 'wooper-paldea',
    minLevel: null,
    trigger: null,
    item: null,
    region: 'paldea',
    evolvesTo: [
      { id: 980, name: 'clodsire', minLevel: 20, trigger: 'level-up', item: null, region: null, evolvesTo: [] }
    ]
  }
};

/**
 * Returns a cloned regional evolution chain if the given Pokémon ID or name is a regional variant
 */
export const getRegionalEvolutionChain = (pokemonIdOrName) => {
  if (!pokemonIdOrName) return null;
  const queryStr = String(pokemonIdOrName).toLowerCase().trim();
  const matched =
    pokemonIndex.find(p => String(p.id) === queryStr) ||
    pokemonIndex.find(p => p.name.toLowerCase() === queryStr);

  const name = matched ? matched.name.toLowerCase() : queryStr;
  const chainTemplate = REGIONAL_EVOLUTION_CHAINS[name];

  if (!chainTemplate) return null;

  // Return deep clone
  return JSON.parse(JSON.stringify(chainTemplate));
};

/**
 * Checks whether the given Pokémon is a regional form
 */
export const isRegionalPokemon = (pokemonIdOrName) => {
  if (!pokemonIdOrName) return false;
  const queryStr = String(pokemonIdOrName).toLowerCase().trim();
  const matched =
    pokemonIndex.find(p => String(p.id) === queryStr) ||
    pokemonIndex.find(p => p.name.toLowerCase() === queryStr);

  const name = matched ? matched.name.toLowerCase() : queryStr;
  return (
    name.includes('-alola') ||
    name.includes('-galar') ||
    name.includes('-hisui') ||
    name.includes('-paldea') ||
    Boolean(REGIONAL_EVOLUTION_CHAINS[name])
  );
};

/**
 * Returns region string ('alola', 'galar', 'hisui', 'paldea') or null
 */
export const getPokemonRegion = (pokemonIdOrName) => {
  if (!pokemonIdOrName) return null;
  const queryStr = String(pokemonIdOrName).toLowerCase().trim();
  const matched =
    pokemonIndex.find(p => String(p.id) === queryStr) ||
    pokemonIndex.find(p => p.name.toLowerCase() === queryStr);

  const name = matched ? matched.name.toLowerCase() : queryStr;
  if (name.includes('-alola')) return 'alola';
  if (name.includes('-galar')) return 'galar';
  if (name.includes('-hisui')) return 'hisui';
  if (name.includes('-paldea')) return 'paldea';
  if (['perrserker', 'sirfetchd', 'mr-rime', 'cursola', 'obstagoon', 'runerigus'].includes(name)) return 'galar';
  if (['overqwil', 'sneasler', 'basculegion', 'wyrdeer', 'kleavor', 'ursaluna'].includes(name)) return 'hisui';
  if (['clodsire', 'annihilape', 'dudunsparce', 'farigiraf'].includes(name)) return 'paldea';
  return null;
};
