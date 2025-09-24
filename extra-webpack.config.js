// eslint-disable-next-line no-undef
module.exports = {
  output: {
    // eslint-disable-next-line no-undef
    filename: process.env.production ? '[id].[contenthash].bundle.js' : '[id].[hash].bundle.js',
  }
};


