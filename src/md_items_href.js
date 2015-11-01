"use strict";

const TYPES = require('./types')
    , referenceRegex = /^@@([ntd])(\d+)$/


function transformHref(token, makeURL) {
  var hrefIndex
    , classIndex
    , match
    , linked

  for (var i = 0; i < token.attrs.length; i++) {
    if (token.attrs[i][0] === 'href') hrefIndex = i;
    if (token.attrs[i][0] === 'class') classIndex = i;
  }

  if (hrefIndex === undefined) return null;

  match = token.attrs[hrefIndex][1].match(referenceRegex);

  if (match) {
    let itemType = TYPES[match[1]]
      , itemID = match[2]
      , itemURL = makeURL(itemType, itemID)
      , className = 'ENInlineReference ENInlineReference-' + itemType

    token.attrs[hrefIndex][1] = itemURL

    if (classIndex !== undefined) {
      let oldClass = token.attrs[classIndex][1];
      token.attrs[classIndex][1] = oldClass + ' ' + className
    } else {
      token.attrs.push([ 'class', className ])
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
