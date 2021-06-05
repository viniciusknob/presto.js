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
