(function (Presto, location) {
  "use strict";

  const { EmitirNFSe } = Presto.pages;
  const { DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Module = (function () {
    const HOST = /nfse\.canoas\.rs\.gov\.br/;

    const isCurrentHost = function () {
      return HOST.test(location.host);
    };

    const isPageReady = function () {
      return $("#hidden_nomePrestador").value.length > 0;
    };

    const applyFeatures = function () {
      EmitirNFSe.applyFeatures();
    };

    /* Public Functions */

    return {
      isCurrentHost,
      isPageReady,
      applyFeatures,
    };
  })();

  Presto.modules.NFSeCanoas = _Module;
})(Presto, location);
