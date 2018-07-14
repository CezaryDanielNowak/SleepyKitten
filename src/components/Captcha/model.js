import atom from 'atom-js';
import { loadScriptPool } from 'helpers';
import { get, errorHandler } from 'helpers/request';
import { getScript } from 'helpers/domHelper';

const model = atom({ captchaUrl: 'backend/contactus/' });

model.provide('sitekey', (done) => {
  get(model.get('captchaUrl'))
    .end((err, res) => {
      if (err) {
        return errorHandler(err, res);
      }

      loadScriptPool('grecaptcha.render', () => {
        // hl = language https://developers.google.com/recaptcha/docs/language
        getScript('//www.google.com/recaptcha/api.js?render=explicit&hl=en');
      }).then(() => {
        done(res.body.data.recaptcha_sitekey);
      });
    });
});

export default model;
