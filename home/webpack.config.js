module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  output: {
    path: __dirname,
    filename: './main.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.svg'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: 'defaults',
                  },
                ],
                '@babel/preset-typescript',
              ],
            },
          },
        ],
      },
    ],
  },
};
