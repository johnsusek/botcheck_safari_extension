const apiRoot = 'https://ashbhat.pythonanywhere.com';

window.apiCheckUser = function(screenName) {
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

window.apiDisagree = function(screenName, prediction) {
  return window
    .postJSON(`${apiRoot}/disagree`, {
      username: screenName,
      prediction,
      apikey: localStorage.botcheck_apikey
    })
    .then(res => res)
    .catch(window.logException);
};
