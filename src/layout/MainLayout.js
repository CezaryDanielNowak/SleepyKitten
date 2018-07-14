import React from 'react';
import BaseComponent from 'components/BaseComponent';
import PageHeader from 'components/PageHeader';
import PageFooter from 'components/PageFooter';

export default class MainLayout extends BaseComponent {
  className = 'sk-MainLayout';

  render() {
    const contentClassName = {
      '__content': true
    };

    return (
      <div className={ this.rootcn() }>
        <PageHeader key="head" />
        <div key="body" className={ this.cn(contentClassName) }>
          { this.props.children }
        </div>
        <PageFooter key="foot" />
      </div>
    );
  }
}
