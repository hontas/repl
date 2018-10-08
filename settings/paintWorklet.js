export default {
  paintWorklet: {
    type: 'paint',
    console: true,
    name: 'Paint API',
    features: [],
    js: `CSS.registerProperty({
name: '--tooltip-position',
inherits: false,
syntax: '<percentage>',
initialValue: '50%'
});
CSS.registerProperty({
name: '--tooltip-size',
inherits: false,
syntax: '<length>',
initialValue: '0px'
});
CSS.registerProperty({
name: '--tooltip-border-width',
inherits: false,
syntax: '<length>',
initialValue: '0px'
});


// controls
const tooltip = document.querySelector('.tooltip');
['tooltip-position', 'tooltip-size', 'border-width'].forEach((prop) => {
const el = document.getElementById(prop);
const {unit} = el.dataset;
el.addEventListener('input', () => {
  tooltip.attributeStyleMap.set('--' + prop, el.value + unit);
});
});
`,
    css: `.tooltip {
--tooltip-position: 30%;
--tooltip-size: 30px;
--border-width: 20px;
background: hsl(193, 100%, 30%);
border-bottom: 1px solid transparent;
border-image-source: paint(tooltip);
border-image-slice: 0 0 100% 0;
border-image-width: var(--border-width);
border-image-outset: var(--border-width);
display: inline-block;
font-size: 3em;
margin-bottom: var(--border-width);
padding: 0.5em;
}


/* controls */
body {
color: white;
font-family: system-ui
}
label {
display: block;
}`,
    worklet: `registerPaint('tooltip', class {
static get inputProperties() {
  return [
    'background-color',
    '--tooltip-position',
    '--tooltip-size'
  ];
}

paint(ctx, geom, styleMap) {
  const color = styleMap.get('background-color').toString();
  const positionPercent = styleMap.get('--tooltip-position').value;
  const position = geom.width * positionPercent / 100;
  const size = styleMap.get('--tooltip-size').value;

  ctx.beginPath();
  ctx.moveTo(position - size, 0);
  ctx.lineTo(position + size, 0);
  ctx.lineTo(position, geom.height);
  ctx.closePath();

  // fill
  ctx.fillStyle = color;
  ctx.fill();
}
})`,
    html: `<div class="tooltip">I'm a tooltip</div>


<!-- controls -->
<label>
<input type="range" value="30" id="tooltip-position" data-unit="%" />
--tooltip-position
</label>
<label>
<input type="range" value="30" id="tooltip-size" data-unit="px" />
--tooltip-size
</label>
<label>
<input type="range" value="20" id="border-width" data-unit="px" />
--border-width
</label>`,
  }
};