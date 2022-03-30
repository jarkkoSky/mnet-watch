export type Ad = {
  header: string;
  description: string;
  link: string;
  price: number;
  category: AD_CATEGORIES;
  city: string;
  province: string;
};

export enum AD_CATEGORIES {
  ACOUSTIC_GUITARS = 1,
  ELECTRIC_GUITARS = 8,
  BASSES = 13,
  DRUMS = 18,
  KEYBOARDS = 28,
  OTHER_INSTRUMENTS = 33,
  GUITAR_AMPS = 40,
  BASS_AMPS = 45,
  GUITAR_PARTS = 87,
  EFFECTS = 55,
  PA = 60,
  MICS = 50,
  STUDIO = 66,
  DJ = 76,
  CASES_AND_STANDS = 81,
  LIGHTS = 93,
  HIFI = 98,
  RECORDS = 103,
  LITERATURE = 108,
  SERVICES = 112,
  REHEARSAL_ROOMS = 116,
  OTHERS = 120,
  ALL = 0,
}
