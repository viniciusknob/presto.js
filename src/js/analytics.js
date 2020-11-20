(function(Presto, window, document) {

    if (!window.ga) {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    }

    const 
        trakerName = 'prestoTracker',
        dataFlux = {
            "_SulAmerica": "G-MXK1RQ5VT5",
        };

    
    const _Analytics = function() {

        const
            _create = (id) => {
                window.ga('create', {
                    trackingId: dataFlux[id],
                    cookieDomain: 'auto',
                    name: trakerName,
                });
            
                window.ga(`${trakerName}.send`, 'pageview');
            },
            _sendEvent = (category, action, label, nonInteraction = true) => {
                /**
                 * https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#send
                 * https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#nonInteraction
                 */
                window.ga(`${trakerName}.send`, {
                    hitType: 'event',
                    eventCategory: category,
                    eventAction: action,
                    eventLabel: label,
                    nonInteraction: nonInteraction,
                });
            };

        return {
            create: _create,
            sendEvent: _sendEvent,
        };
    }();

    Presto.modules.Analytics = _Analytics;

})(Presto, window, document);