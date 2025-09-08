(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, CommonsHelper, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Faturamento > Digitação > Consultar > Buscar
      PATHNAME_REGEX = /faturamento\/visualizar\/filtrarPorData/,
      FORM_FIELDSET_SELECTOR = "#formularioFiltroVisualizarDigitacao fieldset";

    const __createCopyButton_onclick = function () {
        let tbodyTrList = $$("#tblListaLoteFaturamento tbody tr");
        let barArr = [],
          bazArr = [];

        tbodyTrList.forEach((tr) => {
          const allowed = [2, 3, 4, 5, 6, 7];
          $$("td", tr).forEach((td, index) => {
            if (allowed.includes(index)) {
              let value = td.textContent;
              if (/\d+\.\d+/.test(value)) value = value.replace(".", ",");
              barArr.push(value.trim());
            }
          });
          let barArrJoined = barArr.join("\t");
          bazArr.push(barArrJoined);
          barArr = [];
        });

        let bazArrJoined = bazArr.join("\n");

        Clipboard.write(bazArrJoined).then(() => Snackbar.fire("Copiado!"));
      },
      applyFeatures = () => {
        if (!PATHNAME_REGEX.test(location.pathname)) return;

        FAB.build([
          {
            textLabel: "Copiar dados",
            iconClass: "lar la-copy",
            click: __createCopyButton_onclick,
          },
        ]);

        const div = CommonsHelper.createSelectOptionsMonthYear({
          dateBeginFieldId: "#txtVisualizarDataInicial",
          dateEndFieldId: "#txtVisualizarDataFinal",
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

  Presto.pages.FaturamentoVisualizarFiltrarPorDataPage = _Page;
})(Presto, location);
