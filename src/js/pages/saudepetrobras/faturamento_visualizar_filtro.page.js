(function (Presto, location) {
    "use strict";

    const {
        SaudePetrobrasHelper,

    } = Presto.modules;

    const _Page = (function () {
        const
            // Inicio > Faturamento > Digitação > Consultar
            PATHNAME_REGEX = /faturamento\/visualizar\/filtro/,

            FORM_FIELDSET_SELECTOR = "#formularioFiltroVisualizarDigitacao fieldset";

        const 
            _upgrade = () => {
                const div = SaudePetrobrasHelper.createSelectOptionsMonthYear({
                    dateBeginFieldId: '#txtVisualizarDataInicial2',
                    dateEndFieldId: '#txtVisualizarDataFinal2',
                });

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

    Presto.pages.FaturamentoVisualizarFiltroPage = _Page;
})(Presto, location);
