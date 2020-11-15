(function(window) {

	'use strict';

	const _Presto = function() {

		return {
			modules: {},
		};
	}();

	window.Presto = _Presto;

})(window);

(function(Presto, location) {
    
    const _SulAmerica = function() {
        
        const
            HOST = /saude.sulamericaseguros.com.br/,

        	// Prestador > Segurado > Validação de Elegibilidade
            ELEGIBILIDADE = /validacao-de-elegibilidade/,
        
            // Prestador > Segurado > Validação de Procedimentos > Solicitação
            PROCEDIMENTO_SOLICITACAO = /validacao-de-procedimentos(\/solicitacao)?/,

            // Prestador > Segurado > Validação de Procedimentos > Consulta > Consulta de Solicitações
            PROCEDIMENTO_CONSULTA = /validacao-de-procedimentos\/consulta/,

            // Prestador > Serviços Médicos > Contas Médicas > Faturamento > Fechamento de Lote > Fechamento de Lote
            FECHAMENTO_DE_LOTE = /fechamento-de-lote/,
            
            // Prestador > Serviços Médicos > Contas Médicas > Faturamento > Validar procedimento autorizado
            PROCEDIMENTO_AUTORIZADO = /validar-procedimento-autorizado/;

        const
            _is = function() {
                return HOST.test(location.host);
            },
            _isLoaded = function() {
                return document.querySelector("#box-validacao-beneficiario");
            },
            _buildComboBox = function() {
                let select = document.createElement("SELECT");
                select.style.cssText = "vertical-align: middle;";
                
                let option = document.createElement("OPTION");
                option.value = "";
                option.textContent = "ESCOLHA O BENEFICIÁRIO...";
                select.appendChild(option);

                select.onchange = () => {
                    let option = select.querySelector(":checked");
                    document.querySelector("#codigo-beneficiario-1").value = option.value.substr(0,3);
                    document.querySelector("#codigo-beneficiario-2").value = option.value.substr(3,5);
                    document.querySelector("#codigo-beneficiario-3").value = option.value.substr(8,4);
                    document.querySelector("#codigo-beneficiario-4").value = option.value.substr(12,4);
                    document.querySelector("#codigo-beneficiario-5").value = option.value.substr(16,4);
                };

                Presto.initArgs.insuredArr.forEach((value) => {
                    let option = document.createElement("OPTION");
                    option.value = value.id;
                    option.textContent = value.name + " (" + value.id + ")";
                    select.appendChild(option);
                });

                return select;
            },
            _fixAnyPage = function() {
                console.log("Presto._fixAnyPage => Enter");

                // Before


                // Core

                let comboBox = _buildComboBox();


                // After

                if (ELEGIBILIDADE.test(location.pathname)) {
                    let node = document.querySelector("#box-validacao-beneficiario div");
                    node.insertBefore(comboBox, node.childNodes[2]);
                    document.querySelector(".box-padrao").style.width = "850px";
                }
                if (PROCEDIMENTO_SOLICITACAO.test(location.pathname)) {
                    if (PROCEDIMENTO_CONSULTA.test(location.pathname)) {
                        let node = document.querySelector("#box-validacao-beneficiario");
                        node.insertBefore(comboBox, node.childNodes[2]);
                    } else {
                        let node = document.querySelector("#box-validacao-beneficiario div");
                        node.insertBefore(comboBox, node.childNodes[2]);
                        document.querySelector(".box-padrao").style.width = "850px";
                    }
                }
                if (FECHAMENTO_DE_LOTE.test(location.pathname)) {
                    let node = document.querySelector("#box-validacao-beneficiario div");
                    node.insertBefore(comboBox, node.childNodes[2]);
                }
                if (PROCEDIMENTO_AUTORIZADO.test(location.pathname)) {
                    let node = document.querySelector("#box-validacao-beneficiario");
                    node.insertBefore(comboBox, node.childNodes[0]);
                    document.querySelector(".box-padrao").style.width = "780px";
                }

                console.log("Presto._fixAnyPage => End");
            };


        /* Public Functions */

        return {
            is: _is,
            isLoaded: _isLoaded,
            fix: _fixAnyPage
        };

    }();

    Presto.modules.SulAmerica = _SulAmerica;
	
})(window.Presto, location);

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