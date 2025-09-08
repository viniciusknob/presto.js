(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Faturamento > Digitação > Consultar > Detalhe
      PATHNAME_REGEX = /faturamento\/visualizar\/detalharLote/;

    const __createCopyButton_onclick = function () {
        let tbodyTrList = $$(".tab-administracao tbody tr");
        let barArr = [],
          bazArr = [];

        tbodyTrList.forEach((tr) => {
          $$("td", tr).forEach((td) => {
            let value = td.textContent;
            if (/^R\$/.test(value)) value = value.replace("R$", "");
            barArr.push(value.trim());
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
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.FaturamentoVisualizarDetalharLotePage = _Page;
})(Presto, location);
