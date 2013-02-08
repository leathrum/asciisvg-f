# asciisvg-f

This project is a small modification of Peter Jipsen's [ASCIIsvg](http://www1.chapman.edu/~jipsen/svg/asciisvg.html) 
JavaScript library.  The modifications provide support
for the SVG `foreignObject` tag.  This feature is implemented by a new method, `foreign()`, which has the following
usage syntax:

    foreign([x,y],"foreign string"{,id})
    
Also included here are Jipsen's original `d.svg` and a sample file `test.html` 
([view in browser](http://cs.jsu.edu/~leathrum/asciisvg-f/test.html))
showing how the `foreign()` method can be 
used to include [MathJax](http://www.mathjax.org) labels in an ASCIIsvg graph.

### Notes:

* This is based on ASCIIsvg version 1.2, which is missing a few features found in the graphing routines included
with the current version of ASCIIMathML -- notably, this does not support the `agraph...endagraph` or 
`\begin{graph}...\end{graph}` syntax for delimiting the graphing environment, you have to use the `<embed>`
syntax.  I hope to push an update soon which will fix this.
* This is primarily intended as a way to include MathJax-formatted labels in ASCIIsvg graphs.  To simplify this,
the contents of the `"foreign string"` are wrapped in a `<span>` element with the HTML5 namspace.  Moreover,
the `foreign()` method includes a check to see if MathJax is loaded, and if it is, calls the MathJax `Typeset()`
method with the contents of the `foreignObject` element node.  Other foreign content can be used, but 
namespaces must be explicit within the string.
* The content is placed within the SVG with the point `[x,y]` at the upper left corner of the content rectangle.
The width and height of the content rectangle are determined from the `offsetWidth` and `offsetHeight` of the
containing `<span>`.  ( *Warning:*  Furher testing indicates that the dynamic
sizing code is not working as well as I had hoped -- it needs more work.)
* When using MathJax TeX input in the `"foreign string"`, it is important to use *inline* math mode delimiters,
`\(...\)` (or `$...$` with appropriate configuration) so that dynamic sizing will work correctly.
Display math delimiters `\[...\]` or `$$...$$` place the rendered math in a
block-level element, which in particular causes problems with computing the width of the element because
block-level elements are set up to fill the width of the containing element.
* The `"foreign string"` is a JavaScript string, so JavaScript escaping rules apply.  In particular, when using
MathJax TeX input, backslashes must be doubled, including in the TeX delimiters.  For example:

        foreign([-1,1],"\\(f(x)=\\sin(x)\\)")

### To Do:

* More work needed on dynamic resizing.
* Extract graphing code from ASCIIMathML.js to get current version and new features
