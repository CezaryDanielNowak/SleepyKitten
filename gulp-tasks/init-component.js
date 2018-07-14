'use strict';

const gutil = require('gulp-util');
const config = require('../config');
const template = require('lodash/template');
const fs = require('fs');
const path = require('path');
const readline = require('readline');


const TEMPLATES = {
  scss:
`.sk-<%= componentName %> {
  $module: &;

}
`,
  /* ========== */
  js:
`import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';

export default class <%= componentName %> extends BaseComponent {
  className = 'sk-<%= componentName %>';

  static propTypes = {
    children: PropTypes.node
  };

  static defaultProps = {
    children: ''
  };

  render() {
    return (
      <div
        { ...this.pickProps() }
        className={ this.rootcn() }
      >
        { this.props.children }
      </div>
    );
  }
}
`,
  /* ========== */
  package:
`{
  "main": "./<%= componentName %>.js"
}
`,
  /* ========== */
  jspage:
`import React from 'react';
import BasePage from 'pages/BasePage';
import PageTitle from 'components/PageTitle';

export default class <%= componentName %> extends BasePage {
  className = 'sk-<%= componentName %>';
  title = 'Page:<%= componentName %>';

  render() {
    return (
      <div className={ this.rootcn() }>
        <div className="sk-container">
          <PageTitle title={ this.title } />
          { this.props.children }
        </div>
      </div>
    );
  }
}
`,
};

Object.keys(TEMPLATES).forEach((key) => {
  TEMPLATES[key] = template(TEMPLATES[key]);
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = (directory) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const generateFiles = (inputComponentName) => {
    let filePath;
    const componentName = capitalizeFirstLetter(inputComponentName);
    const templateConfig = {
      componentName,
      directory,
    };
    const dist = path.resolve(config.SOURCE_DIR, directory, componentName);

    if (fs.existsSync(dist)) {
      return gutil.log(`ERROR: ${dist} ALREADY EXISTS!`);
    }
    fs.mkdirSync(dist);

    filePath = path.resolve(dist, `${componentName}.scss`);
    gutil.log(`GENERATING: ${filePath}`);
    fs.writeFileSync(filePath, TEMPLATES.scss(templateConfig));

    filePath = path.resolve(dist, `${componentName}.js`);
    gutil.log(`GENERATING: ${filePath}`);
    if (directory === 'pages') {
      fs.writeFileSync(filePath, TEMPLATES.jspage(templateConfig));
    } else {
      fs.writeFileSync(filePath, TEMPLATES.js(templateConfig));
    }
    filePath = path.resolve(dist, 'package.json');
    gutil.log(`GENERATING: ${filePath}`);
    fs.writeFileSync(filePath, TEMPLATES.package(templateConfig));
    return gutil.log('Done.');
  };

  return () => {
    rl.question('Insert component name: ', (answer) => {
      generateFiles(answer);
      rl.close();
      process.stdin.destroy();
    });
  };
};
