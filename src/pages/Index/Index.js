import React from 'react';
import BasePage from 'pages/BasePage';
import PageTitle from 'components/PageTitle';

export default class Index extends BasePage {
  className = 'sk-Index';

  render() {
    return (
      <div className={ this.rootcn`` }>
        <div className="sk-container">
          <PageTitle
            title="Sleepy Kitten"
          />
          <p className="sk-p">
            :)
          </p>
          
        </div>
      </div>
    );
  }
}
