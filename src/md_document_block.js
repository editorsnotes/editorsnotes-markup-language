"use strict";

var getItemURL = require('./get_item_url')
  , regex = /^document (\d+)$/

function createRule(md, projectBaseURL, makeCitationText) {
  return function enDocumentBlockMetaRule(state) {
    var blockTokens = state.tokens

    blockTokens.forEach(function (token) {
      if (token.type === 'container_document_open') {
        let match = token.info.trim().match(regex)
          , id = match[1]
          , url = getItemURL(projectBaseURL, 'document', id)
          , citation = { id, url }
          , documentText = makeCitationText([citation], false)

        token.meta = {
          enCitationText: documentText,
          enItemType: 'document',
          enItemID: id,
          enItemURL: url
        }
      }
    })
  }
}

module.exports = function (md, opts) {

  opts = opts || {};

  md.use(require('markdown-it-container'), 'document', {
    validate: function (params) {
      return params.trim().match(regex)
    },
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '<div class="doc-block"><div class="doc">' + tokens[idx].meta.enCitationText + '</div>';
      } else {
        return '</div>';
      }
    }
  });

  md.core.ruler.push(
    'en_document_block_meta',
    createRule(md, opts.projectBaseURL, opts.makeCitationText)
  )
}
