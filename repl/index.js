import Editor from './editor.js';

if (CSS.paintWorklet) {
  CSS.paintWorklet.addModule('./repl/paint-switcher.js');
}

const runCodeTimeout = 1500;
const debounce = (fn, wait = 1) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}

const worklets = ['layout', 'paint', 'animation'];
const isWorklet = (type) => worklets.includes(type);

export default class {
  constructor(target, options) {
    this.target = target;
    this.parent = document.querySelector(target) ;
    this.options = options;
    this.optKeys = Object.keys(options);
    this.type = options[this.optKeys[0]].type;
    this.inputEvent = new Event(`input`, {
      bubbles: true,
      cancelable: true,
    });
    this.active = this.optKeys[0];
    this.repl = {};

    this.switcherOptions = ['worklet', 'js', 'css', 'html'];

    this.buildREPL();
  }

  buildREPL() {
    // Build Elements
    const menu = document.createElement('div');

    const replSwitcher = document.createElement('select');
    const replTitle = document.createElement('h4');
    const replFeatures = document.createElement('p');

    const workletEditor = document.createElement('div');
    const jsEditor = document.createElement('div');
    const cssEditor = document.createElement('div');
    const htmlEditor = document.createElement('div');
    const editorElmnts = {
      worklet: workletEditor,
      js: jsEditor,
      css: cssEditor,
      html: htmlEditor
    };

    menu.classList.add('repl--menu');
    replTitle.classList.add('repl--title');
    replFeatures.classList.add('repl--features');
    replSwitcher.classList.add('repl--switcher');
    workletEditor.classList.add('repl--editor');
    workletEditor.setAttribute('data-language', 'worklet');
    jsEditor.classList.add('repl--editor');
    jsEditor.setAttribute('data-language', 'js');
    cssEditor.classList.add('repl--editor');
    cssEditor.setAttribute('data-language', 'css');
    htmlEditor.classList.add('repl--editor');
    htmlEditor.setAttribute('data-language', 'markup');

    // Build Menu
    const menuItems = {};

    if (this.optKeys.length > 1) {
      for (const key of this.optKeys) {
        menuItems[key] = document.createElement('button');
        menuItems[key].classList.add('repl--menu-item');
        menuItems[key].setAttribute('data-type', key);
        menuItems[key].textContent = key;
        menuItems[key].addEventListener('click', this.menuHandler());
        menu.appendChild(menuItems[key]);
      }
    }

    // Worklet Edits
    const selected = this.options[this.active].selectedEditor;
    if (isWorklet(this.type)) {
      workletEditor.style.zIndex = 100;
    } else if (selected && editorElmnts[selected]) {
      editorElmnts[selected].style.zIndex = 100;
      this.switcherOptions.shift();
    } else {
      jsEditor.style.zIndex = 100;
      this.switcherOptions.shift();
    }

    // Build Switcher
    for (const key of this.switcherOptions) {
      const so = document.createElement('option');
      so.selected = selected === key;
      so.value = key;
      so.text = key;
      replSwitcher.appendChild(so);
    }

    replSwitcher.addEventListener('input', this.swapEditors());

    // Add items to DOM
    this.parent.classList.add('repl');
    this.parent.appendChild(menu);
    this.parent.appendChild(replTitle);
    this.parent.appendChild(replFeatures);
    this.parent.appendChild(replSwitcher);
    if (isWorklet(this.type)) {
      this.parent.appendChild(workletEditor);
    }
    this.parent.appendChild(jsEditor);
    this.parent.appendChild(cssEditor);
    this.parent.appendChild(htmlEditor);

    // Set up Editors
    const editor = new Editor;
    editor.run(`${this.target} .repl--editor`, {
      live: false,
    });

    const editors = {
      worklet: workletEditor.querySelector('.editor--textarea'),
      js: jsEditor.querySelector('.editor--textarea'),
      css: cssEditor.querySelector('.editor--textarea'),
      html: htmlEditor.querySelector('.editor--textarea'),
    }

    if (!isWorklet(this.type)) {
      delete editors.worklet;
    }

    this.repl.editors = editors;
    this.repl.switcher = replSwitcher;
    this.repl.title = replTitle;
    this.repl.features = replFeatures;
    this.repl.menu = this.parent.querySelectorAll('.repl--menu-item');
    this.repl.previous = null;

    this.resetEditors(this.active);
  }

