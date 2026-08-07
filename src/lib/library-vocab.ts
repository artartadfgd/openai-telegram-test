import type { Locale } from "@/lib/i18n/dictionary";

export type Loc<T = string> = Record<Locale, T>;

export const LEVEL_LABEL: [Loc, Loc, Loc] = [
  { pt: "Sub-11", en: "U11", es: "Sub-11", fr: "M11", it: "Under 11", de: "U11" },
  { pt: "Sub-15", en: "U15", es: "Sub-15", fr: "M15", it: "Under 15", de: "U15" },
  { pt: "Sênior", en: "Senior", es: "Sénior", fr: "Senior", it: "Senior", de: "Senioren" },
];

export const LEVEL_WORD: [Loc, Loc, Loc] = [
  { pt: "iniciante", en: "beginner", es: "principiante", fr: "débutant", it: "principiante", de: "Anfänger" },
  { pt: "intermediário", en: "intermediate", es: "intermedio", fr: "intermédiaire", it: "intermedio", de: "Fortgeschrittene" },
  { pt: "avançado", en: "advanced", es: "avanzado", fr: "avancé", it: "avanzato", de: "Profis" },
];

export const LEVEL_DURATION: [number, number, number] = [45, 55, 65];
export const LEVEL_PLAYERS: [number, number, number] = [8, 10, 12];
export const LEVEL_INTENSITY: [number, number, number] = [1, 2, 3];

export const COURT_SETUP: Record<string, Loc> = {
  reduzida: { pt: "Quadra reduzida", en: "Reduced court", es: "Cancha reducida", fr: "Terrain réduit", it: "Campo ridotto", de: "Verkleinertes Feld" },
  completa: { pt: "Quadra completa", en: "Full court", es: "Cancha completa", fr: "Terrain complet", it: "Campo intero", de: "Ganzes Feld" },
  meia: { pt: "Meia quadra", en: "Half court", es: "Media cancha", fr: "Demi-terrain", it: "Mezzo campo", de: "Halbfeld" },
  ataque: { pt: "Zona de ataque", en: "Attack zone", es: "Zona de ataque", fr: "Zone d'attaque", it: "Zona d'attacco", de: "Angriffszone" },
  defesa: { pt: "Zona de defesa", en: "Defense zone", es: "Zona de defensa", fr: "Zone de défense", it: "Zona difensiva", de: "Abwehrzone" },
  rede: { pt: "Linha de rede", en: "Net line", es: "Línea de red", fr: "Ligne de filet", it: "Linea di rete", de: "Netzlinie" },
};

export const MATERIAL: Record<string, Loc> = {
  ball1pair: { pt: "1 bola por dupla", en: "1 ball per pair", es: "1 balón por pareja", fr: "1 ballon par binôme", it: "1 pallone per coppia", de: "1 Ball pro Paar" },
  ball1each: { pt: "1 bola por atleta", en: "1 ball per player", es: "1 balón por jugador", fr: "1 ballon par joueur", it: "1 pallone per giocatore", de: "1 Ball pro Spieler" },
  balls6: { pt: "6 bolas", en: "6 balls", es: "6 balones", fr: "6 ballons", it: "6 palloni", de: "6 Bälle" },
  balls4: { pt: "4 bolas", en: "4 balls", es: "4 balones", fr: "4 ballons", it: "4 palloni", de: "4 Bälle" },
  cones4: { pt: "4 cones", en: "4 cones", es: "4 conos", fr: "4 plots", it: "4 coni", de: "4 Hütchen" },
  cones6: { pt: "6 cones", en: "6 cones", es: "6 conos", fr: "6 plots", it: "6 coni", de: "6 Hütchen" },
  cones8: { pt: "8 cones", en: "8 cones", es: "8 conos", fr: "8 plots", it: "8 coni", de: "8 Hütchen" },
  net: { pt: "1 rede", en: "1 net", es: "1 red", fr: "1 filet", it: "1 rete", de: "1 Netz" },
  tape: { pt: "fita para marcar zonas", en: "tape to mark zones", es: "cinta para marcar zonas", fr: "ruban pour marquer les zones", it: "nastro per segnare le zone", de: "Klebeband zur Zonenmarkierung" },
  bibs: { pt: "coletes de 2 cores", en: "bibs in 2 colors", es: "petos de 2 colores", fr: "chasubles de 2 couleurs", it: "pettorine di 2 colori", de: "Leibchen in 2 Farben" },
  numberedSigns: { pt: "cartazes numerados de 1 a 6", en: "signs numbered 1 to 6", es: "carteles numerados del 1 al 6", fr: "pancartes numérotées de 1 à 6", it: "cartelli numerati da 1 a 6", de: "Schilder nummeriert von 1 bis 6" },
  target: { pt: "1 alvo (arco ou bambolê)", en: "1 target (hoop)", es: "1 objetivo (aro)", fr: "1 cible (cerceau)", it: "1 bersaglio (cerchio)", de: "1 Ziel (Reifen)" },
  scoreboard: { pt: "placar", en: "scoreboard", es: "marcador", fr: "tableau de score", it: "tabellone", de: "Anzeigetafel" },
  stopwatch: { pt: "cronômetro", en: "stopwatch", es: "cronómetro", fr: "chronomètre", it: "cronometro", de: "Stoppuhr" },
  ladder: { pt: "escada de agilidade", en: "agility ladder", es: "escalera de agilidad", fr: "échelle d'agilité", it: "scaletta di agilità", de: "Koordinationsleiter" },
  whistle: { pt: "apito", en: "whistle", es: "silbato", fr: "sifflet", it: "fischietto", de: "Trillerpfeife" },
};
