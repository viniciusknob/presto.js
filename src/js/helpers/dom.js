(function (Presto, document) {
  "use strict";

  const _Module = (function () {
    // Selectors
    const $ = (selector, scope = document) => scope?.querySelector(selector);
    const $$ = (selector, scope = document) => [
      ...(scope?.querySelectorAll(selector) || []),
    ];

    return { $, $$ };
  })();

  /* Module Definition */

  Presto.modules.DomHelper = _Module;
})(window.Presto, window.document);
