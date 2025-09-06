(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, CommonsHelper } = Presto.modules;

  const _Page = (function () {
    const // Inicio > Faturamento > Digitação > Consultar > Buscar
      PATHNAME_REGEX = /faturamento\/visualizar\/filtrarPorData/,
      FORM_FIELDSET_SELECTOR = "#formularioFiltroVisualizarDigitacao fieldset";

    const __createCopyButton_onclick = function () {
        let tbodyTrList = document.querySelectorAll(
          "#tblListaLoteFaturamento tbody tr"
        );
        let barArr = [],
          bazArr = [];

        tbodyTrList.forEach((tr) => {
          const allowed = [2, 3, 4, 5, 6, 7];
          tr.querySelectorAll("td").forEach((td, index) => {
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
      _upgrade = () => {
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

  Presto.pages.FaturamentoVisualizarFiltrarPorDataPage = _Page;
})(Presto, location);
