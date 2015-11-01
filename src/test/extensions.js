"use strict"

var test = require('tape')

test('Inline item links', function (t) {
  var inlinePlugin = require('../md_items_inline')
    , parser

  parser = require('markdown-it')().use(inlinePlugin, {
    projectBaseURL: '/projects/emma/',
    resolveItemText: function (type, id, url) {
      return type + ' ' + id;
    }
  });

  t.plan(2);

  t.equal(
    parser.render('mentioning @@t123').trim(),
    '<p>mentioning <a href="/projects/emma/topics/123/" class="InlineReference InlineReference-topic">topic 123</a></p>'
  )

  t.equal(
    parser.render('mentioning @@n456!').trim(),
    '<p>mentioning <a href="/projects/emma/notes/456/" class="InlineReference InlineReference-note">note 456</a>!</p>'
  )
});

test('Items as hrefs', function (t) {
  var itemHrefPlugin = require('../md_items_href')
    , parser

  parser = require('markdown-it')().use(itemHrefPlugin, {
    projectBaseURL: '/projects/emma/',
  });

  t.plan(3);

  t.equal(
    parser.render('This is a link to [a topic](@@t500).').trim(),
    '<p>This is a link to <a href="/projects/emma/topics/500/" class="InlineReference InlineReference-topic">a topic</a>.</p>'
  )

  t.equal(
    parser.render('This is a link to [a note](@@n365).').trim(),
    '<p>This is a link to <a href="/projects/emma/notes/365/" class="InlineReference InlineReference-note">a note</a>.</p>'
  )

  t.equal(
    parser.render('This is a link to [a document](@@d7).').trim(),
    '<p>This is a link to <a href="/projects/emma/documents/7/" class="InlineReference InlineReference-document">a document</a>.</p>'
  )
});

test('Citations', function (t) {
  var citationPlugin = require('../md_citations')
    , parser

  t.plan(4);

  parser = require('markdown-it')().use(citationPlugin, {
    projectBaseURL: '/projects/emma/',
    makeInlineCitation: function (cites) {
      return {
        delimiter: '; ',
        citations: cites.map(function (cite) {
          return (cite.prefix || '') + cite.url + (cite.locator || '');
        })
      }
    }
  });

  t.equal(
    parser.render('This claim needs a citation [see @@d1, page 1], I think.').trim(),
    '<p>This claim needs a citation <cite>' +
    '<a href="/projects/emma/documents/1/" class="InlineReference InlineReference-document">' +
    'see /projects/emma/documents/1/, page 1' +
    '</a></cite>, I think.</p>'
  );

  t.equal(
    parser.render('should work at EOL [see @@d1, page 1]').trim(),
    '<p>should work at EOL <cite>' +
    '<a href="/projects/emma/documents/1/" class="InlineReference InlineReference-document">' +
    'see /projects/emma/documents/1/, page 1' +
    '</a></cite></p>'
  );

  t.equal(
    parser.render('should work at EOL [@@d1; @@d2]').trim(),
    '<p>should work at EOL <cite>' +
      '<a href="/projects/emma/documents/1/" class="InlineReference InlineReference-document">' +
        '/projects/emma/documents/1/' +
      '</a>; ' +
      '<a href="/projects/emma/documents/2/" class="InlineReference InlineReference-document">' +
        '/projects/emma/documents/2/' +
      '</a>' +
    '</cite></p>'
  );

  var testText = `
See Suzanne Briet's comment that

> [the] conditions and the tools of mental work today are very
> different from what they previously were
>
> [@@d1, p.13]

(end)
`.trim()

  var expectedHTML = (`
<p>See Suzanne Briet's comment that</p>
<blockquote>
<p>[the] conditions and the tools of mental work today are very
different from what they previously were</p>
<footer><cite><a href="/projects/emma/documents/1/" class="InlineReference InlineReference-document">` +
`/projects/emma/documents/1/, p.13</a></cite></footer>
</blockquote>
<p>(end)</p>
`).trim()

  t.equal(parser.render(testText).trim(), expectedHTML);
});

test('Document block', function (t) {
  var documentBlockPlugin = require('../md_document_block')
    , parser

  t.plan(1);

  parser = require('markdown-it')().use(documentBlockPlugin, {
    projectBaseURL: '/projects/emma/',
    makeBibliographyEntry: function (cite) {
      return 'Document #' + cite.id;
    }
  });

  t.equal(
    parser.render('::: document 1\nThis is in the document block.\n:::\nThis is not.').trim(),
    (
      '<section class="CitationBlock"><div>' +
      '<a href="/projects/emma/documents/1/" class="CitationBlock--Citation">Document #1</a>' +
      '</div>' +
      '<p>This is in the document block.</p>\n</section><p>This is not.</p>'
    )
  )
});
