"use strict"

module.exports = function (opts) {
  var inlinePlugin = require('./md_items_inline')
    , hrefPlugin = require('./md_items_href')
    , citationPlugin = require('./md_citations')
    , documentBlockPlugin = require('./md_document_block')

  opts = opts || {};

  if (!opts.projectBaseURL) throw Error("Must pass projectBaseURL");
  if (!opts.resolveItemText) throw Error("Must pass resolveItemText");
  if (!opts.makeInlineCitation) throw Error("Must pass makeInlineCitation");
  if (!opts.makeBibliographyEntry) throw Error("Must pass makeBibliographyEntry");

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
      makeInlineCitation: opts.makeInlineCitation
    })
    .use(documentBlockPlugin, {
      projectBaseURL: opts.projectBaseURL,
      makeBibliographyEntry: opts.makeBibliographyEntry
    })
}
