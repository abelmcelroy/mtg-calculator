const { fisherYates, rand } = require("../../src/statisticalSimulator.js");
const [
  Forest,
  Island,
  Plains,
  SeasideCitidel,
  Treva,
  BantCharm,
  Vizzerdrix,
  ThistledownLiege,
  NosyGoblin,
  BloodtitheHarvester,
  CorpseAppraiser,
  EvelyntheCovetous,
  LedgerShredder,
  MalevolentHermit,
  ExpressiveIteration,
  InfernalGrasp,
  MakeDisappear,
  Negate,
  PrismariCommand,
  SpellPierce,
  VoltageSurge,
  ReckonerBankbuster,
  FableoftheMirrorBreaker,
  TheMeathookMassacre,
  BlightstepPathway,
  ClearwaterPathway,
  HauntedRidge,
  HiveoftheEyeTyrant,
  RiverglidePathway,
  ShipwreckMarsh,
  StormcarvedCoast,
  Swamp,
  XandersLounge,
] = [
  require("../../data/cards/Forest.json"),
  require("../../data/cards/Island.json"),
  require("../../data/cards/Plains.json"),
  require("../../data/cards/Seaside\ Citadel.json"),
  require("../../data/cards/Treva\,\ the\ Renewer.json"),
  require("../../data/cards/Bant\ Charm.json"),
  require("../../data/cards/Vizzerdrix.json"),
  require("../../data/cards/Thistledown\ Liege.json"),
  require("../../data/cards/Nosy\ Goblin.json"),
  require("../../data/cards/Bloodtithe\ Harvester.json"),
  require("../../data/cards/Corpse\ Appraiser.json"),
  require("../../data/cards/Evelyn\,\ the Covetous.json"),
  require("../../data/cards/Ledger\ Shredder.json"),
  require("../../data/cards/Malevolent\ Hermit\ \-\-\ Benevolent\ Geist.json"),
  require("../../data/cards/Expressive\ Iteration.json"),
  require("../../data/cards/Infernal\ Grasp.json"),
  require("../../data/cards/Make\ Disappear.json"),
  require("../../data/cards/Negate.json"),
  require("../../data/cards/Prismari\ Command.json"),
  require("../../data/cards/Spell\ Pierce.json"),
  require("../../data/cards/Voltage\ Surge.json"),
  require("../../data/cards/Reckoner\ Bankbuster.json"),
  require("../../data/cards/Fable\ of\ the\ Mirror\-Breaker\ \-\-\ Reflection\ of\ Kiki\-Jiki.json"),
  require("../../data/cards/The\ Meathook\ Massacre.json"),
  require("../../data/cards/Blightstep\ Pathway\ \-\-\ Searstep\ Pathway.json"),
  require("../../data/cards/Clearwater\ Pathway\ \-\-\ Murkwater\ Pathway.json"),
  require("../../data/cards/Haunted\ Ridge.json"),
  require("../../data/cards/Hive\ of\ the\ Eye\ Tyrant.json"),
  require("../../data/cards/Riverglide\ Pathway\ \-\-\ Lavaglide\ Pathway.json"),
  require("../../data/cards/Shipwreck\ Marsh.json"),
  require("../../data/cards/Stormcarved\ Coast.json"),
  require("../../data/cards/Swamp.json"),
  require("../../data/cards/Xander\'s\ Lounge.json"),
];

const ArborealGrazer = {
  name: "Arboreal Grazer",
  types: "{Other}",
  type: "Other",
  mana_cost: "{G}",
}

const AzoriusGuildgate = {
  name: "Azorius Guildgate",
  producible_mana_colors: "U,W",
  types: "{Land}",
  tap_land: true,
  type: "Land",
}

const BlastZone = {
  name: "Blast Zone",
  producible_mana_colors: "C",
  types: "{Land}",
  type: "Land",
}

const BlossomingSands = {
  name: "Blossoming Sands",
  producible_mana_colors: "G,W",
  types: "{Land}",
  tap_land: true,
  type: "Land",
}

const BreedingPool = {
  name: "Breeding Pool",
  producible_mana_colors: "G,U",
  types: "{Land}",
  type: "Land",
}

