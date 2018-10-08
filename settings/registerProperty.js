export default {
  'Properties & Values API': {
    type: 'props',
    console: true,
    selectedEditor: 'css',
    name: 'CSS.registerProperty',
    features: [],
    js: `CSS.registerProperty({
name: '',
syntax: '*'
});`,
    css: `:root {

}

.box {
background: var(--bg-color, slategray);
margin: 0 auto;
height: 100px;
width: 100%;
}`,
    html: `<div class="box"></div>`
  }
};