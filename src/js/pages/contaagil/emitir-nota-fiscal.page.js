(function (Presto, location, jQuery) {
  "use strict";

  const { CommonsHelper, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

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
      _setDesiredValues = () => {
        CommonsHelper.selectOption(
          "#codNbs",
          "1.2301.98.00 - Serviços de psicologia",
        );
        CommonsHelper.selectOption("#localServico", "Em meu endereço");
        CommonsHelper.selectOption(
          "#CST",
          "1 - Tributada integralmente e sujeita ao regime do Simples Nacional",
        );
        const textarea = $("#servicoDescricao");
        textarea.value = "Sessões de Terapia";
        textarea.rows = 1;

        const radioNaoInformar = $(
          'input[name="tributos_opcao"][value="nao_informar"]',
        );
        radioNaoInformar.checked = true;
        radioNaoInformar.dispatchEvent(new Event("change", { bubbles: true }));

        [
          "#imposto-retido-block > .block-header",
          "#valor-calculo-block > .block-header",
          "#valor-tributos-block > .block-header",
        ].forEach((selector) => {
          $(selector).classList.remove("is-open");
        });
      },
      _applyFeatures = () => {
        _sortAZ_selectTomador();

        const interval = setInterval(() => {
          const target = $("#servico-block");
          if (target?.style.display !== "none") {
            clearInterval(interval);

            CommonsHelper.selectOption("#servico", "Psicologia");

            const anchor = document.createElement("a");
            anchor.href = "#";
            anchor.textContent = "Aplicar Valores Padrão";
            anchor.style.cssText = `
              display: inline-block;
              margin-bottom: 10px;
              padding: 8px 12px;
              background-color: #7e2993;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: bold;
            `;

            anchor.onclick = (e) => {
              e.preventDefault();
              _setDesiredValues();
            };

            target.parentNode.insertBefore(anchor, target);
          }
        }, 250);
      },
      applyFeatures = () => {
        if (PATHNAME_REGEX.test(location.pathname)) {
          const interval = setInterval(() => {
            const btn = $("#servicoDescricao");
            if (btn) {
              clearInterval(interval);
              _applyFeatures();
            }
          }, 250);
        }
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.EmitirNotaFiscalPage = _Page;
})(window.Presto, window.location, window.jQuery);