const CircuitousRoute = {
  name: "Circuitous Route",
  types: "{Other}",
  type: "Other",
  mana_cost: "{3}{G}",
}

const DeputyOfDetention = {
  name: "Deputy of Detention",
  types: "{Other}",
  type: "Other",
  mana_cost: "{1}{U}{W}",
}

const ElvishRejuvenator = {
  name: "Elvish Rejuvenator",
  types: "{Other}",
  type: "Other",
  mana_cost: "{2}{G}",
}

const FieldOfRuin = {
  name: "Field of Ruin",
  producible_mana_colors: "C",
  types: "{Land}",
  type: "Land",
}

const FieldOfTheDead = {
  name: "Field of the Dead",
  producible_mana_colors: "C",
  types: "{Land}",
  tap_land: true,
  type: "Land",
}

const GlacialFortress = {
  name: "Glacial Fortress",
  producible_mana_colors: "U,W",
  types: "{Land}",
  tap_land: true,
  tap_exceptions: "Plains,Island",
  type: "Land",
}

const GrowFromTheAshes = {
  name: "Grow from the Ashes",
  types: "{Other}",
  type: "Other",
  mana_cost: "{2}{G}",
}

const GrowthSpiral = {
  name: "Growth Spiral",
  types: "{Other}",
  type: "Other",
  mana_cost: "{G}{U}",
}

const HallowedFountain = {
  name: "Hallowed Fountain",
  producible_mana_colors: "U,W",
  types: "{Land}",
  type: "Land",
}

const HinterlandHarbor = {
  name: "Hinterland Harbor",
  producible_mana_colors: "G,U",
  types: "{Land}",
  tap_exceptions: "Forest,Island",
  type: "Land",
}

const ThornwoodFalls = {
  name: "Thornwood Falls",
  producible_mana_colors: "G,U",
  types: "{Land}",
  tap_land: true,
  type: "Land",
}

const HydroidKrasis = {
  name: "Hydroid Krasis",
  types: "{Other}",
  type: "Other",
  mana_cost: "{X}{G}{U}",
}

const MemorialToGenius = {
  name: "Memorial to Genius",
  producible_mana_colors: "U",
  types: "{Land}",
  tap_land: true,
  type: "Land",
}

const Scapeshift = {
  name: "Scapeshift",
  types: "{Other}",
  type: "Other",
  mana_cost: "{2}{G}{G}",
}

const SelesnyaGuildgate = {
  name: "Selesnya Guildgate",
  producible_mana_colors: "G,W",
  types: "{Land}",
  tap_land: true,
  type: "Land",
}

const SimicGuildgate = {
  name: "Simic Guildgate",
  producible_mana_colors: "G,U",
  types: "{Land}",
  tap_land: true,
  type: "Land",
}

const SunpetalGrove = {
  name: "Sunpetal Grove",
  producible_mana_colors: "G,W",
  types: "{Land}",
  tap_exceptions: "Forest,Plains",
  type: "Land",
}

const TeferiTimeRaveler = {
  name: "Teferi, Time Raveler",
  types: "{Other}",
  type: "Other",
  mana_cost: "{1}{U}{W}",
}

const TempleGarden = {
  name: "Temple Garden",
  producible_mana_colors: "G,W",
  types: "{Land}",
  type: "Land",
}

const TempleOfMystery = {
  name: "Temple of Mystery",
  producible_mana_colors: "G,U",
  types: "{Land}",
  tap_land: true,
  type: "Land",
}

const TimeWipe = {
  name: "Time Wipe",
  types: "{Other}",
  type: "Other",
  mana_cost: "{2}{W}{W}{U}",
}

const FalseIsland = {
  name: "Island",
  producible_mana_colors: "U",
  types: "{Land}",
  type: "Basic Land - Island",
}

const FalseForest = {
  name: "Forest",
  producible_mana_colors: "G",
  types: "{Land}",
  type: "Basic Land - Forest",
}

const Mountain = {
  name: "Mountain",
  producible_mana_colors: "R",
  types: "{Land}",
  type: "Basic Land - Mountain",
}

const FalsePlains = {
  name: "Plains",
  producible_mana_colors: "W",
  types: "{Land}",
  type: "Basic Land - Plains",
}

