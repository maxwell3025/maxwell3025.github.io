const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = file => {
  return {
    mode: 'development',
    entry: './_src/' + file + '.ts',
    output: {
      path: __dirname,
      filename: file +'.js',
    },
    resolve: {
      extensions: ['.ts', '.js', '.json']
    },
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: 'html-loader',
        },
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
  };
};
