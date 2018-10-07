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
    background: var(--bg-color, slategray);
    margin: 0 auto;
    height: 100px;
    width: 100%;
  }`,
      html: `<div class="box"></div>`
    }
  },
  registerProperty: {
    'Properties & Values API': {
      type: 'props',
      console: true,
      name: 'CSS.registerProperty',
      features: [],
      js: `CSS.registerProperty({
  name: '',
  syntax: '*'
});`,
      css: `.box {
  background: var(--bg-color, slategray);
  margin: 0 auto;
  height: 100px;
  width: 100%;
}`,
      html: `<div class="box"></div>`
    }
  },
  animateProperty: {
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
  --bg-color: slategray;
  background: linear-gradient(var(--bg-color), teal);
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
  },
  tooltip: {
    tooltip: {
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
  display: inline-block;
  font: 3em system-ui;
  color: #fff;
  margin-bottom: var(--border-width);
  padding: 0.5em;
  border-radius: 10px;
  background: hsl(193, 100%, 30%);
  border-bottom: 1px solid transparent;
  border-top: 1px solid transparent;
  border-image-source: paint(tooltip);
  border-image-slice: 0 0 100% 0;
  border-image-width: var(--border-width);
  border-image-outset: var(--border-width);
  --tooltip-position: 30%;
  --tooltip-size: 30px;
  --border-width: 20px;
}
input[type=range] {
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

  paint(ctx, geom, props) {
    const color = props.get('background-color').toString();
    const positionPercent = props.get('--tooltip-position').value;
    const position = geom.width * positionPercent / 100;
    const size = props.get('--tooltip-size').value;
    console.log(geom, color);

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
<div>
  <input type="range" value="30" id="tooltip-position" data-unit="%" min="12" max="88" />
  <input type="range" value="30" id="tooltip-size" data-unit="px" />
  <input type="range" value="20" id="border-width" data-unit="px" />
</div>`,
    },
    circle: {
      type: 'paint',
      name: '',
      features: [],
      worklet: `registerPaint('circle', class {
  static get inputProperties() { return ['--circle-color']; }
  paint(ctx, size, properties) {
    // Get fill color from property
    const color = properties.get('--circle-color');

    // Determine the center point and radius.
    const xCircle = size.width / 2;
    const yCircle = size.height / 2;
    const radiusCircle = Math.min(xCircle, yCircle) - 2.5;

    // Draw the circle o/
    ctx.beginPath();
    ctx.arc(xCircle, yCircle, radiusCircle, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }
});`,
      js: `CSS.registerProperty({
  name: '--circle-color',
  syntax: '<color>',
  inherits: true,
  initialValue: 'red',
});`,
      css: `.circle {
  --circle-color: green;
  background-image: paint(circle);
  height: 80vh;
  width: 100vw;
}`,
      html: `<div class="circle"></div>`
    }
  }
};

const setting = new URL(location).searchParams.get('setting');
if (!setting || !settings[setting]) {
  console.warn(`?setting=${setting} is NOT valid. Must be one of: "${Object.keys(settings)}"`);
} else {
  new REPL('#repl', settings[setting]);
}
