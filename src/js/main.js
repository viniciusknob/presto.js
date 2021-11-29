(function(Presto, setInterval, clearInterval) {

    const {
        Analytics,
        Style,
        SulAmerica,
        SaudePetrobras,
        CanoasPrev,
    
    } = Presto.modules;

    const
        _init = function() {
            Style.inject();

            if (SulAmerica.is()) {
                Analytics.config('_SulAmerica');
                SulAmerica.fix();
            }
            if (SaudePetrobras.is()) {
                Analytics.config('_SaudePetrobras');
                SaudePetrobras.fix();
            }
            if (CanoasPrev.is()) {
                Analytics.config('_CanoasPrev');
                CanoasPrev.fix();
            }

            // others...
        },
        _isLoaded = function() {
            if (SulAmerica.is())
                return SulAmerica.isLoaded();

            if (SaudePetrobras.is())
                return SaudePetrobras.isLoaded();

            if (CanoasPrev.is())
                return CanoasPrev.isLoaded();

            // others...
        },
        _initWithDelay = function() {
            var interval = setInterval(function() {
                if (_isLoaded()) {
                    clearInterval(interval);
                    _init();
                }
            }, 250);
        };


    /* Public Functions */

    Presto.bless = function() {
        _initWithDelay();
    };

})(window.Presto, window.setInterval, window.clearInterval);
