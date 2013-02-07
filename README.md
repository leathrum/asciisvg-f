# asciisvg-f

This project is a small modification of Peter Jipsen's [ASCIIsvg](http://www1.chapman.edu/~jipsen/svg/asciisvg.html) 
JavaScript library.  The modifications provide support
for the SVG `foreignObject` tag.  This feature is implemented by a new method, `foreign()`, which has the following
usage syntax:

    foreign([x,y],[w,h],"foreign string"{,id})
    
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
The width and height of the content rectangle must be given explicity, in the pair `[w,h]` -- height and width
attributes are required by the SVG `foreignObject` element, and may disagree with the actual dimensions of the
content, so parts of the content may be cropped if these are not set carefully.

### To Do:

* Extract graphing code from ASCIIMathML.js to get current version and new features

* Work on way to dynamically resize `foreignObject` based on dimensions of processed MathJax (or other content?)
