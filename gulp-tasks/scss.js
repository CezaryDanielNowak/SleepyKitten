'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const sassBulk = require('gulp-sass-bulk-import');
const mmq = require('gulp-merge-media-queries');
const sassInlineImage = require('sass-inline-image');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const rucksack = require('rucksack-css');
const lost = require('lost');
const config = require('../config');

const sassConfig = {};
const postProcessors = [
  rucksack(),
  lost(),
  autoprefixer({
    remove: false,
    browsers: ['last 2 versions', '> 1%']
  })
];

module.exports = () => {
  return () => {
    let task = gulp.src(`${config.SOURCE_DIR}/*.scss`);

    task = task
    .pipe(sassBulk())
    .pipe(
      sass(sassConfig)
      .on('error', sass.logError)
    );

    task = task
    .pipe(mmq())
    .pipe(sass({
      functions: sassInlineImage()
    }))
    .pipe(postcss(postProcessors))
    .pipe(gulp.dest(config.DESTINATION_DIR));

    return task;
  };
};
