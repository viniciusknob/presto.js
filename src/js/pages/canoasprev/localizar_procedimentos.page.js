(function (Presto, location, jQuery) {
  "use strict";

  const { Analytics, Clipboard, Snackbar, FAB } = Presto.modules;

  const _Page = (function () {
    const PATHNAME_REGEX = /GuiasTISS\/LocalizarProcedimentos/;

    const __createCopyButton_relatorioMensal_onclick = () => {
        Analytics.sendEvent("clickButton", "log", "btnCopyToReportMonthly");

        const selectors = ["Senha", "CodigoBenficiario", "NomeBeneficiario"];

        let table = [];
        document
          .querySelectorAll("[data-bind*=guia-template]")
          .forEach((div) => {
            let line = [];
            selectors.forEach((selector) => {
              line.push(
                div.querySelector(`[data-bind*=${selector}]`)?.textContent
              );
            });
            table.push(line.join("\t"));
          });

        Clipboard.write(table.join("\n")).then(() => Snackbar.fire("Copiado!"));
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar dados (relatório mensal)",
            iconClass: "lar la-clipboard",
            click: __createCopyButton_relatorioMensal_onclick,
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

  Presto.pages.LocalizarProcedimentosPage = _Page;
})(Presto, location, jQuery);
