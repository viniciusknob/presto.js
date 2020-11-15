(function(Presto, setInterval, clearInterval) {

    const {
        SulAmerica,
    
    } = Presto.modules;

    const
        _init = function() {
            console.log("Presto._init => Enter");
            if (SulAmerica.is())
                SulAmerica.fix();
            
            // others...
            console.log("Presto._init => End");
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
            }, 1000);
        };


    /* Public Functions */

    Presto.initArgs = {};

    Presto.bless = function() {
        console.log("Presto.bless => Enter");
        _initWithDelay();
        return this.description;
    };

})(window.Presto, window.setInterval, window.clearInterval);
