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
            EXTRATO_DETALHE_PGTO_LOTE = /extrato\/buscarLote/;
        
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
                            value = reasons.join(';\n');
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
