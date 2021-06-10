(function (Presto, location) {
    'use strict';

    const {
        Analytics,
        IndexedDB,
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
                                _watchForm();
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
