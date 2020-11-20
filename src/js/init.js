(function(window) {
    let interval = setInterval(() => {
        if (window.Presto) {
            clearInterval(interval);
            console.log(window.Presto.bless());
        }
    }, 250);
})(window);
