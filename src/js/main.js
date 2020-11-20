(function(Presto, setInterval, clearInterval) {

    const {
        Analytics,
        SulAmerica,
    
    } = Presto.modules;

    const
        _init = function() {
            if (SulAmerica.is()) {
                Analytics.create('_SulAmerica');
                SulAmerica.fix();
            }
            
            // others...
        },
        _isLoaded = function() {
            if (SulAmerica.is())
                return SulAmerica.isLoaded();

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
