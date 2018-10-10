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
  constructor(target, editorConfig) {
    if (Array.isArray(editorConfig)) {
      this.editorKeys = editorConfig.map(({ name }) => name);
      this.active = this.editorKeys[0];
      this.type = editorConfig[0].type;
    } else {
      this.editorKeys = [];
      this.type = editorConfig.type;
    }

    this.target = target;
    this.parent = document.querySelector(target) ;
    this.editorConfig = editorConfig;
    this.inputEvent = new Event(`input`, {
      bubbles: true,
      cancelable: true,
    });
    
    this.repl = {};
    this.switcherOptions = ['worklet', 'js', 'css', 'html'];

    this.buildREPL();
  }

  getActive() {
    return this.active
      ? this.editorConfig.find(({ name }) => this.active)
      : this.editorConfig;
  }

  buildREPL() {
    // Build Elements
    const menu = document.createElement('div');

    const replSwitcher = document.createElement('select');
    const replTitle = document.createElement('h4');

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

    if (this.editorKeys.length > 1) {
      for (const key of this.editorKeys) {
        menuItems[key] = document.createElement('button');
        menuItems[key].classList.add('repl--menu-item');
        menuItems[key].setAttribute('data-type', key);
        menuItems[key].textContent = key;
        menuItems[key].addEventListener('click', this.menuHandler());
        menu.appendChild(menuItems[key]);
      }
    }

    // Worklet Edits
    const selectedEditor = this.getActive().selectedEditor;
    if (isWorklet(this.type)) {
      workletEditor.style.zIndex = 100;
    } else if (selectedEditor && editorElmnts[selectedEditor]) {
      editorElmnts[selectedEditor].style.zIndex = 100;
      this.switcherOptions.shift();
    } else {
      jsEditor.style.zIndex = 100;
      this.switcherOptions.shift();
    }

    // Build Switcher
    for (const key of this.switcherOptions) {
      const so = document.createElement('option');
      so.selected = selectedEditor === key;
      so.value = key;
      so.text = key;
      replSwitcher.appendChild(so);
    }

    replSwitcher.addEventListener('input', this.swapEditors());

    // Add items to DOM
    this.parent.classList.add('repl');
    this.parent.appendChild(menu);
    this.parent.appendChild(replTitle);
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
    this.repl.menu = this.parent.querySelectorAll('.repl--menu-item');
    this.repl.previous = null;

    this.resetEditors();
  }

  resetEditors(base) {
    const selectedEditor = this.getActive();
    this.showConsole = selectedEditor.console || false;

    this.repl.title.innerText = selectedEditor.name;

    // Set the active menu item
    for (const menuItem of this.repl.menu) {
      delete menuItem.dataset.active;
      if (menuItem.dataset.type === base) {
        menuItem.dataset.active = true;
        this.active = base;
      }
    }

    let activateKey = '';

    for (const key in selectedEditor) {
      if (this.repl.editors[key]) {
        this.repl.editors[key].value = selectedEditor[key];
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

      if (isWorklet(self.type)) {
        self.repl.switcher.value = 'worklet';
      } else {
        self.repl.switcher.value = self.getActive().selectedEditor || 'js';
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
          function printToConsole(msg) {
            pre.hidden = !msg;
            code.textContent = msg;
          }
        </script>`;
      html += `${vals.html}`;
      html += `</body>`;

      if (isWorklet(type)) {
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
