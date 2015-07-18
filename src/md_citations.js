"use strict";

var parseLinkLabel = require('markdown-it/lib/helpers/parse_link_label')
  , citeRegex = /(.* )?@@d(\d+)(, .*)?/


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
        , documentURL = makeURL(match[2])
        , locator = match[3]

      return { prefix, documentURL, locator }
    });
}

function createRule(md, projectBaseURL, makeCitationText) {
  var makeURL = require('./get_item_url').bind(null, projectBaseURL, 'document')

  return function enCitations(state) {
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

    label = state.src.slice(labelStart, labelEnd);

    if (!citeRegex.test(label)) return false;

    citations = getCitations(label, makeURL);

    // If every citation is not formatted correctly, stop
    if (!citations) return false;

    // Advance state past the opening bracke, up to the last char of the label
    state.pos = labelStart;
    state.posMax = labelEnd;

    // Insert citation tokens for each citation
    // TODO: maybe be more sophisticated about this?
    citations.forEach(function (citation) {
      var token

      token = state.push('en_cite_open', 'cite', 1);

      token = state.push('text', '', 0);
      token.content = makeCitationText(citation);

      token = state.push('en_cite_close', 'cite', -1);
    });

    // Advance state past the closing ']'
    state.pos = labelEnd + 1;
    state.posMax = max;
  }
}

module.exports = function (md, opts) {
  opts = opts || {};

  // Inserted before link so that there won't be any conflicts
  md.inline.ruler.before(
    'link',
    'en_citations',
    createRule(md, opts.projectBaseURL, opts.makeCitationText)
  )
}
