(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

  const _Page = (function () {
    const PATHNAME_REGEX = /GuiasTISS\/LocalizarProcedimentos/;

    const __createCopyButton_relatorioMensal_onclick = () => {
        const selectors = ["Senha", "CodigoBenficiario", "NomeBeneficiario"];

        let table = [];
        $$("[data-bind*=guia-template]").forEach((div) => {
          let line = [];
          selectors.forEach((selector) => {
            line.push($(`[data-bind*=${selector}]`, div)?.textContent);
          });
          table.push(line.join("\t"));
        });

        Clipboard.write(table.join("\n")).then(() => Snackbar.fire("Copiado!"));
      },
      applyFeatures = () => {
        if (!PATHNAME_REGEX.test(location.pathname)) return;

        FAB.build([
          {
            textLabel: "Copiar dados (relatório mensal)",
            iconClass: "lar la-clipboard",
            click: __createCopyButton_relatorioMensal_onclick,
          },
        ]);
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.LocalizarProcedimentosPage = _Page;
})(Presto, location);
