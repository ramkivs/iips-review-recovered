/**
 * IID-0 — a very small, deliberately dumb XML reader.
 *
 * Scope: enough to read a filing's XBRL instance document (elements, attributes, text, self-closing
 * tags, comments, CDATA, the XML declaration). It is NOT a general XML parser and says so: entities are
 * limited to the five predefined ones, and DTDs / namespaces beyond prefix splitting are not interpreted.
 * Being small is the point — no dependency, no network, no surprise behaviour.
 */
export interface XmlElement {
  readonly name: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly children: readonly XmlElement[];
  readonly text: string;
}

export class XmlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'XmlError';
  }
}

const PREDEFINED: Readonly<Record<string, string>> = Object.freeze({
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
});

export function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9A-Fa-f]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith('#')) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    const resolved = PREDEFINED[entity];
    return resolved === undefined ? match : resolved;
  });
}

interface MutableElement {
  name: string;
  attributes: Record<string, string>;
  children: MutableElement[];
  text: string;
}

function parseAttributes(source: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    const name = match[1]!;
    const value = match[3] !== undefined ? match[3] : (match[4] ?? '');
    attributes[name] = decodeEntities(value);
  }
  return attributes;
}

/** Parse an XML document into a single synthetic root whose children are the top-level elements. */
export function parseXml(text: string): XmlElement {
  const root: MutableElement = { name: '#document', attributes: {}, children: [], text: '' };
  const stack: MutableElement[] = [root];
  let index = 0;

  const pushText = (chunk: string): void => {
    const current = stack[stack.length - 1]!;
    current.text += decodeEntities(chunk);
  };

  while (index < text.length) {
    const open = text.indexOf('<', index);
    if (open === -1) {
      pushText(text.slice(index));
      break;
    }
    if (open > index) pushText(text.slice(index, open));

    if (text.startsWith('<!--', open)) {
      const end = text.indexOf('-->', open + 4);
      if (end === -1) throw new XmlError('unterminated comment');
      index = end + 3;
      continue;
    }
    if (text.startsWith('<![CDATA[', open)) {
      const end = text.indexOf(']]>', open + 9);
      if (end === -1) throw new XmlError('unterminated CDATA section');
      pushText(text.slice(open + 9, end));
      index = end + 3;
      continue;
    }
    if (text.startsWith('<?', open)) {
      const end = text.indexOf('?>', open + 2);
      if (end === -1) throw new XmlError('unterminated processing instruction');
      index = end + 2;
      continue;
    }
    if (text.startsWith('<!', open)) {
      const end = text.indexOf('>', open + 2);
      if (end === -1) throw new XmlError('unterminated declaration');
      index = end + 1;
      continue;
    }

    const close = findTagEnd(text, open + 1);
    if (close === -1) throw new XmlError('unterminated tag');
    const inner = text.slice(open + 1, close).trim();

    if (inner.startsWith('/')) {
      const name = inner.slice(1).trim();
      const current = stack.pop();
      if (current === undefined || current === root || current.name !== name) {
        throw new XmlError(`unexpected closing tag </${name}>`);
      }
      index = close + 1;
      continue;
    }

    const selfClosing = inner.endsWith('/');
    const body = selfClosing ? inner.slice(0, -1) : inner;
    const space = body.search(/\s/);
    const rawName = space === -1 ? body : body.slice(0, space);
    const attributes = space === -1 ? {} : parseAttributes(body.slice(space));
    const element: MutableElement = { name: rawName, attributes, children: [], text: '' };
    stack[stack.length - 1]!.children.push(element);
    if (!selfClosing) stack.push(element);
    index = close + 1;
  }

  if (stack.length !== 1) throw new XmlError(`unclosed element <${stack[stack.length - 1]!.name}>`);
  return toImmutable(root);
}

function findTagEnd(text: string, from: number): number {
  let quote: string | null = null;
  for (let i = from; i < text.length; i += 1) {
    const ch = text[i]!;
    if (quote !== null) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '>') return i;
  }
  return -1;
}

function toImmutable(element: MutableElement): XmlElement {
  return {
    name: element.name,
    attributes: Object.freeze({ ...element.attributes }),
    children: element.children.map(toImmutable),
    text: element.text,
  };
}

/** Local name of a possibly prefixed element (`xbrli:context` → `context`). */
export function localName(name: string): string {
  const colon = name.indexOf(':');
  return colon === -1 ? name : name.slice(colon + 1);
}

export function findAll(element: XmlElement, name: string): readonly XmlElement[] {
  const found: XmlElement[] = [];
  const walk = (node: XmlElement): void => {
    if (localName(node.name) === name) found.push(node);
    node.children.forEach(walk);
  };
  walk(element);
  return found;
}
