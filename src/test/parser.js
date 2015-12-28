"use strict";

var test = require('tape')

test('Citations in document blocks', function (t) {
  var parser = require('../')({
    projectBaseURL: '/',
    makeInlineCitation: cites => ({
      delimiter: null,
      citations: cites.map(d => 'INLINE ' + d.id + ', ' + d.locator),
    }),
    makeBibliographyEntry: d => 'BIBLIOGRAPHY ' + d.id,
    resolveItemText: () => null
  })

  var markdown = `
::: document @@d100

> This is a
> quote.
>
> [p. 12]

:::
`.trim()

  var expectedHTML = (
    '<section class="ENDocumentBlock"><div>' +
    '<a href="/documents/100/" class="ENDocumentBlock--Citation">BIBLIOGRAPHY 100</a>' +
    '</div>' +
    '<blockquote>\n' +
      '<p>This is a\nquote.</p>\n' +
      '<footer><cite>' +
      '<a href="/documents/100/" class="ENInlineReference ENInlineReference-document">' +
      'INLINE 100, p. 12' +
      '</a></cite></footer>\n' +
    '</blockquote>\n' +
    '</section>'
  )

  t.plan(1);
  t.equal(parser.render(markdown, {}), expectedHTML);
});
