(function (Presto, location) {
  "use strict";

  const {
    LocalizarProcedimentosPage,
    ViewGuiaSPSADTPage,
    FaturamentoAtendimentosPage,
  } = Presto.pages;
  const { DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Module = (function () {
    const HOST = /novowebplancanoasprev\.facilinformatica\.com\.br/;

    const isCurrentHost = function () {
      return HOST.test(location.host);
    };

    const isPageReady = function () {
      return $(".form-control");
    };

    const applyFeatures = function () {
      ViewGuiaSPSADTPage.applyFeatures();
      LocalizarProcedimentosPage.applyFeatures();
      FaturamentoAtendimentosPage.applyFeatures();
    };

    /* Public Functions */

    return {
      isCurrentHost,
      isPageReady,
      applyFeatures,
    };
  })();

  Presto.modules.CanoasPrev = _Module;
})(Presto, location);
