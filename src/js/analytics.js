(function(Presto, window, document) {

    if (!window.gtag) {
        let script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js';
        script.async = 1;
        document.querySelector('body').appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
    }

    var _GA_MEASUREMENT_ID = false;
    const
        _dataFlux = {
            "_SulAmerica": "G-MXK1RQ5VT5",
            "_SaudePetrobras": "G-MWGSGJR0QC",
        };

    
    const _Analytics = function() {

        const
            _config = (id) => {
                _GA_MEASUREMENT_ID = _dataFlux[id];
                window.gtag('config', _GA_MEASUREMENT_ID);
            },
            _sendEvent = (name, category, label, nonInteraction = true) => {
                window.gtag('event', name, {
                    'send_to': _GA_MEASUREMENT_ID,
                    'event_category': category,
                    'event_label': label,
                    'non_interaction': nonInteraction,
                });
            },
            _sendException = (description, fatal = false) => {
                window.gtag('event', 'exception', {
                    'send_to': _GA_MEASUREMENT_ID,
                    'description': description,
                    'fatal': fatal,
                });
            };

        return {
            config: _config,
            sendEvent: _sendEvent,
            sendException: _sendException,
        };
    }();

    Presto.modules.Analytics = _Analytics;

})(Presto, window, document);
