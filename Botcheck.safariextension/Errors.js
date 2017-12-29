/* eslint-disable no-empty, prefer-template */

window.onerror = function(msg, url, line, col, error) {
  let extra = !col ? '' : `\ncolumn: ${col}`;
  extra += !error ? '' : `\nerror: ${error}`;
  const message = `Error: ${msg}\nurl: ${url}\nline: ${line}${extra}`;
  window.logError(message);
  return true;
};

window.logException = function(ex) {
  const uuid = generateUuid();
  const exception = {
    message: ex.toString(),
    stack: ex.stack
  };
  window.logger({ exception }, uuid);
  console.info(
    `[botcheck] Logged exception ${uuid}. Please include this identifier if reporting a bug. Details: `,
    exception
  );
};

window.logError = function(error) {
  const uuid = generateUuid();
  window.logger({ error }, uuid);
  console.info(`[botcheck] Logged error ${uuid}. Please include this identifier if reporting a bug.`, error);
};

window.logger = function(payload, uuid = generateUuid()) {
  try {
    window.postJSON('https://log.declaredintent.com/entries', {
      namespace: 'com.declaredintent.botcheck-safari',
      useragent: navigator && navigator.userAgent,
      payload,
      uuid
    });
  } catch (err) {}
};

// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function generateUuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
