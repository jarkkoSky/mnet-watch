import { Element, Node } from 'domhandler';
import { DomUtils, ElementType, parseDocument } from 'htmlparser2';

export const getElementsByTagName = (name: string) => (nodes: Node | Node[]) =>
  DomUtils.getElementsByTagName(name, nodes);

export const getElementsByTagType =
  (type: ElementType.ElementType) => (nodes: Node | Node[]) =>
    DomUtils.getElementsByTagType(type, nodes);

export const findElement =
  (fn: (elem: Element) => boolean) => (nodes: Node[]) =>
    DomUtils.findOne(fn, nodes);

export const parseStringToHtml = (html: string) => parseDocument(html);
