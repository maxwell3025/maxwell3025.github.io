const webpack = require('webpack');
const postcss = require('postcss');
const webpackConfig = require('./webpack.config');
const postcssConfig = require('./postcss.config');
const fs = require('node:fs');

sources = ['home/main', 'handwriting/main'];

styles = ['home/home'];

sources.forEach(element => {
  webpack(webpackConfig(element), (err, stats) => {
    if (err) {
      console.log(err);
    }
    if (stats.hasErrors()) {
      console.log(new Error(stats.compilation.errors.join('\n')));
    }
  });
});

styles.forEach(element => {
  postcss(postcssConfig.plugins)
    .process(fs.readFileSync('_src/' + element + '.css'))
    .then(result => {
      fs.writeFileSync(element + '.css', result.css);
    });
});
