const prestoArgs = {
    insuredArr: [
        {"id":"01234567890123456789", "name":"TESTE"},
    ]
};

(function(window, prestoArgs) {
    let interval = setInterval(() => {
        console.log("Try init Presto...");
        if (window.Presto) {
            clearInterval(interval);
            window.Presto.initArgs = prestoArgs;
            console.log(window.Presto.bless());
        }
    }, 1000);
})(window, prestoArgs);
