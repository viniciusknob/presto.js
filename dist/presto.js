(function (window) {
  "use strict";

  const _Module = (function () {
    return {
      env: "prd",
      models: {},
      modules: {},
      pages: {},
    };
  })();

  window.Presto = _Module;
})(window);

(function(Presto, navigator, isSecureContext, document) {

    'use strict';

    const _Module = function() {

        const
            _write = text => {
                if (navigator.clipboard && isSecureContext) {
                    return navigator.clipboard.writeText(text);
                }
                else {
                    let textArea = document.createElement("textarea");
                    textArea.value = text;

                    // make the textarea out of viewport
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    textArea.style.top = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();

                    return new Promise((resolve, reject) => {
                        // here the magic happens
                        document.execCommand('copy') ? resolve() : reject();
                        textArea.remove();
                    });
                }
            };

        return {
            write: _write,
        };
    }();

    /* Module Definition */

    Presto.modules.Clipboard = _Module;

})(window.Presto, window.navigator, window.isSecureContext, window.document);

(function (Presto, document, jQuery) {
  "use strict";

  const _Module = (function () {
    const createSelectOptionsMonthYear = (options) => {
        let label = document.createElement("label");
        label.textContent = "Presto.js - Mês/Ano:";

        let select = document.createElement("select");

        let option = document.createElement("option");
        option.value = "";
        option.textContent = "Selecione...";
        select.appendChild(option);

        let currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth();
        let monthsToGoBack = 24;

        for (let goBack = 0; goBack >= 0 - monthsToGoBack; goBack--) {
          let date = new Date(currentYear, currentMonth + goBack, 1);
          let monthStr = new Intl.DateTimeFormat("pt-BR", {
            month: "short",
          }).format(date);

          let option = document.createElement("option");
          option.value = `${date.getMonth()}/${date.getFullYear()}`;
          option.textContent = `${monthStr}/${date.getFullYear()}`;
          select.appendChild(option);
        }

        select.onchange = (event) => {
          let partialDate = event.target.value.split("/");
          let year = partialDate[1];
          let month = parseInt(partialDate[0]) + 1;
          let monthStr = `${month}`.padStart(2, "0");
          let endOfMonth = new Date(year, month, 0).getDate();

          if (
            parseInt(year) === currentYear &&
            parseInt(partialDate[0]) === currentMonth
          ) {
            endOfMonth = new Date().getDate();
          }

          document.querySelector(
            options.dateBeginFieldId
          ).value = `01/${monthStr}/${year}`;
          document.querySelector(
            options.dateEndFieldId
          ).value = `${endOfMonth}/${monthStr}/${year}`;
        };

        let div = document.createElement("div");
        div.appendChild(label);
        div.appendChild(select);

        return div;
      },
      selectOption = (selector, optionByText) => {
        const select = document.querySelector(selector);
        const target = Array.from(select.options).find((x) =>
          new RegExp(optionByText).test(x.textContent)
        );
        if (target) {
          target.selected = true;

          const event = new Event("change", { bubbles: true });
          select.dispatchEvent(event);
        }
      },
      selectFirstJQueryAutocomplete = (id, value) => {
        const el = jQuery(id);
        el.focus();
        el.val(value);
        el.autocomplete("search");

        const interval = setInterval(() => {
          const menu = el.autocomplete("widget");
          const firstItem = menu.find("li.ui-menu-item:first");

          if (firstItem?.length) {
            clearInterval(interval);
            firstItem.trigger("mouseenter").trigger("click");
          }
        }, 250);
      },
      getFirstWeekdayOfMonth = (year, month) => {
        const date = new Date(year, month, 1);

        // If Saturday (6), move to Monday (2 days ahead)
        // If Sunday (0), move to Monday (1 day ahead)
        if (date.getDay() === 6) {
          date.setDate(date.getDate() + 2);
        } else if (date.getDay() === 0) {
          date.setDate(date.getDate() + 1);
        }

        return date;
      };

    const Taskier = {
      toText: (selector, value) => ({
        type: "text",
        selector,
        value,
      }),
      toSelect: (selector, value) => ({
        type: "select",
        selector,
        value,
      }),
      toFunc: (fn) => ({
        type: "function",
        fn,
      }),
      mapToFunc: (tasks) =>
        tasks.map((task) => {
          if (task.type === "function") {
            return task.fn;
          } else {
            const { selector: sel, value: val } = task;
            if (task.type === "text") {
              return () => (document.querySelector(sel).value = val);
            }
            if (task.type === "select") {
              return () => selectOption(sel, val);
            }
          }
        }),
      exec: async (tasks, ms) => {
        const delay = () => new Promise((r) => setTimeout(r, ms));

        for (let i = 0; i < tasks.length; i++) {
          await Promise.resolve(tasks[i]()); // garante que pode ser sync ou async
          if (i < tasks.length - 1) {
            await delay(); // só espera entre as tasks
          }
        }
      },
    };

    return {
      createSelectOptionsMonthYear,
      selectOption,
      selectFirstJQueryAutocomplete,
      getFirstWeekdayOfMonth,
      Taskier,
    };
  })();

  /* Module Definition */

  Presto.modules.CommonsHelper = _Module;
})(window.Presto, window.document, window.jQuery);

(function (Presto, document) {
  "use strict";

  const _Module = (function () {
    // Selectors
    const $$ = (selector, scope = document) => [
      ...scope.querySelectorAll(selector),
    ];

    return { $$ };
  })();

  /* Module Definition */

  Presto.modules.DomHelper = _Module;
})(window.Presto, window.document);

// https://stackoverflow.com/questions/29209244/css-floating-action-button

(function(Presto) {

    'use strict';

    const _Module = function() {

        const
            _buildIconHolder = iconClass => {
                let icon_holder = document.createElement('div');
                icon_holder.classList.add('fab-icon-holder');

                if (iconClass) {
                    let i = document.createElement('i');
                    i.classList.add(...iconClass.split(' '));
                    icon_holder.appendChild(i);
                } else {
                    icon_holder.classList.add('fab-main', 'fab-image-holder');
                }

                return icon_holder;
            },
            _buildLabel = textLabel => {
                let label = document.createElement('span');
                label.classList.add('fab-label');
                label.textContent = textLabel;
                return label;
            },
            _buildItem = options => {
                let item = document.createElement('li');

                item.appendChild(_buildLabel(options.textLabel));
                item.appendChild(_buildIconHolder(options.iconClass));
                item.onclick = options.click;

                return item;
            },
            _buildFabAndAddToPage = optionsArr => {
                let fab = document.createElement('div');
                fab.classList.add('fab-container');

                let ul = document.createElement('ul');
                ul.classList.add('fab-options');

                optionsArr.forEach(options => {
                    ul.appendChild(_buildItem(options));
                });

                fab.appendChild(_buildIconHolder());
                fab.appendChild(ul);

                document.body.appendChild(fab);
            };

        return {
            build: _buildFabAndAddToPage,
        };
    }();

    Presto.modules.FAB = _Module;

})(window.Presto);

// https://www.w3schools.com/howto/howto_css_modals.asp

(function (Presto) {
  "use strict";

  const _Module = (function () {
    const MODAL_SELECTOR = "#presto-modal",
      MODAL = `<div class="micromodal micromodal-slide" id="presto-modal" aria-hidden="true"><div class="modal__overlay" tabindex="-1" data-micromodal-close><div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="presto-modal-title"><header class="modal__header"><h2 class="modal__title" id="presto-modal-title"></h2><button class="modal__close" aria-label="Close modal" data-micromodal-close></button></header><main class="modal__content" id="presto-modal-content"></main><footer class="modal__footer"><button class="modal__btn modal__btn-primary" data-micromodal-close aria-label="Close this dialog window">Continue</button> <button class="modal__btn" data-micromodal-close aria-label="Close this dialog window">Close</button></footer></div></div></div>`;

    const _asyncReflow = function (...taskArr) {
        taskArr.map((task) => setTimeout(task, 25));
      },
      _addModalToPage = () => {
        let container = document.createElement("div");
        container.innerHTML = MODAL;
        document.body.appendChild(container.firstChild);
      },
      _addScriptToPage = () => {
        let script = document.createElement("script");
        /**
         * https://micromodal.vercel.app/
         * https://github.com/Ghosh/micromodal
         */
        script.src =
          "https://cdn.jsdelivr.net/npm/micromodal/dist/micromodal.min.js";
        document.body.appendChild(script);
      },
      _open = (options) => {
        const interval = setInterval(() => {
          let modal = document.querySelector(MODAL_SELECTOR);
          if (modal) {
            clearInterval(interval);

            modal.querySelector(".modal__title").textContent = options.title;
            modal.querySelector(".modal__content").innerHTML = "";
            modal.querySelector(".modal__content").appendChild(options.content);
            modal.querySelector(".modal__btn-primary").onclick =
              options.mainAction;

            window.MicroModal.show(MODAL_SELECTOR.substring(1));
          }
        }, 500);
      },
      _init = () => {
        _asyncReflow(_addModalToPage, _addScriptToPage);
      };

    const helpers = {
      buildFormGroup: (options) => {
        let formGroup = document.createElement("div");
        formGroup.classList.add("form-group");

        let label = document.createElement("label");
        label.htmlFor = options.input.id;
        label.textContent = options.textLabel;
        formGroup.appendChild(label);

        let input = document.createElement("input");
        input.type = options.input.type || "text";
        input.classList.add("form-control");
        input.id = options.input.id;
        if (options.input.value) input.value = options.input.value;
        formGroup.appendChild(input);

        if (options.helpText) {
          let small = document.createElement("small");
          small.classList.add("form-text", "text-muted");
          small.textContent = options.helpText;
          formGroup.appendChild(small);
        }

        return formGroup;
      },
      buildFormCheck: (options) => {
        let formCheck = document.createElement("div");
        formCheck.classList.add("form-check");

        let input = document.createElement("input");
        input.type = "checkbox";
        input.classList.add("form-check-input");
        input.id = options.input.id;
        if (options.input.value) input.value = options.input.value;
        formCheck.appendChild(input);

        let label = document.createElement("label");
        label.classList.add("form-check-label");
        label.htmlFor = options.input.id;
        label.textContent = options.textLabel;
        formCheck.appendChild(label);

        return formCheck;
      },
    };

    return {
      init: _init,
      open: _open,
      helpers: helpers,
    };
  })();

  /* Module Definition */

  Presto.modules.Modal = _Module;
})(window.Presto);

(function(Presto) {

    'use strict';

    const _Module = function() {

        const
            SHOW_CLASS = 'show',
            $ = document.querySelector.bind(document),
            _fire = message => {
                let x = $('#snackbar');

                if (!!!x) {
                    x = document.createElement('div');
                    x.id = 'snackbar';
                    $('body').appendChild(x);
                }

                x.textContent = message;

                x.classList.add(SHOW_CLASS);
                setTimeout(() => { x.classList.remove(SHOW_CLASS) }, 2850);
            };

        return {
            fire: _fire,
        };
    }();

    /* Module Definition */

    Presto.modules.Snackbar = _Module;

})(window.Presto);

