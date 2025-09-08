(function (Presto, location) {
  "use strict";

  const { CommonsHelper, DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Faturamento > Digitação > Consultar
      PATHNAME_REGEX = /faturamento\/visualizar\/filtro/,
      FORM_FIELDSET_SELECTOR = "#formularioFiltroVisualizarDigitacao fieldset";

    const applyFeatures = () => {
      if (!PATHNAME_REGEX.test(location.pathname)) return;

      const div = CommonsHelper.createSelectOptionsMonthYear({
        dateBeginFieldId: "#txtVisualizarDataInicial2",
        dateEndFieldId: "#txtVisualizarDataFinal2",
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

  Presto.pages.FaturamentoVisualizarFiltroPage = _Page;
})(Presto, location);
