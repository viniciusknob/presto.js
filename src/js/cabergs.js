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
