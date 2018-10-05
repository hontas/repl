import REPL from './repl/index.js';

const settings = {
  'typed-om': {
    'Typed OM': {
      name: 'CSS Typed Object Model',
      features: ['Proper object-based API for working with values in JavaScript'],
      js: `const el = document.querySelector('.box');
const styleMap = el.computedStyleMap();
const attrMap = el.attributeStyleMap;

console.log(styleMap.get('margin-top'));
console.log(attrMap.get('margin-top'));`,
      css: `.box {
    background: slategray;
    margin: 0 auto;
    height: 100px;
    width: 100%;
  }`,
      html: `<div class="box"></div>`
    }
  }
};

const setting = new URL(location).searchParams.get('setting');
if (!setting || !settings[setting]) {
  console.warn(`?setting=${setting} is NOT valid. Must be one of: "${Object.keys(settings)}"`);
} else {
  new REPL('#repl', settings[setting]);
}
