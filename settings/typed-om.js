export default {
  name: 'CSS Typed Object Model',
  console: true,
  js: `const el = document.querySelector('.box');
const styleMap = el.computedStyleMap();
const attrMap = el.attributeStyleMap;

console.log(styleMap.get('margin-top'));
console.log(attrMap.get('margin-top'));

const transform = new CSSTransformValue([
  new CSSRotate(CSS.deg(0)),
  new CSSScale(CSS.number(1), CSS.number(1))
]);
el.attributeStyleMap.set('transform', transform);
let scaleDelta = 0.1;
(function draw() {
  if (transform[1].x.value > 20) { scaleDelta = -0.1 }
  if (transform[1].x.value < 0) { scaleDelta = 0.1 }
  requestAnimationFrame(draw);
  transform[0].angle.value += 5;
  transform[1].x.value += scaleDelta;
  transform[1].y.value += scaleDelta;
  el.attributeStyleMap.set('transform', transform);
})();`,
  css: `.box {
  --box-size: 50px;
  background: coral;
  height: var(--box-size);
  width: var(--box-size);
  margin: var(--box-size) auto;
}`,
  html: `<div class="box"></div>`
};