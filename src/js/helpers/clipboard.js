(function(Presto, navigator, isSecureContext, document) {

    'use strict';

    const _Module = function() {

        const
            _write = text => {
                if (navigator.clipboard && isSecureContext) {
                    return navigator.clipboard.writeText(text);
                }
                else {
                    let textArea = document.createElement("textarea");
                    textArea.value = text;

                    // make the textarea out of viewport
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    textArea.style.top = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();

                    return new Promise((resolve, reject) => {
                        // here the magic happens
                        document.execCommand('copy') ? resolve() : reject();
                        textArea.remove();
                    });
                }
            };

        return {
            write: _write,
        };
    }();

    /* Module Definition */

    Presto.modules.Clipboard = _Module;

})(window.Presto, window.navigator, window.isSecureContext, window.document);
