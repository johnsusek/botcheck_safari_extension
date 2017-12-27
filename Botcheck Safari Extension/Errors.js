/* eslint-disable guard-for-in, no-restricted-syntax */

window.onerror = function(msg, url, line, col, error) {
  let extra = !col ? '' : `\ncolumn: ${col}`;
  extra += !error ? '' : `\nerror: ${error}`;
  const message = `Error: ${msg}\nurl: ${url}\nline: ${line}${extra}`;

  const navi = {};
  for (const navigatorProperty in navigator) {
    if (typeof navigator[navigatorProperty] !== 'function') {
      navi[navigatorProperty] = navigator[navigatorProperty];
    }
  }

  // Log any unhandled errors - cheaper than newrelic :)
  try {
    window.postJSON('https://log.declaredintent.com/entries/', {
      namespace: 'com.declaredintent.botcheck-safari',
      message,
      visitor: navi
    });
  } catch (err) {
    console.log(err);
  }

  return true;
};