  resetEditors(base) {
    const selected = this.options[base];
    this.showConsole = selected.console || false;

    this.repl.title.innerText = selected.name;
    this.repl.features.innerText = selected.features.join(', ');

    // Set the active menu item
    for (const menuItem of this.repl.menu) {
      delete menuItem.dataset.active;
      if (menuItem.dataset.type === base) {
        menuItem.dataset.active = true;
        this.active = base;
      }
    }

    let activateKey = '';

    for (const key in selected) {
      if (this.repl.editors[key]) {
        this.repl.editors[key].value = selected[key];
        this.repl.editors[key].addEventListener('input', this.replPreview());
        this.repl.editors[key].dispatchEvent(this.inputEvent);
      }
    }
  }

  swapEditors() {
    const repl = this.repl;

    return function(e) {
      const val = e.target.value;

      for (const key in repl.editors) {
        if (key === val) {
          repl.editors[key].closest('.repl--editor').style.zIndex = 100;
        } else {
          repl.editors[key].closest('.repl--editor').style.zIndex = 0;
        }
      }
    }
  }

  menuHandler() {
    const self = this;

    return function(e) {
      const target = e.target;
      const switchType = target.getAttribute('data-type');

      self.resetEditors(switchType);

      if (self.type !== 'props') {
        self.repl.switcher.value = 'worklet';
      } else {
        self.repl.switcher.value = 'js';
      }

      self.repl.switcher.dispatchEvent(self.inputEvent);
    }
  }

  replPreview() {
    const repl = this.repl;
    const parent = this.parent;
    const type = this.type;
    const showConsole = this.showConsole;

    return debounce(function() {
      // console.clear();
      const vals = {};

      // Get Editor Values
      for (const editor in repl.editors) {
        vals[editor] = repl.editors[editor].value;
      }

      const getJS = () => showConsole ? `try {${vals.js}} catch(e) {printToConsole(e)}` : vals.js;

      // Build HTML
      let html = `<head><style>${vals.css}</style>`;
      if (showConsole) html += `<style>
pre.console {
  background: #272821;
  margin: 0;
  padding: .5em;
  position: absolute;
  bottom: 0;
  width: 100%;
}
pre.console code {
  color: whitesmoke;
  font-size: 3vw;
  white-space: normal;
}
</style>`;

      html += `</head><body>`;
      if (showConsole) html += `<pre class="console" hidden><code id="console_output"></code></pre>
        <script>
          const pre = document.querySelector('.console');
          const code = document.getElementById('console_output');
          console.dir(pre);
          console.dir(code);
          function printToConsole(msg) {
            console.error(msg);
            pre.hidden = !msg;
            code.textContent = msg;
          }
        </script>`;
      html += `${vals.html}`;
      html += `</body>`;

      // Only include JS directly if we're doing Custom Properties
      if (type === 'props') {
        html += `<script type="text/javascript">${getJS()}</script></head>`;
      } else if (isWorklet(type)) {
        html += `<script language="worklet">
            ${vals.worklet}
          </script>
          <script type="module">
          // In-page Worklet pattern from @DasSurma
          // https://glitch.com/edit/#!/aw-bug-hunt?path=delay.html:39:0
          function blobWorklet() {
            const src = document.querySelector('script[language="worklet"]').innerHTML;
            const blob = new Blob([src], {type: 'text/javascript'});
            return URL.createObjectURL(blob);
          }

          async function init() {
            await CSS.${type}Worklet.addModule(blobWorklet());
            console.log('loaded worklet');

            ${getJS()}
          }

          init();

          </script>`;
      } else {
        html += `<script type="module">
          window.addEventListener('DOMContentLoaded', () => {
            ${getJS()}
          });         
          </script>
        </head>`;
      }

      // Load it in
      window.requestAnimationFrame(() => {
        if (repl.previous) {
          repl.previous.remove();
        }
        const preview = document.createElement('iframe');
        preview.classList.add('repl--preview');
        parent.appendChild(preview);
        preview.contentWindow.document.open();
        preview.contentWindow.document.write(html);
        preview.contentWindow.document.close();

        repl.previous = preview;
      });
    }, runCodeTimeout);
  }
}
