// ==UserScript==
// @name         Presto.js
// @version      1.0.0
// @description  Useful things for work with health insurance
// @author       Vinícius Knob <knob.vinicius@gmail.com>
// @source       https://github.com/viniciusknob/presto.js
// @match        https://saude.sulamericaseguros.com.br/prestador/segurado/validacao-de-elegibilidade-tiss3/validacao-de-elegibilidade/*
// @match        https://saude.sulamericaseguros.com.br/prestador/segurado/validacao-de-procedimentos-tiss-3/validacao-de-procedimentos/*
// @match        https://saude.sulamericaseguros.com.br/prestador/servicos-medicos/contas-medicas/faturamento-tiss-3/faturamento/validar-procedimento-autorizado/*
// @match        https://saude.sulamericaseguros.com.br/prestador/servicos-medicos/contas-medicas/faturamento-tiss-3/faturamento/fechamento-de-lote/*
// @require      https://raw.githubusercontent.com/viniciusknob/presto.js/master/dist/presto.min.js
// @grant        none
// ==/UserScript==

let prestoArgs = {
    insuredArr: [
        /*
         * COLE AQUI
         */
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