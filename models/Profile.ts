import { Ad, AD_CATEGORIES } from './Ad';

export type SearchInput = {
  keywords: string[];
  category: AD_CATEGORIES;
};

export type Profile = {
  email: string;
  searches: SearchInput[];
  matches: Ad[];
};
