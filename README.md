# Sleepy Kitten


## Installation
- install `git`
- [install `NodeJS LTS (6.9 or 8.9)`](https://nodejs.org/en/download/package-manager/)
- [Install `Yarn`](https://yarnpkg.com/lang/en/docs/install/)
- Install global nodejs dependencies (sudo):
```
npm install -g node-gyp
npm install -g gulp-cli
```

- Install local dependencies (no-sudo):
```
yarn install
```

## Installation Check
```
git --version // any
node --version // latest LTS (6.9, 8.9)
yarn --version // any
yarn list --check-files // no errors
```

### $ `make start`
File serving + building SCSS, babel etc. Local use only!

### $ `make build`
Build website into `dist/` directory.  css, js files are combined and compressed.

### $ `make server`
Server is started. No watch/rebuild is performed.


#### Automated component creation:
to add new component:
$ `make init-component`

to add new page:
$ `make init-page`

## Server-side rendering
Server-side rendering is working when `server` or `start` task is running.
Please references to `window` or `document` only in `componentDidMount`. Global object in webpack is called `global`, feel free to use it instead of `window`.

## Configs
There are two config files:
- `frontend/config.js` (for server anside)
Which can be extended by local config if needed:
- `frontend/config.local.js`

# Architecture:
Our architecture is based on three major areas:
- (M) atom.js + superagent for models and data handling
- (V) React for views and UI interactions.
- (C) react-router for routing and server-side rendering.

# Styles
We are using BEM in following convention
```css
/* React component */
.sk-SomeComponent

/* React component with modifier */
.sk-SomeComponent--ultra-wide

/* Element in component */
.sk-SomeComponent__element

/* Element with modifier */
.sk-SomeComponent__element--blue

/* element, that is not a part of React component (lower case, not recommended but easy to use for frequently used classNames like sk-container or sk-or) */
.sk-some-element__button--modifier
```

## Styles in React components:
```js
class Xyz extends BaseComponent {
  className = "sk-Xyz";

  render() {
    return <div className={...}>
  }
}

/* className: */
this.cn('some-classname')  // "sk-Xyz some-classname"

this.cn('--some-modifier') // "sk-Xyz sk-Xyz--some-modifier"

this.cn('__element')       // "sk-Xyz sk-Xyz__element"

this.cn`__element`       // "sk-Xyz sk-Xyz__element"

this.cn({
  '__element': true,
  '--modifier': true,
  'bootstrap-class': true
})                         // "sk-Xyz sk-Xyz__element sk-Xyz--modifier bootstrap-class"

```
