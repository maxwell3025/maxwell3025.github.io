const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = file => {
  return {
    mode: 'development',
    entry: './_src/' + file + '.ts',
    output: {
      path: __dirname,
      filename: file + '.js',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', 'svg'],
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          issuer: /\.[jt]sx?$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      name: 'removeViewBox',
                      active: false,
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.html$/i,
          loader: 'html-loader',
        },
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
                  '@babel/preset-react',
                ],
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
  };
};
