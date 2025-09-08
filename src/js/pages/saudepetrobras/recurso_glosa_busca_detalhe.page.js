(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Acompanhar recurso de glosa > Detalhe
      PATHNAME_REGEX = /recursoglosa\/buscaDetalheRecursoGlosa/;

    const _btnCopy_ignoreFields = [
      "Contrato",
      "Prestador",
      "Área",
      "Código Procedimento",
      "Quantidade",
      "Procedimento",
    ];

    const __btnCopy_onclick = function () {
        let labelList = $$("#body label");
        let barArr = [],
          bazArr = [];

        let stopLoop = false;

        labelList.forEach((label) => {
          if (stopLoop) return;

          let labelText = label.textContent;
          labelText = labelText ? labelText.replace(":", "").trim() : "";

          let value = "";

          if (/Motivo.+Glosa/.test(labelText)) {
            let reasons = $$("ul li", label.parentElement);
            reasons = reasons.map((reason) => reason.textContent.trim());
            value = reasons.join(";");
            stopLoop = true;
          } else {
            if (
              _btnCopy_ignoreFields.some((item) => item == labelText) === false
            ) {
              let spanElement = $("span", label.parentElement);
              value = spanElement ? spanElement.textContent : "";
              value = value ? value.replace("R$", "").trim() : "";
            } else {
              return;
            }
          }

          barArr.push(value);
        });

        bazArr.push(barArr.join("\t"));

        Clipboard.write(bazArr.join("\n")).then(() =>
          Snackbar.fire("Copiado!")
        );
      },
      __btnCopyMessages_onclick = function () {
        let labelList = $$("#body label");

        let stopLoop = false;
        let resourceNumber = "";

        labelList.forEach((label) => {
          if (stopLoop) return;

          let labelText = label.textContent;
          labelText = labelText ? labelText.replace(":", "").trim() : "";

          if (/Motivo.+Glosa/.test(labelText)) stopLoop = true;

          if (/^Recurso/.test(labelText)) {
            let spanElement = $("span", label.parentElement);
            let value = spanElement ? spanElement.textContent : "";
            resourceNumber = value ? value.replace("R$", "").trim() : "";
          }
        });

        let lines = [];

        var boxMessageList = $$(
          ".box-resposta-mensagem,.box-resposta-resposta"
        );
        boxMessageList.forEach((box) => {
          let boxp1div = $(".box-resposta-p1 div", box);
          let user = $("label", boxp1div).textContent.trim();
          let date = $("span", boxp1div).textContent.trim();
          let message = $(".box-resposta-p2 span", box).textContent.trim();
          message = message.replace(/[\n\t]*/g, "");

          let line = [resourceNumber, user, date, message];
          lines.push(line.join("\t"));
        });

        Clipboard.write(lines.join("\n")).then(() => Snackbar.fire("Copiado!"));
      },
      applyFeatures = () => {
        if (!PATHNAME_REGEX.test(location.pathname)) return;

        FAB.build([
          {
            textLabel: "Copiar detalhes",
            iconClass: "lar la-copy",
            click: __btnCopy_onclick,
          },
          {
            textLabel: "Copiar mensagens",
            iconClass: "lar la-copy",
            click: __btnCopyMessages_onclick,
          },
        ]);
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.RecursoGlosaBuscaDetalhePage = _Page;
})(Presto, location);
