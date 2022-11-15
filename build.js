const webpack = require('webpack');
const postcss = require('postcss');
const webpackConfig = require('./webpack.config');
const postcssConfig = require('./postcss.config');
const fs = require('node:fs');

htmls = ['manifolds/index']

sources = ['manifolds/manifolds'];

styles = [];

// htmls = ['button/index', 'gravity/index', 'handwriting/index', 'wall/index', 'home/index', 'manifolds/index']

// sources = ['home/main', 'handwriting/main', 'gravity/gravity', 'wall/wall', 'button/button', 'manifolds/manifolds'];

// styles = ['home/home', 'gravity/gravity', 'wall/wall', 'button/button'];

htmls.forEach(element => {
  fs.writeFileSync(element + '.html', fs.readFileSync('_src/' + element + '.html'))
})

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
