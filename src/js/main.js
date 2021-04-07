(function(Presto, setInterval, clearInterval) {

    const {
        Analytics,
        SulAmerica,
        SaudePetrobras,
    
    } = Presto.modules;

    const
        _init = function() {
            if (SulAmerica.is()) {
                Analytics.config('_SulAmerica');
                SulAmerica.fix();
            }
            if (SaudePetrobras.is()) {
                Analytics.config('_SaudePetrobras');
                SaudePetrobras.fix();
            }
            
            // others...
        },
        _isLoaded = function() {
            if (SulAmerica.is())
                return SulAmerica.isLoaded();

            if (SaudePetrobras.is())
                return SaudePetrobras.isLoaded();
            
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
