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
(function(Presto) {

    'use strict';

    const _Style = function() {

        const CSS = '.fab-container{position:fixed;bottom:50px;right:50px;z-index:99;cursor:pointer}.fab-icon-holder{width:50px;height:50px;border-radius:100%;background-image:linear-gradient(to bottom right,#ba39be,#05b370);box-shadow:0 6px 25px rgba(0,0,0,.35)}.fab-image-holder{background-image:url(https://i.imgur.com/6xZyXGT.png);background-size:58px;background-repeat:no-repeat;background-position:right}.fab-icon-holder:hover{opacity:.8}.fab-icon-holder i{display:flex;align-items:center;justify-content:center;height:100%;font-size:25px;color:#fff}.fab-main{width:60px;height:60px}.fab-main::before{content:"";position:absolute;width:100%;height:100%;bottom:10px}.fab-options{list-style-type:none;margin:0;position:absolute;bottom:70px;right:0;opacity:0;transition:all .3s ease;transform:scale(0);transform-origin:85% bottom}.fab-main:hover+.fab-options,.fab-options:hover{opacity:1;transform:scale(1)}.fab-options li{display:flex;justify-content:flex-end;padding:5px}.fab-label{padding:2px 5px;align-self:center;user-select:none;white-space:nowrap;border-radius:3px;font-size:16px;background:#666;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.2);margin-right:10px}#snackbar{visibility:hidden;opacity:0;min-width:250px;margin-left:-125px;background-image:linear-gradient(to bottom right,#ba39be,#05b370);color:#fff;text-align:center;border-radius:2px;padding:16px;position:fixed;z-index:9999999;left:50%;bottom:20%;font-size:17px}#snackbar.show{visibility:visible;opacity:1;-webkit-animation:fadein .5s,fadeout .5s 2.5s;animation:fadein .5s,fadeout .5s 2.5s}@-webkit-keyframes fadein{from{bottom:0;opacity:0}to{bottom:20%;opacity:1}}@keyframes fadein{from{bottom:0;opacity:0}to{bottom:20%;opacity:1}}@-webkit-keyframes fadeout{from{bottom:20%;opacity:1}to{bottom:0;opacity:0}}@keyframes fadeout{from{bottom:20%;opacity:1}to{bottom:0;opacity:0}}';

        const
            _addMaterialIconsToPage = () => {
                let link = document.createElement('link');
                link.rel = 'stylesheet';
                /**
                 * https://icons8.com/line-awesome
                 * https://github.com/icons8/line-awesome
                 */
                link.href = 'https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css';
                document.head.appendChild(link);
            },
            _addCustomCSSToPage = () => {
                let style = document.createElement('style');
                style.innerHTML = CSS;
                document.head.appendChild(style);
            },
            _inject = () => {
                _addMaterialIconsToPage();
                _addCustomCSSToPage();
            };

        return {
            inject: _inject,
        };
    }();

    /* Module Definition */

    Presto.modules.Style = _Style;

})(window.Presto);

(function(Presto) {

    'use strict';

    const _Snackbar = function() {

        const
            SHOW_CLASS = 'show',
            $ = document.querySelector.bind(document),
            _fire = message => {
                let x = $('#snackbar');

                if (!!!x) {
                    x = document.createElement('div');
                    x.id = 'snackbar';
                    $('body').appendChild(x);
                }

                x.textContent = message;

                x.classList.add(SHOW_CLASS);
                setTimeout(() => { x.classList.remove(SHOW_CLASS) }, 2850);
            };

        return {
            fire: _fire,
        };
    }();

    /* Module Definition */

    Presto.modules.Snackbar = _Snackbar;

})(window.Presto);
// https://stackoverflow.com/questions/29209244/css-floating-action-button

