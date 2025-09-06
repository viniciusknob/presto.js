(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Extrato > Visualizar > Detalhe do Pagamento > Detalhe Lote
      PATHNAME_REGEX = /extrato\/buscarLote/;

    const __createDeepCopyButton_extratoDetalhePgtoLote_onclick = function () {
        let formList = $$('form[id*="formularioTratarGlosas"]');
        let bazArr = [],
          todoTasks = [];

        formList.forEach((form) => {
          var table = $("table", form);
          var tbodyTrList = $$("tbody tr", table);
          tbodyTrList.forEach((tr) => {
            $$("td", tr).forEach((td) => {
              let child = td.firstElementChild;
              if (child && child.nodeName === "A") {
                todoTasks.push(child);
              }
            });
          });
        });

        let execTask = () => {
          let child = todoTasks.shift();
          var barArr = [];
          child.click();
          let interval = setInterval(() => {
            let eAjaxContent = $("#TB_ajaxContent");
            if (!eAjaxContent) return;

            clearInterval(interval);

            let glosas = [];

            $$("label", eAjaxContent).forEach((label) => {
              let labelText = label.textContent.replace(":", "").trim();
              let value = $("span", label.parentElement)
                .textContent.replace(".", ",")
                .trim();

              if (/Motivo.+Glosa/.test(labelText)) {
                let reasons = $$("ul li", label.parentElement.parentElement);
                reasons = reasons
                  .map((reason) => reason.textContent.trim())
                  .map((reason) => reason.replace(/\t/g, ""));
                value += ` (${reasons.join(";\n")});`;
                glosas.push(value);
                return;
              }

              barArr.push(value);
            });

            if (glosas) {
              barArr.push(`="${glosas.join('"&CHAR(10)&"')}"`);
            }

            bazArr.push(barArr.join("\t"));

            $(".TB_closeWindowButton", eAjaxContent).click();

            let innerInterval = setInterval(() => {
              if ($("#TB_ajaxContent")) return;

              clearInterval(innerInterval);

              if (todoTasks.length) {
                execTask();
              } else {
                Clipboard.write(bazArr.join("\n")).then(() =>
                  Snackbar.fire("Copiado!")
                );
              }
            }, 250);
          }, 250);
        };

        execTask();
      },
      __createCopyButton_extratoDetalhePgtoLote_onclick = function () {
        let formList = $$('form[id*="formularioTratarGlosas"]');
        let bazArr = [],
          todoTasks = [];

        formList.forEach((form) => {
          var table = $("table", form);
          var tbodyTrList = $$("tbody tr", table);
          tbodyTrList.forEach((tr) => {
            var barArr = [];

            // bloco cinza...

            var labelList = $$("label", form);
            labelList.forEach((label) => {
              let value = $("span", label.parentElement).textContent.trim();
              barArr.push(value);
            });

            $$("td", tr).forEach((td) => {
              let child = td.firstElementChild;
              if (child && child.nodeName === "A") {
                todoTasks.push(child);
              }

              let tdText = td.textContent.replace("R$", "").trim();
              if (tdText) {
                barArr.push(tdText);
              }
            });

            barArr.push($(".tab-administracao tbody tr td").textContent.trim());
            bazArr.push(barArr.join("\t"));
          });
        });

        Clipboard.write(bazArr.join("\n")).then(() =>
          Snackbar.fire("Copiado!")
        );
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar dados (deep)",
            iconClass: "lar la-clipboard",
            click: __createDeepCopyButton_extratoDetalhePgtoLote_onclick,
          },
          {
            textLabel: "Copiar dados",
            iconClass: "lar la-copy",
            click: __createCopyButton_extratoDetalhePgtoLote_onclick,
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

  Presto.pages.ExtratoBuscarLotePage = _Page;
})(Presto, location);
