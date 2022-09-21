const browserify = require('browserify')
const babelify = require('babelify')
const tsify = require('tsify')
const fs = require('fs')

const targets = ['home', 'handwriting']

targets.forEach((target) => {
browserify()
  .plugin('tsify')
  .transform('babelify')
  .add(`typescript/${target}/main.ts`)
  .bundle()
  .pipe(fs.createWriteStream(`${target}/main.js`))
})