(function(Presto) {

    'use strict';

    const _Module = function() {

        const CSS = '.fab-container{position:fixed;bottom:50px;right:50px;z-index:9999;cursor:pointer}.fab-icon-holder{width:50px;height:50px;border-radius:100%;background-image:linear-gradient(to bottom right,#ba39be,#05b370);box-shadow:0 6px 25px rgba(0,0,0,.35)}.fab-image-holder{background-image:url(https://i.imgur.com/x6YRXy8.png);background-color:#fff;background-size:58px;background-repeat:no-repeat;background-position:right}.fab-icon-holder i{display:flex;align-items:center;justify-content:center;height:100%;font-size:25px;color:#fff}.fab-main{width:60px;height:60px}.fab-main::before{content:"";position:absolute;width:100%;height:100%;bottom:10px}.fab-options{list-style-type:none;margin:0;position:absolute;bottom:70px;right:0;opacity:0;transition:all .3s ease;transform:scale(0);transform-origin:85% bottom}.fab-main:hover+.fab-options,.fab-options:hover{opacity:1;transform:scale(1)}.fab-options li{display:flex;justify-content:flex-end;padding:5px}.fab-label{padding:2px 5px;align-self:center;user-select:none;white-space:nowrap;border-radius:3px;font-size:16px;background:#666;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.2);margin-right:10px}.icon-number-1::before{content:"①"}.icon-number-2::before{content:"②"}.icon-number-3::before{content:"③"}.icon-number-4::before{content:"④"}.icon-number-5::before{content:"⑤"}.micromodal{font-family:-apple-system,BlinkMacSystemFont,avenir next,avenir,helvetica neue,helvetica,ubuntu,roboto,noto,segoe ui,arial,sans-serif}.micromodal *{box-sizing:border-box}.modal__overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:flex;justify-content:center;align-items:center;z-index:999999}.modal__container{background-color:#fff;padding:30px;max-width:500px;max-height:80vh;border-radius:4px;overflow-y:auto;box-sizing:border-box;min-width:30%}.modal__container header,.modal__container main{padding:initial!important}.modal__header{display:flex;justify-content:space-between;align-items:center}.modal__title{margin-top:0;margin-bottom:0;font-weight:600;font-size:1.5rem;line-height:1.5;color:#ba39be;box-sizing:border-box}.modal__close{background-color:transparent!important;border:0}.modal__close:before{content:"\\2715"}.modal__close:focus,.modal__close:hover{color:#000;text-decoration:none;opacity:.75}.modal__content{margin-top:2rem;margin-bottom:2rem;line-height:1.5;color:rgba(0,0,0,.8)}.modal__footer{text-align:right}.modal__btn{font-size:.875rem;padding-left:1rem;padding-right:1rem;padding-top:.5rem;padding-bottom:.5rem;background-color:#e6e6e6!important;color:rgba(0,0,0,.8);border-radius:.25rem;border-style:none;border-width:0;cursor:pointer;-webkit-appearance:button;text-transform:none;overflow:visible;line-height:1.15;margin:0;will-change:transform;-moz-osx-font-smoothing:grayscale;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-transform:translateZ(0);transform:translateZ(0);transition:-webkit-transform .25s ease-out;transition:transform .25s ease-out;transition:transform .25s ease-out,-webkit-transform .25s ease-out}.modal__btn:focus,.modal__btn:hover{-webkit-transform:scale(1.05);transform:scale(1.05)}.modal__btn-primary{background-color:#05b370!important;color:#fff}@keyframes mmfadeIn{from{opacity:0}to{opacity:1}}@keyframes mmfadeOut{from{opacity:1}to{opacity:0}}@keyframes mmslideIn{from{transform:translateY(15%)}to{transform:translateY(0)}}@keyframes mmslideOut{from{transform:translateY(0)}to{transform:translateY(-10%)}}.micromodal-slide{display:none}.micromodal-slide.is-open{display:block}.micromodal-slide[aria-hidden=false] .modal__overlay{animation:mmfadeIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=false] .modal__container{animation:mmslideIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__overlay{animation:mmfadeOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__container{animation:mmslideOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide .modal__container,.micromodal-slide .modal__overlay{will-change:transform}.modal__container .text-muted{color:#6c757d!important}.modal__container .form-text{display:block;margin-top:.25rem}.modal__container .form-group{margin-bottom:1rem}.modal__container .form-check{position:relative;display:block;padding-left:1.25rem}.modal__container .form-check-input{position:absolute;margin-top:.3rem;margin-left:-1.25rem;padding-right:20px}.modal__container .form-check-label{margin-left:5px}.modal__container label{display:inline-block;margin-bottom:.5rem!important}.modal__container button,.modal__container input{overflow:visible}.modal__container button,.modal__container input,.modal__container optgroup,.modal__container select,.modal__container textarea{margin:0;font-family:inherit;font-size:inherit;line-height:inherit}.modal__container textarea{height:initial;overflow:auto;resize:vertical}.modal__container .form-control{display:block;width:100%;padding:.375rem .75rem;font-size:1rem;line-height:1.5;color:#495057;background-color:#fff;background-clip:padding-box;border:1px solid #ced4da;border-radius:.25rem;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}.modal__container .form-control:focus{color:#495057;background-color:#fff;border-color:#80bdff;outline:0;box-shadow:0 0 0 .2rem rgb(0 123 255 / 25%)}#snackbar{visibility:hidden;opacity:0;min-width:250px;margin-left:-125px;background-image:linear-gradient(to bottom right,#ba39be,#05b370);color:#fff;text-align:center;border-radius:2px;padding:16px;position:fixed;z-index:9999999;left:50%;bottom:15%;font-size:17px}#snackbar.show{visibility:visible;opacity:1;-webkit-animation:fadein .5s,fadeout .5s 2.5s;animation:fadein .5s,fadeout .5s 2.5s}@-webkit-keyframes fadein{from{bottom:0;opacity:0}to{bottom:15%;opacity:1}}@keyframes fadein{from{bottom:0;opacity:0}to{bottom:15%;opacity:1}}@-webkit-keyframes fadeout{from{bottom:15%;opacity:1}to{bottom:0;opacity:0}}@keyframes fadeout{from{bottom:15%;opacity:1}to{bottom:0;opacity:0}}';

        const
            _addMaterialIconsToPage = () => {
                let link = document.createElement('link');
                link.rel = 'stylesheet';
                /**
                 * https://icons8.com/line-awesome
                 * https://github.com/icons8/line-awesome
                 */
                link.href = 'https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css';
                document.head.appendChild(link);
            },
            _addCustomCSSToPage = () => {
                let style = document.createElement('style');
                style.innerHTML = CSS;
                document.head.appendChild(style);
            },
            _inject = () => {
                _addMaterialIconsToPage();
                _addCustomCSSToPage();
            };

        return {
            inject: _inject,
        };
    }();

    /* Module Definition */

    Presto.modules.Style = _Module;

})(window.Presto);

(function (Presto, indexedDB) {
  "use strict";

  const _Module = (function () {
    const DB_NAME = "PrestoDB";

    let _db = undefined;

    const _getOrCreateDB = (storeName, keyPath, version = 1) => {
        const fn = "_getOrCreateDB";

        return new Promise((resolve, reject) => {
          if (_db) {
            // console.log(`${fn}: ${_db.name} already opened`);
            if (_db.version !== version) {
              console.log(
                `${fn}: it will close ${_db.name} because version change!`
              );
              _db.close();
            } else {
              return resolve(_db);
            }
          }

          if (!indexedDB) {
            console.log(
              `${fn}.checkSupport: This browser doesn\'t support IndexedDB`
            );
            return reject();
          }

          const idb = indexedDB.open(DB_NAME, version);

          idb.onerror = function (event) {
            console.log(`${fn}.indexedDB.open: ${JSON.stringify(event)}`);
            reject();
          };

          idb.onsuccess = (event) => {
            _db = event.target.result;

            _db.onerror = function (event) {
              console.log(`${fn}.db.any: ${JSON.stringify(event)}`);
            };

            resolve(_db);
          };

          idb.onupgradeneeded = function (event) {
            console.log(`${fn}.onupgradeneeded`, JSON.stringify(event));

            _db = event.target.result;

            if (_db.objectStoreNames.contains(storeName) === false) {
              _db.createObjectStore(storeName, { keyPath });
            }
          };
        });
      },
      __getObjectStore = function (db, storeName) {
        return db.transaction([storeName], "readonly").objectStore(storeName);
      },
      _get = function (db, storeName, id) {
        const fn = "_get";

        return new Promise((resolve, reject) => {
          const objectStore = __getObjectStore(db, storeName);
          const request = objectStore.get(id);
          request.onsuccess = (event) => {
            if (event.target.result) {
              resolve(event.target.result);
            } else {
              reject(`not found id ${id} in ${storeName} store`);
            }
          };
          request.onerror = reject;
        });
      },
      _getAll = function (db, storeName) {
        const fn = "_getAll";

        return new Promise(function (resolve, reject) {
          const list = [];
          const objectStore = __getObjectStore(db, storeName);
          objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
              list.push(cursor.value);
              cursor.continue();
            } else {
              resolve(list);
            }
          };
        });
      },
      _addOrUpdateItem = function (db, storeName, data) {
        const fn = "_addOrUpdateItem";

        return new Promise(function (resolve, reject) {
          const transaction = db.transaction([storeName], "readwrite");

          transaction.oncomplete = resolve;

          transaction.onerror = function (event) {
            console.log(`${fn}.transaction: ${JSON.stringify(event)}`);
            reject();
          };

          const objectStore = transaction.objectStore(storeName);

          const singleKeyRange = IDBKeyRange.only(data.id || data.uid);
          const _cursor = objectStore.openCursor(singleKeyRange);

          _cursor.onsuccess = function (event) {
            var cursor = event.target.result;

            let request;
            if (cursor) {
              request = objectStore.put(data);
            } else {
              request = objectStore.add(data);
            }

            request.onerror = function (event) {
              console.log(
                `${fn}.objectStore.request: ${JSON.stringify(event)}`
              );
              reject();
            };
          };

          _cursor.onerror = function (event) {
            console.log(`${fn}.cursor.open: ${JSON.stringify(event)}`);
            reject();
          };
        });
      };
    return {
      getOrCreateDB: _getOrCreateDB,
      get: _get,
      getAll: _getAll,
      addOrUpdateItem: _addOrUpdateItem,
    };
  })();

  Presto.modules.IndexedDBClient = _Module;
})(Presto, indexedDB);

(function (Presto) {
  "use strict";

  const { IndexedDBClient } = Presto.modules;

  const _Model = (function () {
    const STORE_NAME = "patient";

    const _getOrCreateDB = (version = 1) =>
        IndexedDBClient.getOrCreateDB(STORE_NAME, "id", version),
      _get = (db, id) => IndexedDBClient.get(db, STORE_NAME, id),
      _getAll = async (db) => {
        const list = await IndexedDBClient.getAll(db, STORE_NAME);
        list.sort(function (a, b) {
          // a.name.charCodeAt() - b.name.charCodeAt()
          return a.name.localeCompare(b.name);
        });
        return list;
      },
      _addOrUpdateItem = (db, data) =>
        IndexedDBClient.addOrUpdateItem(db, STORE_NAME, data),
      _createReport = () => {
        _getOrCreateDB()
          .then(_getAll)
          .then((arr) => {
            window.open().document.write(`
                <pre>${JSON.stringify(arr, undefined, 4)}</pre>
            `);
          });
      };

    return {
      getOrCreateDB: _getOrCreateDB,
      get: _get,
      getAll: _getAll,
      addOrUpdateItem: _addOrUpdateItem,
      createReport: _createReport,
    };
  })();

  Presto.models.PatientModel = _Model;
})(Presto, location);

