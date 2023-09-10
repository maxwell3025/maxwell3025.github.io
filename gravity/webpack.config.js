module.exports = {
  mode: 'development',
  entry: './src/gravity.ts',
  output: {
    path: __dirname,
    filename: 'gravity.js',
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
