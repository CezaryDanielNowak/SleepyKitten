import atom from 'atom-js';
import is from 'next-is';
import config from '../config';
import { post, errorHandler } from '../helpers';

const model = atom.setup({
  validation: {
    name: {
      'Please provide your name': is.string,
      'Please type at least 2 characters': (input) => is.string.minLen(input, 2, true)
    },
    email: {
      'Please provide your email address': is.string,
      'This is not a valid email address': is.string.isEmail
    },
    message: {
      'Please provide message': is.isString
    }
  },
  methods: {
    messageSent(resolve, reject) {
      post(`${config.backendURL}/contactus/`)
        .send({
          'name': model.get('name'),
          'email': model.get('email'),
          'message': model.get('message'),
          'g-recaptcha-response': model.get('captchaResponse')
        })
        .end((err, res) => {
          if (err) {
            errorHandler(err, res);
            reject();
          } else {
            resolve();
          }
        });
    }
  }
})();

export default model;