(function (Presto) {
  "use strict";

  const { IndexedDBClient } = Presto.modules;

  const _Model = (function () {
    const STORE_NAME = "person";

    const _getOrCreateDB = (version = 1) =>
        IndexedDBClient.getOrCreateDB(STORE_NAME, "uid", version),
      _get = (db, uid) => IndexedDBClient.get(db, STORE_NAME, uid),
      _getAll = async (db) => {
        const list = await IndexedDBClient.getAll(db, STORE_NAME);
        list.sort(function (a, b) {
          // a.name.charCodeAt() - b.name.charCodeAt()
          return a.name.localeCompare(b.name);
        });
        return list;
      },
      _addOrUpdateItem = (db, person) =>
        IndexedDBClient.addOrUpdateItem(db, STORE_NAME, person),
      _createReport = () => {
        _getOrCreateDB()
          .then(_getAll)
          .then((personArr) => {
            window.open().document.write(`
                <pre>${JSON.stringify(personArr, undefined, 4)}</pre>
            `);
          });
      };

    return {
      getOrCreateDB: _getOrCreateDB,
      get: _get,
      getAll: _getAll,
      addOrUpdateItem: _addOrUpdateItem,
      createReport: _createReport,
    };
  })();

  Presto.models.PersonModel = _Model;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { PatientModel } = Presto.models;
  const dbVersion = 2; // IndexedDB
  const { Snackbar, FAB, Modal, CommonsHelper, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const PATHNAME_REGEX = /guia-de-sp-sadt-incluir/,
      MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR = "#presto-appointments-days",
      MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR =
        "#presto-appointments-month-year",
      MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR =
        "#presto-appointments-unit-value";

    const __buildTasksForDefaultData = async () => {
        const formatBRDate = (date) => {
          const intlOpt = { day: "2-digit", month: "2-digit", year: "numeric" };
          return new Intl.DateTimeFormat("pt-BR", intlOpt).format(date);
        };

        let carteira = undefined;
        $$(".linha").forEach((line) => {
          let strongList = $$("strong", line);
          strongList.forEach((strong) => {
            if (strong) {
              let strongText = strong.textContent;
              if (/Carteira/.test(strongText)) {
                carteira = strong.parentElement
                  .querySelector("span")
                  .textContent.replace(/\s/g, "");
              }
            }
          });
        });

        let patient = undefined;
        if (carteira) {
          patient = await PatientModel.getOrCreateDB(dbVersion)
            .then(PatientModel.getAll)
            .then((patients) => patients.find((x) => x.id === carteira));
        }

        const { Taskier } = CommonsHelper;

        return Taskier.mapToFunc([
          Taskier.toText("#numero-guia-principal", "0"),
          Taskier.toText("#data-autorizacao", formatBRDate(new Date())),
          Taskier.toFunc(() => {
            const d = new Date();
            d.setDate(d.getDate() + 90);
            const sel = "#data-validade-senha";
            document.querySelector(sel).value = formatBRDate(d);
          }),
          Taskier.toText(
            "#nome-profissional-solicitante",
            patient?.specialist?.name || ""
          ),
          Taskier.toSelect("#conselho-profissional", "CRP"),
          Taskier.toSelect("#uf-conselho-profissional", "RS"),
          Taskier.toText(
            "#numero-registro-conselho",
            patient?.specialist?.ncrp || ""
          ),
          Taskier.toFunc(() =>
            CommonsHelper.selectFirstJQueryAutocomplete("#cbo", "251510")
          ),
          Taskier.toSelect("#carater-atendimento", "Eletivo"),
          Taskier.toText("#data-solicitacao", formatBRDate(new Date())),
          Taskier.toSelect("#flag-atendimento-rn", "Não"),
          Taskier.toText("#indicacao-clinica", "Tratamento Psicologico"),
          Taskier.toSelect("#indicador-acidente", "Não Acidente"),
          Taskier.toSelect("#tipo-consulta", "Retorno"),
          Taskier.toSelect("#regime-atendimento", "Ambulatorial"),
          Taskier.toFunc(() => {
            CommonsHelper.selectOption("#tipo-atendimento", "Outras Terapias");
            setTimeout(() => jQuery(".ui-dialog-content").dialog("close"), 500);
          }),
        ]);
      },
      /** Modal actions */

      __removeInitialAppointment = () => {
        const selector = ".bt-excluir-procedimento-realizado";
        $$(selector).forEach((e) => e.click());
      },
      _addAppointment = (days, monthYear, unitValue) => {
        const day = days.shift();

        document.querySelector(
          "[name='per.data']"
        ).value = `${day}/${monthYear}`;

        document.querySelector("[name='per.codigo-procedimento']").value =
          "50000470";
        document
          .querySelector("[class='sasbt1 btn-busca-procedimento']")
          .click();

        setTimeout(() => {
          document.querySelector("[name='per.quantidade']").value = "1";
          document.querySelector("[name='per.valor-unitario']").value =
            unitValue;

          document.querySelector("#incluirPer").click();

          setTimeout(() => {
            if (days.length) {
              _addAppointment(days, monthYear, unitValue);
            } else {
              Snackbar.fire(`Pronto!`);
            }
          }, 1000);
        }, 1000);
      },
      __fillFormModal_onclick = async () => {
        /**
         * Modal Validations
         */
        let _days = document.querySelector(
          MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR
        ).value;
        if (!!!_days) {
          Snackbar.fire("Informe os dias dos procedimentos!");
          return;
        }

        let _monthYear = document.querySelector(
          MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR
        ).value;
        if (!!!_monthYear) {
          Snackbar.fire("Informe o mês/ano dos procedimentos!");
          return;
        }

        let _unitValue = document.querySelector(
          MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR
        ).value;
        if (!!!_unitValue) {
          Snackbar.fire(
            "Informe o valor unitário dos procedimentos no formato 12,34!"
          );
          return;
        }
        /**
         * end Modal Validations
         */

        const { Taskier } = CommonsHelper;

        const tasks = [
          ...(await __buildTasksForDefaultData()),
          ...Taskier.mapToFunc([
            Taskier.toFunc(__removeInitialAppointment),
            Taskier.toFunc(() => {
              document
                .querySelector("#formPer")
                .scrollIntoView({ behavior: "smooth", block: "start" });

              _days = _days.split(",").map((day) => day.padStart(2, "0"));
              _monthYear = `/${_monthYear}`;

              _addAppointment(_days, _monthYear, _unitValue);
            }),
          ]),
        ];

        Taskier.exec(tasks, 200); // _addAppointment take more time than exec, so the Snackbar is there!
      },
      __buildMonthDate = () => {
        const f = new Intl.DateTimeFormat("pt-BR", {
          month: "2-digit",
          year: "numeric",
        });
        return f.format(new Date());
      },
      __buildModalContent = () => {
        let content = document.createElement("div");

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "DIAS",
            input: {
              id: MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR.substring(1),
            },
            helpText: "Ex.: 7,14,21,28",
          })
        );

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "MÊS/ANO",
            input: {
              id: MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR.substring(1),
              value: __buildMonthDate(),
            },
            helpText: "Ex.: 07/2024",
          })
        );

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "VALOR UNITÁRIO",
            input: {
              id: MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR.substring(1),
              value: "62,05",
            },
            helpText: "Ex.: 62,05",
          })
        );

        return content;
      },
      /** end Modal actions */

      __btnAdicionarProcedimentos_onclick = () => {
        Modal.open({
          title: "Adicionar Procedimentos",
          content: __buildModalContent(),
          mainAction: __fillFormModal_onclick,
        });
      },
      __buildPatientName = () => {
        const e = document.querySelector(
          ".box-padrao .box-padrao-int .tab .linha"
        );

        const carteira = e
          .querySelector("div span")
          .textContent.replace(/\s/g, "");

        PatientModel.getOrCreateDB(dbVersion)
          .then(PatientModel.getAll)
          .then((patients) => {
            const ptt = patients.find((p) => p.id === carteira);

            const div = document.createElement("div");
            const strong = document.createElement("strong");
            strong.textContent = "(Presto.js) Nome do Beneficiário: ";
            const span = document.createElement("span");
            span.textContent = ptt.name;
            div.appendChild(strong);
            div.appendChild(span);
            e.appendChild(div);
          })
          .catch((e) => console.error(e));
      },
      _upgrade = () => {
        Modal.init();

        __buildPatientName();

        FAB.build([
          {
            textLabel: "Preencher Guia",
            iconClass: "las la-calendar-plus",
            click: __btnAdicionarProcedimentos_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.GuiaDeSPSADTIncluirPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { PatientModel } = Presto.models;
  const dbVersion = 2; // IndexedDB
  const { Snackbar, FAB, CommonsHelper, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    // validacao-de-procedimentos-tiss-3/validacao-de-procedimentos/solicitacao/solicitacao-de-sp-sadt.htm
    const PATHNAME_REGEX = /solicitacao\/solicitacao-de-sp-sadt/;

    const __btnPreencherDadosPadrao_onclick = async (qtdSolicitada) => {
        const formatBRDate = (date) => {
          const intlOpt = { day: "2-digit", month: "2-digit", year: "numeric" };
          return new Intl.DateTimeFormat("pt-BR", intlOpt).format(date);
        };

        let carteira = undefined;
        $$(".linha").forEach((line) => {
          let strongList = $$("strong", line);
          strongList.forEach((strong) => {
            if (strong) {
              let strongText = strong.textContent;
              if (/Carteira/.test(strongText)) {
                carteira = strong.parentElement
                  .querySelector("span")
                  .textContent.replace(/\s/g, "");
              }
            }
          });
        });
        let patient = undefined;
        if (carteira) {
          patient = await PatientModel.getOrCreateDB(dbVersion)
            .then(PatientModel.getAll)
            .then((patients) => patients.find((x) => x.id === carteira));
        }

        const { Taskier } = CommonsHelper;

        const tasks = Taskier.mapToFunc([
          Taskier.toText(
            "[name='solicitacao-sp-sadt.numero-guia-prestador']",
            "0"
          ),
          Taskier.toText(
            "[name='solicitacao-sp-sadt.executante-solicitante.nome-profissional-solicitante']",
            patient?.specialist?.name || ""
          ),
          Taskier.toSelect("#conselho-profissional", "CRP"),
          Taskier.toSelect("#uf-conselho-profissional", "RS"),
          Taskier.toText(
            "[name='solicitacao-sp-sadt.executante-solicitante.conselho-profissional.numero']",
            patient?.specialist?.ncrp || ""
          ),
          Taskier.toFunc(() =>
            CommonsHelper.selectFirstJQueryAutocomplete(
              "#busca-codigo-cbo",
              "251510"
            )
          ),
          Taskier.toFunc(() => {
            // const d = new Date();
            // const yyyy = d.getFullYear();
            // const mm = d.getMonth();
            // const date = CommonsHelper.getFirstWeekdayOfMonth(yyyy, mm);
            const sel = "#data-atendimento";
            document.querySelector(sel).value = formatBRDate(new Date());
          }),
          Taskier.toSelect("#recem-nato", "Não"),
          Taskier.toSelect(
            "[name='solicitacao-sp-sadt.atendimento.tecnica-utilizada.codigo']",
            "Convencional"
          ),
          Taskier.toText("[name='codigo-procedimento']", "50000470"),
          Taskier.toFunc(() =>
            document.querySelector("#btn-incluir-procedimento").click()
          ),
          Taskier.toFunc(() => {
            const sel = '[name="quantidade-solicitada"]';
            const input = document.querySelector(sel);
            input.value = qtdSolicitada;

            const event = new Event("change", { bubbles: true });
            input.dispatchEvent(event);
          }),
          Taskier.toFunc(() =>
            document.querySelector("#btn-validar-procedimento").click()
          ),
        ]);

        Taskier.exec(tasks, 200)
          .then(() => Snackbar.fire("Pronto!"))
          .then(() => {
            const selector = "#btn-confirmar-solicitacao";
            const elem = document.querySelector(selector);
            const originalClick = elem.click;
            elem.onclick = () => {
              const prefix = "solicitacao-sp-sadt.executante-solicitante";
              const spcName = document.querySelector(
                `[name='${prefix}.nome-profissional-solicitante']`
              ).value;
              const spcNCRP = document.querySelector(
                `[name='${prefix}.conselho-profissional.numero']`
              ).value;
              patient = {
                ...patient,
                specialist: {
                  name: spcName,
                  ncrp: spcNCRP,
                },
              };
              PatientModel.getOrCreateDB(dbVersion)
                .then((db) => PatientModel.addOrUpdateItem(db, patient))
                .then(() => originalClick())
                .catch((e) => console.error(e));
            };
          });
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Autorizar 5 sessões",
            iconClass: "las icon-number-5",
            click: () => __btnPreencherDadosPadrao_onclick(5),
          },
          {
            textLabel: "Autorizar 4 sessões",
            iconClass: "las icon-number-4",
            click: () => __btnPreencherDadosPadrao_onclick(4),
          },
          {
            textLabel: "Autorizar 3 sessões",
            iconClass: "las icon-number-3",
            click: () => __btnPreencherDadosPadrao_onclick(3),
          },
          {
            textLabel: "Autorizar 2 sessões",
            iconClass: "las icon-number-2",
            click: () => __btnPreencherDadosPadrao_onclick(2),
          },
          {
            textLabel: "Autorizar 1 sessões",
            iconClass: "las icon-number-1",
            click: () => __btnPreencherDadosPadrao_onclick(1),
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) {
          _upgrade();
        }
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.SolicitacaoDeSPSADTPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { PatientModel } = Presto.models;
  const { SolicitacaoDeSPSADTPage, GuiaDeSPSADTIncluirPage } = Presto.pages;
  const { CommonsHelper, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;
  const dbVersion = 2; // IndexedDB

  const _Module = (function () {
    const HOST = /saude.sulamericaseguros.com.br/,
      // Prestador > Segurado > Validação de Elegibilidade
      ELEGIBILIDADE = /validacao-de-elegibilidade/,
      // Prestador > Segurado > Validação de Elegibilidade
      ELEGIBILIDADE_RESULTADO =
        /validacao-de-elegibilidade\/elegibilidade-resultado/,
      // Prestador > Segurado > Validação de Procedimentos > Solicitação
      PROCEDIMENTO_SOLICITACAO =
        /validacao-de-procedimentos\/?(solicitacao)?\/?$/,
      // Prestador > Segurado > Validação de Procedimentos > Consulta > Consulta de Solicitações
      PROCEDIMENTO_CONSULTA = /validacao-de-procedimentos\/consulta/,
      // Prestador > Serviços Médicos > Contas Médicas > Faturamento > Fechamento de Lote > Fechamento de Lote
      FECHAMENTO_DE_LOTE = /fechamento-de-lote/,
      // Prestador > Serviços Médicos > Contas Médicas > Faturamento > Validar procedimento autorizado
      PROCEDIMENTO_AUTORIZADO = /validar-procedimento-autorizado/,
      // Prestador > Serviços Médicos > Demonstrativos TISS 3 > Demonstrativo de Pagamento > Demonstrativo de Pagamento
      DEMONSTRATIVO_PAGAMENTO =
        /demonstrativos-tiss-3(\/demonstrativo-de-pagamento)?/;

    const _is = function () {
        return HOST.test(location.host);
      },
      _isLoaded = function () {
        return [
          "#box-validacao-beneficiario",
          ".box-indicador-elegibilidade",
          ".box-padrao",
        ]
          .map((x) => document.querySelector(x))
          .some((x) => x);
      },
      _buildComboBox = async function (insuredList = []) {
        if (insuredList.length === 0) return null;

        let select = document.createElement("SELECT");
        select.style.cssText = "vertical-align: middle;";

        let option = document.createElement("OPTION");
        option.value = "";
        option.textContent = "ESCOLHA O BENEFICIÁRIO...";
        select.appendChild(option);

        select.onchange = () => {
          let option = select.querySelector(":checked");

          document.querySelector("#codigo-beneficiario-1").value =
            option.value.substr(0, 3);
          document.querySelector("#codigo-beneficiario-2").value =
            option.value.substr(3, 5);
          document.querySelector("#codigo-beneficiario-3").value =
            option.value.substr(8, 4);
          document.querySelector("#codigo-beneficiario-4").value =
            option.value.substr(12, 4);
          document.querySelector("#codigo-beneficiario-5").value =
            option.value.substr(16, 4);
        };

        insuredList.forEach((insured) => {
          let option = document.createElement("OPTION");
          option.value = insured.id;
          option.textContent = insured.name;
          select.appendChild(option);
        });

        return select;
      },
      _fixAnyPage = async function () {
        GuiaDeSPSADTIncluirPage.upgrade();
        SolicitacaoDeSPSADTPage.upgrade();

        if (DEMONSTRATIVO_PAGAMENTO.test(location.pathname)) {
          // BEGIN create field for month/year
          const dateBeginFieldSelector = 'input[name="data-inicial"]';
          const div = CommonsHelper.createSelectOptionsMonthYear({
            dateBeginFieldId: dateBeginFieldSelector,
            dateEndFieldId: 'input[name="data-final"]',
          });
          div.firstElementChild.style.width = "initial"; // label
          div.style.display = "block";
          const node = document.querySelector(dateBeginFieldSelector)
            .parentElement.parentElement;
          node.insertBefore(div, node.childNodes[1]);
          // END create field for month/year
        } else if (ELEGIBILIDADE_RESULTADO.test(location.pathname)) {
          let eligibleBox = document.querySelector(
            ".box-indicador-elegibilidade .linha"
          );
          let eligible = eligibleBox.querySelector(".atencao").textContent;

          let patient = {
            id: "",
            name: "",
          };

          $$(".linha").forEach((line) => {
            let strongList = $$("strong", line);
            strongList.forEach((strong) => {
              if (strong) {
                let strongText = strong.textContent;
                if (/Carteira/.test(strongText)) {
                  patient.id = strong.parentElement
                    .querySelector("span")
                    .textContent.replace(/\s/g, "");
                }
                if (/Nome/.test(strongText)) {
                  patient.name =
                    strong.parentElement.querySelector("span").textContent;
                }
              }
            });
          });

          if (patient.id) {
            const _patient = await PatientModel.getOrCreateDB(dbVersion)
              .then(PatientModel.getAll)
              .then((patients) => patients.find((x) => x.id === patient.id));

            patient = _patient || patient;
          }

          if (eligible === "SIM") {
            let divStatus = document.createElement("DIV");
            divStatus.id = "js-presto-status";
            divStatus.style = "float:right;font-weight:bold;color:limegreen;";
            divStatus.textContent = "Salvando...";
            eligibleBox.appendChild(divStatus);

            PatientModel.getOrCreateDB(dbVersion)
              .then((db) => PatientModel.addOrUpdateItem(db, patient))
              .then(() => {
                eligibleBox.querySelector("#js-presto-status").textContent =
                  "Salvo!";
              })
              .catch((err) => {
                console.log(
                  `_fixAnyPage: [eligible=${eligible}] ${JSON.stringify(err)}`
                );
              });
          }
        } else {
          PatientModel.getOrCreateDB(dbVersion)
            .then(PatientModel.getAll)
            .then(_buildComboBox)
            .then((comboBox) => {
              if (!comboBox) return;

              if (ELEGIBILIDADE.test(location.pathname)) {
                let node = document.querySelector(
                  "#box-validacao-beneficiario div"
                );
                node.insertBefore(comboBox, node.childNodes[2]);
                document.querySelector(".box-padrao").style.width = "850px";
              }
              if (PROCEDIMENTO_SOLICITACAO.test(location.pathname)) {
                if (PROCEDIMENTO_CONSULTA.test(location.pathname)) {
                  let node = document.querySelector(
                    "#box-validacao-beneficiario"
                  );
                  node.insertBefore(comboBox, node.childNodes[2]);
                } else {
                  let node = document.querySelector(
                    "#box-validacao-beneficiario div"
                  );
                  node.insertBefore(comboBox, node.childNodes[2]);
                  document.querySelector(".box-padrao").style.width = "850px";
                }
              }
              if (FECHAMENTO_DE_LOTE.test(location.pathname)) {
                let node = document.querySelector(
                  "#box-validacao-beneficiario div"
                );
                node.insertBefore(comboBox, node.childNodes[2]);

                // BEGIN create field for month/year
                const dateBeginFieldSelector = 'input[name="data-inicial"]';
                const div = CommonsHelper.createSelectOptionsMonthYear({
                  dateBeginFieldId: dateBeginFieldSelector,
                  dateEndFieldId: 'input[name="data-final"]',
                });
                node = document.querySelector(dateBeginFieldSelector)
                  .parentElement.parentElement;
                node.insertBefore(div, node.childNodes[1]);
                // END create field for month/year
              }
              if (PROCEDIMENTO_AUTORIZADO.test(location.pathname)) {
                let node = document.querySelector(
                  "#box-validacao-beneficiario"
                );
                node.insertBefore(comboBox, node.childNodes[0]);
                document.querySelector(".box-padrao").style.width = "780px";

                // BEGIN create field for month/year
                const dateBeginFieldSelector = 'input[name="data-inicio"]';
                const div = CommonsHelper.createSelectOptionsMonthYear({
                  dateBeginFieldId: dateBeginFieldSelector,
                  dateEndFieldId: 'input[name="data-termino"]',
                });
                div.firstElementChild.style.width = "initial"; // label
                div.style.marginRight = "1rem";
                node = document.querySelector(dateBeginFieldSelector)
                  .parentElement.parentElement;
                node.insertBefore(div, node.childNodes[2]);
                // END create field for month/year
              }
            })
            .catch((err) => {
              console.log(
                `_fixAnyPage: [eligible=${eligible}] ${JSON.stringify(err)}`
              );
            });
        }
      };

    /* Public Functions */

    return {
      is: _is,
      isLoaded: _isLoaded,
      fix: _fixAnyPage,
    };
  })();

  Presto.modules.SulAmerica = _Module;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { CommonsHelper } = Presto.modules;

  const _Page = (function () {
    const // Inicio > Autorização > Últimas Solicitações
      PATHNAME_REGEX = /autorizacao\/ultimasSolicitacoes\/ultimasSolicitacoes/,
      FORM_FIELDSET_SELECTOR = "#formularioBase fieldset";

    const _upgrade = () => {
        const div = CommonsHelper.createSelectOptionsMonthYear({
          dateBeginFieldId: "#txtDataEnvioDe",
          dateEndFieldId: "#txtDataEnvioAte",
        });
        div.style.paddingBottom = "3em";
        div.style.marginLeft = "8em";

        const referenceNode = document.querySelector(FORM_FIELDSET_SELECTOR);
        referenceNode.insertBefore(div, referenceNode.firstChild);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.AutorizacaoUltimasSolicitacoesPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Autorização > Últimas Solicitações > Buscar Status Autorização
      PATHNAME_REGEX =
        /autorizacao\/ultimasSolicitacoes\/buscarStatusAutorizacao/;

    const _btnCopy_fields = [
      /Senha/,
      /Data.Autoriza..o/,
      /Data.Validade.Senha/,
      /Status.da.Senha/,
      /N.mero.da.Carteira/,
      /Nome:/,
      /Cart.o.Nacional.de.Sa.de/,
    ];

    const __btnCopy_onclick = function () {
        const labelList = $$("#body label");
        let barArr = [];

        labelList.forEach((label) => {
          let labelText = label.textContent;
          labelText = labelText ? labelText.trim() : "";

          let value = "";

          if (
            _btnCopy_fields.some((fieldRegex) => fieldRegex.test(labelText))
          ) {
            let spanElement = label.parentElement.querySelector("span");
            value = spanElement ? spanElement.textContent : "";
            value = value ? value.replace("R$", "").trim() : "";
          } else {
            return;
          }

          labelText = labelText.replace("ù", "ú");

          barArr.push(`${labelText} ${value}`);
        });

        const thList = $$(".tab-administracao th");
        const trList = $$(".tab-administracao tr");

        trList.forEach((tr) => {
          $$("td", tr).forEach((td, index) => {
            let tdText = td.textContent;
            barArr.push(`${thList[index].textContent}: ${tdText}`);
          });
        });

        Clipboard.write(barArr.join(", ")).then(() =>
          Snackbar.fire("Copiado!")
        );
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar dados (Recurso de Glosa)",
            iconClass: "lar la-copy",
            click: __btnCopy_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.AutorizacaoUltimasSolicitacoesBuscarStatusPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Extrato > Visualizar > Detalhe do Pagamento > Detalhe Lote
      PATHNAME_REGEX = /extrato\/buscarLote/;

    const __createDeepCopyButton_extratoDetalhePgtoLote_onclick = function () {
        let formList = $$('form[id*="formularioTratarGlosas"]');
        let bazArr = [],
          todoTasks = [];

        formList.forEach((form) => {
          var table = form.querySelector("table");
          var tbodyTrList = $$("tbody tr", table);
          tbodyTrList.forEach((tr) => {
            $$("td", tr).forEach((td) => {
              let child = td.firstElementChild;
              if (child && child.nodeName === "A") {
                todoTasks.push(child);
              }
            });
          });
        });

        let execTask = () => {
          let child = todoTasks.shift();
          var barArr = [];
          child.click();
          let interval = setInterval(() => {
            let eAjaxContent = document.querySelector("#TB_ajaxContent");
            if (!eAjaxContent) return;

            clearInterval(interval);

            let glosas = [];

            $$("label", eAjaxContent).forEach((label) => {
              let labelText = label.textContent.replace(":", "").trim();
              let value = label.parentElement
                .querySelector("span")
                .textContent.replace(".", ",")
                .trim();

              if (/Motivo.+Glosa/.test(labelText)) {
                let reasons = $$("ul li", label.parentElement.parentElement);
                reasons = reasons
                  .map((reason) => reason.textContent.trim())
                  .map((reason) => reason.replace(/\t/g, ""));
                value += ` (${reasons.join(";\n")});`;
                glosas.push(value);
                return;
              }

              barArr.push(value);
            });

            if (glosas) {
              barArr.push(`="${glosas.join('"&CHAR(10)&"')}"`);
            }

            bazArr.push(barArr.join("\t"));

            eAjaxContent.querySelector(".TB_closeWindowButton").click();

            let innerInterval = setInterval(() => {
              if (document.querySelector("#TB_ajaxContent")) return;

              clearInterval(innerInterval);

              if (todoTasks.length) {
                execTask();
              } else {
                Clipboard.write(bazArr.join("\n")).then(() =>
                  Snackbar.fire("Copiado!")
                );
              }
            }, 250);
          }, 250);
        };

        execTask();
      },
      __createCopyButton_extratoDetalhePgtoLote_onclick = function () {
        let formList = $$('form[id*="formularioTratarGlosas"]');
        let bazArr = [],
          todoTasks = [];

        formList.forEach((form) => {
          var table = form.querySelector("table");
          var tbodyTrList = $$("tbody tr", table);
          tbodyTrList.forEach((tr) => {
            var barArr = [];

            // bloco cinza...

            var labelList = $$("label", form);
            labelList.forEach((label) => {
              let value = label.parentElement
                .querySelector("span")
                .textContent.trim();
              barArr.push(value);
            });

            $$("td", tr).forEach((td) => {
              let child = td.firstElementChild;
              if (child && child.nodeName === "A") {
                todoTasks.push(child);
              }

              let tdText = td.textContent.replace("R$", "").trim();
              if (tdText) {
                barArr.push(tdText);
              }
            });

            barArr.push(
              document
                .querySelector(".tab-administracao tbody tr td")
                .textContent.trim()
            );
            bazArr.push(barArr.join("\t"));
          });
        });

        Clipboard.write(bazArr.join("\n")).then(() =>
          Snackbar.fire("Copiado!")
        );
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar dados (deep)",
            iconClass: "lar la-clipboard",
            click: __createDeepCopyButton_extratoDetalhePgtoLote_onclick,
          },
          {
            textLabel: "Copiar dados",
            iconClass: "lar la-copy",
            click: __createCopyButton_extratoDetalhePgtoLote_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.ExtratoBuscarLotePage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Extrato > Visualizar > Detalhe do Pagamento
      PATHNAME_REGEX = /extrato\/detalhePagamento/;

    const __createCopyButton_extratoDetalhePgto_onclick = function () {
        let labelList = $$("#dados-solicitacao label");
        let barArr = [],
          bazArr = [];

        labelList.forEach((label) => {
          let value = label.parentElement
            .querySelector("span")
            .textContent.replace("R$", "")
            .trim();
          barArr.push(value);
        });

        let barArrJoined = barArr.join("\t");
        bazArr.push(barArrJoined);

        let bazArrJoined = bazArr.join("\n");

        Clipboard.write(bazArrJoined).then(() => Snackbar.fire("Copiado!"));
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar dados",
            iconClass: "lar la-copy",
            click: __createCopyButton_extratoDetalhePgto_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.ExtratoDetalhePagamentoPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { PersonModel } = Presto.models;
  const { Snackbar, FAB, Modal, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Faturamento > Digitação > Digitar > Serviço Profissional/Serviço Auxiliar de Diagnóstico e Terapia - SP/SADT
      PATHNAME_REGEX = /faturamento\/digitar\/spsadt/,
      FORM_FIELDSET_SELECTOR = "#formularioDigitacaoSPSADT fieldset div",
      MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR = "#presto-appointments-days",
      MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR =
        "#presto-appointments-month-year",
      MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR =
        "#presto-appointments-unit-value";

    const __avoidErrorInClientCode = () => {
        const brokenFn = window.removerItemDigitacao;
        window.removerItemDigitacao = (...args) => {
          try {
            brokenFn(...args);
          } catch (e) {
            /**
             * Uncaught TypeError: Cannot read properties of null (reading 'length')
             *   at removerItemDigitacao (tratamentosModalDigitacao.js:1126:31)
             *   at HTMLAnchorElement.onclick (spsadt.htm:2449:195)
             *   at __removeInitialAppointment (<anonymous>:1141:38)
             *   at HTMLButtonElement.__fillForm_faturamentoDigitarSPSADT_onclick (<anonymous>:1221:17)
             */
          }
        };
      },
      /** Modal actions */
      __removeInitialAppointment = () => {
        let fakeTR = document.querySelector("#trProcedimento0");
        if (fakeTR) {
          let tdArr = $$("td", fakeTR);
          if (tdArr.filter((td) => td.textContent === "-").length) {
            fakeTR.querySelector("input").checked = true;
            document
              .querySelector("#bt-addProcedimento")
              .parentElement.querySelector(".bt-remover")
              .click();
          }
        }
      },
      _addAppointment = (days, monthYear, daysLength, unitValue) => {
        let day = days.shift();

        document.querySelector("#bt-addProcedimento").click(); // open modal

        document.querySelector("#dataModalProcedimento").value =
          day + monthYear;
        document
          .querySelector("#labelOrdemItemModalProcedimento")
          .parentElement.querySelector("input").value =
          daysLength - days.length;
        document.querySelector("#tipoTabelaModalProcedimento").value = 22;
        document.querySelector("#codigoModalProcedimento").value = 50000470;
        document.querySelector("#codigoModalProcedimento").onblur();

        let interval = setInterval(() => {
          let target = document.querySelector("#descricaoModalProcedimento");
          if (target.value) {
            clearInterval(interval);

            document.querySelector("#quantidadeModalProcedimento").value = 1;

            jQuery("#porcentagemRedAcrModalProcedimento").unmask();
            document.querySelector(
              "#porcentagemRedAcrModalProcedimento"
            ).value = "1.00";

            document.querySelector("#valorUnitarioModalProcedimento").value =
              unitValue.replace(",", ".");
            document.querySelector("#valorUnitarioModalProcedimento").onblur();

            interval = setInterval(() => {
              target = document.querySelector("#valorTotalModalProcedimento");
              if (target.value) {
                clearInterval(interval);

                setTimeout(() => {
                  document
                    .querySelector("#bt-operacaoModalProcedimento")
                    .click(); // close modal
                  if (days.length) {
                    setTimeout(
                      () =>
                        _addAppointment(days, monthYear, daysLength, unitValue),
                      1000
                    );
                  } else {
                    Snackbar.fire("Pronto!");
                  }
                }, 1000);
              }
            }, 250);
          }
        }, 250);
      },
      __fillForm_faturamentoDigitarSPSADT_onclick = () => {
        /**
         * Modal Validations
         */
        let _days = document.querySelector(
          MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR
        ).value;
        if (!!!_days) {
          Snackbar.fire("Informe os dias dos procedimentos!");
          return;
        }

        let _monthYear = document.querySelector(
          MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR
        ).value;
        if (!!!_monthYear) {
          Snackbar.fire("Informe o mês/ano dos procedimentos!");
          return;
        }

        let _unitValue = document.querySelector(
          MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR
        ).value;
        if (!!!_unitValue) {
          Snackbar.fire(
            "Informe o valor unitário dos procedimentos no formato 12,34!"
          );
          return;
        }
        /**
         * end Modal Validations
         */

        _days = _days.split(",").map((day) => day.padStart(2, "0"));
        _monthYear = `/${_monthYear}`;
        const _daysLength = _days.length;

        __removeInitialAppointment();
        _addAppointment(_days, _monthYear, _daysLength, _unitValue);
      },
      __buildPrevMonthDate = () => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const f = new Intl.DateTimeFormat("pt-BR", {
          month: "2-digit",
          year: "numeric",
        });
        return f.format(d);
      },
      __buildModalContent = () => {
        let content = document.createElement("div");

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "DIAS",
            input: {
              id: MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR.substring(1),
            },
            helpText: "Ex.: 7,14,21,28",
          })
        );

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "MÊS/ANO",
            input: {
              id: MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR.substring(1),
              value: __buildPrevMonthDate(),
            },
            helpText: "Ex.: 06/2021",
          })
        );

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "VALOR UNITÁRIO",
            input: {
              id: MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR.substring(1),
              value: "58,37",
            },
            helpText: "Ex.: 58,37",
          })
        );

        return content;
      },
      /** end Modal actions */

      _handleBtnGravarAlteracoes = (person) => {
        const btnGravarAlteracoes = document.querySelector("#gravarAlteracoes");
        const _onclick = btnGravarAlteracoes.onclick;
        btnGravarAlteracoes.onclick = () => {
          PersonModel.getOrCreateDB()
            .then((db) => PersonModel.addOrUpdateItem(db, person))
            .then(() => {
              if (_onclick) _onclick();
            })
            .catch((err) => {
              console.log(`_watchForm: ${JSON.stringify(err)}`);
            });
        };
      },
      _watchForm = function () {
        let person = {
          uid: "", // carteirinha
          name: "",
          password: "",
          props: [],
        };

        setTimeout(() => {
          person.uid = document.querySelector(
            "#txtNumeroCarteirinhaBeneficiario"
          ).value;
          person.name = document.querySelector("#txtNomeBeneficiario").value;
          person.password = document.querySelector("#senha").value;
        }, 500);

        let idIgnoredArr = [
          "dataModalProcedimento",
          "ordemItemModalProcedimento",
        ];

        $$("input[type=text],select,textarea")
          .filter((item) => idIgnoredArr.includes(item.id) === false)
          .map((item) => {
            let _onchange = item.onchange;
            item.onchange = (event) => {
              let change = person.props.find(
                (item) => item.id === event.target.id
              );
              if (!!!change) {
                person.props.push({
                  id: event.target.id,
                  value: event.target.value,
                });
              } else {
                if (event.target.value) change.value = event.target.value;
                else
                  person.props = person.props.filter(
                    (item) => item.id !== event.target.id
                  );
              }
              // console.table(person.props);

              if (_onchange) _onchange();
            };
          });

        _handleBtnGravarAlteracoes(person);
      },
      _validateDueDate = () => {
        return new Promise((resolve, reject) => {
          let interval = setInterval(() => {
            const eDueDatePwd = document.querySelector("#txtDataValidadeSenha");
            if (!!!eDueDatePwd.value) return;

            clearInterval(interval);

            // password validate: duo date
            let snacks = eDueDatePwd.value
              .split("/")
              .map((num) => parseInt(num));
            snacks[1] += -1;
            let duoDatePwd = new Date(...snacks.reverse());
            if (duoDatePwd < new Date()) {
              eDueDatePwd.style.border = "red 2px solid";
              eDueDatePwd.style.color = "red";
              eDueDatePwd.parentElement.querySelector("label").style.color =
                "red";
              reject("Senha vencida!");
            } else resolve();
          }, 500);
        });
      },
      __buildComponentForLoadedProfiles = (personArr) => {
        let label = document.createElement("label");
        label.textContent = "Presto.js - Lista de Pacientes:";
        label.style.marginRight = "1em";

        let select = document.createElement("select");

        let option = document.createElement("option");
        option.value = "";
        option.textContent = "Selecione...";
        select.appendChild(option);

        personArr.forEach((item) => {
          let option = document.createElement("option");
          option.value = item.password;
          option.textContent = `${item.name} - ${item.uid}`;
          select.appendChild(option);
        });

        select.onchange = (event) => {
          document.querySelector("#senha").value = event.target.value;
        };

        let div = document.createElement("div");
        div.style.paddingBottom = "3em";
        div.style.textAlign = "center";
        div.appendChild(label);
        div.appendChild(select);

        const referenceNode = document.querySelector(FORM_FIELDSET_SELECTOR);
        referenceNode.insertBefore(div, referenceNode.firstChild);
      },
      __loadProfiles = () => {
        PersonModel.getOrCreateDB()
          .then(PersonModel.getAll)
          .then((personArr) => {
            if (personArr && personArr.length) {
              __buildComponentForLoadedProfiles(personArr);
            }
          })
          .catch((err) => {
            console.log(`__loadProfiles :: ${JSON.stringify(err)}`);
          });
      },
      __btnAdicionarProcedimentos_onclick = () => {
        Modal.open({
          title: "Adicionar Procedimentos",
          content: __buildModalContent(),
          mainAction: __fillForm_faturamentoDigitarSPSADT_onclick,
        });
      },
      __btnPreencherDadosPadrao_onclick = () => {
        Array.from(
          document.querySelector("#txtTipoDocumentoContratado").options
        ).find((x) => x.textContent === "CPF").selected = true;
        document.querySelector("#txtNomeProfissionalSolicitante").value =
          document.querySelector("#txtNomeContratado").value;
        Array.from(
          document.querySelector("#txtUFProfissionalSolicitante").options
        ).find((x) => x.value === "RS").selected = true;
        Array.from(
          document.querySelector("#txtTipoConselhoProfissionalSolicitante")
            .options
        ).find((x) => /CRP/.test(x.textContent)).selected = true;
        document.querySelector(
          "#txtNumeroConselhoProfissionalSolicitante"
        ).value = "05014";
        Array.from(
          document.querySelector("#txtCBOSProfissionalSolicitante").options
        ).find((x) => /Psic.logo cl.nico/.test(x.textContent)).selected = true;
        Array.from(
          document.querySelector("#txtCaraterInternacao").options
        ).find((x) => /Eletiva/.test(x.textContent)).selected = true;
        document.querySelector("#txtAreaIndicacaoClinica").value =
          "Sessões de Terapia";
        Array.from(document.querySelector("#txtTipoAtendimento").options).find(
          (x) => /Outras Terapias/.test(x.textContent)
        ).selected = true;
        Array.from(document.querySelector("#txtTipoConsulta").options).find(
          (x) => /Seguimento/.test(x.textContent)
        ).selected = true;
        Array.from(
          document.querySelector("#txtRegimeAtendimento").options
        ).find((x) => /Ambulatorial/.test(x.textContent)).selected = true;
        Array.from(
          document.querySelector("#txtIndicacaoAcidente").options
        ).find((x) => /N.o Acidentes/.test(x.textContent)).selected = true;
      },
      _upgrade = () => {
        __avoidErrorInClientCode();
        Modal.init();
        __loadProfiles();

        FAB.build([
          {
            textLabel: "Preencher dados padrão",
            iconClass: "las la-wrench",
            click: __btnPreencherDadosPadrao_onclick,
          },
          {
            textLabel: "Adicionar Procedimentos",
            iconClass: "las la-calendar-plus",
            click: __btnAdicionarProcedimentos_onclick,
          },
          {
            textLabel: "IndexedDB: Criar relatório",
            iconClass: "las la-external-link-alt",
            click: PersonModel.createReport,
          },
        ]);

        let btnImport = document
          .querySelector("#senha")
          .parentElement.querySelector("a.bt-procurar");
        let btnImport_onclick = btnImport.onclick;
        btnImport.onclick = () => {
          btnImport_onclick();
          _validateDueDate()
            .then(() => {
              document.querySelector("#txtNumeroGuiaPrestador").value =
                new Date().getTime();
              _watchForm();
            })
            .catch(Snackbar.fire);
        };
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.FormularioDigitarSPSADTPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Faturamento > Digitação > Consultar > Detalhe
      PATHNAME_REGEX = /faturamento\/visualizar\/detalharLote/;

    const __createCopyButton_onclick = function () {
        let tbodyTrList = $$(".tab-administracao tbody tr");
        let barArr = [],
          bazArr = [];

        tbodyTrList.forEach((tr) => {
          $$("td", tr).forEach((td) => {
            let value = td.textContent;
            if (/^R\$/.test(value)) value = value.replace("R$", "");
            barArr.push(value.trim());
          });
          let barArrJoined = barArr.join("\t");
          bazArr.push(barArrJoined);
          barArr = [];
        });

        let bazArrJoined = bazArr.join("\n");

        Clipboard.write(bazArrJoined).then(() => Snackbar.fire("Copiado!"));
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar dados",
            iconClass: "lar la-copy",
            click: __createCopyButton_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.FaturamentoVisualizarDetalharLotePage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, CommonsHelper, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Faturamento > Digitação > Consultar > Buscar
      PATHNAME_REGEX = /faturamento\/visualizar\/filtrarPorData/,
      FORM_FIELDSET_SELECTOR = "#formularioFiltroVisualizarDigitacao fieldset";

    const __createCopyButton_onclick = function () {
        let tbodyTrList = $$("#tblListaLoteFaturamento tbody tr");
        let barArr = [],
          bazArr = [];

        tbodyTrList.forEach((tr) => {
          const allowed = [2, 3, 4, 5, 6, 7];
          $$("td", tr).forEach((td, index) => {
            if (allowed.includes(index)) {
              let value = td.textContent;
              if (/\d+\.\d+/.test(value)) value = value.replace(".", ",");
              barArr.push(value.trim());
            }
          });
          let barArrJoined = barArr.join("\t");
          bazArr.push(barArrJoined);
          barArr = [];
        });

        let bazArrJoined = bazArr.join("\n");

        Clipboard.write(bazArrJoined).then(() => Snackbar.fire("Copiado!"));
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar dados",
            iconClass: "lar la-copy",
            click: __createCopyButton_onclick,
          },
        ]);

        const div = CommonsHelper.createSelectOptionsMonthYear({
          dateBeginFieldId: "#txtVisualizarDataInicial",
          dateEndFieldId: "#txtVisualizarDataFinal",
        });
        div.style.paddingBottom = "3em";
        div.style.marginLeft = "8em";

        const referenceNode = document.querySelector(FORM_FIELDSET_SELECTOR);
        referenceNode.insertBefore(div, referenceNode.firstChild);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.FaturamentoVisualizarFiltrarPorDataPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { CommonsHelper } = Presto.modules;

  const _Page = (function () {
    const // Inicio > Faturamento > Digitação > Consultar
      PATHNAME_REGEX = /faturamento\/visualizar\/filtro/,
      FORM_FIELDSET_SELECTOR = "#formularioFiltroVisualizarDigitacao fieldset";

    const _upgrade = () => {
        const div = CommonsHelper.createSelectOptionsMonthYear({
          dateBeginFieldId: "#txtVisualizarDataInicial2",
          dateEndFieldId: "#txtVisualizarDataFinal2",
        });
        div.style.paddingBottom = "3em";
        div.style.marginLeft = "8em";

        const referenceNode = document.querySelector(FORM_FIELDSET_SELECTOR);
        referenceNode.insertBefore(div, referenceNode.firstChild);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.FaturamentoVisualizarFiltroPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Acompanhar recurso de glosa > Detalhe
      PATHNAME_REGEX = /recursoglosa\/buscaDetalheRecursoGlosa/;

    const _btnCopy_ignoreFields = [
      "Contrato",
      "Prestador",
      "Área",
      "Código Procedimento",
      "Quantidade",
      "Procedimento",
    ];

    const __btnCopy_onclick = function () {
        let labelList = $$("#body label");
        let barArr = [],
          bazArr = [];

        let stopLoop = false;

        labelList.forEach((label) => {
          if (stopLoop) return;

          let labelText = label.textContent;
          labelText = labelText ? labelText.replace(":", "").trim() : "";

          let value = "";

          if (/Motivo.+Glosa/.test(labelText)) {
            let reasons = $$("ul li", label.parentElement);
            reasons = reasons.map((reason) => reason.textContent.trim());
            value = reasons.join(";");
            stopLoop = true;
          } else {
            if (
              _btnCopy_ignoreFields.some((item) => item == labelText) === false
            ) {
              let spanElement = label.parentElement.querySelector("span");
              value = spanElement ? spanElement.textContent : "";
              value = value ? value.replace("R$", "").trim() : "";
            } else {
              return;
            }
          }

          barArr.push(value);
        });

        bazArr.push(barArr.join("\t"));

        Clipboard.write(bazArr.join("\n")).then(() =>
          Snackbar.fire("Copiado!")
        );
      },
      __btnCopyMessages_onclick = function () {
        let labelList = $$("#body label");

        let stopLoop = false;
        let resourceNumber = "";

        labelList.forEach((label) => {
          if (stopLoop) return;

          let labelText = label.textContent;
          labelText = labelText ? labelText.replace(":", "").trim() : "";

          if (/Motivo.+Glosa/.test(labelText)) stopLoop = true;

          if (/^Recurso/.test(labelText)) {
            let spanElement = label.parentElement.querySelector("span");
            let value = spanElement ? spanElement.textContent : "";
            resourceNumber = value ? value.replace("R$", "").trim() : "";
          }
        });

        let lines = [];

        var boxMessageList = $$(
          ".box-resposta-mensagem,.box-resposta-resposta"
        );
        boxMessageList.forEach((box) => {
          let boxp1div = box.querySelector(".box-resposta-p1 div");
          let user = boxp1div.querySelector("label").textContent.trim();
          let date = boxp1div.querySelector("span").textContent.trim();
          let message = box
            .querySelector(".box-resposta-p2 span")
            .textContent.trim();
          message = message.replace(/[\n\t]*/g, "");

          let line = [resourceNumber, user, date, message];
          lines.push(line.join("\t"));
        });

        Clipboard.write(lines.join("\n")).then(() => Snackbar.fire("Copiado!"));
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar detalhes",
            iconClass: "lar la-copy",
            click: __btnCopy_onclick,
          },
          {
            textLabel: "Copiar mensagens",
            iconClass: "lar la-copy",
            click: __btnCopyMessages_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.RecursoGlosaBuscaDetalhePage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { Snackbar, FAB, Modal } = Presto.modules;

  const _Page = (function () {
    const // Inicio > Responder Recursos de Glosa
      PATHNAME_REGEX = /recursoglosa\/filtroNew/,
      MODAL_INPUT_PROTOCOLS_SELECTOR = "#presto-protocols";

    const __buildModalContent = () => {
        let content = document.createElement("div");

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "PROTOCOLOS",
            input: {
              id: MODAL_INPUT_PROTOCOLS_SELECTOR.substring(1),
            },
            helpText: "Ex.: 147634317,147634318 ou 147634317 147634318",
          })
        );

        return content;
      },
      __mainAction_checkStatus_onclick = () => {
        /**
         * Modal Validations
         */
        let _protocols = document.querySelector(
          MODAL_INPUT_PROTOCOLS_SELECTOR
        ).value;
        if (!!!_protocols) {
          Snackbar.fire("Informe os protocolos de recurso de glosa!");
          return;
        }
        let tasks = _protocols.split(/[,\s]/);
        /**
         * end Modal Validations
         */

        const fn = () => {
          let query = tasks.shift();

          document.querySelector(
            "#acompanharSolicitacao_protocoloRecurso"
          ).value = query;
          document.querySelector("#acompanharSolicitacao_btnBuscar").click();

          const interval = setInterval(() => {
            let tr = document.querySelector(`tr[id="${query}"]`);
            if (tr) clearInterval(interval);
            else return;

            let status = tr.querySelector(
              `td[aria-describedby*="statusRecurso"]`
            ).textContent;
            console.log(`${query}: ${status}`);

            if (tasks.length) fn();
            else Snackbar.fire("Pronto! Use F12 para ver os resultados.");
          }, 250);
        };

        fn();
      },
      __menuItem_checkStatus_onclick = () => {
        Modal.open({
          title: "Verificar status",
          content: __buildModalContent(),
          mainAction: __mainAction_checkStatus_onclick,
        });
      },
      _upgrade = () => {
        Modal.init();
        FAB.build([
          {
            textLabel: "Verificar status em massa",
            iconClass: "las la-search",
            click: __menuItem_checkStatus_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.RecursoGlosaFiltroPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const {
    RecursoGlosaBuscaDetalhePage,
    RecursoGlosaFiltroPage,
    ExtratoDetalhePagamentoPage,
    ExtratoBuscarLotePage,
    FormularioDigitarSPSADTPage,
    AutorizacaoUltimasSolicitacoesPage,
    AutorizacaoUltimasSolicitacoesBuscarStatusPage,
    FaturamentoVisualizarFiltroPage,
    FaturamentoVisualizarFiltrarPorDataPage,
    FaturamentoVisualizarDetalharLotePage,
  } = Presto.pages;

  const _Module = (function () {
    const HOST = /portaltiss\.saudepetrobras\.com\.br/;

    const _is = function () {
        return HOST.test(location.host);
      },
      _isLoaded = function () {
        const maybe = [".titulos-formularios", ".box-formularios"];
        return maybe.some((selector) => document.querySelector(selector));
      },
      _fixAnyPage = function () {
        RecursoGlosaBuscaDetalhePage.upgrade();
        RecursoGlosaFiltroPage.upgrade();
        ExtratoDetalhePagamentoPage.upgrade();
        ExtratoBuscarLotePage.upgrade();
        FormularioDigitarSPSADTPage.upgrade();
        AutorizacaoUltimasSolicitacoesPage.upgrade();
        AutorizacaoUltimasSolicitacoesBuscarStatusPage.upgrade();
        FaturamentoVisualizarFiltroPage.upgrade();
        FaturamentoVisualizarFiltrarPorDataPage.upgrade();
        FaturamentoVisualizarDetalharLotePage.upgrade();
      };

    /* Public Functions */

    return {
      is: _is,
      isLoaded: _isLoaded,
      fix: _fixAnyPage,
    };
  })();

  Presto.modules.SaudePetrobras = _Module;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { Snackbar, FAB } = Presto.modules;

  const _Page = (function () {
    const PATHNAME_REGEX = /GuiasTISS\/FaturamentoAtendimentos/;

    let lines = [],
      selectors = {
        date: "[data-bind='displayDate: dataLiberacaoProcedimento']",
        iconSuccess: "td .pointer.text-success",
        iconRemove: "td .pointer.text-danger",
        iconStatus:
          "[data-bind='tooltip:{ title: translateStatusConferecia(statusConferenciaOb()) }, click: modificarStatusConferencia']",
      };

    const isLastMonth = (date) => {
        const parts = date.split("/");
        const year = parseInt(parts[2]);
        const month = parseInt(parts[1]);

        const d = new Date();

        // set the day of the month to the last day of the previous month.
        d.setDate(0);

        return year === d.getFullYear() && month === d.getMonth() + 1;
      },
      fnProcess = () => {
        const tr = lines.shift();
        const date = tr.querySelector(selectors.date).textContent;
        const _isLastMonth = isLastMonth(date);
        if (_isLastMonth) {
          tr.querySelector(selectors.iconSuccess).click();
          console.log(`${date}: OK`);
        } else {
          tr.querySelector(selectors.iconRemove).click();
          console.log(`${date}: Removed!`);
        }
        const interval = setInterval(() => {
          const iconStatus = tr.querySelector(selectors.iconStatus);
          const clazz = `text-${_isLastMonth ? "success" : "danger"}`;
          const updated = Array.from(iconStatus.classList).includes(clazz);
          if (updated) {
            clearInterval(interval);

            if (lines.length) {
              fnProcess();
            } else {
              Snackbar.fire("Pronto!");
            }
          }
        }, 250);
        setTimeout(() => clearInterval(interval), 10000);
      },
      __changeStatusAppointments_onclick = () => {
        const tbody = $$("#lote-detalhes tbody");
        lines = $$(
          "tr td span[data-bind='displayDate: dataLiberacaoProcedimento']",
          tbody[0]
        ).map((e) => e.parentElement.parentElement);

        fnProcess();
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Validar Atendimentos",
            iconClass: "lar la-list-alt",
            click: __changeStatusAppointments_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) {
          _upgrade();
        }
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.FaturamentoAtendimentosPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const PATHNAME_REGEX = /GuiasTISS\/LocalizarProcedimentos/;

    const __createCopyButton_relatorioMensal_onclick = () => {
        const selectors = ["Senha", "CodigoBenficiario", "NomeBeneficiario"];

        let table = [];
        $$("[data-bind*=guia-template]").forEach((div) => {
          let line = [];
          selectors.forEach((selector) => {
            line.push(
              div.querySelector(`[data-bind*=${selector}]`)?.textContent
            );
          });
          table.push(line.join("\t"));
        });

        Clipboard.write(table.join("\n")).then(() => Snackbar.fire("Copiado!"));
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar dados (relatório mensal)",
            iconClass: "lar la-clipboard",
            click: __createCopyButton_relatorioMensal_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.LocalizarProcedimentosPage = _Page;
})(Presto, location);

(function (Presto, location, jQuery) {
  "use strict";

  const { PatientModel } = Presto.models;
  const { FAB, Modal, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Guias > Guia de SP/SADT
      PATHNAME_REGEX = /GuiasTISS\/GuiaSPSADT\/ViewGuiaSPSADT/,
      PROFILES_SELECT_OPTION_ID = "presto-profiles-select",
      PROFILES_BULK_INSERT_APPOINTMENTS_ID =
        "presto-profiles-bulk-insert-appointments";

    const __selectFirstItemInAutocompleteMenu = (id, callback) => {
        const interval = setInterval(() => {
          const autocompleteMenu = jQuery(id).autocomplete("widget");
          const firstItem = autocompleteMenu.find("li.ui-menu-item:first");

          if (firstItem?.length) {
            clearInterval(interval);
            firstItem.trigger("mouseenter").trigger("click");

            if (callback) setTimeout(callback, 1000);
          }
        }, 500);
      },
      __populateFormWithProfessional_onChange = (data) => {
        const id = "#idContratadoSolicitante";
        jQuery(id).val(data.spc.id);
        jQuery(id).autocomplete("search");

        __selectFirstItemInAutocompleteMenu(id, () => {
          document.querySelector("#ui-accordion-accordion-header-2").click();
          setTimeout(() => {
            document.querySelector("#incluirProcedimento").click();
            const interval = setInterval(() => {
              // elemento utilizado para verificação apenas, quando ele estiver
              // pronto terá um valor retornado por textContent
              const elem = document.querySelector("#registroProcedimentoID");
              if (elem.textContent) {
                clearInterval(interval);
                document.querySelector("#btnGravar").click();
              }
            }, 250);
          }, 500);
        });
      },
      __populateForm_onChange = (personArr) => (event) => {
        const data = personArr.find((x) => event.target.value === x.id);

        const id = "#numeroDaCarteira";
        jQuery(id).val(data.id);
        jQuery(id).autocomplete("search");

        __selectFirstItemInAutocompleteMenu(id, () => {
          __populateFormWithProfessional_onChange(data);
        });
      },
      __buildComponentForLoadedProfiles = (personArr) => {
        const spanElementTitle = document.createElement("span");
        spanElementTitle.classList.add("elementTitle");
        spanElementTitle.textContent = "Presto.js - Lista de Pacientes:";

        const select = document.createElement("select");
        select.id = PROFILES_SELECT_OPTION_ID;
        select.classList.add("elementInput");
        select.style.width = "300px";

        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Selecione...";
        select.appendChild(option);

        personArr.forEach((item) => {
          const opt = document.createElement("option");
          opt.value = item.id;
          opt.textContent = item.name;
          select.appendChild(opt);
        });

        select.onchange = __populateForm_onChange(personArr);

        const divInner = document.createElement("div");
        divInner.classList.add("innerDivOfNormalElementItem");
        divInner.style.width = "312px";
        divInner.style.height = "46px";
        divInner.appendChild(spanElementTitle);
        divInner.appendChild(select);

        const divElemItem = document.createElement("div");
        divElemItem.classList.add("elementItem");
        divElemItem.style.width = "316px";
        divElemItem.append(divInner);

        const divLine = document.createElement("div");
        divLine.classList.add("lineOfElements");
        divLine.style.marginBottom = "2em";
        divLine.append(divElemItem);

        const referenceNode = document.querySelector("#guiaDadosPrincipais");
        referenceNode.insertBefore(divLine, referenceNode.firstChild);
      },
      __buildModalForBulkInsert = (profiles) => {
        let content = document.createElement("div");
        content.id = PROFILES_BULK_INSERT_APPOINTMENTS_ID;

        profiles.forEach((p) =>
          content.appendChild(
            Modal.helpers.buildFormCheck({
              textLabel: p.name,
              input: {
                id: p.id,
                value: p.id,
              },
            })
          )
        );

        return content;
      },
      __getAccount = () => {
        const data = document
          .querySelector("footer p")
          .textContent.split("\n")
          .map((x) => x.trim())
          .filter((x) => x);

        return {
          id: data[0].replace(/\D/g, ""),
          name: data[1],
        };
      },
      __loadProfiles = () => {
        return PatientModel.getOrCreateDB()
          .then(PatientModel.getAll)
          .then((arr) => {
            if (arr && arr.length) {
              const account = __getAccount();
              return arr.filter((x) => x.acc.id === account.id);
            }
            return [];
          })
          .catch((err) => {
            console.error("__loadProfiles", err);
          });
      },
      __handleBtnGravar = () => {
        const btn = document.querySelector("#btnGravar");
        const _onclick = btn.onclick;
        btn.onclick = () => {
          const account = __getAccount();
          const patient = {
            id: document.querySelector("#numeroDaCarteira").value,
            name: document.querySelector("#nomeDoBeneficiario").value,
            // specialist
            spc: {
              id: document.querySelector("#idContratadoSolicitante").value,
              name: document.querySelector("#nomeContratadoSolicitante").value,
            },
            acc: {
              id: account.id,
              name: account.name,
            },
          };
          PatientModel.getOrCreateDB()
            .then((db) => PatientModel.addOrUpdateItem(db, patient))
            .then(() => {
              if (_onclick) _onclick();

              // Feche automaticamente o modal que apresenta a senha
              const interval = setInterval(() => {
                const bArr = $$("b");
                const b = bArr?.find((b) =>
                  b.textContent.includes("Nº Guia Operadora")
                );
                const uiDialog = b?.closest(".ui-dialog");
                const btnFechar = uiDialog?.querySelector("#fechar");
                if (btnFechar?.offsetParent) {
                  clearInterval(interval);
                  setTimeout(() => btnFechar.click(), 1000);
                }
              }, 250);
            })
            .catch((err) => {
              console.log(`__handleBtnGravar: ${JSON.stringify(err)}`);
            });
        };
      },
      /**
       * preencher a data de atendimento para o dia atual
       */
      __handleInputDataSolicitacao = () => {
        document.querySelector("#dataSolicitacao").value =
          new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(new Date());
      },
      __handleBtnIncluirProcedimento = () => {
        const elem = document.querySelector("#incluirProcedimento");
        const elem_onclick = elem.onclick;
        elem.onclick = () => {
          elem_onclick();

          const selector = "#registroProcedimentoCodigo input";
          jQuery(selector).val("20104219"); // SESSAO DE PSICOTERAPIA INDIVIDUAL [Tabela: 13]
          jQuery(selector).autocomplete("search");

          __selectFirstItemInAutocompleteMenu(selector, () => {
            document.querySelector("#confirmarEdicaoDeProcedimento").click();
          });
        };
      },
      __executeBulkInsertAppointments = () => {
        const item = localStorage.getItem(PROFILES_BULK_INSERT_APPOINTMENTS_ID);
        if (item) {
          const profiles = item.split(`,`);
          const target = profiles.shift();

          // select person and click to trigger automation
          const select = document.querySelector(
            `#${PROFILES_SELECT_OPTION_ID}`
          );
          select.value = target;
          select.dispatchEvent(new Event("change", { bubbles: true }));

          if (profiles.length) {
            localStorage.setItem(
              PROFILES_BULK_INSERT_APPOINTMENTS_ID,
              profiles.join(`,`)
            );
          } else {
            localStorage.removeItem(PROFILES_BULK_INSERT_APPOINTMENTS_ID);
          }
        }
      },
      __fillForm_AdicionarProcedimentosEmLote_onclick = () => {
        const modal = document.querySelector(
          `#${PROFILES_BULK_INSERT_APPOINTMENTS_ID}`
        );
        localStorage.setItem(
          PROFILES_BULK_INSERT_APPOINTMENTS_ID,
          $$(`input[type="checkbox"]:checked`, modal)
            .map((x) => x.value)
            .join(`,`)
        );

        __executeBulkInsertAppointments();
      },
      __btnAdicionarProcedimentosEmLote_onclick = (profiles) => () => {
        Modal.open({
          title: "Adicionar Procedimentos em Lote",
          content: __buildModalForBulkInsert(profiles),
          mainAction: __fillForm_AdicionarProcedimentosEmLote_onclick,
        });
      },
      __initialConfig = () => {
        __handleInputDataSolicitacao();

        // preencher tipo atendimento como TERAPIA
        document.querySelector("#tipoAtendimento").value = "3";

        __handleBtnIncluirProcedimento();
        __handleBtnGravar();
      },
      _upgrade = async () => {
        Modal.init();

        const profiles = await __loadProfiles();
        __buildComponentForLoadedProfiles(profiles);

        __initialConfig();

        FAB.build([
          {
            textLabel: "Adicionar Procedimentos em Lote",
            iconClass: "las la-calendar-plus",
            click: __btnAdicionarProcedimentosEmLote_onclick(profiles),
          },
        ]);

        __executeBulkInsertAppointments();
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) {
          const interval = setInterval(() => {
            const btn = document.querySelector("#btnGravar");
            if (btn) {
              clearInterval(interval);
              _upgrade();
            }
          }, 250);
        }
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.ViewGuiaSPSADTPage = _Page;
})(window.Presto, window.location, window.jQuery);

(function (Presto, location) {
  "use strict";

  const {
    LocalizarProcedimentosPage,
    ViewGuiaSPSADTPage,
    FaturamentoAtendimentosPage,
  } = Presto.pages;

  const _Module = (function () {
    const HOST = /novowebplancanoasprev\.facilinformatica\.com\.br/;

    const _is = function () {
        return HOST.test(location.host);
      },
      _isLoaded = function () {
        return document.querySelector("#collapseMenu");
      },
      _fixAnyPage = function () {
        ViewGuiaSPSADTPage.upgrade();
        LocalizarProcedimentosPage.upgrade();
        FaturamentoAtendimentosPage.upgrade();
      };

    /* Public Functions */

    return {
      is: _is,
      isLoaded: _isLoaded,
      fix: _fixAnyPage,
    };
  })();

  Presto.modules.CanoasPrev = _Module;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { PatientModel } = Presto.models;
  const { CommonsHelper, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const PATHNAME_REGEX = /prestador\/guiaexameexecucao/;

    const _sortGuidesByPatientName = () => {
        const fn = "_sortGuidesByPatientName";
        console.log(`${fn} - Enter`);
        try {
          const tbody = document.getElementById(
            "mainForm:resultadoPesquisaTable:tb"
          );
          const rows = $$("tr.rich-table-row", tbody);

          const selPatientName = "span[id$=nomePacientTooltip]";
          rows.sort((a, b) => {
            const aText = a.querySelector(selPatientName).textContent.trim();
            const bText = b.querySelector(selPatientName).textContent.trim();
            return aText.localeCompare(bText);
          });

          // Remove and re-append rows in sorted order
          rows.forEach((row) => tbody.appendChild(row));
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      _addSortAZButton = () => {
        const fn = "_addSortAZButton";
        console.log(`${fn} - Enter`);
        try {
          const div = document.createElement("div");
          div.id = "prestoSetup";
          div.style.float = "right";

          const anchor = document.createElement("a");
          anchor.textContent = "A→Z";
          anchor.href = "javascript:void(0)";
          anchor.onclick = _sortGuidesByPatientName;
          div.appendChild(anchor);

          const selector =
            'div[id="mainForm:panelConfigPesquisa"] div.configPesquisaItens';
          const setupBar = document.querySelector(selector);

          setupBar.appendChild(div);
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      __awaitOpeningModalToExecuteProcedure = (patient) => () => {
        const fn = "__awaitOpeningModalToExecuteProcedure";
        console.log(`${fn} - Enter`);
        try {
          // aguardar abrir o Painel, então clicar em "Executar procedimento"
          return new Promise((resolve) => {
            const painelSelector = "#panelResumoGuia";
            const carteiraSelector = '[id*="listaCarteiraConvenio"]';
            const execProcSelector = "span.resumoMenuItem a";
            const execProcText = "Executar procedimento";

            const interval = setInterval(() => {
              const eCarteira = document.querySelector(
                `${painelSelector} ${carteiraSelector}`
              );
              if (eCarteira) {
                clearInterval(interval);
                patient.id = eCarteira.textContent.replace(/\D/g, "");

                const eExecProcItems = $$(
                  `${painelSelector} ${execProcSelector}`
                );
                const execProc = Array.from(eExecProcItems).find(
                  (e) => e.textContent === execProcText
                );
                execProc.click();
                resolve();
              }
            }, 1000);
          });
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      __awaitLoadingSADTExecutionView = () => {
        const fn = "__awaitLoadingSADTExecutionView";
        console.log(`${fn} - Enter`);
        try {
          // aguardar carregar a tela de Execução de SADT
          return new Promise((resolve) => {
            const selector =
              'input[id="formAddUpdate:profissionalexecucaoExame"]';
            const interval = setInterval(() => {
              const eSpecialistInput = document.querySelector(selector);
              if (eSpecialistInput) {
                clearInterval(interval);
                resolve();
              }
            }, 500);
          });
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      __fillProfessionalField = (patient) => () => {
        const fn = "__fillProfessionalField";
        console.log(`${fn} - Enter`);
        try {
          // preencher o campo "Profissional Executante" com o nome do profissional vinculado ao paciente
          const selector =
            'input[id="formAddUpdate:profissionalexecucaoExame"]';
          const input = document.querySelector(selector);
          input.value = patient.professional;

          function dispatchEvent(el) {
            const event = new KeyboardEvent("keydown", {
              bubbles: true,
              cancelable: true,
              keyCode: 32,
              code: "Space",
              key: " ",
            });

            el.dispatchEvent(event);
          }
          dispatchEvent(input);

          // observar se este campo deixa de ser display: none para então...
          const selDivSuggestions =
            'div[id*="formAddUpdate"].rich-sb-common-container';
          const divSuggestions = document.querySelector(selDivSuggestions);

          return new Promise((resolve) => {
            const interval = setInterval(() => {
              if (divSuggestions.style.display !== "none") {
                clearInterval(interval);

                // ...selecionar o primeiro profissional
                const selSpanSuggestion =
                  'table.rich-sb-ext-decor-3 td[class*="rich-table-cell"] span';
                $$(selSpanSuggestion, divSuggestions)
                  .filter((x) => x.textContent == patient.professional)[0]
                  .click();

                resolve();
              }
            }, 1000);
          });
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      __awaitOpeningModalToAuthenticatePatient = () => {
        const fn = "__awaitOpeningModalToAuthenticatePatient";
        console.log(`${fn} - Enter`);
        try {
          // clicar no botão autenticar para abrir o modal e inserir a senha de autorização
          document.querySelector(".button-autenticar").click();

          return new Promise((resolve) => {
            // aguardar abrir o modal e inserir a senha
            const interval0 = setInterval(() => {
              const modal = document.querySelector(
                "#autenticarModalPanelVirtualCDiv"
              );
              if (modal?.offsetParent) {
                clearInterval(interval0);

                // acessar opção 'Atendimento PRESENCIAL'
                $$('input[type="radio"]', modal)[1].click();

                // somente resolve quando o input de senha estiver criado/aparecendo
                const interval1 = setInterval(() => {
                  const inputPwd = modal.querySelector(
                    'input[id*="senhaPacienteBiometria"]'
                  );
                  if (inputPwd?.offsetParent) {
                    clearInterval(interval1);
                    resolve();
                  }
                }, 250);
              }
            }, 250);
          });
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      __fillAuthentication = (patient) => async () => {
        const fn = "__fillAuthentication";
        console.log(`${fn} - Enter`);
        try {
          const selector = {
            modal: "#autenticarModalPanelVirtualCDiv",
            inputPwd: 'input[id*="senhaPacienteBiometria"]',
            btnAuth: 'input[id*="autenticarPacienteModalPanelButton"]',
            btnFinish: 'a[title="Finalizar execução"]',
          };

          const modal = document.querySelector(selector.modal);
          const authBtn = modal.querySelector(selector.btnAuth);
          const triggerUpsertItem = async (e) => {
            await PatientModel.getOrCreateDB().then((db) => {
              patient.password = modal.querySelector(selector.inputPwd).value;
              return PatientModel.addOrUpdateItem(db, patient);
            });
          };
          authBtn.addEventListener("click", triggerUpsertItem);

          await PatientModel.getOrCreateDB()
            .then(PatientModel.getAll)
            .then((patients) => patients.find((p) => p.id === patient.id))
            .then((patientDB) => {
              if (patientDB) {
                modal.querySelector(selector.inputPwd).value =
                  patientDB.password;
                modal.querySelector(selector.btnAuth).click();

                // espere a autenticação finalizar
                return new Promise((resolve) => {
                  const interval = setInterval(() => {
                    if (!modal.offsetParent) {
                      clearInterval(interval);
                      setTimeout(() => {
                        document.querySelector(selector.btnFinish).click();
                        resolve();
                      }, 1000);
                    }
                  }, 1000);
                });
              } else {
                console.log(
                  `${fn} - No patient found in DB ${JSON.stringify(patient)}`
                );
              }
            });
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      _patientOnClick = async (patient) => {
        const fn = "_patientOnClick";
        console.log(`${fn} - Enter`);
        try {
          const { Taskier } = CommonsHelper;

          const tasks = Taskier.mapToFunc([
            Taskier.toFunc(__awaitOpeningModalToExecuteProcedure(patient)),
            Taskier.toFunc(__awaitLoadingSADTExecutionView),
            Taskier.toFunc(__fillProfessionalField(patient)),
            Taskier.toFunc(__awaitOpeningModalToAuthenticatePatient),
            Taskier.toFunc(__fillAuthentication(patient)),
          ]);
          await Taskier.exec(tasks, 1000);
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      _configureAddAutomaticAppointment = () => {
        const fn = "_configureAddAutomaticAppointment";
        console.log(`${fn} - Enter`);
        try {
          const selector = {
            patient: 'span[id$="nomePacientTooltip"]',
            closestTD: 'td[id^="mainForm:resultadoPesquisaTable"]',
            grid: 'span[id="mainForm:panelResultadoPesquisaGrid"]',
          };

          const buildPatient = (span) => {
            const table = span.closest("table");
            const professionalEl = table
              ? table.querySelector('[title="Médico"]')
              : null;
            return {
              name: (span.textContent || "").trim(),
              professional: professionalEl
                ? professionalEl.textContent.trim()
                : "",
            };
          };

          const triggerPatientOnClick = (e) => {
            const td = e.target.closest(selector.closestTD);
            if (!td) return;

            const span = td.querySelector(selector.patient);
            const patient = buildPatient(span);
            _patientOnClick(patient);
          };

          const gridSpan = document.querySelector(selector.grid);
          if (!gridSpan._hasTriggerPatientOnClick) {
            gridSpan.addEventListener("click", triggerPatientOnClick);
            gridSpan._hasTriggerPatientOnClick = true;
          }
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      _upgrade = () => {
        setInterval(() => {
          const tbody = document.getElementById(
            "mainForm:resultadoPesquisaTable:tb"
          );
          if (tbody?.textContent) {
            const ePrestoSetup = document.querySelector("#prestoSetup");
            if (!ePrestoSetup) {
              _addSortAZButton();
              _configureAddAutomaticAppointment();
            }
          }
        }, 1000);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.ExecucaoGuiaSADTPage = _Page;
})(Presto, location);

(function (Presto, location) {
  "use strict";

  const { ExecucaoGuiaSADTPage } = Presto.pages;

  const _Module = (function () {
    const HOST = /portal\.cabergs\.org\.br/;

    const _is = function () {
        return HOST.test(location.host);
      },
      _isLoaded = function () {
        return document.querySelector("#container");
      },
      _fixAnyPage = function () {
        ExecucaoGuiaSADTPage.upgrade();
      };

    /* Public Functions */

    return {
      is: _is,
      isLoaded: _isLoaded,
      fix: _fixAnyPage,
    };
  })();

  Presto.modules.Cabergs = _Module;
})(Presto, location);

(function (Presto, location, jQuery) {
  "use strict";

  const { Snackbar, FAB } = Presto.modules;

  const _Page = (function () {
    const PATHNAME_REGEX = /bancario\/index/;

    const __setDefaultCategoryForRevenue_onclick = () => {
        jQuery(".selectpicker").selectpicker("val", "19");
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Receita: Setar categoria padrão",
            iconClass: "las la-wrench",
            click: __setDefaultCategoryForRevenue_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) {
          _upgrade();
        }
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.ConciliacaoBancariaPage = _Page;
})(window.Presto, window.location, window.jQuery);

(function (Presto, location, jQuery) {
  "use strict";

  const { CommonsHelper, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const PATHNAME_REGEX = /notas_fiscais\/emitir_nota/;

    const _sortAZ_selectTomador = () => {
        const select = jQuery("#tomador");
        const options = select.find("option").sort(function (a, b) {
          return jQuery(a).text().localeCompare(jQuery(b).text());
        });
        select.html(options);

        // move the last <option> element (-- Selecione --) to the beginning
        select.prepend(select.find("option:last"));
      },
      _upgrade = () => {
        _sortAZ_selectTomador();
        CommonsHelper.selectOption("#servico", "Psicologia");
        CommonsHelper.selectOption("#localServico", "Em meu endereço");
        CommonsHelper.selectOption(
          "#CST",
          "1 - Tributada integralmente e sujeita ao regime do Simples Nacional"
        );
        const textarea = document.querySelector("#servicoDescricao");
        textarea.value = "Sessões de Terapia";
        textarea.rows = 1;

        document.querySelector("#numDeskChar").style.padding = 0;
        $$("hr").forEach((hr) => (hr.style.margin = "10px 0"));
        $$(".form-group").forEach((fg) => (fg.style.margin = "0 0 5px 0"));

        const interval = setInterval(() => {
          const target = document.querySelector(".servico-show");
          if (target?.style.display === "block") {
            clearInterval(interval);
            const tgSty = target.style;

            const anchor = document.createElement("a");
            anchor.textContent = "Outros detalhes (hide/show)";
            anchor.href = "javascript:void(0)";
            anchor.onclick = () => {
              tgSty.display = tgSty.display === "none" ? "block" : "none";
            };
            target.parentNode.insertBefore(anchor, target);

            const rowBtnEnviar =
              document.querySelector("#btnPostNf").parentElement.parentElement;
            target.parentNode.insertBefore(rowBtnEnviar, target.nextSibling);

            setTimeout(() => (tgSty.display = "none"), 250);
          }
        }, 250);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) {
          const interval = setInterval(() => {
            const btn = document.querySelector("#servicoDescricao");
            if (btn) {
              clearInterval(interval);
              _upgrade();
            }
          }, 250);
        }
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.EmitirNotaFiscalPage = _Page;
})(window.Presto, window.location, window.jQuery);

(function (Presto, location) {
  "use strict";

  const { EmitirNotaFiscalPage, ConciliacaoBancariaPage } = Presto.pages;

  const _Module = (function () {
    const HOST = /app\.contaagil\.com\.br/;

    const _is = function () {
        return HOST.test(location.host);
      },
      _isLoaded = function () {
        return document.querySelector("#accordion");
      },
      _fixAnyPage = function () {
        EmitirNotaFiscalPage.upgrade();
        ConciliacaoBancariaPage.upgrade();
      };

    /* Public Functions */

    return {
      is: _is,
      isLoaded: _isLoaded,
      fix: _fixAnyPage,
    };
  })();

  Presto.modules.ContaAgil = _Module;
})(Presto, location);

(function (Presto, setInterval, clearInterval) {
  const { Style, SulAmerica, SaudePetrobras, CanoasPrev, Cabergs, ContaAgil } =
    Presto.modules;

  const pages = [SulAmerica, SaudePetrobras, CanoasPrev, Cabergs, ContaAgil];

  const _init = function () {
      Style.inject();
      pages.forEach((x) => {
        if (x.is()) x.fix();
      });
    },
    _isLoaded = function () {
      return pages.some((x) => x.is() && x.isLoaded());
    },
    _initWithDelay = function () {
      var interval = setInterval(function () {
        if (_isLoaded()) {
          clearInterval(interval);
          _init();
        }
      }, 250);
    };

  /* Public Functions */

  Presto.bless = _initWithDelay;
})(window.Presto, window.setInterval, window.clearInterval);

(function(window) {
    let interval = setInterval(() => {
        if (window.Presto) {
            clearInterval(interval);
            console.log(window.Presto.bless());
        }
    }, 250);
})(window);
