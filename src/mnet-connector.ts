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

const getPrice = (table: Element) =>
  pipe(
    table,
    R.prop('childNodes'),
    getElementsByTagName('b'),
    R.find((elem) => R.contains('€', (elem.next as any).data)),
    (element: any) =>
      pipe(element.next, R.prop('data'), R.replace('€', ''), parseInt)
  );

const getCategory = (table: Element): AD_CATEGORIES =>
  pipe(
    table,
    R.prop('childNodes'),
    getElementsByTagName('a'),
    R.find((x) => R.includes('?category=', x.attribs.href)),
    (element: Element) => {
      const categoryId = pipe(
        R.match(/category=([^&#]*)/, element.attribs.href)[1],
        parseInt
      );
      return categoryId;
    }
  );

const getLocation = (table: Element) =>
  pipe(
    table,
    R.prop('childNodes'),
    getElementsByTagName('b'),
    R.find(R.path(['prev', 'prev', 'data'])),
    (element) => {
      if (!R.path<string>(['prev', 'prev', 'data'], element)) {
        return {
          province: '',
          city: '',
        };
      }
      const location = R.trim(
        R.path<string>(['prev', 'prev', 'data'], element)
      );

      const province = R.match(/\(([^\)]+)\)/, location)[1];
      const city = R.match(/^([\w\-]+)/, location)[1];

      return {
        province,
        city,
      };
    }
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
        link: `https://muusikoiden.net${x[0].attribs.href}`,
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
        fetch(`${BASE_URL}?category=${category}&type=sell`),
        from,
        switchMap((response) => response.arrayBuffer()),
        map((buffer: BufferSource) =>
          new TextDecoder('iso-8859-1').decode(buffer)
        ),
        map((html: string) =>
          pipe(
            parseStringToHtml(html),
            getElementsByTagName('table'),
            R.filter(isAd),
            R.map((table) => {
              return {
                description: getDescription(table),
                ...getHeaderAndLink(table),
                price: getPrice(table),
                category: getCategory(table),
                ...getLocation(table),
              };
            })
          )
        )
      )
    )
  );
};
