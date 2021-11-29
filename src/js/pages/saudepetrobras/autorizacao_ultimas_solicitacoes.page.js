(function (Presto, location) {
    "use strict";

    const _Page = (function () {
        const
            // Inicio > Autorização > Últimas Solicitações
            PATHNAME_REGEX = /autorizacao\/ultimasSolicitacoes\/ultimasSolicitacoes/,

            FORM_FIELDSET_SELECTOR = "#formularioBase fieldset";

        const 
            _upgrade = () => {
                let label = document.createElement("label");
                label.textContent = "Presto.js - Mês/Ano:";
                label.style.marginRight = "1em";

                let select = document.createElement("select");

                let option = document.createElement("option");
                option.value = "";
                option.textContent = "Selecione...";
                select.appendChild(option);

                let currentYear = new Date().getFullYear();
                let currentMonth = new Date().getMonth();
                let monthsToGoBack = 24;

                for (let goBack = 0; goBack >= 0 - monthsToGoBack; goBack--) {
                    let date = new Date(currentYear, currentMonth + goBack, 1);
                    let monthStr = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date);

                    let option = document.createElement("option");
                    option.value = `${date.getMonth()}/${date.getFullYear()}`;
                    option.textContent = `${monthStr}/${date.getFullYear()}`;
                    select.appendChild(option);
                }

                select.onchange = (event) => {
                    let partialDate = event.target.value.split("/");
                    let year = partialDate[1];
                    let month = parseInt(partialDate[0]) + 1;
                    let monthStr = ("" + month).padStart(2, "0");
                    let endOfMonth = new Date(year, month, 0).getDate();

                    document.querySelector("#txtDataEnvioDe").value = `01/${monthStr}/${year}`;
                    document.querySelector("#txtDataEnvioAte").value = `${endOfMonth}/${monthStr}/${year}`;
                };

                let div = document.createElement("div");
                div.style.paddingBottom = "3em";
                div.style.marginLeft = "8em";
                div.appendChild(label);
                div.appendChild(select);

                const referenceNode = document.querySelector(FORM_FIELDSET_SELECTOR);
                referenceNode.insertBefore(div, referenceNode.firstChild);
            },
            _init = () => {
                if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
            };

        return {
            upgrade: _init,
        };
    })();

    Presto.pages.AutorizacaoUltimasSolicitacoesPage = _Page;
})(Presto, location);
