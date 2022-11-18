const webpack = require('webpack');
const postcss = require('postcss');
const webpackConfig = require('./webpack.config');
const postcssConfig = require('./postcss.config');
const fs = require('node:fs');
const path = require('node:path');

const pages = [
  {
    html: 'button/index',
    source: 'button/button',
    style: 'button/button',
  },
  {
    html: 'gravity/index',
    source: 'gravity/gravity',
    style: 'gravity/gravity',
  },
  {
    html: 'handwriting/index',
    source: 'handwriting/main',
    style: '',
  },
  {
    html: 'wall/index',
    source: 'wall/wall',
    style: 'wall/wall',
  },
  {
    html: 'home/index',
    source: 'home/main',
    style: 'home/home',
  },
  {
    html: 'manifolds/index',
    source: 'manifolds/manifolds',
    style: '',
  },
];

pages.forEach(page => {
  console.log(`started compiling ${page.html}!`);
  if (page.html != '') {
    fs.mkdirSync(path.dirname(page.html), { recursive: true });
    let pageData = fs.readFileSync('_src/' + page.html + '.html');
    fs.writeFileSync(page.html + '.html', pageData);
  }

  let sourcePromise = new Promise((resolve, reject) => {
    if (page.source != '') {
      fs.mkdirSync(path.dirname(page.source), { recursive: true });
      webpack(webpackConfig(page.source), (err, stats) => {
        if (err) {
          console.log(err);
          reject();
        }
        if (stats.hasErrors()) {
          console.log(new Error(stats.compilation.errors.join('\n')));
          reject();
        }
        resolve();
      });
    } else {
      resolve();
    }
  });

  let stylePromise = new Promise((resolve, reject) => {
    if (page.style != '') {
      fs.mkdirSync(path.dirname(page.style), { recursive: true });
      postcss(postcssConfig.plugins)
        .process(fs.readFileSync('_src/' + page.style + '.css'))
        .then(result => {
          fs.writeFileSync(page.style + '.css', result.css);
          resolve();
        });
    } else {
      resolve();
    }
  });

  sourcePromise.then(() => {
    stylePromise.then(() => {
      console.log(`finished compiling ${page.html}!`);
    });
  });
});
