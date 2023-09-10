"use strict";

module.exports = {
    mode: 'development',
    entry: './gravity.ts',
    output: {
      path: __dirname + '/../../gravity/',
      filename: 'gravity.js',
    },
    resolve: {
      extensions: ['.js', '.ts'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-typescript'],
              },
            },
          ],
        },
      ],
    },
}