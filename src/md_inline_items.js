"use strict";

/* eslint camelcase:0 no-lone-blocks:0 */

/*
 * Markdown-it extension to allow inline mentions of Editors' Notes topics
 * and notes with the syntax @@t(topic_id) or @@n(note_id), respectively.
 *
 * The extension takes two options:
 *   1. projectBaseURL (string): the base URL of the project, ending with a slash
 *   2. resolveItemText (function): a function that will return the text content
 *      of the anchor for a linked item. This function is passed two arguments:
 *      the type of item (either 'topic' or 'note'), and the URL of the item
 *      derived from the type, projectBaseURL, and id. This function _must_ be
 *      synchronous.
 */

const TYPES = require('./types')

function render(tokens, idx) {
  var token = tokens[idx]
    , itemType = token.meta.type
    , href = token.meta.url

  return (
    '<a ' +
      'class="en-item en-item-' + itemType + '" ' +
      'rel="' + itemType + '" ' +
      'href="' + href + '"' +
    '>' + token.content + '</a>'
  )
}

function createRule(md, projectBaseURL, resolveItemText) {
  var getItemURL = require('./get_item_url')
    , regex = /@@([nt])(\d+)/

  function split(text, level, Token) {
    var nodes = []
      , lastPos = 0

    text.replace(regex, function (match, type, id, offset) {
      // Add text before the mention
      if (offset > lastPos) {
        let token = new Token('text', '', 0);
        token.content = text.slice(lastPos, offset);
        nodes.push(token);
      }

      // Add the mention
      {
        let token = new Token('inline_en_ref', '', 0)
          , itemType = TYPES[type]
          , url = getItemURL(projectBaseURL, itemType, id)

        token.content = resolveItemText(itemType, url);
        token.meta = { url: url, type: itemType }
        nodes.push(token);
      }

      // Move past the last position of the match
      lastPos = offset + match.length;
    });

    // Add text after the mention
    if (lastPos < text.length) {
        let token = new Token('text', '', 0);
        token.content = text.slice(lastPos);
        nodes.push(token);
    }

    return nodes;
  }

  return function enInlineReferenceParser(state) {
    var blockTokens = state.tokens
      , tokens
      , currentToken

    for (var j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== 'inline') continue;

      tokens = blockTokens[j].children;

      for (var i = tokens.length - 1; i >= 0; i--) {
        currentToken = tokens[i]

        // Skip text of links
        if (currentToken.type === 'link_close') {
          i--;
          while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
            i--;
          }
          continue;
        }

        if (currentToken.type === 'text' && regex.test(currentToken.content)) {
          blockTokens[j].children = tokens = md.utils.arrayReplaceAt(
            tokens, i, split(currentToken.content, currentToken.level, state.Token)
          );
        }
      }
    }
  }
}

module.exports = function (md, opts) {
  opts = opts || {};

  md.core.ruler.push(
    'inline_en_ref',
    createRule(md, opts.projectBaseURL, opts.resolveItemText)
  )
  md.renderer.rules.inline_en_ref = render
}
