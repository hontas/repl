export default {
  'animate property': {
    type: 'props',
    selectedEditor: 'css',
    console: true,
    name: 'Properties & Values API',
    features: [],
    js: `CSS.registerProperty({
  name: '--bg-col',
  inherits: true,
  syntax: '<color>',
  initialValue: 'coral'
});`,
    css: `.box {
  background: linear-gradient(var(--bg-color, slategray), teal);
  margin: 0 auto;
  height: 100px;
  width: 100%;
  transition: --bg-color 1s;
}  
.box:hover {
  --bg-color: cornflowerblue;
}`,
    html: `<div class="box"></div>`
  }
};