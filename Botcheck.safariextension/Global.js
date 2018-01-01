safari.application.addEventListener('message', handleMessage, false);

function handleMessage(msg) {
  if (msg.name === 'getApiKey') {
    msg.target.page.dispatchMessage('getApiKeyDone', localStorage.apiKey);
  }
}
