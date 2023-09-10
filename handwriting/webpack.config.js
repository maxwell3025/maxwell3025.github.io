module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  output: {
    path: __dirname,
    filename: 'main.js',
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
