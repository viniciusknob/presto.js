// https://www.w3schools.com/howto/howto_css_modals.asp

(function (Presto) {
  "use strict";

  const _Module = (function () {
    const MODAL_SELECTOR = "#presto-modal",
      MODAL = `__modal__`;

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
