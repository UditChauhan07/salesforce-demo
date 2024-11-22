const path = require('path');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i, // Process image files
        use: [
          {
            loader: 'file-loader', // Or 'url-loader' if you prefer
            options: {
              name: '[path][name].[ext]', // Output file name
              context: 'src', // Maintain the original directory structure
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true, // Skip optimization during development
              disable: false, // Disable optimization during production builds
              mozjpeg: {
                progressive: true,
                quality: 65, // Adjust quality to optimize
              },
              optipng: {
                enabled: true,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              svgo: {
                plugins: [
                  { removeViewBox: false },
                  { cleanupIDs: false },
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css', // Add content hash to filenames for caching
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    static: path.join(__dirname, 'dist'), // Serve static files from the dist directory
    compress: true,
    port: 3000, // Development server port
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: 'single', // Adds a runtime file to ensure better caching
  },
};
