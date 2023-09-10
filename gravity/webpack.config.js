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
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader'
          }
        ]
      }
    ],
  },
};
