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
  const { DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Module = (function () {
    const HOST = /portaltiss\.saudepetrobras\.com\.br/;

    const _is = function () {
        return HOST.test(location.host);
      },
      _isLoaded = function () {
        const maybe = [".titulos-formularios", ".box-formularios"];
        return maybe.some((selector) => $(selector));
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
