"use strict";

const TYPES = require('./types')
    , referenceRegex = /^@@([ntd])(\d+)$/


function transformHref(token, makeURL) {
  var hrefIndex
    , relIndex
    , match
    , linked

  for (var i = 0; i < token.attrs.length; i++) {
    if (token.attrs[i][0] === 'href') hrefIndex = i;
    if (token.attrs[i][0] === 'rel') relIndex = i;
  }

  if (hrefIndex === undefined) return null;

  match = token.attrs[hrefIndex][1].match(referenceRegex);

  if (match) {
    let itemType = TYPES[match[1]]
      , itemID = match[2]
      , itemURL = makeURL(itemType, itemID)
      , rel = 'http://editorsnotes.org/v#' + itemType

    token.attrs[hrefIndex][1] = itemURL

    if (relIndex !== undefined) {
      let oldRel = token.attrs[relIndex][1];
      token.attrs[relIndex][1] = oldRel + ' ' + rel;
    } else {
      token.attrs.push([ 'rel', rel ])
    }

    linked = {
      enItemType: itemType,
      enItemID: itemID,
      enItemURL: itemURL
    }
  } else {
    linked = null;
  }

  return linked;
}

function createRule(md, projectBaseURL) {
  var makeURL = require('./get_item_url').bind(null, projectBaseURL)

  return function enItemsHref(state) {
    state.tokens.forEach(function (blockToken) {
      if (blockToken.type === 'inline' && blockToken.children) {
        blockToken.children.forEach(function (token, idx) {
          var type = token.type;
          if (type === 'link_open') {
            let linkedEnItem = transformHref(token, makeURL);
            if (linkedEnItem) {
              blockToken.children[idx + 1].meta = linkedEnItem;
            }
          }
        });
      }
    });
  }
}

module.exports = function (md, opts) {
  opts = opts || {};

  md.core.ruler.after(
    'inline',
    'href_en_ref',
    createRule(md, opts.projectBaseURL)
  )
}
