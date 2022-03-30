import { pipe } from 'fp-ts/lib/function';
import * as R from 'ramda';
import { combineLatest, map, Observable, of, tap } from 'rxjs';
import { fetchAdsByCategory } from './mnet-connector';
import { Ad, AD_CATEGORIES } from './models/Ad';
import { Match } from './models/Match';
import { Profile, SearchInput } from './models/Profile';
import { PROFILES } from './profiles';
import { initEmail, sendEmail } from './utils/email-utils';
import { log } from './utils/utils';

const isKeywordInHeaderOrDescription = (keywords: string[], ad: Ad) =>
  R.any(
    (keyword) => R.includes(R.toLower(keyword), R.toLower(ad.header)),
    keywords
  ) ||
  R.any(
    (keyword) => R.includes(R.toLower(keyword), R.toLower(ad.description)),
    keywords
  );

const checkProp = (
  ad: Ad,
  search: SearchInput,
  prop: 'city' | 'category' | 'province'
) => {
  if (search[prop] == undefined) {
    return true;
  }

  return search[prop] === ad[prop];
};

const matches = (profiles: Profile[], ads: Ad[]) =>
  pipe(
    profiles,
    R.map((profile) =>
      R.map(
        (search) =>
          pipe(
            ads,
            R.map((ad) => {
              if (
                checkProp(ad, search, 'city') &&
                checkProp(ad, search, 'province') &&
                checkProp(ad, search, 'category')
              ) {
                if (isKeywordInHeaderOrDescription(search.keywords, ad)) {
                  return { profile, ad } as Match;
                }
              }
            }),
            R.reject<Match>(R.isNil)
          ),
        profile.searches
      )
    ),
    R.flatten
  );

let MATCHES: Match[] = [];

const main = () => {
  const client = initEmail();
  const profiles$ = of(PROFILES);
  const ads$ = fetchAdsByCategory(AD_CATEGORIES.ALL);

  const matches$: Observable<Match[]> = pipe(
    combineLatest({ profiles: profiles$, ads: ads$ }),
    tap(() => log('Checking for matches')),
    map(({ profiles, ads }) => matches(profiles, ads))
  );

  const sendMail$ = pipe(
    matches$,
    tap((matches) => {
      const newMatches = R.difference(matches, MATCHES);

      R.map((match) => {
        log(
          `Sending email to ${match.profile.email}, match ${match.ad.header}`
        );
        sendEmail(client, match.profile.email, match.ad);
      }, newMatches);
    }),
    tap((matches) => {
      MATCHES = matches;
    })
  );

  sendMail$.subscribe();
};

main();
