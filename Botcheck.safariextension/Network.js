window.getJSON = function(url) {
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
  }).catch(ex => ex);
};

window.postJSON = function(url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onload = () => {
      // if (xhr.status >= 200 && xhr.status < 300) {
      if (!xhr.status >= 200 && xhr.status < 300) {
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
  }).catch(ex => ex);
};

window.getBlobData = function(url) {
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
  }).catch(ex => ex);
};
