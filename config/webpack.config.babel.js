import path from 'path'
import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

const sources = './app/assets/js'

module.exports = {
  entry: {
    commons: `${sources}/commons`,
    index: `${sources}/index`,
    submit: `${sources}/submit`,
    notice: `${sources}/notice`
  },
  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                minimize: true
              }
            }
          ]
        })
      },
      {
        test: /\.s[a|c]ss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                minimize: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true
              }
            }
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(png|jpe?g|gif|svg|ttf|woff2?|eot)$/,
        loader: 'file-loader',
        options: { name: '[name].[ext]?[hash]' }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, '..', 'public'),
    watchOptions: {
      poll: true
    },
    host: '0.0.0.0',
    port: process.env.DEVSERVER_PORT,
    proxy: {
      '**': 'http://localhost:' + process.env.APP_INTERNAL_PORT
    }
  },
  devtool: '#eval-source-map',
  plugins: [
    new ExtractTextPlugin('bundle.css')
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"production"' }
    }),
    /*
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.js'
    }),
    */
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: { warnings: false }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.LoaderOptionsPlugin({ minimize: true })
  ])
}