const PlainsForest = {
  name: "PlainsForest",
  producible_mana_colors: "W,G",
  types: "{Land}",
  tap_land: true,
  type: "Basic Land - Plains, Forest",
}

const MountainPlains = {
  name: "MountainPlains",
  producible_mana_colors: "R,W",
  types: "{Land}",
  tap_land: true,
  type: "Basic Land - Mountain, Plains",
}

const MountainForest = {
  name: "MountainForest",
  producible_mana_colors: "G,R",
  types: "{Land}",
  tap_land: true,
  type: "Basic Land - Mountain, Forest",
}

const LandWG = {
  name: "LandWG",
  producible_mana_colors: "W,G",
  types: "{Land}",
  tap_land: true,
  type: "Land",
}

const LandWGR = {
  name: "LandWGR",
  producible_mana_colors: "W,G,R",
  types: "{Land}",
  tap_land: true,
  type: "Land",
}

const LandC = {
  name: "LandC",
  producible_mana_colors: "C",
  types: "{Land}",
  type: "Land",
}

const Taiga = {
  name: "Taiga",
  producible_mana_colors: "G,R",
  types: "{Land}",
  type: "Basic Land - Forest, Mountain",
}

const splitLandWG = {
  name: "splitLand",
  producible_mana_colors: "WG,W,G",
  types: "{Land}",
  type: "Land",
}

const WG = {
  name: "WG",
  types: "{Other}",
  type: "Other",
  mana_cost: "{W}{G}",
}

const RWG = {
  name: "RWG",
  types: "{Other}",
  type: "Other",
  mana_cost: "{R}{G}{W}",
}

const RWGC = {
  name: "RWGC",
  types: "{Other}",
  type: "Other",
  mana_cost: "{R}{W}{G}{1}",
}

const C3 = {
  name: "C3",
  types: "{Other}",
  type: "Other",
  mana_cost: "{3}",
}

const WoollyThoctar = {
  name: "Woolly Thoctar",
  types: "{Creature}",
  type: "Creature",
  mana_cost: "{R}{W}{G}",
}

const DevoutLightcaster = {
  name: "Devout Lightcaster",
  types: "{Creature}",
  type: "Creature",
  mana_cost: "{W}{W}{W}",
}

const BaneSlayerAngel = {
  name: "Bane-Slayer Angel",
  types: "{Creature}",
  type: "Creature",
  mana_cost: "{W}{W}{3}",
}

const WiltLeafLeige = {
  name: "Wilt-Leaf Leige",
  types: "{Creature}",
  type: "Creature",
  mana_cost: "{WG}{WG}{WG}{1}",
}

const RithTheAwakener = {
  name: "Rith the Awakener",
  types: "{Creature}",
  type: "Creature",
  mana_cost: "{G}{W}{R}{3}",
}

const RithsCharm = {
  name: "Rith's Charm",
  types: "{Creature}",
  type: "Creature",
  mana_cost: "{G}{W}{R}"
}

const Pacifism = {
  name: "Pacifism",
  types: "{Enchantment}",
  type: "Enchantment",
  mana_cost: "{W}{1}"
}

const BaneFire = {
  name: "Bane Fire",
  types: "{Sorcery}",
  type: "Sorcery",
  mana_cost: "{R}{X}"
}

const NobelHierarch = {
  name: "Nobel Hierarch",
  types: "{Creature}",
  type: "Creature",
  mana_cost: "{G}"
}

const Quilspike = {
  name: "Quilspike",
  types: "{Creature}",
  type: "Creature",
  mana_cost: "{GB}{2}"
}

const ElvishDruid = {
  name: "Elvish Druid",
  types: "{Creature}",
  type: "Creature",
  mana_cost: "{G}{1}"
}

const Stifle = {
  name: "Stifle",
  types: "{Instant}",
  type: "Instant",
  mana_cost: "{U}"
}

