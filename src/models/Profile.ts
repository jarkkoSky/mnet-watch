import { AD_CATEGORIES } from './Ad';

export type SearchInput = {
  keywords: string[];
  category: AD_CATEGORIES;
  province?: string;
  city?: string;
};

export type Profile = {
  email: string;
  searches: SearchInput[];
};
