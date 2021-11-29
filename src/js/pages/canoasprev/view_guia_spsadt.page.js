(function (Presto, location, jQuery) {
    "use strict";

    const _Page = (function () {
        const
            // Guias > Guia de SP/SADT
            PATHNAME_REGEX = /GuiasTISS\/GuiaSPSADT\/ViewGuiaSPSADT/;

        const _upgrade = () => {
            // preencher a data de atendimento para o dia atual
            const eDataSolicitacao = document.querySelector("#dataSolicitacao");
            let yyyy = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(new Date());
            let mm = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(new Date());
            let dd = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(new Date());
            eDataSolicitacao.value = `${dd}/${mm}/${yyyy}`;

            // preencher tipo atendimento como TERAPIA
            document.querySelector('#tipoAtendimento').value = '3';

            // preencher o código de psicoterapia
            const eIncluirProcedimento = document.querySelector("#incluirProcedimento");
            const eIncluirProcedimento_click = eIncluirProcedimento.onclick;
            eIncluirProcedimento.onclick = () => {
                eIncluirProcedimento_click();
                setTimeout(() => {
                    const selector = "#registroProcedimentoCodigo input";
                    document.querySelector(selector).value = "20104219"; // SESSAO DE PSICOTERAPIA INDIVIDUAL [Tabela: 13]

                    // https://api.jqueryui.com/autocomplete/
                    jQuery(selector).autocomplete("search");
                    //setTimeout(() => jQuery(selector).data("ui-autocomplete").menu.element.children().first().click(), 1000);

                }, 250);
            };
        },
        _init = () => {
            if (PATHNAME_REGEX.test(location.pathname)) setTimeout(_upgrade, 2000);
        };

        return {
            upgrade: _init,
        };
    })();

    Presto.pages.ViewGuiaSPSADTPage = _Page;
})(Presto, location, jQuery);
