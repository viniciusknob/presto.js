(function (Presto, location, jQuery) {
  "use strict";

  const { CommonsHelper } = Presto.modules;

  const _Page = (function () {
    const PATHNAME_REGEX = /notas_fiscais\/emitir_nota/;

    const _sortAZ_selectTomador = () => {
        const select = jQuery("#tomador");
        const options = select.find("option").sort(function (a, b) {
          return jQuery(a).text().localeCompare(jQuery(b).text());
        });
        select.html(options);

        // move the last <option> element (-- Selecione --) to the beginning
        select.prepend(select.find("option:last"));
      },
      _upgrade = () => {
        _sortAZ_selectTomador();
        CommonsHelper.selectOption("#servico", "Psicologia");
        CommonsHelper.selectOption("#localServico", "Em meu endereço");
        CommonsHelper.selectOption(
          "#CST",
          "1 - Tributada integralmente e sujeita ao regime do Simples Nacional"
        );
        const textarea = document.querySelector("#servicoDescricao");
        textarea.value = "Sessões de Terapia";
        textarea.rows = 1;

        document.querySelector("#numDeskChar").style.padding = 0;
        Array.from(document.querySelectorAll("hr")).forEach(
          (hr) => (hr.style.margin = "10px 0")
        );
        Array.from(document.querySelectorAll(".form-group")).forEach(
          (fg) => (fg.style.margin = "0 0 5px 0")
        );

        const interval = setInterval(() => {
          const target = document.querySelector(".servico-show");
          if (target?.style.display === "block") {
            clearInterval(interval);
            const tgSty = target.style;

            const anchor = document.createElement("a");
            anchor.textContent = "Outros detalhes (hide/show)";
            anchor.href = "javascript:void(0)";
            anchor.onclick = () => {
              tgSty.display = tgSty.display === "none" ? "block" : "none";
            };
            target.parentNode.insertBefore(anchor, target);

            const rowBtnEnviar =
              document.querySelector("#btnPostNf").parentElement.parentElement;
            target.parentNode.insertBefore(rowBtnEnviar, target.nextSibling);

            setTimeout(() => (tgSty.display = "none"), 250);
          }
        }, 250);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) {
          const interval = setInterval(() => {
            const btn = document.querySelector("#servicoDescricao");
            if (btn) {
              clearInterval(interval);
              _upgrade();
            }
          }, 250);
        }
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.EmitirNotaFiscalPage = _Page;
})(window.Presto, window.location, window.jQuery);
