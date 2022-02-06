const isPromise = (o) => typeof o === 'object' && !!o.then;

const VOID_ELEMENTS = {
  area: true,
  base: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};

export const createTag = (name, isVoid) => {
  const open = `<${name}`;
  const enter = '>';
  const close = VOID_ELEMENTS[name] || isVoid ? null : `</${name}>`;
  return function tag () {
    let a;
    let arg;
    let entered;
    let fragments;
    fragments = [open];
    for (a = 0; a < arguments.length; a++) {
      arg = arguments[a];
      switch (true) {
        case typeof arg === 'string' || isPromise(arg):
          if (!entered) {
            fragments.push(enter);
            entered = true;
          }
          fragments.push(arg);
          break;
        case Array.isArray(arg):
          if (!entered) {
            fragments.push(enter);
            entered = true;
          }
          arg.forEach((c) => {
            fragments.push(c);
          });
          break;
        default:
          for (let key in arg) {
            if (arg.hasOwnProperty(key)) {
              fragments.push(` ${key}="`);
              fragments.push(arg[key]);
              fragments.push(`"`);
            }
          }
          fragments.push(enter);
          entered = true;
      }
    };
    if (close) fragments.push(close);
    return fragments;
  };
};

export const a = createTag('a');
export const abbr = createTag('abbr');
export const address = createTag('address');
export const area = createTag('area');
export const article = createTag('article');
export const aside = createTag('aside');
export const audio = createTag('audio');
export const b = createTag('b');
export const base = createTag('base');
export const bdi = createTag('bdi');
export const bdo = createTag('bdo');
export const blockquote = createTag('blockquote');
export const body = createTag('body');
export const br = createTag('br');
export const button = createTag('button');
export const canvas = createTag('canvas');
export const caption = createTag('caption');
export const cite = createTag('cite');
export const code = createTag('code');
export const col = createTag('col');
export const colgroup = createTag('colgroup');
export const data = createTag('data');
export const datalist = createTag('datalist');
export const dd = createTag('dd');
export const del = createTag('del');
export const details = createTag('details');
export const dfn = createTag('dfn');
export const dialog = createTag('dialog');
export const div = createTag('div');
export const dl = createTag('dl');
export const dt = createTag('dt');
export const em = createTag('em');
export const embed = createTag('embed');
export const fieldset = createTag('fieldset');
export const figcaption = createTag('figcaption');
export const figure = createTag('figure');
export const footer = createTag('footer');
export const form = createTag('form');
export const head = createTag('head');
export const header = createTag('header');
export const hgroup = createTag('hgroup');
export const h1 = createTag('h1');
export const h2 = createTag('h2');
export const h3 = createTag('h3');
export const h4 = createTag('h4');
export const h5 = createTag('h5');
export const h6 = createTag('h6');
export const hr = createTag('hr');
export const html = createTag('html');
export const i = createTag('i');
export const iframe = createTag('iframe');
export const img = createTag('img');
export const input = createTag('input');
export const ins = createTag('ins');
export const kbd = createTag('kbd');
export const keygen = createTag('keygen');
export const label = createTag('label');
export const legend = createTag('legend');
export const li = createTag('li');
export const link = createTag('link');
export const main = createTag('main');
export const map = createTag('map');
export const mark = createTag('mark');
export const menu = createTag('menu');
export const menuitem = createTag('menuitem');
export const meta = createTag('meta');
export const meter = createTag('meter');
export const nav = createTag('nav');
export const noscript = createTag('noscript');
export const object = createTag('object');
export const ol = createTag('ol');
export const optgroup = createTag('optgroup');
export const option = createTag('option');
export const output = createTag('output');
export const p = createTag('p');
export const param = createTag('param');
export const picture = createTag('picture');
export const pre = createTag('pre');
export const progress = createTag('progress');
export const q = createTag('q');
export const rp = createTag('rp');
export const rt = createTag('rt');
export const ruby = createTag('ruby');
export const s = createTag('s');
export const samp = createTag('samp');
export const script = createTag('script');
export const section = createTag('section');
export const select = createTag('select');
export const small = createTag('small');
export const source = createTag('source');
export const span = createTag('span');
export const strong = createTag('strong');
export const style = createTag('style');
export const sub = createTag('sub');
export const summary = createTag('summary');
export const sup = createTag('sup');
export const svg = createTag('svg');
export const table = createTag('table');
export const tbody = createTag('tbody');
export const td = createTag('td');
export const template = createTag('template');
export const textarea = createTag('textarea');
export const tfoot = createTag('tfoot');
export const th = createTag('th');
export const thead = createTag('thead');
export const time = createTag('time');
export const title = createTag('title');
export const tr = createTag('tr');
export const track = createTag('track');
export const u = createTag('u');
export const ul = createTag('ul');
export const video = createTag('video');
export const wbr = createTag('wbr');

export const render = async (p) => {
  if (isPromise(p)) p = await p;
  let i = 0;
  let a = p;
  let frag;
  let outer = [];

  return async function next() {
    frag = a[i];
    if (isPromise(frag)) frag = await frag;
    if (Array.isArray(frag)) {
      outer.push([a, i + 1]);
      i = 0;
      a = frag;
      return next();
    } else {
      if (typeof frag === 'undefined') {
        if (outer.length) {
          [a, i] = outer.pop();
          return next();
        } else {
          return; // nothing left...
        }
      } else {
        i++;
        return frag;
      }
    }
  }
};
