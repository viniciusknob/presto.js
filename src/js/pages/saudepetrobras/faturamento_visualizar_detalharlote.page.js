(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB } = Presto.modules;

  const _Page = (function () {
    const // Inicio > Faturamento > Digitação > Consultar > Detalhe
      PATHNAME_REGEX = /faturamento\/visualizar\/detalharLote/;

    const __createCopyButton_onclick = function () {
        let tbodyTrList = document.querySelectorAll(
          ".tab-administracao tbody tr"
        );
        let barArr = [],
          bazArr = [];

        tbodyTrList.forEach((tr) => {
          tr.querySelectorAll("td").forEach((td) => {
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
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar dados",
            iconClass: "lar la-copy",
            click: __createCopyButton_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.FaturamentoVisualizarDetalharLotePage = _Page;
})(Presto, location);
