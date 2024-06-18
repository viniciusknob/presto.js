(function (Presto, location) {
  "use strict";

  const { CommonsHelper } = Presto.modules;

  const _Page = (function () {
    const // Inicio > Autorização > Últimas Solicitações
      PATHNAME_REGEX = /autorizacao\/ultimasSolicitacoes\/ultimasSolicitacoes/,
      FORM_FIELDSET_SELECTOR = "#formularioBase fieldset";

    const _upgrade = () => {
        const div = CommonsHelper.createSelectOptionsMonthYear({
          dateBeginFieldId: "#txtDataEnvioDe",
          dateEndFieldId: "#txtDataEnvioAte",
        });
        div.style.paddingBottom = "3em";
        div.style.marginLeft = "8em";

        const referenceNode = document.querySelector(FORM_FIELDSET_SELECTOR);
        referenceNode.insertBefore(div, referenceNode.firstChild);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.AutorizacaoUltimasSolicitacoesPage = _Page;
})(Presto, location);
