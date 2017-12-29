window.getApiKey(chromekey) {
  return window
    .getJSON(`https://ashbhat.pythonanywhere.com/chromekey?token=${chromekey}`)
    .then(res => {
      if (res && res.token) {
        return res.token;
      }
      return Promise.reject(new Error('Error getting API key'));
    })
    .catch(window.logException);
}

window.check(screenName) {
  return window
    .postJSON('https://ashbhat.pythonanywhere.com/checkhandle/', {
      username: screenName,
      apikey: localStorage.botcheck_apikey
    })
    .then(res => res)
    .catch(window.logException);
}

window.disagree(screenName, prediction) {
  return window
    .postJSON('https://ashbhat.pythonanywhere.com/disagree', {
      username: screenName,
      prediction,
      apikey: localStorage.botcheck_apikey
    })
    .then(res => res)
    .catch(window.logException);
}

// Swiped from chrome version of extension makeid()
window.generateToken() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 15; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
