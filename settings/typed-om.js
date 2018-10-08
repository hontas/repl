export default {
  'Typed OM': {
    name: 'CSS Typed Object Model',
    features: ['Proper object-based API for working with values in JavaScript'],
    js: `const el = document.querySelector('.box');
const styleMap = el.computedStyleMap();
const attrMap = el.attributeStyleMap;

console.log(styleMap.get('margin-top'));
console.log(attrMap.get('margin-top'));`,
    css: `.box {
  background: var(--bg-color, slategray);
  height: 100px;
  width: 100%;
}`,
    html: `<div class="box"></div>`
  }
};