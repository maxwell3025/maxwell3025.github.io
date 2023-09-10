module.exports = {
  mode: 'development',
  entry: './src/wall.ts',
  output: {
    path: __dirname,
    filename: 'wall.js',
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
