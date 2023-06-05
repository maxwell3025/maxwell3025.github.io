"use strict";

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

const postcss = require('postcss');
const postcssConfig = require('./postcss.config');

const fs = require('fs');

const target = '../../gravity/'

new Promise((resolve, reject) =>
    webpack(webpackConfig, (err, stats) => {
        if(err){
            console.log(err);
            reject();
        }
        if(stats.hasErrors()){
            console.log(new Error(stats.compilation.errors.join('\n')));
            reject();
        }
        var logText = JSON.stringify(stats.toJson('verbose'), undefined, '    ');
        fs.writeFileSync('latest_build_log.json', logText);
        resolve();
    })
)

new Promise((resolve, reject) => {
    postcss(postcssConfig.plugins)
    .process(fs.readFileSync('gravity.css'))
    .then(result => 
        fs.writeFileSync(target + 'gravity.css', result.css)
    )

    resolve();
})

fs.copyFileSync('index.html', target + 'index.html')