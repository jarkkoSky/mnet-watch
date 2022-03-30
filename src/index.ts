import * as R from 'ramda';
import { fetchAdsByCategory } from './mnet-connector';
import { AD_CATEGORIES } from './models/Ad';
import { Profile } from './models/Profile';
import { PROFILES } from './profiles';
import { log } from './utils/utils';

const main = () => {
  const ads$ = fetchAdsByCategory(AD_CATEGORIES.ALL);

  ads$.subscribe(console.log);
};

main();
