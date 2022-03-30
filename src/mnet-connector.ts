import { Element } from 'domhandler';
import { pipe } from 'fp-ts/lib/function';
import { ElementType } from 'htmlparser2';
import fetch from 'node-fetch';
import * as R from 'ramda';
import { Ad, AD_CATEGORIES } from './models/Ad';
import {
  findElement,
  getElementsByTagName,
  getElementsByTagType,
  parseStringToHtml,
} from './utils/html-utils';
import { from, interval, map, Observable, startWith, switchMap } from 'rxjs';

const BASE_URL = 'https://muusikoiden.net/tori/';
const POLL_INTERVAL = 60 * 1000;

const isAd = (element: Element) => element.childNodes.length == 6;

const getDescription = (table: Element) =>
  pipe(
    table,
    R.prop('childNodes'),
    findElement((elem) => (elem.attribs.class == 'msg' ? true : false)),
    getElementsByTagType(ElementType.Text),
    R.map((x: any) => R.prop('data', x)),
    R.flatten,
    R.join(' ')
  );

const getHeaderAndLink = (table: Element) =>
  pipe(
    table,
    R.prop('childNodes'),
    findElement((elem) => (elem.attribs.class == 'tori_title' ? true : false)),
    getElementsByTagName('a'),
    (x) => {
      const header = x[0].children[0] as any;

      return {
        link: `https://muusikoiden.net/tori${x[0].attribs.href}`,
        header: R.prop('data', header),
      };
    }
  );

export const fetchAdsByCategory = (
  category: AD_CATEGORIES
): Observable<Ad[]> => {
  const pollInterval$ = pipe(interval(POLL_INTERVAL), startWith(undefined));

  return pipe(
    pollInterval$,
    switchMap(() =>
      pipe(
        fetch(`${BASE_URL}?category=${category}`, {}),
        from,
        switchMap((response) => response.text()),
        map((html: string) =>
          pipe(
            parseStringToHtml(html),
            getElementsByTagName('table'),
            R.filter(isAd),
            R.map((table) => {
              return {
                description: getDescription(table),
                ...getHeaderAndLink(table),
              };
            })
          )
        )
      )
    )
  );
};
