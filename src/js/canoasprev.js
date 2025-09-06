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

    const _is = function () {
        return HOST.test(location.host);
      },
      _isLoaded = function () {
        return $("#collapseMenu");
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
