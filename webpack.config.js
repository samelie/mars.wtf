const { join, resolve } = require("path");

const constants = require("./webpack.constants");
const colors = require("colors");
const _ = require("lodash");

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const UglifyJsWebpackPlugin = require("uglifyjs-webpack-plugin");
const Dotenv = require("dotenv-webpack");

/*const DefineENV = new webpack.DefinePlugin({
  "process.env.NODE_ENV": JSON.stringify(
    process.env.NODE_ENV || "development"
  ),
});

const CSS_LOADERS = {
  css: "",
  scss: "!sass-loader",
};

const ENV_VARS = {
  APP_HOST: '"https://mars.wtf/"',
  APP_DOMAIN: '"/mars.wtf"',
  ASSETS_DIR:
    '"https://storage.googleapis.com/samrad-mars/www-assets/assets/"',
  REMOTE_ASSETS_DIR:
    '"https://storage.googleapis.com/samrad-mars/www-assets/assets/"',
};
*/
module.exports = env => {
  const isDev = !!env.dev;
  const isProd = !!env.prod;
  const isDebug = !!process.env.DEBUG;
  const isTest = !!env.test;

  console.log("--------------");
  console.log(colors.blue(`isDev: ${isDev}`));
  console.log(colors.blue(`isProd: ${isProd}`));
  console.log("--------------");
  const addPlugin = (add, plugin) => (add ? plugin : undefined);
  const ifDev = plugin => addPlugin(env.dev, plugin);
  const ifProd = plugin => addPlugin(env.prod, plugin);
  const ifNotTest = plugin => addPlugin(!env.test, plugin);
  const removeEmpty = array => array.filter(i => !!i);

  const stylesLoaders = () => {
    const sassLoader = {
      loader: "sass-loader",
      options: {
        sourceMap: isDev,
        includePaths: [
          constants.NODE_MODULES_DIR,
          join(constants.FRONTEND, "base"),
          join(constants.FRONTEND, "base", "vars"),
          join(constants.FRONTEND, "base", "site"),
        ],
      },
    };

    const postcssLoader = {
      loader: 'postcss-loader',
      options: {
        sourceMap: isDev,
        ident: 'postcss',
        plugins: loader => [
          require('postcss-easings'),
          require('autoprefixer')({
            browsers: ['last 2 versions', 'Safari 8', 'ie > 9'],
          }),
        ],
      },
    };

    const CSS_LOADERS = isProd
      ? [
          {
            test: /\.(css|scss)$/,
            exclude: /node_modules/,
            use: ExtractTextPlugin.extract({
              fallback: "style-loader",
              use: [
                {
                  loader: 'css-loader',
                },
                {
                  ...sassLoader,
                },
              ],
            }),
          },
        ]
      : [
          {
            test: /\.(css|scss)$/,
            exclude: [/node_modules/],
            use: [
            'style-loader',
              {
                  loader: 'css-loader',
                },
                {
                  ...sassLoader,
                },
            ],
          },
        ];

    console.log(colors.yellow(`-- Css Loaders --`));
    console.log(CSS_LOADERS);
    console.log(colors.yellow(`--  --`));
    return CSS_LOADERS;
  };

  return {
    entry: {
      app: "./app.js",
    },
    mode: isDev ? "development" : "production",
    node: {
      dns: "mock",
      net: "mock",
    },
    optimization: {
      minimizer: ifProd([
        new UglifyJsWebpackPlugin({
          parallel: true, // uses all cores available on given machine
          sourceMap: false,
        }),
      ]),
      splitChunks: {
        cacheGroups: {
          default: {
            chunks: "initial",
            name: "bundle",
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            chunks: "initial",
            name: "vendor",
            priority: -10,
            test: /node_modules\/(.*)\.js/,
          },
        },
      },
    },
    output: {
      filename: "bundle.[name].[hash].js",
      path: resolve(__dirname, constants.DIST),
      publicPath: "/",
      pathinfo: !env.prod,
    },
    context: constants.SRC_DIR,
    devtool: env.prod ? "source-map" : "eval",
    devServer: {
      host: "0.0.0.0",
      stats: {
        colors: true,
      },
      contentBase: resolve(__dirname, constants.DIST),
      historyApiFallback: !!env.dev,
      port: 8081,
    },
    bail: env.prod,
    resolve: {
      extensions: [".js", ".jsx"],
    },
    node: {
      fs: "empty",
      child_process: "empty",
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          exclude: /node_modules/,
          loader: "svg-inline-loader",
        },
        {
          loader: "url-loader?limit=100000-loader",
          exclude: /node_modules/,
          test: /\.(gif|jpg|png)$/,
        },
        {
          loader: "url-loader?limit=100000-loader",
          exclude: /node_modules/,
          test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
          include: [`${join(constants.ASSETS_DIR, "/font/")}`],
        },
        {
          test: /\.json$/,
          exclude: /node_modules/,
          loader: "json-loader",
        },
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(glsl|vert|frag)$/,
          loader: "shader-loader",
          exclude: /node_modules/,
        },
      ].concat(stylesLoaders()),
    },
    plugins: removeEmpty([
      ifDev(new webpack.HotModuleReplacementPlugin()),
      new HtmlWebpackPlugin({
        assetsUrl: `""`,
        env: process.env,
        template: "./index.ejs", // Load a custom template (ejs by default see the FAQ for details)
      }),
      ifProd(
        new ExtractTextPlugin({
          filename: "css/main.css",
          disable: false,
          allChunks: true,
        })
      ),
      ifProd(
        new webpack.LoaderOptionsPlugin({
          minimize: true,
          debug: false,
          quiet: true,
        })
      ),
      new Dotenv({
        path: isDev ? ".dev.env" : ".prod.env",
      }),
    ]),
  };
};
