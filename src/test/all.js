"use strict"

var test = require('tape')

test('Inline item links', function (t) {
  var inlinePlugin = require('../md_inline_items')
    , parser

  parser = require('markdown-it')().use(inlinePlugin, {
    projectBaseURL: '/projects/emma/',
    resolveItemText: function (type, url) {
      return type + ' ' + url.match(/\d+/)[0]
    }
  });

  t.plan(2);

  t.equal(
    parser.render('mentioning @@t123').trim(),
    '<p>mentioning <a class="en-item en-item-topic" rel="topic" href="/projects/emma/topics/123/">topic 123</a></p>'
  )

  t.equal(
    parser.render('mentioning @@n456!').trim(),
    '<p>mentioning <a class="en-item en-item-note" rel="note" href="/projects/emma/notes/456/">note 456</a>!</p>'
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
    '<p>This is a link to <a href="/projects/emma/topics/500/" rel="topic">a topic</a>.</p>'
  )

  t.equal(
    parser.render('This is a link to [a note](@@n365).').trim(),
    '<p>This is a link to <a href="/projects/emma/notes/365/" rel="note">a note</a>.</p>'
  )

  t.equal(
    parser.render('This is a link to [a document](@@d7).').trim(),
    '<p>This is a link to <a href="/projects/emma/documents/7/" rel="document">a document</a>.</p>'
  )
});
