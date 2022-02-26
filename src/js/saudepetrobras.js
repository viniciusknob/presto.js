(function (Presto, location) {

    'use strict';

    const {
        RecursoGlosaBuscaDetalhePage,
        RecursoGlosaFiltroPage,
        ExtratoDetalhePagamentoPage,
        ExtratoBuscarLotePage,
        FormularioDigitarSPSADTPage,
        AutorizacaoUltimasSolicitacoesPage,
        FaturamentoDigitarConsultarPage,
        FaturamentoDigitarConsultarDetalhePage,

    } = Presto.pages;

    const _Module = function () {

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
                RecursoGlosaFiltroPage.upgrade();
                ExtratoDetalhePagamentoPage.upgrade();
                ExtratoBuscarLotePage.upgrade();
                FormularioDigitarSPSADTPage.upgrade();
                AutorizacaoUltimasSolicitacoesPage.upgrade();
                FaturamentoDigitarConsultarPage.upgrade();
                FaturamentoDigitarConsultarDetalhePage.upgrade();
            };


        /* Public Functions */

        return {
            is: _is,
            isLoaded: _isLoaded,
            fix: _fixAnyPage,
        };

    }();

    Presto.modules.SaudePetrobras = _Module;

})(Presto, location);
