(function (Presto, location) {

    'use strict';

    const {
        RecursoGlosaBuscaDetalhePage,
        ExtratoDetalhePagamentoPage,
        ExtratoBuscarLotePage,
        FormularioDigitarSPSADTPage,
        AutorizacaoUltimasSolicitacoesPage,

    } = Presto.pages;

    const _SaudePetrobras = function () {

        const HOST = /portaltiss\.saudepetrobras\.com\.br/;

        const
            _is = function () {
                return HOST.test(location.host);
            },
            _isLoaded = function () {
                return document.querySelector(".titulos-formularios");
            },
            _fixAnyPage = function () {
                RecursoGlosaBuscaDetalhePage.upgrade();
                ExtratoDetalhePagamentoPage.upgrade();
                ExtratoBuscarLotePage.upgrade();
                FormularioDigitarSPSADTPage.upgrade();
                AutorizacaoUltimasSolicitacoesPage.upgrade();
            };


        /* Public Functions */

        return {
            is: _is,
            isLoaded: _isLoaded,
            fix: _fixAnyPage,
        };

    }();

    Presto.modules.SaudePetrobras = _SaudePetrobras;

})(Presto, location);
