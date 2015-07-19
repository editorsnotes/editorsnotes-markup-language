#!/usr/bin/env node

"use strict";

var http = require('http')
  , router = require('routes')()
  , argv

argv = require('optimist')
  .default({ port: 7194, host: '127.0.0.1' })
  .argv

router.addRoute('/embeddedItems', function (req, res) {
  var body = require('body/json')
    , getEmbeddedItems = require('../lib/utils/get_embedded_items')

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
  }

  body(req, function (err, parsed) {
    var embeddedItems

    if (err) {
      res.statusCode = 400;
      res.end();
    } else {
      try {
        embeddedItems = getEmbeddedItems(parsed.data);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(embeddedItems));
      } catch (parseErr) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end(parseErr.toString());
      }
    }
  })
});

http.createServer(function (req, res) {
  var match = router.match(req.url);

  if (match) {
    match.fn(req, res);
  } else {
    if (req.method !== 'POST') {
      res.statusCode = 404;
      res.end();
    }
  }

}).listen(argv.port, argv.host);

console.log('Server running at ' + argv.host + ':' + argv.port);
