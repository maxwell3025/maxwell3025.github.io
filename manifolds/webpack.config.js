module.exports = {
  mode: 'development',
  entry: './src/manifolds.ts',
  output: {
    path: __dirname,
    filename: 'manifolds.js',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
