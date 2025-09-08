(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Extrato > Visualizar > Detalhe do Pagamento
      PATHNAME_REGEX = /extrato\/detalhePagamento/;

    const __createCopyButton_extratoDetalhePgto_onclick = function () {
        let labelList = $$("#dados-solicitacao label");
        let barArr = [],
          bazArr = [];

        labelList.forEach((label) => {
          let value = $("span", label.parentElement)
            .textContent.replace("R$", "")
            .trim();
          barArr.push(value);
        });

        let barArrJoined = barArr.join("\t");
        bazArr.push(barArrJoined);

        let bazArrJoined = bazArr.join("\n");

        Clipboard.write(bazArrJoined).then(() => Snackbar.fire("Copiado!"));
      },
      applyFeatures = () => {
        if (!PATHNAME_REGEX.test(location.pathname)) return;

        FAB.build([
          {
            textLabel: "Copiar dados",
            iconClass: "lar la-copy",
            click: __createCopyButton_extratoDetalhePgto_onclick,
          },
        ]);
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.ExtratoDetalhePagamentoPage = _Page;
})(Presto, location);
