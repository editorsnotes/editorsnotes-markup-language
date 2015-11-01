"use strict";

var getItemURL = require('./get_item_url')
  , regex = /^document @@d(\d+)$/

function createRule(md, projectBaseURL, makeBibliographyEntry) {
  return function enDocumentBlockMetaRule(state) {
    var blockTokens = state.tokens

    blockTokens.forEach(function (token) {
      if (token.type === 'container_document_open') {
        let match = token.info.trim().match(regex)
          , id = match[1]
          , url = getItemURL(projectBaseURL, 'document', id)
          , citation = { id, url }
          , documentText = makeBibliographyEntry(citation, false)

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
        return (
          '<section class="ENDocumentBlock">' +
            '<div>' +
              '<a href="' + tokens[idx].meta.enItemURL + '" class="ENDocumentBlock--Citation">' +
              tokens[idx].meta.enCitationText +
              '</a>' +
            '</div>'
        )
      } else {
        return '</section>';
      }
    }
  });

  md.core.ruler.push(
    'en_document_block_meta',
    createRule(md, opts.projectBaseURL, opts.makeBibliographyEntry)
  )
}
