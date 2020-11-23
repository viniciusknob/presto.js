(function(window) {

	'use strict';

	const _Presto = function() {

		return {
			modules: {},
		};
	}();

	window.Presto = _Presto;

})(window);

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
(function(Presto, indexedDB) {
	'use strict';
	
    const {
        Analytics,

    } = Presto.modules;

	const _IndexedDB = function() {

		const DB_NAME = 'PrestoDB';
		const STORE_NAME = 'person';

		let _db = undefined;

		const
			_getOrCreateDB = () => {
				const fn = '_getOrCreateDB';

				return new Promise((resolve, reject) => {

					if (_db) {
						return resolve(_db);
					}
				
					if (!(indexedDB)) {
						Analytics.sendException(`${fn}.checkSupport: This browser doesn\'t support IndexedDB`, true);
						return reject();
					}
					
					const idb = indexedDB.open(DB_NAME);
					
					idb.onerror = function(event) {
						Analytics.sendException(`${fn}.indexedDB.open: ${JSON.stringify(event)}`, true);
						reject();
					};
					
					idb.onsuccess = (event) => {
						_db = event.target.result;
						
						_db.onerror = function(event) {
							Analytics.sendException(`${fn}.db.any: ${JSON.stringify(event)}`, true);
						};
						
						resolve(_db);
					};
					
					idb.onupgradeneeded = function(event) {
						Analytics.sendEvent(`${fn}.onupgradeneeded`, 'log', JSON.stringify(event));
						
						_db = event.target.result;
						
						if (_db.objectStoreNames.contains(STORE_NAME) === false) {
							_db.createObjectStore(STORE_NAME, { keyPath: "uid" });
						}
					};
				});
			},
			_getAll = function(db) {
				const fn = '_getAll';
				
				return new Promise(function(resolve, reject) {
					const personList = [];
					const objectStore = db.transaction([STORE_NAME], "readonly").objectStore(STORE_NAME);
					objectStore.openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							personList.push(cursor.value);
							cursor.continue();
						} else {
							Analytics.sendEvent(`${fn}.personList`, 'log', `size ${personList.length}`);
							
							personList.sort(function(a,b) {
								return a.name.localeCompare(b.name);
							});
							
							resolve(personList);
						}
					};
				});
			},
			_addOrUpdateItem = function(db, person) {
				const fn = '_addOrUpdateItem';

				return new Promise(function(resolve, reject) {
					
					const transaction = db.transaction([STORE_NAME], "readwrite");
					
					transaction.oncomplete = function(event) {
						resolve();
					};
	
					transaction.onerror = function(event) {
						Analytics.sendException(`${fn}.transaction: ${JSON.stringify(event)}`, true);
						reject();
					};
	
					const objectStore = transaction.objectStore(STORE_NAME);
					
					const singleKeyRange = IDBKeyRange.only(person.uid);
					const _cursor = objectStore.openCursor(singleKeyRange);
					
					_cursor.onsuccess = function(event) {
						var cursor = event.target.result;

						let request;
						if (cursor) {
							Analytics.sendEvent(`${fn}.objectStore.put`, 'log', person.uid);
							request = objectStore.put(person);
						} else {
							Analytics.sendEvent(`${fn}.objectStore.add`, 'log', person.uid);
							request = objectStore.add(person);
						}
						
						request.onerror = function(event) {
							Analytics.sendException(`${fn}.objectStore.request: ${JSON.stringify(event)}`, false);
							reject();
						};
					};
					
					_cursor.onerror = function(event) {
						Analytics.sendException(`${fn}.cursor.open: ${JSON.stringify(event)}`, false);
						reject();
					};
				});
			};

		return {
			getOrCreateDB: _getOrCreateDB,
			getAll: _getAll,
			addOrUpdateItem: _addOrUpdateItem,
		};
	}();

	Presto.modules.IndexedDB = _IndexedDB;

})(Presto, indexedDB);
(function(Presto, location) {
    'use strict';

    const {
        Analytics,
        IndexedDB,

    } = Presto.modules;
    
    const _SulAmerica = function() {
        
        const
            HOST = /saude.sulamericaseguros.com.br/,

        	// Prestador > Segurado > Validação de Elegibilidade
            ELEGIBILIDADE = /validacao-de-elegibilidade/,

            // Prestador > Segurado > Validação de Elegibilidade
            ELEGIBILIDADE_RESULTADO = /validacao-de-elegibilidade\/elegibilidade-resultado/,
        
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
                return document.querySelector("#box-validacao-beneficiario") || document.querySelector(".box-indicador-elegibilidade");
            },
            _buildComboBox = function(insuredList = []) {
                if (insuredList.length === 0)
                    return null;

                let select = document.createElement("SELECT");
                select.style.cssText = "vertical-align: middle;";
                
                let option = document.createElement("OPTION");
                option.value = "";
                option.textContent = "ESCOLHA O BENEFICIÁRIO...";
                select.appendChild(option);

                select.onchange = () => {
                    let option = select.querySelector(":checked");

                    Analytics.sendEvent('person_selected', 'log', option.value, false);

                    document.querySelector("#codigo-beneficiario-1").value = option.value.substr(0,3);
                    document.querySelector("#codigo-beneficiario-2").value = option.value.substr(3,5);
                    document.querySelector("#codigo-beneficiario-3").value = option.value.substr(8,4);
                    document.querySelector("#codigo-beneficiario-4").value = option.value.substr(12,4);
                    document.querySelector("#codigo-beneficiario-5").value = option.value.substr(16,4);
                };

                insuredList.forEach((insured) => {
                    let option = document.createElement("OPTION");
                    option.value = insured.uid;
                    option.textContent = insured.name;
                    select.appendChild(option);
                });

                return select;
            },
            _fixAnyPage = function() {
                if (ELEGIBILIDADE_RESULTADO.test(location.pathname)) {
                    let eligibleBox = document.querySelector('.box-indicador-elegibilidade .linha');
                    let eligible = eligibleBox.querySelector('.atencao').textContent;
                    
                    var person = {
                        uid: '',
                        name: '',
                    };
                    
                    document.querySelectorAll('.linha').forEach((line) => {
                        let strongList = line.querySelectorAll('strong');
                        strongList.forEach((strong) => {
                            if (strong) {
                                let strongText = strong.textContent;
                                if (/Carteira/.test(strongText)) {
                                    person.uid = strong.parentElement.querySelector('span').textContent.replace(/\s/g,"");
                                }
                                if (/Nome/.test(strongText)) {
                                    person.name = strong.parentElement.querySelector('span').textContent;
                                }
                            }
                        });
                    });

                    Analytics.sendEvent('checkPersonEligibility', 'log', `${person.uid} => ${eligible}`);

                    if (eligible === "SIM") {
                        let divStatus = document.createElement('DIV');
                        divStatus.id = 'js-presto-status';
                        divStatus.style = "float:right;font-weight:bold;color:limegreen;";
                        divStatus.textContent = "Salvando...";
                        eligibleBox.appendChild(divStatus);

                        IndexedDB.getOrCreateDB()
                            .then(db => IndexedDB.addOrUpdateItem(db, person))
                            .then(() => {
                                eligibleBox.querySelector('#js-presto-status').textContent = "Salvo!";
                                Analytics.sendEvent('personSaved', 'log', person.uid);
                            })
                            .catch(err => {
                                Analytics.sendException(`_fixAnyPage: ${JSON.stringify(err)}`, true);
                            });
                    }
                } else {
                    IndexedDB.getOrCreateDB()
                        .then(IndexedDB.getAll)
                        .then(_buildComboBox)
                        .then(comboBox => {
                            if (!comboBox)
                                return;

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
                        });
                }

            };


        /* Public Functions */

        return {
            is: _is,
            isLoaded: _isLoaded,
            fix: _fixAnyPage
        };

    }();

    Presto.modules.SulAmerica = _SulAmerica;
	
})(Presto, location);

(function(Presto, setInterval, clearInterval) {

    const {
        Analytics,
        SulAmerica,
    
    } = Presto.modules;

    const
        _init = function() {
            if (SulAmerica.is()) {
                Analytics.config('_SulAmerica');
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

(function(window) {
    let interval = setInterval(() => {
        if (window.Presto) {
            clearInterval(interval);
            console.log(window.Presto.bless());
        }
    }, 250);
})(window);
