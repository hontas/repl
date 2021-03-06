import REPL from './repl/index.js';

import typedOm from './settings/typed-om.js';
import animateProperty from './settings/animateProperty.js';
import registerProperty from './settings/registerProperty.js';
import paintWorklet from './settings/paintWorklet.js';
import animationWorklet from './settings/animationWorklet.js';
import layoutWorklet from './settings/layoutWorklet.js';

const settings = {
  typedOm,
  animateProperty,
  registerProperty,
  paintWorklet,
  animationWorklet,
  layoutWorklet
};

const search = new URL(location).searchParams;
const setting = search.get('setting');
const type = search.get('type');

const empty = {
  console: true,
  js: ``,
  css: ``,
  html: ``,
  worklet: ``,
  type
};

if (!setting || !settings[setting]) {
  console.warn(`?setting=${setting} is NOT valid. Must be one of: "${Object.keys(settings)}"`);
}

new REPL('#repl', settings[setting] || empty);
