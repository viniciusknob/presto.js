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

    const isCurrentHost = function () {
      return HOST.test(location.host);
    };

    const isPageReady = function () {
      const maybe = [".titulos-formularios", ".box-formularios"];
      return maybe.some((selector) => $(selector));
    };

    const applyFeatures = function () {
      RecursoGlosaBuscaDetalhePage.applyFeatures();
      RecursoGlosaFiltroPage.applyFeatures();
      ExtratoDetalhePagamentoPage.applyFeatures();
      ExtratoBuscarLotePage.applyFeatures();
      FormularioDigitarSPSADTPage.applyFeatures();
      AutorizacaoUltimasSolicitacoesPage.applyFeatures();
      AutorizacaoUltimasSolicitacoesBuscarStatusPage.applyFeatures();
      FaturamentoVisualizarFiltroPage.applyFeatures();
      FaturamentoVisualizarFiltrarPorDataPage.applyFeatures();
      FaturamentoVisualizarDetalharLotePage.applyFeatures();
    };

    /* Public Functions */

    return {
      isCurrentHost,
      isPageReady,
      applyFeatures,
    };
  })();

  Presto.modules.SaudePetrobras = _Module;
})(Presto, location);
