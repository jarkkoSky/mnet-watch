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

const BASE_URL = 'https://muusikoiden.net/tori/';

const isAd = (node: Node) => node.childNodes.length == 6;

const getDescription = (table: Element) =>
  pipe(
    table,
    R.prop('childNodes'),
    findElement((elem) => (elem.attribs.class == 'msg' ? true : false)),
    getElementsByTagType(ElementType.Text),
    R.map(R.prop('data')),
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
      const header = x[0].children[0];

      return {
        link: `https://muusikoiden.net/tori${x[0].attribs.href}`,
        header: R.prop('data', header),
      };
    }
  );

export const fetchAdsByCategory = async (
  category: AD_CATEGORIES
): Promise<Ad[]> => {
  const response = await fetch(`${BASE_URL}?category=${category}`, {});
  const html = await response.text();

  return pipe(
    parseStringToHtml(html),
    getElementsByTagName('table'),
    R.filter(isAd),
    R.map((table) => {
      return {
        description: getDescription(table),
        ...getHeaderAndLink(table),
      };
    })
  );
};
