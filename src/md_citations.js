"use strict";

var parseLinkLabel = require('markdown-it/lib/helpers/parse_link_label')
  , citeRegex = /(.* )?@@d(\d+)(, .*)?/
  , impliedDocumentCiteRegex = /^\[[^@;]+\]$/


function getCitations(label, makeURL) {
  var citations

  citations = label
    .split(';')
    .map(function (ref) { return ref.match(citeRegex) })

  // Every semicolon separated citation must be valid, or else null
  if (!citations.every(function (match) { return match })) return null;

  return citations
    .map(function (match) {
      var prefix = match[1]
        , id = match[2]
        , url = makeURL(id)
        , locator = match[3]

      return { prefix, id, url, locator }
    });
}


function citationTokens(state, citations, makeInlineCitation, push) {
  let tokens = push ? undefined : []
    , token
    , inlineCitation

  function makeToken(type, tag, nesting) {
    if (push) {
      return state.push(type, tag, nesting);
    } else {
      let token = new state.Token(type, tag, nesting);
      tokens.push(token);
      return token;
    }
  }

  inlineCitation = makeInlineCitation(citations);

  // Insert citation tokens for each citation
  // TODO: maybe be more sophisticated about this?
  token = makeToken('en_cite_section_open', 'cite', 1);
  debugger;
  token.meta = { citations }

  if (inlineCitation.prefix) {
    token = makeToken('text', '', 0);
    token.content = inlineCitation.prefix;
  }

  inlineCitation.citations.forEach(function (citeText, idx) {
    token = makeToken('en_cite_open', 'a', 1);
    token.attrs = [
      [ 'href', citations[idx].url ],
      [ 'class', 'ENInlineReference ENInlineReference-document' ]
    ];

    token.meta = {
      enItemType: 'document',
      enItemID: citations[idx].id,
      enItemURL: citations[idx].url,
    }

    token = makeToken('text', '', 0);
    token.content = citeText.trim();

    token = makeToken('en_cite_close', 'a', -1);

    if (idx < citations.length - 1) {
      token = makeToken('text', '', 0);
      token.content = inlineCitation.delimiter;
    }
  });

  token = makeToken('en_cite_section_close', 'cite', -1);

  return tokens;
}


function createBlockquoteRule(md, projectBaseURL, makeInlineCitation) {
  return function enBlockquoteCitations(state) {
    var blockTokens = state.tokens
      , currentBlockquote = {}
      , blockquotes = []
      , _citationBlockDocumentData = null

    blockTokens.forEach(function (token, idx) {
      if (token.type === 'container_document_open') {
        _citationBlockDocumentData = token.meta;
      }

      if (token.type === 'container_document_closed') {
        _citationBlockDocumentData = null;
      }

      if (token.type === 'blockquote_open') {
        currentBlockquote[token.level] = idx;
      }

      if (token.type === 'blockquote_close') {
        blockquotes.push([currentBlockquote[token.level], idx, _citationBlockDocumentData]);
      }
    });

    blockquotes.forEach(function (data) {
      var blockStart = data[0]
        , blockStop = data[1]
        , citationBlockDocumentData = data[2]
        , inCitationBlock = citationBlockDocumentData !== null
        , containsClosingCitation

      // FIXME figure out the best number on this first check. It should just
      // prevent things like one line with "> [@@d1]"
      containsClosingCitation = (
        (blockStop - blockStart) > 3 &&
        blockTokens[blockStop - 3].type === 'paragraph_open' &&
        blockTokens[blockStop - 1].type === 'paragraph_close' &&
        blockTokens[blockStop - 2].type === 'inline' &&
        blockTokens[blockStop - 2].children &&
        (
          !inCitationBlock &&
          blockTokens[blockStop - 2].children.length === 5 &&
          blockTokens[blockStop - 2].children[0].type === 'en_cite_section_open' &&
          blockTokens[blockStop - 2].children[1].type === 'en_cite_open' &&
          blockTokens[blockStop - 2].children[2].type === 'text' &&
          blockTokens[blockStop - 2].children[3].type === 'en_cite_close' &&
          blockTokens[blockStop - 2].children[4].type === 'en_cite_section_close'
        )

        ||

        (
          inCitationBlock &&
          blockTokens[blockStop - 2].children.length === 1 &&
          blockTokens[blockStop - 2].children[0].type === 'text' &&
          impliedDocumentCiteRegex.test(blockTokens[blockStop - 2].children[0].content)
        )
      );

      if (!containsClosingCitation) return;

      // FIXME: should state.parentType be changed? It's not documented
      // anywhere but it seems like markdown-it block parsers normally
      // do that.
      blockTokens[blockStop - 3].type = 'blockquote_citation_footer_open';
      blockTokens[blockStop - 3].tag = 'footer';
      blockTokens[blockStop - 1].type = 'blockquote_citation_footer_close';
      blockTokens[blockStop - 1].tag = 'footer';

      if (inCitationBlock) {
        let citations = [{
          id: citationBlockDocumentData.enItemID,
          url: citationBlockDocumentData.enItemURL,
          locator: blockTokens[blockStop - 2].children[0].content.slice(1, -1)
        }]

        blockTokens[blockStop - 2].children = citationTokens(state, citations, makeInlineCitation);
      }
    });
  }
}


function createInlineCitationRule(md, projectBaseURL, makeInlineCitation) {
  var makeURL = require('./get_item_url').bind(null, projectBaseURL, 'document')

  return function enInlineCitations(state) {
    var max = state.posMax
      , labelStart
      , labelEnd
      , label
      , citations

    // Continue only if starting with a link label
    if (state.src[state.pos] !== '[') return false;

    labelStart = state.pos + 1;
    labelEnd = parseLinkLabel(state, state.pos, true);

    // No closing link label; stop
    if (labelEnd < 0) return false;

    // Skip if this is [label](link)
    if (state.src[labelEnd + 1] === '(') return false;

    // This will be the text between the square brackets
    label = state.src.slice(labelStart, labelEnd);

    // Only continue if the label is a citation
    if (!citeRegex.test(label)) return false;

    citations = getCitations(label, makeURL);

    // If every citation is not formatted correctly, stop
    if (!citations) return false;

    // Advance state past the opening bracket, up to the last char of the label
    state.pos = labelStart;
    state.posMax = labelEnd;

    // Push citation tokens into state
    citationTokens(state, citations, makeInlineCitation, true);

    // Advance state past the closing ']'
    state.pos = labelEnd + 1;
    state.posMax = max + 1;
    return true;
  }
}


module.exports = function (md, opts) {
  opts = opts || {};

  // Inserted before link so that there won't be any conflicts
  md.inline.ruler.before(
    'link',
    'en_inline_citations',
    createInlineCitationRule(md, opts.projectBaseURL, opts.makeInlineCitation)
  );

  md.core.ruler.push(
    'en_blockquote_citations',
    createBlockquoteRule(md, opts.projectBaseURL, opts.makeInlineCitation)
  )
}
