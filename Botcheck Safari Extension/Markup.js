/* eslint-disable no-unused-vars */

const markup = {
  actionItem: html`
    <div class="ProfileTweet-action ProfileTweet-action--botcheck js-toggleState">
      <button
        type="button"
        class="EdgeButton EdgeButton--tertiary EdgeButton--xsmall button-text"
      >
        <div>
          <div class="botcheck-show-loading botcheck-spinner botcheck-hide"></div>
          <span class="botcheck-spinner-text">Botcheck.me</span>
        </div>
      </button> 
    </div>
  `,
  resultModal: html`
    <div id="botcheck-dialog" class="modal-container botcheck-modal-close botcheck-hide">
      <div class="modal" id="botcheck-dialog-dialog" role="alertdialog">
        <div class="modal-content" role="document"></div>    
      </div>
    </div>
  `,
  modalContent: html`
    <div class="modal-header">
      <h3 class="modal-title" id="botcheck-dialog-header">${'header'}</h3>
    </div>

    <button
      type="button"
      class="modal-btn modal-close js-close botcheck-modal-close"
      aria-controls="botcheck-dialog-dialog"
      aria-describedby="botcheck-dialog-body"
    >
      <span class="Icon Icon--close Icon--medium botcheck-modal-close">
        <span class="visuallyhidden">Close</span>
      </span>
    </button>

    <div class="modal-body" id="botcheck-dialog-body">${'body'}</div>
    
    <div class="modal-footer" id="botcheck-dialog-footer">
      <div class="botcheck-flex botcheck-flex-grow">
        <a href="https://medium.com/@robhat/identifying-propaganda-bots-on-twitter-5240e7cb81a9" target="_blank">How this works</a> 
        &nbsp;&bull;&nbsp;
        <a href="http://twitter.com/theashbhat" target="_blank">Follow us for updates</a>
      </div>
      <div class="botcheck-flex">
        ${'buttons'}
      </div>
    </div>
  `,
  modalButtons: {
    positive: html`
      <button class="EdgeButton EdgeButton--secondary botcheck-modal-disagree" data-botcheck-screen-name="${'screenName'}" data-botcheck-prediction="true">Disagree</button>
      <button class="EdgeButton EdgeButton--secondary botcheck-modal-share" data-botcheck-screen-name="${'screenName'}">Share</button>
      <button class="EdgeButton EdgeButton--primary botcheck-modal-close">Close</button>
    `,
    negative: html`
      <button class="EdgeButton EdgeButton--secondary botcheck-modal-disagree" data-botcheck-screen-name="${'screenName'}" data-botcheck-prediction="false">Disagree</button>
      <button class="EdgeButton EdgeButton--primary botcheck-modal-close">Close</button>
    `,
    default: '<button class="EdgeButton EdgeButton--primary botcheck-modal-close">Close</button>'
  },
  modalHeader: {
    positive: 'Propaganda Bot like patterns found',
    negative: 'Propaganda Bot like patterns not found'
  },
  modalBody: html`
    <div class="botcheck-flex">
      <div class="botcheck-flex-shrink">
        <img src="${'imgData'}" alt="@${'screenName'} profile image" class="botcheck-profile-image" /> 
      </div>
      <div class="botcheck-flex-grow">
        ${'message'}
      </div>
    </div>  
  `,
  modalMessage: {
    positive: html`
        Our model has classified <strong>@${'screenName'}</strong> to exhibit patterns 
        conducive to a political bot or highly moderated account.
    `,
    negative: html`
        Our model finds that <strong>@${'screenName'}</strong> does not 
        exhibit patterns conducive to propaganda bots or moderated behavior 
        conducive to political propaganda accounts.
    `
  }
};

// Usage:
// var templateFn = html`Hello ${"foo"}!`;
// templateFn({ foo: "World" }); // "Hello World!"
function html(strings, ...keys) {
  return function(...values) {
    if (!values) {
      return '';
    }
    const dict = values[values.length - 1] || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  };
}
