(function (Presto, location) {
  "use strict";

  const { Clipboard, Snackbar, FAB, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Autorização > Últimas Solicitações > Buscar Status Autorização
      PATHNAME_REGEX =
        /autorizacao\/ultimasSolicitacoes\/buscarStatusAutorizacao/;

    const _btnCopy_fields = [
      /Senha/,
      /Data.Autoriza..o/,
      /Data.Validade.Senha/,
      /Status.da.Senha/,
      /N.mero.da.Carteira/,
      /Nome:/,
      /Cart.o.Nacional.de.Sa.de/,
    ];

    const __btnCopy_onclick = function () {
        const labelList = $$("#body label");
        let barArr = [];

        labelList.forEach((label) => {
          let labelText = label.textContent;
          labelText = labelText ? labelText.trim() : "";

          let value = "";

          if (
            _btnCopy_fields.some((fieldRegex) => fieldRegex.test(labelText))
          ) {
            let spanElement = label.parentElement.querySelector("span");
            value = spanElement ? spanElement.textContent : "";
            value = value ? value.replace("R$", "").trim() : "";
          } else {
            return;
          }

          labelText = labelText.replace("ù", "ú");

          barArr.push(`${labelText} ${value}`);
        });

        const thList = $$(".tab-administracao th");
        const trList = $$(".tab-administracao tr");

        trList.forEach((tr) => {
          $$("td", tr).forEach((td, index) => {
            let tdText = td.textContent;
            barArr.push(`${thList[index].textContent}: ${tdText}`);
          });
        });

        Clipboard.write(barArr.join(", ")).then(() =>
          Snackbar.fire("Copiado!")
        );
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Copiar dados (Recurso de Glosa)",
            iconClass: "lar la-copy",
            click: __btnCopy_onclick,
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

  Presto.pages.AutorizacaoUltimasSolicitacoesBuscarStatusPage = _Page;
})(Presto, location);
