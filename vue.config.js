module.exports = {
  configureWebpack: config => {
    config.externals = {
      ...config.externals,
      "uxp": "commonjs2 uxp"
    };
  }
}