const Bant = [
  copies(ArborealGrazer, 4),
  copies(AzoriusGuildgate, 2),
  copies(BlastZone, 1),
  copies(BlossomingSands, 1),
  copies(BreedingPool, 2),
  copies(CircuitousRoute, 4),
  copies(DeputyOfDetention, 2),
  copies(ElvishRejuvenator, 4),
  copies(FieldOfRuin, 1),
  copies(FieldOfTheDead, 4),
  copies(FalseForest, 4),
  copies(GlacialFortress, 1),
  copies(GrowFromTheAshes, 1),
  copies(GrowthSpiral, 4),
  copies(HallowedFountain, 2),
  copies(HinterlandHarbor, 1),
  copies(HydroidKrasis, 4),
  copies(Island, 2),
  copies(MemorialToGenius, 1),
  copies(FalsePlains, 1),
  copies(Scapeshift, 4),
  copies(SelesnyaGuildgate, 1),
  copies(SimicGuildgate, 1),
  copies(SunpetalGrove, 1),
  copies(TeferiTimeRaveler, 4),
  copies(TempleGarden, 2),
  copies(TempleOfMystery, 2),
  copies(ThornwoodFalls, 1),
  copies(TimeWipe, 1),
]

const simpleSample1 = [
  copies(ArborealGrazer, 4),
  copies(FalseForest, 4)
]

const simpleSample2 = [
  copies(ArborealGrazer, 8),
  copies(BlossomingSands, 4)
]

const simpleSample3 = [
  copies(ArborealGrazer, 2),
  copies(BlossomingSands, 4),
  copies(FalseForest, 4)
]

const sample1 = [
  copies(HydroidKrasis, 4),
  copies(SimicGuildgate, 4),
  copies(BlossomingSands, 4)
]

const sample2 = [
  copies(HydroidKrasis, 4),
  copies(SimicGuildgate, 2),
  copies(BlossomingSands, 2),
  copies(FalseForest, 2),
  copies(FalseIsland, 2)
]

const realDataDeck1 = [
  copies(Plains, 8),
  copies(Forest, 8),
  copies(Island, 8),
  copies(SeasideCitidel, 4),
  copies(BantCharm, 4),
  copies(Treva, 1),
  copies(Vizzerdrix, 27),
];

const realDataDeck2 = [
  copies(Plains, 8),
  copies(Forest, 8),
  copies(Island, 8),
  copies(SeasideCitidel, 4),
  copies(BantCharm, 4),
  copies(Treva, 1),
  copies(Vizzerdrix, 27),
];

const realDataDeck3 = [
  copies(Plains, 8),
  copies(Forest, 8),
  copies(Island, 8),
  copies(SeasideCitidel, 4),
  copies(BantCharm, 4),
  copies(ThistledownLiege, 2),
  copies(Treva, 1),
  copies(Vizzerdrix, 25),
];

const realDataDeck4 = [
  copies(Plains, 8),
  copies(Forest, 8),
  copies(Island, 8),
  copies(SeasideCitidel, 4),
  copies(BantCharm, 4),
  copies(ThistledownLiege, 2),
  copies(Treva, 1),
  copies(Vizzerdrix, 25),
  copies(NosyGoblin, 1)
];

const realMetaDeck1 = [
  copies(BloodtitheHarvester, 4),
  copies(CorpseAppraiser, 4),
  copies(EvelyntheCovetous, 2),
  copies(LedgerShredder, 2),
  copies(MalevolentHermit, 1),
  copies(ExpressiveIteration, 4),
  copies(InfernalGrasp, 2),
  copies(MakeDisappear, 2),
  copies(Negate, 1),
  copies(PrismariCommand, 1),
  copies(SpellPierce, 1),
  copies(VoltageSurge, 4),
  copies(ReckonerBankbuster, 2),
  copies(FableoftheMirrorBreaker, 4),
  copies(TheMeathookMassacre, 1),
  copies(BlightstepPathway, 3),
  copies(ClearwaterPathway, 3),
  copies(HauntedRidge, 4),
  copies(HiveoftheEyeTyrant, 1),
  copies(Island, 1),
  copies(RiverglidePathway, 3),
  copies(ShipwreckMarsh, 2),
  copies(StormcarvedCoast, 3),
  copies(Swamp, 1),
  copies(XandersLounge, 4),
];

const allDecks = {
  realMetaDeck1,
  realDataDeck4,
  realDataDeck3,
  realDataDeck2,
  realDataDeck1,
  simpleSample1,
  simpleSample2,
  simpleSample3,
  sample1,
  sample2
}

