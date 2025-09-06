(function (Presto, location) {
  "use strict";

  const { EmitirNotaFiscalPage, ConciliacaoBancariaPage } = Presto.pages;
  const { DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Module = (function () {
    const HOST = /app\.contaagil\.com\.br/;

    const _is = function () {
        return HOST.test(location.host);
      },
      _isLoaded = function () {
        return $("#accordion");
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
