module.exports = {
  mode: 'development',
  entry: './src/button.ts',
  output: {
    path: __dirname,
    filename: 'button.js',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
