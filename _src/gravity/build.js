"use strict";

const webpack = require('webpack');
const fs = require('fs');

const webpackConfig = require('./webpack.config');

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