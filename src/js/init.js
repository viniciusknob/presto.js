(function (Presto, setInterval, clearInterval) {
  const interval = setInterval(() => {
    if (Presto) {
      clearInterval(interval);
      Presto.bless();
    }
  }, 250);
})(window.Presto, window.setInterval, window.clearInterval);