(function(Presto) {

    'use strict';

    const _FAB = function() {

        const
            _buildIconHolder = iconClass => {
                let icon_holder = document.createElement('div');
                icon_holder.classList.add('fab-icon-holder');

                if (iconClass) {
                    let i = document.createElement('i');
                    i.classList.add(...iconClass.split(' '));
                    icon_holder.appendChild(i);
                } else {
                    icon_holder.classList.add('fab-main', 'fab-image-holder');
                }

                return icon_holder;
            },
            _buildLabel = textLabel => {
                let label = document.createElement('span');
                label.classList.add('fab-label');
                label.textContent = textLabel;
                return label;
            },
            _buildItem = options => {
                let item = document.createElement('li');

                item.appendChild(_buildLabel(options.textLabel));
                item.appendChild(_buildIconHolder(options.iconClass));
                item.onclick = options.click;

                return item;
            },
            _buildFabAndAddToPage = optionsArr => {
                let fab = document.createElement('div');
                fab.classList.add('fab-container');

                let ul = document.createElement('ul');
                ul.classList.add('fab-options');

                optionsArr.forEach(options => {
                    ul.appendChild(_buildItem(options));
                });

                fab.appendChild(_buildIconHolder());
                fab.appendChild(ul);

                document.body.appendChild(fab);
            };

        return {
            build: _buildFabAndAddToPage,
        };
    }();

    Presto.modules.FAB = _FAB;

})(window.Presto);

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

