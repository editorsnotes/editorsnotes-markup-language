"use strict"

module.exports = function (opts) {
  var inlinePlugin = require('./md_inline_items')
    , hrefPlugin = require('./md_items_href')

  opts = opts || {};

  if (!opts.projectBaseURL) {
    throw Error("Must pass projectBaseURL");
  }

  if (!opts.resolveItemText) {
    throw Error("Must pass resolveItemText");
  }

  return require('markdown-it')()
    .use(inlinePlugin, {
      projectBaseURL: opts.projectBaseURL,
      resolveItemText: opts.resolveItemText
    })
    .use(hrefPlugin, {
      projectBaseURL: opts.projectBaseURL
    })
}
