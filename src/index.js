"use strict"

module.exports = function (opts) {
  var inlinePlugin = require('./md_items_inline')
    , hrefPlugin = require('./md_items_href')
    , citationPlugin = require('./md_citations')
    , documentBlockPlugin = require('./md_document_block')

  opts = opts || {};

  if (!opts.projectBaseURL) throw Error("Must pass projectBaseURL");
  if (!opts.resolveItemText) throw Error("Must pass resolveItemText");
  if (!opts.makeCitationText) throw Error("Must pass makeCitationText");

  return require('markdown-it')()
    .use(inlinePlugin, {
      projectBaseURL: opts.projectBaseURL,
      resolveItemText: opts.resolveItemText
    })
    .use(hrefPlugin, {
      projectBaseURL: opts.projectBaseURL
    })
    .use(citationPlugin, {
      projectBaseURL: opts.projectBaseURL,
      makeCitationText: opts.makeCitationText
    })
    .use(documentBlockPlugin, {
      projectBaseURL: opts.projectBaseURL,
      makeCitationText: opts.makeCitationText
    })
}
