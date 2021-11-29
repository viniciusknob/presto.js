(function(window) {

	'use strict';

	const _Presto = function() {

		return {
			modules: {},
			pages: {},
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

(function (Presto, indexedDB) {
	'use strict';

	const {
		Analytics,

	} = Presto.modules;

	const _IndexedDB = function () {

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

					idb.onerror = function (event) {
						Analytics.sendException(`${fn}.indexedDB.open: ${JSON.stringify(event)}`, true);
						reject();
					};

					idb.onsuccess = (event) => {
						_db = event.target.result;

						_db.onerror = function (event) {
							Analytics.sendException(`${fn}.db.any: ${JSON.stringify(event)}`, true);
						};

						resolve(_db);
					};

					idb.onupgradeneeded = function (event) {
						Analytics.sendEvent(`${fn}.onupgradeneeded`, 'log', JSON.stringify(event));

						_db = event.target.result;

						if (_db.objectStoreNames.contains(STORE_NAME) === false) {
							_db.createObjectStore(STORE_NAME, { keyPath: "uid" });
						}
					};
				});
			},
			_getAll = function (db) {
				const fn = '_getAll';

				return new Promise(function (resolve, reject) {
					const personList = [];
					const objectStore = db.transaction([ STORE_NAME ], "readonly").objectStore(STORE_NAME);
					objectStore.openCursor().onsuccess = function (event) {
						var cursor = event.target.result;
						if (cursor) {
							personList.push(cursor.value);
							cursor.continue();
						} else {
							Analytics.sendEvent(`${fn}.personList`, 'log', `size ${personList.length}`);

							personList.sort(function (a, b) {
								return a.name.localeCompare(b.name);
							});

							resolve(personList);
						}
					};
				});
			},
			_addOrUpdateItem = function (db, person) {
				const fn = '_addOrUpdateItem';

				return new Promise(function (resolve, reject) {

					const transaction = db.transaction([ STORE_NAME ], "readwrite");

					transaction.oncomplete = function (event) {
						resolve();
					};

					transaction.onerror = function (event) {
						Analytics.sendException(`${fn}.transaction: ${JSON.stringify(event)}`, true);
						reject();
					};

					const objectStore = transaction.objectStore(STORE_NAME);

					const singleKeyRange = IDBKeyRange.only(person.uid);
					const _cursor = objectStore.openCursor(singleKeyRange);

					_cursor.onsuccess = function (event) {
						var cursor = event.target.result;

						let request;
						if (cursor) {
							Analytics.sendEvent(`${fn}.objectStore.put`, 'log', person.uid);
							request = objectStore.put(person);
						} else {
							Analytics.sendEvent(`${fn}.objectStore.add`, 'log', person.uid);
							request = objectStore.add(person);
						}

						request.onerror = function (event) {
							Analytics.sendException(`${fn}.objectStore.request: ${JSON.stringify(event)}`, false);
							reject();
						};
					};

					_cursor.onerror = function (event) {
						Analytics.sendException(`${fn}.cursor.open: ${JSON.stringify(event)}`, false);
						reject();
					};
				});
			},
			_createReport = () => {
				_getOrCreateDB()
					.then(_getAll)
					.then(personArr => {
						window.open().document.write(`
							<pre>${JSON.stringify(personArr, undefined, 4)}</pre>
						`);
					});
			};

		return {
			getOrCreateDB: _getOrCreateDB,
			getAll: _getAll,
			addOrUpdateItem: _addOrUpdateItem,
			createReport: _createReport,
		};
	}();

	Presto.modules.IndexedDB = _IndexedDB;

})(Presto, indexedDB);
(function(Presto) {

    'use strict';

    const _Style = function() {

        const CSS = '.fab-container{position:fixed;bottom:50px;right:50px;z-index:99;cursor:pointer}.fab-icon-holder{width:50px;height:50px;border-radius:100%;background-image:linear-gradient(to bottom right,#ba39be,#05b370);box-shadow:0 6px 25px rgba(0,0,0,.35)}.fab-image-holder{background-image:url(https://i.imgur.com/6xZyXGT.png);background-size:58px;background-repeat:no-repeat;background-position:right}.fab-icon-holder:hover{opacity:.8}.fab-icon-holder i{display:flex;align-items:center;justify-content:center;height:100%;font-size:25px;color:#fff}.fab-main{width:60px;height:60px}.fab-main::before{content:"";position:absolute;width:100%;height:100%;bottom:10px}.fab-options{list-style-type:none;margin:0;position:absolute;bottom:70px;right:0;opacity:0;transition:all .3s ease;transform:scale(0);transform-origin:85% bottom}.fab-main:hover+.fab-options,.fab-options:hover{opacity:1;transform:scale(1)}.fab-options li{display:flex;justify-content:flex-end;padding:5px}.fab-label{padding:2px 5px;align-self:center;user-select:none;white-space:nowrap;border-radius:3px;font-size:16px;background:#666;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.2);margin-right:10px}#snackbar{visibility:hidden;opacity:0;min-width:250px;margin-left:-125px;background-image:linear-gradient(to bottom right,#ba39be,#05b370);color:#fff;text-align:center;border-radius:2px;padding:16px;position:fixed;z-index:9999999;left:50%;bottom:15%;font-size:17px}#snackbar.show{visibility:visible;opacity:1;-webkit-animation:fadein .5s,fadeout .5s 2.5s;animation:fadein .5s,fadeout .5s 2.5s}@-webkit-keyframes fadein{from{bottom:0;opacity:0}to{bottom:15%;opacity:1}}@keyframes fadein{from{bottom:0;opacity:0}to{bottom:15%;opacity:1}}@-webkit-keyframes fadeout{from{bottom:15%;opacity:1}to{bottom:0;opacity:0}}@keyframes fadeout{from{bottom:15%;opacity:1}to{bottom:0;opacity:0}}';

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
    "use strict";

    const _Page = (function () {
        const
            // Inicio > Autorização > Últimas Solicitações
            PATHNAME_REGEX = /autorizacao\/ultimasSolicitacoes\/ultimasSolicitacoes/,

            FORM_FIELDSET_SELECTOR = "#formularioBase fieldset";

        const 
            _upgrade = () => {
                let label = document.createElement("label");
                label.textContent = "Presto.js - Mês/Ano:";
                label.style.marginRight = "1em";

                let select = document.createElement("select");

                let option = document.createElement("option");
                option.value = "";
                option.textContent = "Selecione...";
                select.appendChild(option);

                let currentYear = new Date().getFullYear();
                let currentMonth = new Date().getMonth();
                let monthsToGoBack = 24;

                for (let goBack = 0; goBack >= 0 - monthsToGoBack; goBack--) {
                    let date = new Date(currentYear, currentMonth + goBack, 1);
                    let monthStr = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date);

                    let option = document.createElement("option");
                    option.value = `${date.getMonth()}/${date.getFullYear()}`;
                    option.textContent = `${monthStr}/${date.getFullYear()}`;
                    select.appendChild(option);
                }

                select.onchange = (event) => {
                    let partialDate = event.target.value.split("/");
                    let year = partialDate[1];
                    let month = parseInt(partialDate[0]) + 1;
                    let monthStr = ("" + month).padStart(2, "0");
                    let endOfMonth = new Date(year, month, 0).getDate();

                    document.querySelector("#txtDataEnvioDe").value = `01/${monthStr}/${year}`;
                    document.querySelector("#txtDataEnvioAte").value = `${endOfMonth}/${monthStr}/${year}`;
                };

                let div = document.createElement("div");
                div.style.paddingBottom = "3em";
                div.style.marginLeft = "8em";
                div.appendChild(label);
                div.appendChild(select);

                const referenceNode = document.querySelector(FORM_FIELDSET_SELECTOR);
                referenceNode.insertBefore(div, referenceNode.firstChild);
            },
            _init = () => {
                if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
            };

        return {
            upgrade: _init,
        };
    })();

    Presto.pages.AutorizacaoUltimasSolicitacoesPage = _Page;
})(Presto, location);

(function(Presto, location) {

	'use strict';

    const {
        Analytics,
        Snackbar,
        FAB,

    } = Presto.modules;

	const _Page = function() {

        const
            // Inicio > Extrato > Visualizar > Detalhe do Pagamento > Detalhe Lote
            PATHNAME_REGEX = /extrato\/buscarLote/;

        const
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
            _upgrade = () => {
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
            },
            _init = () => {
                if (PATHNAME_REGEX.test(location.pathname))
                    _upgrade();
            };

		return {
            upgrade: _init,
		};
	}();

	Presto.pages.ExtratoBuscarLotePage = _Page;

})(Presto, location);

(function(Presto, location) {

	'use strict';

    const {
        Analytics,
        Snackbar,
        FAB,

    } = Presto.modules;

	const _Page = function() {

        const
            // Inicio > Extrato > Visualizar > Detalhe do Pagamento
            PATHNAME_REGEX = /extrato\/detalhePagamento/;

        const
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
            _upgrade = () => {
                FAB.build([ {
                    textLabel: 'Copiar dados',
                    iconClass: 'lar la-copy',
                    click: __createCopyButton_extratoDetalhePgto_onclick,
                } ]);
            },
            _init = () => {
                if (PATHNAME_REGEX.test(location.pathname))
                    _upgrade();
            };

		return {
            upgrade: _init,
		};
	}();

	Presto.pages.ExtratoDetalhePagamentoPage = _Page;

})(Presto, location);

(function(Presto, location) {

	'use strict';

    const {
        Analytics,
        IndexedDB,
        Snackbar,
        FAB,

    } = Presto.modules;

	const _Page = function() {

        const
            // Inicio > Faturamento > Digitação > Digitar > Serviço Profissional/Serviço Auxiliar de Diagnóstico e Terapia - SP/SADT
            PATHNAME_REGEX = /faturamento\/digitar\/spsadt/,

            FORM_FIELDSET_SELECTOR = "#formularioDigitacaoSPSADT fieldset div";

        const
            _handleBtnGravarAlteracoes = person => {
                const btnGravarAlteracoes = document.querySelector('#gravarAlteracoes');
                const _onclick = btnGravarAlteracoes.onclick;
                btnGravarAlteracoes.onclick = () => {
                    IndexedDB.getOrCreateDB()
                        .then(db => IndexedDB.addOrUpdateItem(db, person))
                        .then(() => {
                            Analytics.sendEvent('_watchForm_personSaved', 'log', person.uid);
                            if (_onclick) _onclick();
                        })
                        .catch(err => {
                            Analytics.sendException(`_watchForm: ${JSON.stringify(err)}`, true);
                        });
                };
            },
            _watchForm = function () {
                let person = {
                    uid: '', // carteirinha
                    name: '',
                    password: '',
                    props: [],
                };

                setTimeout(() => {
                    person.uid = document.querySelector('#txtNumeroCarteirinhaBeneficiario').value;
                    person.name = document.querySelector('#txtNomeBeneficiario').value;
                    person.password = document.querySelector('#senha').value;
                }, 500);

                let idIgnoredArr = [
                    'dataModalProcedimento',
                    'ordemItemModalProcedimento',
                ];

                Array.from(document.querySelectorAll('input[type=text],select,textarea'))
                    .filter(item => idIgnoredArr.includes(item.id) === false)
                    .map(item => {
                        let _onchange = item.onchange;
                        item.onchange = (event) => {
                            let change = person.props.find(item => item.id === event.target.id);
                            if (!!!change) {
                                person.props.push({
                                    id: event.target.id,
                                    value: event.target.value,
                                });
                            } else {
                                if (event.target.value)
                                    change.value = event.target.value;
                                else
                                    person.props = person.props.filter(item => item.id !== event.target.id);
                            }
                            // console.table(person.props);

                            if (_onchange) _onchange();
                        };
                    });

                _handleBtnGravarAlteracoes(person);
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
            __buildComponentForLoadedProfiles = personArr => {
                let label = document.createElement('label');
                label.textContent = 'Presto.js - Lista de Pacientes:'
                label.style.marginRight = '1em';

                let select = document.createElement('select');

                let option = document.createElement('option');
                option.value = '';
                option.textContent = 'Selecione...';
                select.appendChild(option);

                personArr.forEach(item => {
                    let option = document.createElement('option');
                    option.value = item.password;
                    option.textContent = `${item.name} - ${item.uid}`;
                    select.appendChild(option);
                });

                select.onchange = (event) => {
                    document.querySelector('#senha').value = event.target.value;
                };

                let div = document.createElement('div');
                div.style.paddingBottom = '3em';
                div.style.textAlign = 'center';
                div.appendChild(label);
                div.appendChild(select);

                const referenceNode = document.querySelector(FORM_FIELDSET_SELECTOR);
                referenceNode.insertBefore(div, referenceNode.firstChild);
            },
            __loadProfiles = () => {
                IndexedDB.getOrCreateDB()
                    .then(IndexedDB.getAll)
                    .then(personArr => {
                        if (personArr && personArr.length) {
                            personArr.sort((a, b) => a.name.charCodeAt() - b.name.charCodeAt());
                            __buildComponentForLoadedProfiles(personArr);
                        }
                    })
                    .catch(err => {
                        Analytics.sendException(`__loadProfiles :: ${JSON.stringify(err)}`);
                    });

            },
            _upgrade = () => {
                __loadProfiles();

                FAB.build([ {
                    textLabel: 'IndexedDB: Criar relatório',
                    iconClass: 'las la-external-link-alt',
                    click: IndexedDB.createReport,
                } ]);

                let btnImport = document.querySelector('#senha').parentElement.querySelector('a.bt-procurar');
                let btnImport_onclick = btnImport.onclick;
                btnImport.onclick = () => {
                    btnImport_onclick();
                    _validateDueDate()
                        .then(() => {
                            document.querySelector('#txtNumeroGuiaPrestador').value = new Date().getTime();
                            _watchForm();
                        })
                        .catch(Snackbar.fire);
                };
            },
            _init = () => {
                if (PATHNAME_REGEX.test(location.pathname))
                    _upgrade();
            };

		return {
            upgrade: _init,
		};
	}();

	Presto.pages.FormularioDigitarSPSADTPage = _Page;

})(Presto, location);

(function(Presto, location) {

	'use strict';

    const {
        Analytics,
        Snackbar,
        FAB,

    } = Presto.modules;

	const _Page = function() {

        const
            // Inicio > Acompanhar recurso de glosa > Detalhe
            PATHNAME_REGEX = /recursoglosa\/buscaDetalheRecursoGlosa/;

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
            _upgrade = () => {
                FAB.build([ {
                    textLabel: 'Copiar dados',
                    iconClass: 'lar la-copy',
                    click: __createCopyButton_recursoGlosaDetalhe_onclick,
                } ]);
            },
            _init = () => {
                if (PATHNAME_REGEX.test(location.pathname))
                    _upgrade();
            };

		return {
            upgrade: _init,
		};
	}();

	Presto.pages.RecursoGlosaBuscaDetalhePage = _Page;

})(Presto, location);

(function (Presto, location) {

    'use strict';

    const {
        RecursoGlosaBuscaDetalhePage,
        ExtratoDetalhePagamentoPage,
        ExtratoBuscarLotePage,
        FormularioDigitarSPSADTPage,
        AutorizacaoUltimasSolicitacoesPage,

    } = Presto.pages;

    const _SaudePetrobras = function () {

        const HOST = /portaltiss\.saudepetrobras\.com\.br/;

        const
            _is = function () {
                return HOST.test(location.host);
            },
            _isLoaded = function () {
                return document.querySelector(".titulos-formularios");
            },
            _fixAnyPage = function () {
                RecursoGlosaBuscaDetalhePage.upgrade();
                ExtratoDetalhePagamentoPage.upgrade();
                ExtratoBuscarLotePage.upgrade();
                FormularioDigitarSPSADTPage.upgrade();
                AutorizacaoUltimasSolicitacoesPage.upgrade();
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

(function (Presto, location, jQuery) {
    "use strict";

    const _Page = (function () {
        const
            // Guias > Guia de SP/SADT
            PATHNAME_REGEX = /GuiasTISS\/GuiaSPSADT\/ViewGuiaSPSADT/;

        const _upgrade = () => {
            // preencher a data de atendimento para o dia atual
            const eDataSolicitacao = document.querySelector("#dataSolicitacao");
            let yyyy = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(new Date());
            let mm = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(new Date());
            let dd = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(new Date());
            eDataSolicitacao.value = `${dd}/${mm}/${yyyy}`;

            // preencher tipo atendimento como TERAPIA
            document.querySelector('#tipoAtendimento').value = '3';

            // preencher o código de psicoterapia
            const eIncluirProcedimento = document.querySelector("#incluirProcedimento");
            const eIncluirProcedimento_click = eIncluirProcedimento.onclick;
            eIncluirProcedimento.onclick = () => {
                eIncluirProcedimento_click();
                setTimeout(() => {
                    const selector = "#registroProcedimentoCodigo input";
                    document.querySelector(selector).value = "20104219"; // SESSAO DE PSICOTERAPIA INDIVIDUAL [Tabela: 13]

                    // https://api.jqueryui.com/autocomplete/
                    jQuery(selector).autocomplete("search");
                    //setTimeout(() => jQuery(selector).data("ui-autocomplete").menu.element.children().first().click(), 1000);

                }, 250);
            };
        },
        _init = () => {
            if (PATHNAME_REGEX.test(location.pathname)) setTimeout(_upgrade, 2000);
        };

        return {
            upgrade: _init,
        };
    })();

    Presto.pages.ViewGuiaSPSADTPage = _Page;
})(Presto, location, jQuery);

(function (Presto, location) {

    'use strict';

    const {
        ViewGuiaSPSADTPage,

    } = Presto.pages;

    const _CanoasPrev = function () {

        const HOST = /novowebplancanoasprev\.facilinformatica\.com\.br/;

        const
            _is = function () {
                return HOST.test(location.host);
            },
            _isLoaded = function () {
                return document.querySelector("#incluirProcedimento");
            },
            _fixAnyPage = function () {
                ViewGuiaSPSADTPage.upgrade();
            };


        /* Public Functions */

        return {
            is: _is,
            isLoaded: _isLoaded,
            fix: _fixAnyPage,
        };

    }();

    Presto.modules.CanoasPrev = _CanoasPrev;

})(Presto, location);

(function(Presto, setInterval, clearInterval) {

    const {
        Analytics,
        Style,
        SulAmerica,
        SaudePetrobras,
        CanoasPrev,
    
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
            if (CanoasPrev.is()) {
                Analytics.config('_CanoasPrev');
                CanoasPrev.fix();
            }

            // others...
        },
        _isLoaded = function() {
            if (SulAmerica.is())
                return SulAmerica.isLoaded();

            if (SaudePetrobras.is())
                return SaudePetrobras.isLoaded();

            if (CanoasPrev.is())
                return CanoasPrev.isLoaded();

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
