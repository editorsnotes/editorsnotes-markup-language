"use strict"

var test = require('tape')

test('Inline item links', function (t) {
  var inlinePlugin = require('../md_inline_items')
    , parser

  parser = require('markdown-it')().use(inlinePlugin, {
    projectBase: '/projects/emma/',
    resolveItemText: function (type, url) {
      return type + ' ' + url.match(/\d+$/)[0]
    }
  });

  t.plan(2);

  t.equal(
    parser.render('mentioning @@t123'),
    '<p>mentioning <a rel="topic" href="/projects/emma/topics/123">topic 123</a>'
  )

  t.equal(
    parser.render('mentioning @@n456'),
    '<p>mentioning <a rel="note" href="/projects/emma/notes/456">note 456</a>'
  )
})
