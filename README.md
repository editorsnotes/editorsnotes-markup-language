# Editors' Notes markup parser
This is parser for a custom flavor of [CommonMark] that
includes extensions for authoring scholarly notes on [Editors' Notes]. The
following additions are supported, based off of conventions in [Pandoc] and
[MultiMarkdown].

# Features
The Editors' Notes markup language supports the syntax of [CommonMark], with
several additions

## Inline references to Editors' Notes entitites
References to topics and notes can be added within text with the syntax

  `@@t(TOPIC_ID)`

and

  `@@n(NOTE_ID)`

respectively. For example, if topic 140 in a project with the slug `p` had the
name "Woodrow Wilson", the markup

  `In a contentious election, @@t140 was elected president in 1912.`

would result in the html:

```
  <p>
    In a contentions election, 
    <a href="/projects/p/topics/140/" rel="topic">
      Woodrow Wilson
    </a>
    was elected president in 1912.
  </p>
```

## Link references to Editors' Notes entities
Links to topics, documents, and notes can also be added to arbitrary text by
including the `@@` syntax as link href values. For example, `[some text](@@d1)`
would include a link to the document with ID 1.

## Citations
Documents can be cited with the same syntax as used in [Pandoc]. To cite a
document within body text, use the format

    `[(optional prefix )@@d(DOCUMENT_ID)(, optional locator)]`

## Blockquote attribution
Blockquotes can be attributed to a certain source by using the citation syntax
in the final line of the blockquote. For example:

```
> The whole life of those societies in which modern conditions of production
> prevail presents itself as an immense accumulation of _spectacles_. All that
> once was directly lived has become mere representation.
>
> [@@d40, p.12]
```

# Testing
  * `npm install`
  * `npm test`

[CommonMark]: http://commonmark.org/
[Editors' Notes]: http://editorsnotes.org/
[Pandoc]: http://pandoc.org/
[MultiMarkdown]: http://fletcherpenney.net/multimarkdown/
