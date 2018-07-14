import React from 'react';
import BasePage from 'pages/BasePage';
import { asset } from 'helpers';

export default class ErrorPage extends BasePage {
  className = 'sk-ErrorPage';
  title = 'Error';

  render() {
    return (
      <div className={ this.rootcn`sk-container` }>
        <img alt="404 Error" src={ asset`img/404.png` } className={ this.cn('__img') } />
      </div>
    );
  }
}
