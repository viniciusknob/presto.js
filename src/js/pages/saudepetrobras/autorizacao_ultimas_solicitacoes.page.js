(function (Presto, location) {
  "use strict";

  const { CommonsHelper, DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Autorização > Últimas Solicitações
      PATHNAME_REGEX = /autorizacao\/ultimasSolicitacoes\/ultimasSolicitacoes/,
      FORM_FIELDSET_SELECTOR = "#formularioBase fieldset";

    const applyFeatures = () => {
      if (!PATHNAME_REGEX.test(location.pathname)) return;

      const div = CommonsHelper.createSelectOptionsMonthYear({
        dateBeginFieldId: "#txtDataEnvioDe",
        dateEndFieldId: "#txtDataEnvioAte",
      });
      div.style.paddingBottom = "3em";
      div.style.marginLeft = "8em";

      const referenceNode = $(FORM_FIELDSET_SELECTOR);
      referenceNode.insertBefore(div, referenceNode.firstChild);
    };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.AutorizacaoUltimasSolicitacoesPage = _Page;
})(Presto, location);
