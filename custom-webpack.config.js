// custom-webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
              noquotes: true
            }
          }
        ]
      }
    ]
  }
};
