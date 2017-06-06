import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import WebpackNotifierPlugin from 'webpack-notifier'
import cssnano from 'cssnano'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'

const defaultConfig = {
  stats: {
    assets: true,
    cached: false,
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    colors: true,
    errors: true,
    errorDetails: true,
    hash: false,
    modules: false,
    timings: true,
    version: false,
    warnings: true
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
      // {
      //   test: /\.js$/,
      //   loader: 'eslint-loader',
      //   exclude: [/node_modules/]
      // }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      debug: 'debug'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        eslint: {
          configFile: './.eslintrc'
        }
      }
    }),
    new WebpackNotifierPlugin()
  ],
  devtool: (isProd) ? false : 'eval-cheap-module-source-map',
  resolve: {
    extensions: ['.js']
  }
}

const serverConfig = Object.assign({}, defaultConfig, {
  name: 'server',
  target: 'node',
  entry: {
    app: './server/app.js'
  },
  output: {
    path: path.resolve('./build'),
    filename: 'server.js'
  },
  node: {
    fs: 'empty',
    net: 'empty'
  }
})

var clientConfig = Object.assign({}, defaultConfig, {
  name: 'public',
  target: 'web',
  entry: {
    app: './client/scripts/main.js'
  },
  output: {
    path: path.resolve('./build/public'),
    filename: 'app.js'
  },
  resolve: {
    alias: {
      'CSSPlugin': 'gsap/src/uncompressed/plugins/CSSPlugin',
      'TweenLite': path.resolve('node_modules', 'gsap/src/uncompressed/TweenLite.js'),
      'TweenMax': path.resolve('node_modules', 'gsap/src/uncompressed/TweenMax.js'),
      'TimelineLite': path.resolve('node_modules', 'gsap/src/uncompressed/TimelineLite.js'),
      'TimelineMax': path.resolve('node_modules', 'gsap/src/uncompressed/TimelineMax.js')
    }
  },
  module: {
    rules: defaultConfig.module.rules.concat({
      test: /\.scss?$/,
      loader: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          'css-loader?importLoaders=3',
          'postcss-loader',
          'sass-loader?sourceMap'
        ]
      })
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: [
        'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
        'image-webpack-loader?bypassOnDebug'
      ]
    })
  },
  plugins: defaultConfig.plugins.concat([
    new HtmlWebpackPlugin({
      template: 'client/index.html',
      path: 'public',
      filename: 'index.html',
      inject: true,
      cache: true
    }),
    new ExtractTextPlugin({
      filename: 'core.css',
      allChunks: true
    }),
    new CopyWebpackPlugin([
      { from: 'client/static', to: 'static' }]),
    new webpack.LoaderOptionsPlugin({
      options: {
        eslint: {
          configFile: './.eslintrc'
        },
        optipng: {
          optimizationLevel: 7
        },
        gifsicle: {
          interlaced: false
        },
        postcss: {
          plugins: [
            cssnano({
              autoprefixer: {
                add: true,
                remove: true,
                browsers: ['last 2 versions']
              },
              discardComments: {
                removeAll: true
              },
              discardUnused: false,
              mergeIdents: false,
              reduceIdents: false,
              safe: true,
              sourcemap: true
            })
          ]
        }
      }
    })
  ])
})

module.exports = [clientConfig, serverConfig]
