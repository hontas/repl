import REPL from './repl/index.js';

import typedOm from './settings/typed-om.js';
import animateProperty from './settings/animateProperty.js';
import registerProperty from './settings/registerProperty.js';
import tooltip from './settings/tooltip.js';
import animationWorklet from './settings/animationWorklet.js';
import layoutWorklet from './settings/layoutWorklet.js';

const settings = {
  typedOm,
  animateProperty,
  registerProperty,
  tooltip,
  animationWorklet,
  layoutWorklet
};

const setting = new URL(location).searchParams.get('setting');
if (!setting || !settings[setting]) {
  console.warn(`?setting=${setting} is NOT valid. Must be one of: "${Object.keys(settings)}"`);
} else {
  new REPL('#repl', settings[setting]);
}
