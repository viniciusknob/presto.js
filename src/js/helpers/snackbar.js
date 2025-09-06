(function (Presto) {
  "use strict";

  const { DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Module = (function () {
    const SHOW_CLASS = "show",
      _fire = (message) => {
        let x = $("#snackbar");

        if (!!!x) {
          x = document.createElement("div");
          x.id = "snackbar";
          $("body").appendChild(x);
        }

        x.textContent = message;

        x.classList.add(SHOW_CLASS);
        setTimeout(() => {
          x.classList.remove(SHOW_CLASS);
        }, 2850);
      };

    return {
      fire: _fire,
    };
  })();

  /* Module Definition */

  Presto.modules.Snackbar = _Module;
})(window.Presto);
