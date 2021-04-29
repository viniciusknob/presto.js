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

(function(Presto, location) {
    'use strict';

    const {
        Analytics,

    } = Presto.modules;

    const _SaudePetrobras = function() {

        const
            HOST = /portalamstiss.petrobras.com.br/,

            // Inicio > Acompanhar recurso de glosa > Detalhe
            RECURSO_GLOSA_DETALHE = /recursoglosa\/buscaDetalheRecursoGlosa/,

            // Inicio > Extrato > Visualizar > Detalhe do Pagamento
            EXTRATO_DETALHE_PGTO = /extrato\/detalhePagamento/,

            // Inicio > Extrato > Visualizar > Detalhe do Pagamento > Detalhe Lote
            EXTRATO_DETALHE_PGTO_LOTE = /extrato\/buscarLote/,
            
            // Inicio > Faturamento > Digitação > Digitar > Serviço Profissional/Serviço Auxiliar de Diagnóstico e Terapia - SP/SADT
            FATURAMENTO_DIGITAR = /faturamento\/digitar\/spsadt/;
        
        const
            __createCopyButton_recursoGlosaDetalhe = function() {
                let btnTemplate = document.querySelector('#formularioBuscarRecursoGlosa a');
                let btnCopy = btnTemplate.cloneNode(false);
                btnCopy.href = 'javascript: void(0);';
                btnCopy.id = '';
                btnCopy.textContent = 'Copiar!';
                btnCopy.classList.remove('last');
                
                document.querySelector('.breadcrumb .container').appendChild(btnCopy);
                
                btnCopy.onclick = function() {
                    Analytics.sendEvent('clickButton', 'log', 'btnCopy');

                    let labelList = document.querySelectorAll('#body label');
                    //let fooArr = [];
                    let barArr = [], bazArr = [];
                    
                    let stopLoop = false;

                    labelList.forEach((label) => {
                        if (stopLoop)
                            return;
                        
                        let labelText = label.textContent;
                        labelText = labelText ? labelText.replace(':','').trim() : ''
                        
                        let value = '';
                        
                        if (/Motivo.+Glosa/.test(labelText)) {
                            let reasons = Array.from(label.parentElement.querySelectorAll('ul li'));
                            reasons = reasons.map(reason => reason.textContent.trim());
                            console.log(reasons);
                            value = reasons.join(';');
                            console.log(value);
                            stopLoop = true;
                            
                        } else {
                            let spanElement = label.parentElement.querySelector('span');
                            value = spanElement ? spanElement.textContent : '';
                            value = value ? value.replace('R$','').trim() : '';
                        }
                        
                        //fooArr.push(labelText);
                        barArr.push(value);
                    });
                    
                    var boxMessageList = document.querySelectorAll('.box-resposta-mensagem');
                    boxMessageList.forEach((box) => {
                        //let labelText = box.querySelector('span').textContent;
                        let message = box.querySelector('.span-13.jump-1.size-12.padrao').textContent;
                        
                        //labelText = labelText.replace(/\n*/g,'');
                        message = message.replace(/\n*/g,'');
                        
                        //fooArr.push(labelText);
                        barArr.push(message);
                    });
                    
                    //let fooArrJoined = fooArr.join('\t');
                    let barArrJoined = barArr.join('\t');

                    //bazArr.push(fooArrJoined); // header
                    bazArr.push(barArrJoined);

                    let bazArrJoined = bazArr.join('\n');

                    navigator.clipboard.writeText(bazArrJoined)
                        .then(() => {
                            this.textContent = 'Pronto!';
                            setTimeout(() => this.textContent = 'Copiar!', 2000);
                        });
                
                };
            },
            __createCopyButton_extratoDetalhePgto = function() {
                let btnTemplate = document.querySelector('.container .bt-voltar');
                let btnCopy = btnTemplate.cloneNode(false);
                btnCopy.href = 'javascript: void(0);';
                btnCopy.id = '';
                btnCopy.textContent = 'Copiar!'
                btnCopy.classList.replace('last','right');
                
                document.querySelector('.breadcrumb .container').appendChild(btnCopy);
                
                btnCopy.onclick = function() {
                    Analytics.sendEvent('clickButton', 'log', 'btnCopy');

                    let labelList = document.querySelectorAll('#dados-solicitacao label');
                    //let fooArr = [];
                    let barArr = [], bazArr = [];
            
                    labelList.forEach((label) => {
                        //let labelText = label.textContent.replace(':','');
                        let value = label.parentElement.querySelector('span').textContent.replace('R$','').trim();
                        
                        //fooArr.push(labelText);
                        barArr.push(value);
                    });
            
                    //let fooArrJoined = fooArr.join('\t');
                    let barArrJoined = barArr.join('\t');
            
                    //bazArr.push(fooArrJoined); // header
                    bazArr.push(barArrJoined);
            
                    let bazArrJoined = bazArr.join('\n');
            
                    navigator.clipboard.writeText(bazArrJoined)
                        .then(() => {
                            this.textContent = 'Pronto!';
                            setTimeout(() => this.textContent = 'Copiar!', 2000);
                        });
            
                };
            },
            __createCopyButton_extratoDetalhePgtoLote = function() {
                let btnTemplate = document.querySelector('#formularioDadosPagamento a');
                let btnCopy = btnTemplate.cloneNode(false);
                btnCopy.href = 'javascript: void(0);';
                btnCopy.id = '';
                btnCopy.textContent = 'Copiar!';
                btnCopy.classList.remove('last');
                
                document.querySelector('.breadcrumb .container').appendChild(btnCopy);
                
                btnCopy.onclick = function() {
                    Analytics.sendEvent('clickButton', 'log', 'btnCopy');

                    let formList = document.querySelectorAll('form[id*="formularioTratarGlosas"]');
                    //let fooArr = [];
                    let bazArr = [], todoTasks = [];
                    
                    formList.forEach((form) => {
                    
                        //var firstTimeHeader = fooArr.length === 0;
                        
                        var table = form.querySelector('table');
                        var tbodyTrList = table.querySelectorAll('tbody tr');
                        tbodyTrList.forEach((tr) => {
                            
                            var barArr = [];
                            
                            // bloco cinza...
                
                            var labelList = form.querySelectorAll('label');
                            labelList.forEach((label) => {
                                //let labelText = label.textContent.replace(':','').trim();
                                let value = label.parentElement.querySelector('span').textContent.trim();
                                
                                /*
                                if (firstTimeHeader)
                                    fooArr.push(labelText.toUpperCase());
                                */
                                
                                barArr.push(value);
                            });
                            
                            // bloco verde e branco/vermelho...

                            /*
                            var theadThList = table.querySelectorAll('thead th');
                            theadThList.forEach((th) => {
                                let thText = th.textContent.trim();
                                if (thText && thText !== 'Outras Despesas') {
                                    if (firstTimeHeader)
                                        fooArr.push(thText.toUpperCase());
                                }
                            });
                            */
                            
                            tr.querySelectorAll('td').forEach((td) => {
                                let child = td.firstElementChild;
                                if (child && child.nodeName === "A") {
                                    todoTasks.push(child);
                                }
                                
                                let tdText = td.textContent.replace('R$','').trim();
                                if (tdText) {
                                    barArr.push(tdText);
                                }
                            });

                            /*
                            if (firstTimeHeader) {
                                fooArr.push('CAPA DO LOTE');
                                bazArr.push(fooArr.join('\t')); // header
                            }
                            */
                            
                            barArr.push(document.querySelector('.tab-administracao tbody tr td').textContent.trim());
                            
                            bazArr.push(barArr.join('\t'));
                            
                        });

                    });
                    
                    navigator.clipboard.writeText(bazArr.join('\n'))
                        .then(() => {
                            this.textContent = 'Pronto!';
                            setTimeout(() => this.textContent = 'Copiar!', 2000);
                        });
                };
            },
            __createDeepCopyButton_extratoDetalhePgtoLote = function() {
                let btnTemplate = document.querySelector('#formularioDadosPagamento a');
                let btnDeepCopy = btnTemplate.cloneNode(false);
                btnDeepCopy.href = 'javascript: void(0);';
                btnDeepCopy.id = '';
                btnDeepCopy.textContent = 'Copiar! (Deep)';
                btnDeepCopy.classList.replace('span-2','span-3');
                btnDeepCopy.classList.remove('last');
                
                document.querySelector('.breadcrumb .container').appendChild(btnDeepCopy);
                
                btnDeepCopy.onclick = function() {
                    Analytics.sendEvent('clickButton', 'log', 'btnDeepCopy');

                    this.textContent = 'Copiando...';
                    
                    let formList = document.querySelectorAll('form[id*="formularioTratarGlosas"]');
                    //let fooArr = [];
                    let bazArr = [], todoTasks = [];
                    
                    formList.forEach((form) => {
                        var table = form.querySelector('table');
                        var tbodyTrList = table.querySelectorAll('tbody tr');
                        tbodyTrList.forEach((tr) => {
                            tr.querySelectorAll('td').forEach((td) => {
                                let child = td.firstElementChild;
                                if (child && child.nodeName === "A") {
                                    todoTasks.push(child);
                                }
                            });
                        });
                    });
                    
                    let execTask = () => {
                        let child = todoTasks.shift();
                        var barArr = [];
                        child.click();
                        let interval = setInterval(() => {
                            let eAjaxContent = document.querySelector('#TB_ajaxContent');
                            if (!eAjaxContent) 
                                return;
                            
                            clearInterval(interval);
                            
                            //let firstTimeHeader = fooArr.length === 0;
                            
                            let glosas = [];
                            
                            eAjaxContent.querySelectorAll('label').forEach((label) => {
                                let labelText = label.textContent.replace(':','').trim();
                                let value = label.parentElement.querySelector('span').textContent.replace('.',',').trim();
                                
                                if (/Motivo.+Glosa/.test(labelText)) {
                                    let reasons = Array.from(label.parentElement.parentElement.querySelectorAll('ul li'));
                                    reasons = reasons.map(reason => reason.textContent.trim());
                                    value += ` (${reasons.join(';\n')});`;
                                    glosas.push(value);
                                    return;
                                }
                                
                                /*
                                if (firstTimeHeader)
                                    fooArr.push(labelText.toUpperCase());
                                */
                                
                                barArr.push(value);
                            });
                            
                            if (glosas) {
                                /*
                                if (firstTimeHeader)
                                    fooArr.push("MOTIVO DE GLOSA");
                                */
                                    
                                barArr.push(`="${glosas.join('"&CHAR(10)&"')}"`);
                            }
                            
                            /*
                            if (firstTimeHeader) {
                                bazArr.push(fooArr.join('\t')); // header
                            }
                            */
                            
                            bazArr.push(barArr.join('\t'));
                            
                            eAjaxContent.querySelector('.TB_closeWindowButton').click();
                            
                            let innerInterval = setInterval(() => {
                                if (document.querySelector('#TB_ajaxContent'))
                                    return;
                                    
                                clearInterval(innerInterval);
                                
                                if (todoTasks.length) {
                                    execTask();
                                } else {
                                    navigator.clipboard.writeText(bazArr.join('\n'))
                                        .then(() => {
                                            this.textContent = 'Pronto!';
                                            setTimeout(() => this.textContent = 'Copiar! (Deep)', 2000);
                                        });
                                }
                            }, 250);
                            
                        }, 250);
                    };
                    
                    execTask();
                };
            },
            _is = function() {
                return HOST.test(location.host);
            },
            _isLoaded = function() {
                return document.querySelector(".titulos-formularios");
            },
            _fixAnyPage = function() {
                if (RECURSO_GLOSA_DETALHE.test(location.pathname)) {
                    __createCopyButton_recursoGlosaDetalhe();
                }
                else if (EXTRATO_DETALHE_PGTO.test(location.pathname)) {
                    __createCopyButton_extratoDetalhePgto();
                }
                else if (EXTRATO_DETALHE_PGTO_LOTE.test(location.pathname)) {
                    __createDeepCopyButton_extratoDetalhePgtoLote();
                    __createCopyButton_extratoDetalhePgtoLote();
                }
                else if (FATURAMENTO_DIGITAR.test(location.pathname)) {
                    document.querySelector('#txtNumeroGuiaPrestador').value = new Date().getTime();
                }
            };
        

        /* Public Functions */

        return {
            is: _is,
            isLoaded: _isLoaded,
            fix: _fixAnyPage,
        };
    
    }();

    Presto.modules.SaudePetrobras = _SaudePetrobras;
	
})(Presto, location);

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

(function(window) {
    let interval = setInterval(() => {
        if (window.Presto) {
            clearInterval(interval);
            console.log(window.Presto.bless());
        }
    }, 250);
})(window);
