(function (Presto, location) {
  "use strict";

  const { ExecucaoGuiaSADTPage } = Presto.pages;
  const { DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Module = (function () {
    const HOST = /portal\.cabergs\.org\.br/;

    const isCurrentHost = function () {
      return HOST.test(location.host);
    };

    const isPageReady = function () {
      return $("#container");
    };

    const applyFeatures = function () {
      ExecucaoGuiaSADTPage.applyFeatures();
    };

    /* Public Functions */

    return {
      isCurrentHost,
      isPageReady,
      applyFeatures,
    };
  })();

  Presto.modules.Cabergs = _Module;
})(Presto, location);
