const apiRoot = 'https://ashbhat.pythonanywhere.com';

localStorage.browserToken = localStorage.browserToken || generateToken();

document.querySelector('[data-action-authtwitter]').addEventListener('click', authTwitter);

if (localStorage.apiKey) {
  document.querySelector('[data-if-no-apikey]').style.display = 'none';
} else {
  document.querySelector('[data-if-apikey]').style.display = 'none';
}

// Just use getApiKey as a health check for the popover
getApiKey()
  .then(() => {
    document.querySelector('[data-if-not-apiup]').style.display = 'none';
  })
  .catch(() => {
    document.querySelector('[data-if-apiup]').style.display = 'none';
  });

function authTwitter() {
  const newTab = safari.application.activeBrowserWindow.openTab();

  newTab.addEventListener('close', () => {
    getApiKey(localStorage.browserToken).then(key => {
      localStorage.apiKey = key;
    });
  });

  newTab.url = `${apiRoot}/chromelogin?token=${localStorage.browserToken}`;
}

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let json;
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
  }).catch(ex => {
    throw ex;
  });
}

function getApiKey(chromekey) {
  return getJSON(`${apiRoot}/chromekey?token=${chromekey}`).then(res => {
    if (res && res.token) {
      return res.token;
    }
    return Promise.reject(new Error('Error getting API key'));
  });
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
