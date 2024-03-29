(function (Presto, location) {
    "use strict";

    const {
        SaudePetrobrasHelper,

    } = Presto.modules;

    const _Page = (function () {
        const
            // Inicio > Autorização > Últimas Solicitações
            PATHNAME_REGEX = /autorizacao\/ultimasSolicitacoes\/ultimasSolicitacoes/,

            FORM_FIELDSET_SELECTOR = "#formularioBase fieldset";

        const 
            _upgrade = () => {
                const div = SaudePetrobrasHelper.createSelectOptionsMonthYear({
                    dateBeginFieldId: '#txtDataEnvioDe',
                    dateEndFieldId: '#txtDataEnvioAte',
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

    Presto.pages.AutorizacaoUltimasSolicitacoesPage = _Page;
})(Presto, location);
