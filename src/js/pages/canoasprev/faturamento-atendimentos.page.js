(function (Presto, location) {
  "use strict";

  const { Snackbar, FAB, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

  const _Page = (function () {
    const PATHNAME_REGEX = /GuiasTISS\/FaturamentoAtendimentos/;

    let lines = [],
      selectors = {
        date: "[data-bind='displayDate: dataLiberacaoProcedimento']",
        iconSuccess: "td .pointer.text-success",
        iconRemove: "td .pointer.text-danger",
        iconStatus:
          "[data-bind='tooltip:{ title: translateStatusConferecia(statusConferenciaOb()) }, click: modificarStatusConferencia']",
      };

    const isLastMonth = (date) => {
        const parts = date.split("/");
        const year = parseInt(parts[2]);
        const month = parseInt(parts[1]);

        const d = new Date();

        // set the day of the month to the last day of the previous month.
        d.setDate(0);

        return year === d.getFullYear() && month === d.getMonth() + 1;
      },
      fnProcess = () => {
        const tr = lines.shift();
        const date = $(selectors.date, tr).textContent;
        const _isLastMonth = isLastMonth(date);
        if (_isLastMonth) {
          $(selectors.iconSuccess, tr).click();
          console.log(`${date}: OK`);
        } else {
          $(selectors.iconRemove, tr).click();
          console.log(`${date}: Removed!`);
        }
        const interval = setInterval(() => {
          const iconStatus = $(selectors.iconStatus, tr);
          const clazz = `text-${_isLastMonth ? "success" : "danger"}`;
          const updated = Array.from(iconStatus.classList).includes(clazz);
          if (updated) {
            clearInterval(interval);

            if (lines.length) {
              fnProcess();
            } else {
              Snackbar.fire("Pronto!");
            }
          }
        }, 250);
        setTimeout(() => clearInterval(interval), 10000);
      },
      __changeStatusAppointments_onclick = () => {
        const tbody = $$("#lote-detalhes tbody");
        lines = $$(
          "tr td span[data-bind='displayDate: dataLiberacaoProcedimento']",
          tbody[0]
        ).map((e) => e.parentElement.parentElement);

        fnProcess();
      },
      applyFeatures = () => {
        if (!PATHNAME_REGEX.test(location.pathname)) return;

        FAB.build([
          {
            textLabel: "Validar Atendimentos",
            iconClass: "lar la-list-alt",
            click: __changeStatusAppointments_onclick,
          },
        ]);
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.FaturamentoAtendimentosPage = _Page;
})(Presto, location);
