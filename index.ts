import * as R from 'ramda';
import { fetchAdsByCategory } from './mnet-connector';
import { PROFILES } from './profiles';
import { log } from './utils/utils';

async function getData(profile) {
  log(`Start fetching new data for ${profile.email}`);

  R.map(async (search) => {
    const ads = await fetchAdsByCategory(search.category);

    console.log(ads);
  }, profile.searches);
}

R.map(getData, PROFILES);
