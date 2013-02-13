# asciisvg-f

This project is a modification of Peter Jipsen's [ASCIIsvg](http://www1.chapman.edu/~jipsen/svg/asciisvg.html) 
JavaScript library.  The modifications provide support
for the SVG `foreignObject` tag.  This feature is implemented by a new method, `foreign()`, which has the following
usage syntax:

    foreign([x,y],"foreign string"[,id])

There are two versions of the library here:  `ASCIIsvg.js` just adds the `foreign()` method to Jipsen's original
`ASCIIsvg.js` library, and `ASCIIMathML-svg.js` trims out everything *but* what is needed for the SVG graphing
code from Jipsen's original `ASCIIMathML.js` library then adds the `foreign()` method to that.
    
Also included here are Jipsen's original `d.svg` and a sample file `test.html` 
([view in browser](http://cs.jsu.edu/~leathrum/asciisvg-f/test.html))
showing how the `foreign()` method can be 
used to include [MathJax](http://www.mathjax.org) labels in an ASCIIsvg graph.
The test file uses the `ASCIIMathML-svg.js` version.

### Notes:

* `ASCIIMathML-svg.js` is based on ASCIIMathML version 2.0.2, and includes support for the `agraph...endagraph`
and `(:graph...:)` syntax for delimiting the graphing environment, as well as a few other features.
*Warning:* The `\begin{graph}...\end{graph}` syntax is not working yet when also using MathJax,
at least not without wrapping it in a `tex2jax_ignore` region to protect it from the MathJax preprocessor.
* `ASCIIsvg.js` is based on ASCIIsvg version 1.2, which is missing a few features found in the graphing routines included
with the current version of ASCIIMathML -- notably, this does *not* support the `agraph...endagraph` or 
`\begin{graph}...\end{graph}` syntax for delimiting the graphing environment, you have to use the `<embed>`
syntax. 
* This is primarily intended as a way to include MathJax-formatted labels in ASCIIsvg graphs.  To simplify this,
the contents of the `"foreign string"` are wrapped in a `<div>` element with the HTML5 namspace.  Moreover,
the `foreign()` method includes a check to see if MathJax is loaded, and if it is, calls the MathJax `Typeset()`
method with the contents of the `foreignObject` element node.  Other foreign content can be used, but 
namespaces must be explicit within the string.
* The content is placed within the SVG with the point `[x,y]` at the upper left corner of the content rectangle.
The width and height of the content rectangle are determined from the `offsetWidth` and `offsetHeight` of the
containing `<div>`.  In order to be sure the `<div>` takes the correct values for these, it is given `style`
attribute value `float:left`.
* When using MathJax TeX input in the `"foreign string"`, it is important to use *inline* math mode delimiters,
`\(...\)` (or `$...$` with appropriate configuration) so that dynamic sizing will work correctly.
Display math delimiters `\[...\]` or `$$...$$` place the rendered math in a
block-level element, which in particular causes extra space in the height of the element.
If you still need display-size rendering, use `\displaystyle` in the MathJax expression.
* The `"foreign string"` is a JavaScript string, so JavaScript escaping rules apply.  In particular, when using
MathJax TeX input, backslashes must be doubled, including in the TeX delimiters.  For example:

        foreign([-1,1],"\\(f(x)=\\sin(x)\\)")
        
* The contents of `agraph...endagraph` and `(:graph...:)` environments are given the
CSS class `tex2jax_ignore` by the preprocessor, to protect the contents from the MathJax preprocessor.
This does not need to be done explicitly in the HTML.
* *Browser Support:*  Tested in Firefox, Chrome, and Opera (required a fix to ASCIIMathML code),
probably also works in Safari.  In order for a
browser to support this, the browser must support SVG and in particular the `foreignObject` element and must 
allow JavaScript to manipulate the DOM for the `foreignObject` element.  This is known to work in 
Gecko (Mozilla/Firefox), Webkit (Chrome, Safari), and Presto (Opera)
browsers recent enough to support SVG.  The situation is different, and more complicated, for Internet
Explorer.  IE9 supports SVG, but *not* the `foreignObject` element; IE with the Adobe SVGViewer plug-in should
provide all necessary support, though.

### To Do:

* `\begin{graph}...\end{graph}` not working -- this is just *too* similar to the
`\begin{something}...\end{something}` syntax that the MathJax `tex2jax` preprocessor handles.
Not sure what to do about this yet, not sure if anything can be done.
