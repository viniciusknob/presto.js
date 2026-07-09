(function (Presto, location) {
  "use strict";

  const {
    SolicitacaoDeSPSADTPage,
    GuiaDeSPSADTIncluirPage,
    DemonstrativoPagamentoPage,
    ElegibilidadePage,
    ElegibilidadeResultadoPage,
    ProcedimentoSolicitacaoPage,
    ProcedimentoConsultaPage,
    FechamentoDeLotePage,
    ProcedimentoAutorizadoPage,
  } = Presto.pages;
  const { DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Module = (function () {
    const HOST = /saude.sulamericaseguros.com.br/;

    const isCurrentHost = function () {
      return HOST.test(location.host);
    };

    const isPageReady = function () {
      return [
        "#box-validacao-beneficiario",
        ".box-indicador-elegibilidade",
        ".box-padrao",
      ]
        .map((x) => $(x))
        .some((x) => x);
    };

    const applyFeatures = function () {
      GuiaDeSPSADTIncluirPage.applyFeatures();
      SolicitacaoDeSPSADTPage.applyFeatures();
      DemonstrativoPagamentoPage.applyFeatures();
      ElegibilidadePage.applyFeatures();
      ElegibilidadeResultadoPage.applyFeatures();
      ProcedimentoSolicitacaoPage.applyFeatures();
      ProcedimentoConsultaPage.applyFeatures();
      FechamentoDeLotePage.applyFeatures();
      ProcedimentoAutorizadoPage.applyFeatures();
    };

    /* Public Functions */

    return {
      isCurrentHost,
      isPageReady,
      applyFeatures,
    };
  })();

  Presto.modules.SulAmerica = _Module;
})(Presto, location);