(function (Presto, location) {
    'use strict';

    const {
        Analytics,
        Snackbar,
        FAB,

    } = Presto.modules;

    const _SaudePetrobras = function () {

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
            __createCopyButton_recursoGlosaDetalhe_onclick = function () {
                Analytics.sendEvent('clickButton', 'log', 'btnCopy');

                let labelList = document.querySelectorAll('#body label');
                let barArr = [], bazArr = [];

                let stopLoop = false;

                labelList.forEach((label) => {
                    if (stopLoop)
                        return;

                    let labelText = label.textContent;
                    labelText = labelText ? labelText.replace(':', '').trim() : '';

                    let value = '';

                    if (/Motivo.+Glosa/.test(labelText)) {
                        let reasons = Array.from(label.parentElement.querySelectorAll('ul li'));
                        reasons = reasons.map(reason => reason.textContent.trim());
                        value = reasons.join(';');
                        stopLoop = true;

                    } else {
                        let spanElement = label.parentElement.querySelector('span');
                        value = spanElement ? spanElement.textContent : '';
                        value = value ? value.replace('R$', '').trim() : '';
                    }

                    barArr.push(value);
                });

                var boxMessageList = document.querySelectorAll('.box-resposta-mensagem');
                boxMessageList.forEach((box) => {
                    let message = box.querySelector('.span-13.jump-1.size-12.padrao').textContent;
                    message = message.replace(/\n*/g, '');
                    barArr.push(message);
                });

                let barArrJoined = barArr.join('\t');
                bazArr.push(barArrJoined);

                let bazArrJoined = bazArr.join('\n');

                navigator.clipboard
                    .writeText(bazArrJoined)
                    .then(() => Snackbar.fire('Copiado!'));

            },
            __createCopyButton_extratoDetalhePgto_onclick = function () {
                Analytics.sendEvent('clickButton', 'log', 'btnCopy');

                let labelList = document.querySelectorAll('#dados-solicitacao label');
                let barArr = [], bazArr = [];

                labelList.forEach((label) => {
                    let value = label.parentElement.querySelector('span').textContent.replace('R$', '').trim();
                    barArr.push(value);
                });

                let barArrJoined = barArr.join('\t');
                bazArr.push(barArrJoined);

                let bazArrJoined = bazArr.join('\n');

                navigator.clipboard
                    .writeText(bazArrJoined)
                    .then(() => Snackbar.fire('Copiado!'));

            },
            __createCopyButton_extratoDetalhePgtoLote_onclick = function () {
                Analytics.sendEvent('clickButton', 'log', 'btnCopy');

                let formList = document.querySelectorAll('form[id*="formularioTratarGlosas"]');
                let bazArr = [], todoTasks = [];

                formList.forEach((form) => {

                    var table = form.querySelector('table');
                    var tbodyTrList = table.querySelectorAll('tbody tr');
                    tbodyTrList.forEach((tr) => {

                        var barArr = [];

                        // bloco cinza...

                        var labelList = form.querySelectorAll('label');
                        labelList.forEach((label) => {
                            let value = label.parentElement.querySelector('span').textContent.trim();
                            barArr.push(value);
                        });

                        tr.querySelectorAll('td').forEach((td) => {
                            let child = td.firstElementChild;
                            if (child && child.nodeName === "A") {
                                todoTasks.push(child);
                            }

                            let tdText = td.textContent.replace('R$', '').trim();
                            if (tdText) {
                                barArr.push(tdText);
                            }
                        });

                        barArr.push(document.querySelector('.tab-administracao tbody tr td').textContent.trim());
                        bazArr.push(barArr.join('\t'));
                    });
                });

                navigator.clipboard
                    .writeText(bazArr.join('\n'))
                    .then(() => Snackbar.fire('Copiado!'));

            },
            __createDeepCopyButton_extratoDetalhePgtoLote_onclick = function () {
                Analytics.sendEvent('clickButton', 'log', 'btnDeepCopy');

                let formList = document.querySelectorAll('form[id*="formularioTratarGlosas"]');
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

                        let glosas = [];

                        eAjaxContent.querySelectorAll('label').forEach((label) => {
                            let labelText = label.textContent.replace(':', '').trim();
                            let value = label.parentElement.querySelector('span').textContent.replace('.', ',').trim();

                            if (/Motivo.+Glosa/.test(labelText)) {
                                let reasons = Array.from(label.parentElement.parentElement.querySelectorAll('ul li'));
                                reasons = reasons.map(reason => reason.textContent.trim());
                                value += ` (${reasons.join(';\n')});`;
                                glosas.push(value);
                                return;
                            }

                            barArr.push(value);
                        });

                        if (glosas) {
                            barArr.push(`="${glosas.join('"&CHAR(10)&"')}"`);
                        }

                        bazArr.push(barArr.join('\t'));

                        eAjaxContent.querySelector('.TB_closeWindowButton').click();

                        let innerInterval = setInterval(() => {
                            if (document.querySelector('#TB_ajaxContent'))
                                return;

                            clearInterval(innerInterval);

                            if (todoTasks.length) {
                                execTask();
                            } else {
                                navigator.clipboard
                                    .writeText(bazArr.join('\n'))
                                    .then(() => Snackbar.fire('Copiado!'));
                            }
                        }, 250);

                    }, 250);
                };

                execTask();
            },
            _validateDueDate = () => {
                return new Promise((resolve, reject) => {
                    let interval = setInterval(() => {
                        const eDueDatePwd = document.querySelector('#txtDataValidadeSenha');
                        if (!!!eDueDatePwd.value)
                            return;

                        clearInterval(interval);

                        // password validate: duo date 
                        let snacks = eDueDatePwd.value.split('/').map(num => parseInt(num));
                        snacks[ 1 ] += -1;
                        let duoDatePwd = new Date(...snacks.reverse());
                        if (duoDatePwd < new Date()) {
                            eDueDatePwd.style.border = 'red 2px solid';
                            eDueDatePwd.style.color = 'red';
                            eDueDatePwd.parentElement.querySelector('label').style.color = 'red';
                            reject('Senha vencida!');
                        }
                        else resolve();

                    }, 500);
                });
            },
            _is = function () {
                return HOST.test(location.host);
            },
            _isLoaded = function () {
                return document.querySelector(".titulos-formularios");
            },
            _fixAnyPage = function () {
                if (RECURSO_GLOSA_DETALHE.test(location.pathname)) {
                    FAB.build([ {
                        textLabel: 'Copiar dados',
                        iconClass: 'lar la-copy',
                        click: __createCopyButton_recursoGlosaDetalhe_onclick,
                    } ]);
                }
                else if (EXTRATO_DETALHE_PGTO.test(location.pathname)) {
                    FAB.build([ {
                        textLabel: 'Copiar dados',
                        iconClass: 'lar la-copy',
                        click: __createCopyButton_extratoDetalhePgto_onclick,
                    } ]);
                }
                else if (EXTRATO_DETALHE_PGTO_LOTE.test(location.pathname)) {
                    FAB.build([
                        {
                            textLabel: 'Copiar dados (deep)',
                            iconClass: 'lar la-clipboard',
                            click: __createDeepCopyButton_extratoDetalhePgtoLote_onclick,
                        },
                        {
                            textLabel: 'Copiar dados',
                            iconClass: 'lar la-copy',
                            click: __createCopyButton_extratoDetalhePgtoLote_onclick,
                        },
                    ]);
                }
                else if (FATURAMENTO_DIGITAR.test(location.pathname)) {
                    let btnImport = document.querySelector('#senha').parentElement.querySelector('a.bt-procurar');
                    let btnImport_onclick = btnImport.onclick;
                    btnImport.onclick = () => {
                        btnImport_onclick();
                        _validateDueDate()
                            .then(() => {
                                document.querySelector('#txtNumeroGuiaPrestador').value = new Date().getTime();
                            })
                            .catch(Snackbar.fire);
                    };
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
        Style,
        SulAmerica,
        SaudePetrobras,
    
    } = Presto.modules;

    const
        _init = function() {
            Style.inject();

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
