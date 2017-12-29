/* eslint-disable no-unused-vars, no-var, vars-on-top */

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        var json;
        try {
          json = JSON.parse(xhr.response);
        } catch (error) {
          reject(error);
        }
        resolve(json);
      } else {
        reject(new Error(`${xhr.status} ${xhr.statusText}`));
      }
    };
    xhr.onerror = () => {
      reject(new Error(url));
    };
    xhr.send();
  }).catch(window.logException);
}

function postJSON(url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Turn blank responses into an empty object
        if (xhr.response === '') {
          return resolve({});
        }
        let json;
        try {
          json = JSON.parse(xhr.response);
        } catch (error) {
          console.error('[botcheck] Caught exception trying to parse JSON.', xhr.response);
          return reject(error);
        }
        return resolve(json);
      }
      return reject(new Error(`${xhr.status} ${xhr.statusText}`));
    };
    xhr.onerror = () => {
      reject(new Error(url));
    };
    xhr.send(JSON.stringify(data));
  });
}

function getBlobData(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(window.URL.createObjectURL(xhr.response));
      } else {
        reject(new Error(`${xhr.status} ${xhr.statusText}`));
      }
    };
    xhr.onerror = () => {
      reject(new Error(url));
    };
    xhr.send();
  }).catch(window.logException);
}

function getApiKey(chromekey) {
  return getJSON(`https://ashbhat.pythonanywhere.com/chromekey?token=${chromekey}`)
    .then(res => {
      if (res && res.token) {
        return res.token;
      }
      return Promise.reject(new Error('Error getting API key'));
    })
    .catch(window.logException);
}

function check(screenName) {
  return postJSON('https://ashbhat.pythonanywhere.com/checkhandle/', {
    username: screenName,
    apikey: localStorage.botcheck_apikey
  })
    .then(res => res)
    .catch(window.logException);
}

function disagree(screenName, prediction) {
  return postJSON('https://ashbhat.pythonanywhere.com/disagree', {
    username: screenName,
    prediction,
    apikey: localStorage.botcheck_apikey
  })
    .then(res => res)
    .catch(window.logException);
}

// Swiped from chrome version of extension makeid()
function generateToken() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 15; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
