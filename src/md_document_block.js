"use strict";

var getItemURL = require('./get_item_url')
  , regex = /^document (\d+)$/

module.exports = function (md, opts) {

  opts = opts || {};

  md.use(require('markdown-it-container'), 'document', {
    validate: function (params) {
      return params.trim().match(regex)
    },
    render: function (tokens, idx) {
      var match = tokens[idx].info.trim().match(regex)

      if (tokens[idx].nesting === 1) {
        let documentURL = getItemURL(opts.projectBaseURL, 'document', match[1])
          , documentText = opts.makeCitationText(documentURL)

        return '<div class="doc-block"><div class="doc">' + documentText + '</div>';
      } else {
        return '</div>';
      }
    }
  });
}
