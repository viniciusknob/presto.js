(function (Presto, location) {
  "use strict";

  const { EmitirNotaFiscalPage, ConciliacaoBancariaPage } = Presto.pages;
  const { DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Module = (function () {
    const HOST = /app\.contaagil\.com\.br/;

    const isCurrentHost = function () {
      return HOST.test(location.host);
    };

    const isPageReady = function () {
      return $("#accordion");
    };

    const applyFeatures = function () {
      EmitirNotaFiscalPage.applyFeatures();
      ConciliacaoBancariaPage.applyFeatures();
    };

    /* Public Functions */

    return {
      isCurrentHost,
      isPageReady,
      applyFeatures,
    };
  })();

  Presto.modules.ContaAgil = _Module;
})(Presto, location);
