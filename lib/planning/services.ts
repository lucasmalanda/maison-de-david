// Types de service proposés dans « Mon profil » (et plus tard
// dans les disponibilités). Les clés sont stockées en base.
export const SERVICES = [
  { key: "chant", label: "Chant" },
  { key: "musique", label: "Instruments" },
  { key: "son", label: "Son & lumière" },
  { key: "video", label: "Vidéo / projection" },
  { key: "accueil", label: "Accueil" },
  { key: "priere", label: "Intercession" },
  { key: "enfants", label: "Enfants" },
  { key: "cuisine", label: "Cuisine / repas" },
  { key: "logistique", label: "Installation / rangement" },
  { key: "autre", label: "Autre" },
] as const;

export const INSTRUMENTS = [
  { key: "piano", label: "Piano / clavier" },
  { key: "guitare", label: "Guitare" },
  { key: "basse", label: "Basse" },
  { key: "batterie", label: "Batterie" },
  { key: "percussions", label: "Percussions" },
  { key: "violon", label: "Violon" },
  { key: "saxophone", label: "Saxophone" },
  { key: "trompette", label: "Trompette" },
  { key: "autre", label: "Autre instrument" },
] as const;

export type ServiceKey = (typeof SERVICES)[number]["key"];
export type InstrumentKey = (typeof INSTRUMENTS)[number]["key"];

export const SERVICE_KEYS = SERVICES.map((s) => s.key) as [ServiceKey, ...ServiceKey[]];
export const INSTRUMENT_KEYS = INSTRUMENTS.map((i) => i.key) as [
  InstrumentKey,
  ...InstrumentKey[],
];