const allCards = {
  FalseForest,
  Mountain,
  Plains,
  PlainsForest,
  MountainPlains,
  MountainForest,
  ArborealGrazer,
  AzoriusGuildgate,
  BlastZone,
  BlossomingSands,
  BreedingPool,
  CircuitousRoute,
  DeputyOfDetention,
  ElvishRejuvenator,
  FieldOfRuin,
  FieldOfTheDead,
  GlacialFortress,
  GrowFromTheAshes,
  GrowthSpiral,
  HallowedFountain,
  HinterlandHarbor,
  ThornwoodFalls,
  HydroidKrasis,
  MemorialToGenius,
  Scapeshift,
  SelesnyaGuildgate,
  SimicGuildgate,
  SunpetalGrove,
  TeferiTimeRaveler,
  TempleGarden,
  TempleOfMystery,
  TimeWipe,
  Island,
  LandWG,
  LandWGR,
  LandC,
  Taiga,
  splitLandWG,
  WG,
  RWG,
  RWGC,
  C3,
  WoollyThoctar,
  DevoutLightcaster,
  BaneSlayerAngel,
  WiltLeafLeige,
  RithTheAwakener,
  RithsCharm,
  Pacifism,
  BaneFire,
  NobelHierarch,
  Quilspike,
  ElvishDruid,
  Stifle,
  Forest,
  Island,
  Plains,
  SeasideCitidel,
  Treva,
  BantCharm,
  Vizzerdrix,
  ThistledownLiege,
  NosyGoblin,
  BloodtitheHarvester,
  CorpseAppraiser,
  EvelyntheCovetous,
  LedgerShredder,
  MalevolentHermit,
  ExpressiveIteration,
  InfernalGrasp,
  MakeDisappear,
  Negate,
  PrismariCommand,
  SpellPierce,
  VoltageSurge,
  ReckonerBankbuster,
  FableoftheMirrorBreaker,
  TheMeathookMassacre,
  BlightstepPathway,
  ClearwaterPathway,
  HauntedRidge,
  HiveoftheEyeTyrant,
  RiverglidePathway,
  ShipwreckMarsh,
  StormcarvedCoast,
  Swamp,
  XandersLounge,
}

function copies(card, num) {
  return Object.assign({}, card, { quantity: num });
}

function randomCards(list, num = 2) {
  const newList = JSON.parse(JSON.stringify(list))
  fisherYates(newList)
  return newList.slice(0, num)
}

// random deck composed of "n" different nonland cards, target card is specified in output
function randomDeck(n) {
  const lands = Object.values(allCards).filter(c => c.type.toLowerCase().includes("land"))
  const nonLands = Object.values(allCards).filter(c => !c.type.toLowerCase().includes("land"))
  const [ targetCard, ...otherCards ] = randomCards(nonLands, n)
  const landBase = randomCards(lands, Math.ceil((.5 * rand() + .5) * lands.length)).map(land => copies(land, 1))
  
  const deck = []
  let totalLands = Math.ceil(rand() * 10) + (18 - landBase.length)
  let targetCardCopies = Math.ceil(rand() * 4)
  let landIndex = 0

  deck.push(copies(targetCard, targetCardCopies))
  let remaining = 60 - targetCardCopies - totalLands - landBase.length
  let others = {}
  while (remaining) {
    others[otherCards[remaining % otherCards.length].name] = others[otherCards[remaining % otherCards.length].name] ? { ...otherCards[remaining % otherCards.length], quantity: others[otherCards[remaining % otherCards.length].name].quantity+1 } : { ...otherCards[remaining % otherCards.length], quantity: 1 }
    remaining--
  }
  Object.values(others).forEach(otherCard => deck.push(otherCard))

  while (totalLands) {
    if (rand() < (.5 / landBase[landIndex].producible_mana_colors.length) ) {
      landBase[landIndex].quantity++
      totalLands--
    }
    landIndex = (landIndex + 1) % landBase.length
  }

  landBase.forEach(land => {
    deck.push(copies(land, land.quantity))
  })
  return { targetCard, deck } // returns a deck and the target card which is ready for computation
}

module.exports = {
  ...allCards,
  ...allDecks,
  randomDeck,
  copies
}
