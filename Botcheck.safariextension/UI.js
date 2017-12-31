// TODO
// - move to a start script and inject on DOMContentLoaded
// - show button on following/followers

let modalEl;
let initialData = {};

// Don't inject inside iframes
if (window.self === window.top) {
  if (document.body) {
    initData();
    injectUI();
    attachEventListeners();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initData();
      injectUI();
      attachEventListeners();
    });
  }
}

function initData() {
  try {
    initialData = JSON.parse(document.querySelector('#init-data').value);
  } catch (ex) {
    window.logException(ex);
  }
}

function injectUI() {
  // Add dialog markup to DOM
  document.body.insertAdjacentHTML('afterbegin', window.markup.resultModal());
  modalEl = document.getElementById('botcheck-dialog');

  // Add check button to profiles
  document.querySelectorAll('.ProfileHeaderCard, .ProfileCard').forEach(processProfileEl);

  // Process tweets currently on the page, add our check button to them
  document.querySelectorAll('.tweet').forEach(processTweetEl);

  // Watch for new tweets that get added to page, and add our UI to them
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(addedNode => {
        if (!addedNode.querySelectorAll) {
          return;
        }
        // Process new tweets
        addedNode.querySelectorAll('.tweet').forEach(processTweetEl);
        // Process hovered profile card
        if (addedNode.classList.contains('ProfileCard')) {
          processProfileEl(addedNode);
        }
        // Process profile page
        addedNode.querySelectorAll('.ProfileHeaderCard').forEach(processProfileEl);
      });
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function processTweetEl(tweetEl) {
  if (!tweetEl.dataset || !tweetEl.dataset.screenName || tweetEl.dataset.botcheckInjected) {
    return;
  }

  tweetEl.dataset.botcheckInjected = true;
  tweetEl.querySelector('.ProfileTweet-actionList').insertAdjacentHTML('beforeend', window.markup.actionItem());
}

function processProfileEl(profileEl) {
  if (!profileEl || profileEl.dataset.botcheckInjected) {
    return;
  }

  profileEl.dataset.botcheckInjected = true;

  const nameLink = profileEl.querySelector('.ProfileHeaderCard-screenname, .ProfileCard-screenname');
  if (nameLink) {
    const screenNameLink = nameLink.querySelector('.ProfileHeaderCard-screennameLink');
    const screenNameLinkName = screenNameLink && screenNameLink.href.replace(/^http.*\/(\w+)/, '$1');

    // Skip putting button on own profile
    if (screenNameLinkName && screenNameLinkName === initialData.screenName) {
      return;
    }

    // Insert button below screen name
    profileEl
      .querySelector('.ProfileHeaderCard-screenname, .ProfileCard-screenname')
      .insertAdjacentHTML('afterend', window.markup.actionItem());
  }
}

function attachEventListeners() {
  // Botcheck.me button
  document.body.addEventListener('click', ev => {
    const button = ev.srcElement;

    if (button.closest('.ProfileTweet-action--botcheck')) {
      const tweet = button.closest('.tweet');
      const profile = button.closest('.ProfileHeaderCard') || button.closest('.ProfileCard');
      const element = tweet || profile;
      const screenName = getScreenNameFromElement(element);

      if (screenName) {
        button.parentElement.classList.add('botcheck-loading');
        botcheck(screenName)
          .then(res => {
            button.parentElement.classList.remove('botcheck-loading');
            handleCheckResult(screenName, res);
          })
          .catch(() => {
            button.parentElement.classList.remove('botcheck-loading');
            showError('Could not connect to botcheck.me API.');
          });
      }
    }
  });

  // Modal buttons
  modalEl.addEventListener('click', e => {
    if (e.target.classList.contains('botcheck-modal-close')) {
      // Modal close handler
      modalEl.classList.add('botcheck-hide');
      modalEl.classList.remove('botcheck-dialog-show');
    } else if (e.target.classList.contains('botcheck-modal-disagree')) {
      // Disagree handler
      const prediction = e.target.dataset.botcheckPrediction === 'true';
      window.disagree(e.target.dataset.botcheckScreenName, prediction).then(showThanks);
    } else if (e.target.classList.contains('botcheck-modal-share')) {
      // Share handler
      window.open(
        `https://twitter.com/intent/tweet/?text=I+just+found+out+@${
          e.target.dataset.botcheckScreenName
        }+is+a+propaganda+account+using+the+botcheck+browser+extension%21+You+can+download+it+from+their+site+at+https%3A%2F%2Fbotcheck.me+and+check+for+yourself.`,
        '',
        'width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0'
      );
    }
  });

  // ESC key to close dialog
  document.body.addEventListener('keyup', e => {
    if (e.which === 27) modalEl.style.display = 'none';
  });
}

function getScreenNameFromElement(element) {
  if (!element) {
    return;
  }

  if (element.dataset && element.dataset.screenName) {
    return element.dataset.screenName;
  } else if (
    element.querySelector('[data-screen-name]') &&
    element.querySelector('[data-screen-name]').dataset.screenName
  ) {
    return element.querySelector('[data-screen-name]').dataset.screenName;
  }

  window.logError({
    message: 'Could not find screen name from element.',
    details: { element: element.outerHTML || '' }
  });
}

function handleCheckResult(screenName, result) {
  if (result) {
    if (result.error) {
      showError(result.error);
    } else if (result && typeof result.prediction !== 'undefined') {
      if (result.prediction === true) {
        showPositiveResult(screenName, result.profile_image);
      } else {
        showNegativeResult(screenName, result.profile_image);
      }
      if (!sessionStorage[`bc_checked_${screenName}`]) {
        sessionStorage[`bc_checked_${screenName}`] = result;
        window.logger({ result });
      }
    } else {
      showError('Unknown response from botcheck.me API.');
      window.logError({ message: 'Unknown response from botcheck API', screenName, result });
    }
  }
}

function showPositiveResult(screenName, profileImage) {
  modalEl.classList.add('botcheck-prediction-true');
  modalEl.classList.remove('botcheck-prediction-false');
  const message = window.markup.modalMessage.positive({ screenName });
  profileImage = profileImage.replace('http:', 'https:');
  window
    .getBlobData(profileImage)
    .then(imgData => {
      modalEl.querySelector('.modal-content').innerHTML = window.markup.modalContent({
        header: window.markup.modalHeader.positive,
        body: window.markup.modalBody({ screenName, imgData, message }),
        buttons: window.markup.modalButtons.positive({
          screenName
        })
      });
      modalEl.classList.remove('botcheck-hide');
      modalEl.classList.add('botcheck-dialog-show');
    })
    .catch(window.logException);
}

function showNegativeResult(screenName, profileImage) {
  modalEl.classList.add('botcheck-prediction-false');
  modalEl.classList.remove('botcheck-prediction-true');
  const message = window.markup.modalMessage.negative({ screenName });
  profileImage = profileImage.replace('http:', 'https:');
  window
    .getBlobData(profileImage)
    .then(imgData => {
      modalEl.querySelector('.modal-content').innerHTML = window.markup.modalContent({
        header: window.markup.modalHeader.negative,
        body: window.markup.modalBody({ screenName, imgData, message }),
        buttons: window.markup.modalButtons.negative({ screenName })
      });
      modalEl.classList.remove('botcheck-hide');
      modalEl.classList.add('botcheck-dialog-show');
    })
    .catch(window.logException);
}

function showError(body) {
  modalEl.querySelector('.modal-content').innerHTML = window.markup.modalContent({
    header: 'Sorry, something went wrong.',
    body,
    buttons: window.markup.modalButtons.default
  });
  modalEl.classList.remove('botcheck-hide');
  modalEl.classList.add('botcheck-dialog-show');
}

function showThanks() {
  modalEl.querySelector('.modal-content').innerHTML = window.markup.modalContent({
    header: 'Thanks for the feedback!',
    body: 'Our model currently has ~90% accuracy and does make mistakes. Thank you for your response. :)',
    buttons: window.markup.modalButtons.default
  });
}

function botcheck(username) {
  // On third and sub-sequent runs, we have an api key
  if (localStorage.botcheck_apikey) {
    return window.check(username);
  }

  // On second run, where we have a browser token (aka chrome key), but no API key
  const chromekey = localStorage.botcheck_chromekey;
  if (chromekey) {
    return window.getApiKey(chromekey).then(key => {
      if (key) {
        console.info('[botcheck] Setting api key to ', key);
        localStorage.botcheck_apikey = key;
        return window.check(username);
      }
      // Scenario where API key isn't truthy, browser token probably isn't registered,
      // so register token at /chromelogin & show twitter app auth screen again
      console.warn('[botcheck] API key response was', key, 'Re-registering browser token.');
      window.open(
        `https://ashbhat.pythonanywhere.com/chromelogin?token=${chromekey}`,
        'Authorize',
        'width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0'
      );
      return Promise.resolve({}); // so botcheck.then(...) works in this scenario
    });
  }

  // On first run, generate the browser token (aka chrome key)
  if (!localStorage.botcheck_chromekey) {
    console.info('[botcheck] No chromekey.. generating...');
    localStorage.botcheck_chromekey = window.generateToken();
  }

  // Since this is first run, register token at /chromelogin & show twitter app auth screen
  window.open(
    `https://ashbhat.pythonanywhere.com/chromelogin?token=${localStorage.botcheck_chromekey}`,
    'Authorize',
    'width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0'
  );

  return Promise.resolve({}); // so botcheck.then(...) works in this scenario
}
