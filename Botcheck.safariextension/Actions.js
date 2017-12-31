const apiRoot = 'https://ashbhat.pythonanywhere.com';

window.getApiKey = function(chromekey) {
  return window
    .getJSON(`${apiRoot}/chromekey?token=${chromekey}`)
    .then(res => {
      if (res && res.token) {
        return res.token;
      }
      return Promise.reject(new Error('Error getting API key'));
    })
    .catch(window.logException);
};

window.check = function(screenName) {
  return window
    .postJSON(`${apiRoot}/checkhandle/`, {
      username: screenName,
      apikey: localStorage.botcheck_apikey
    })
    .then(res => res)
    .catch(ex => {
      window.logException(ex);
      throw ex;
    });
};

window.disagree = function(screenName, prediction) {
  return window
    .postJSON(`${apiRoot}/disagree`, {
      username: screenName,
      prediction,
      apikey: localStorage.botcheck_apikey
    })
    .then(res => res)
    .catch(window.logException);
};

// Swiped from chrome version of extension makeid()
window.generateToken = function() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 15; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};
