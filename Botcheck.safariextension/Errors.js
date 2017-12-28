/* eslint-disable guard-for-in, no-restricted-syntax, no-empty */

const navi = {};

for (const navigatorProperty in navigator) {
  if (typeof navigator[navigatorProperty] !== 'function') {
    navi[navigatorProperty] = navigator[navigatorProperty];
  }
}

window.onerror = function(msg, url, line, col, error) {
  let extra = !col ? '' : `\ncolumn: ${col}`;
  extra += !error ? '' : `\nerror: ${error}`;
  const message = `Error: ${msg}\nurl: ${url}\nline: ${line}${extra}`;
  logError(message);
  return true;
};

window.logException = function(exception) {
  logger({ exception });
};

window.logError = function(error) {
  logger({ error });
};

window.logger = function(payload) {
  try {
    const uuid = uuid();
    window
      .postJSON('https://log.declaredintent.com/entries', {
        namespace: 'com.declaredintent.botcheck-safari',
        payload,
        visitor: navi,
        uuid
      })
      .then(() => {
        console.log(`[botcheck] Logged ${uuid}. Please share this identifier if reporting a bug.`);
      });
  } catch (err) {}
};

// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
