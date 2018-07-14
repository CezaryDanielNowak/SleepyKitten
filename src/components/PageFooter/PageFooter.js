/* global YEAR_CONF */

import React from 'react';
import { Link } from 'react-router';
import BaseComponent from 'components/BaseComponent';

export default class PageFooter extends BaseComponent {
  className = 'sk-PageFooter';

  render() {
    return (
      <footer className={ this.rootcn`` }>
        <div className="sk-container sk-container--narrow">
          <div className={ this.cn`__copyrights` }>
            © { YEAR_CONF } Sleepy Kitten  |  All Rights Reserved
          </div>
        </div>
      </footer>
    );
  }
}
