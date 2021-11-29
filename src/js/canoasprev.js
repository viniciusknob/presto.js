(function (Presto, location) {

    'use strict';

    const {
        LocalizarProcedimentosPage,
        ViewGuiaSPSADTPage,

    } = Presto.pages;

    const _CanoasPrev = function () {

        const HOST = /novowebplancanoasprev\.facilinformatica\.com\.br/;

        const
            _is = function () {
                return HOST.test(location.host);
            },
            _isLoaded = function () {
                return document.querySelector("#collapseMenu");
            },
            _fixAnyPage = function () {
                ViewGuiaSPSADTPage.upgrade();
                LocalizarProcedimentosPage.upgrade();
            };


        /* Public Functions */

        return {
            is: _is,
            isLoaded: _isLoaded,
            fix: _fixAnyPage,
        };

    }();

    Presto.modules.CanoasPrev = _CanoasPrev;

})(Presto, location);
