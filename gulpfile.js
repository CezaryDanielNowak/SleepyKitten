'use strict';

const config = require('./config.js');
require('babel-polyfill');
const gulp = require('gulp');
const gutil = require('gulp-util');
const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');

const WATCH_OPTIONS = {
  interval: 600
};

const buildIndex = () => {
  return new Promise((resolve, reject) => {
    // build index.html file.
    const serverRendering = require('./gulp-tasks/_serverRendering.js');
    serverRendering
      .generateMarkup('/index.html', 'app.js')
      .then((fileContents) => {
        if (!fileContents.data) {
          throw new Error(`index.html build failure ${fileContents}`);
        }

        fs.writeFile(`${config.DESTINATION_DIR}/index.html`, fileContents.data, (err) => {
          if (err) {
            gutil.log('ERROR build-html: index.html', err);
            reject();
          } else {
            resolve();
          }
        });
      });
  });
};

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// === LINT ===
const eslintDirs = [
  'src/**/*.js',
  '!src/**/*.test.js',
  '!src/**/assets/**/*',
  '!src/packages/**/*',
  '!src/**/cv_models.*.js',
];

gulp.task('lint', () => {
  const eslint = require('gulp-eslint');
  return gulp.src(eslintDirs)
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('lint:watch', () => {
  setTimeout(() => gulp.start('lint'));
  return gulp.watch(eslintDirs, WATCH_OPTIONS, ['lint']);
});

// === WEBPACK ===
gulp.task('webpack', (callback) => require('./gulp-tasks/webpack')({
  watch: false,
  callback,
})());

gulp.task('webpack:watch', require('./gulp-tasks/webpack')({
  watch: true,
  callback: () => {
    // run watch at the end to get results faster
    gulp.start('lint:watch');
  }
}));

// === SCSS ===
gulp.task('scss', require('./gulp-tasks/scss')());

gulp.task('scss:watch', ['scss'], () => {
  return gulp.watch([
    `${config.SOURCE_DIR}/**/*.scss`
  ], WATCH_OPTIONS, ['scss']);
});

// === SERVER ===
gulp.task('server', require('./gulp-tasks/server')());

// === COPY ASSETS & BUILD HTML ===
const assetsDirs = [
  `${config.ASSETS_DIR}/**/*`,
  `${config.SOURCE_DIR}/components/assets/**/*`,
];
gulp.task('copy', () => {
  gulp.src(`${config.BASE_DIR}/node_modules/react-select/dist/**/*`)
    .pipe(gulp.dest(`${config.DESTINATION_DIR}/lib/react-select`));

  gulp.src(`${config.SHARED_FRONTEND_DIR}/packages/react-datepicker/*.css`)
    .pipe(gulp.dest(`${config.DESTINATION_DIR}/lib/react-datepicker`));

  gulp.src(`${config.BASE_DIR}/node_modules/inputmask/dist/min/inputmask/**/*`)
    .pipe(gulp.dest(`${config.DESTINATION_DIR}/lib/inputmask`));

  // copy everything from assets/
  return gulp.src(assetsDirs)
    .pipe(gulp.dest(config.DESTINATION_DIR));
});

gulp.task('copy:watch', ['copy'], () => {
  // NOTE:
  // "copy" and "copy:watch" are not called in development mode (watch) to speedup
  // the process. Files are served from /assets directory directly
  //
  if (config.ENV !== 'local') {
    return gulp.watch(assetsDirs, WATCH_OPTIONS, ['copy']);
  }
});

gulp.task('build-html', () => {
  // build html files.
  const serverRendering = require('./gulp-tasks/_serverRendering.js');
  serverRendering
    .getAllPages('app.js')
    .then((pages) => {
      Object.keys(pages).forEach((pageName) => {
        const fileContents = pages[pageName];
        let fileName = pageName.replace(/^\//, '');
        if (!fileName) {
          fileName = 'index.html';
        }
        if (/\.html$/.test(fileName)) {
          const filePath = `${config.DESTINATION_DIR}/${fileName}`;
          ensureDirectoryExistence(filePath);
          fs.writeFile(filePath, fileContents, (err) => {
            if (err) {
              gutil.log(`ERROR build-html: ${fileName}`, err);
            }
          });
        }
      });
    }, console.error);
});

gulp.task('build-html:index', () => {
  buildIndex();
});

// === CLEAN DIST ===
gulp.task('clean', () => {
  const command = `rm -rf ${config.DESTINATION_DIR}/*`;
  console.log(`[EXECUTE] ${command}`);
  childProcess.execSync(command, {
    stdio: 'pipe'
  });
});

// === MINIFY ===
gulp.task('minify-css', () => {
  const cssnano = require('gulp-cssnano');
  return gulp.src(`${config.DESTINATION_DIR}/**/*.css`)
    .pipe(cssnano())
    .pipe(gulp.dest(config.DESTINATION_DIR));
});

// === PUBLIC ===
gulp.task('watch', [
  'clean', 'webpack:watch', 'scss:watch'
], () => {
  gulp.start('copy:watch');
  gulp.start('server');
});

gulp.task('build', [
  'clean', 'webpack', 'lint', 'scss', 'copy'
], () => {
  gulp.start('build-html');
  gulp.start('minify-css');
});

gulp.task('init-component', () => {
  gulp.start(require('./gulp-tasks/init-component')('components'));
});

gulp.task('init-page', () => {
  gulp.start(require('./gulp-tasks/init-component')('pages'));
});
