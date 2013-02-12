/*
ASCIIMathML-svg.js
==================

Same as ASCIIMathML.js with everything but SVG removed
main header and SVG fragment header preserved

also adding support for SVG foreignObject

TEL 2/8/2013

*/
/*
ASCIIMathML.js
==============
This file contains JavaScript functions to convert ASCII math notation
and LaTeX to Presentation MathML. Simple graphics commands are also
translated to SVG images. The conversion is done while the (X)HTML 
page loads, and should work with Firefox/Mozilla/Netscape 7+ and Internet 
Explorer 6/7 + MathPlayer (http://www.dessci.com/en/products/mathplayer/) +
Adobe SVGview 3.03 (http://www.adobe.com/svg/viewer/install/).

Just add the next line to your (X)HTML page with this file in the same folder:

<script type="text/javascript" src="ASCIIMathML.js"></script>

(using the graphics in IE also requires the file "d.svg" in the same folder).
This is a convenient and inexpensive solution for authoring MathML and SVG.

Version 2.0.1 Sept 27, 2007, (c) Peter Jipsen http://www.chapman.edu/~jipsen
This version extends ASCIIMathML.js with LaTeXMathML.js and ASCIIsvg.js.
Latest version at http://www.chapman.edu/~jipsen/mathml/ASCIIMathML.js
If you use it on a webpage, please send the URL to jipsen@chapman.edu

The LaTeXMathML modifications were made by Douglas Woodall, June 2006.
(for details see header on the LaTeXMathML part in middle of file)

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation; either version 2.1 of the License, or (at
your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT 
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License 
(at http://www.gnu.org/licences/lgpl.html) for more details.
*/

var translateOnLoad = true;    // set to false to do call translators from js 
var translateASCIIsvg = true;  // false to preserve agraph.., \begin{graph}..
var avoidinnerHTML = false;   // set true if assigning to innerHTML gives error
var dsvglocation = ""; // path to d.svg (blank if same as ASCIIMathML.js loc)

var isIE = document.createElementNS==null;

if (document.getElementById==null) 
  alert("This webpage requires a recent browser such as\
\nMozilla/Netscape 7+ or Internet Explorer 6+MathPlayer")


// next method adapted from LaTeX part of ASCIIMathML.js
function simpleLaTeXformatting(st) {
  st = st.replace(/<embed\s+class\s?=\s?"ASCIIsvg"/g,"<embed class=\"ASCIIsvg\" src=\""+dsvglocation+"d.svg\" wmode=\"transparent\"");
  st = st.replace(/(?:\\begin{a?graph}|agraph|\(:graph\s)((.|\n)*?)(?:\\end{a?graph}|enda?graph|:\))/g,function(s,t){return "<div><embed class=\"ASCIIsvg\" src=\""+dsvglocation+"d.svg\" wmode=\"transparent\" script=\'"+t.replace(/<\/?(br|p|pre)\s?\/?>/gi,"\n")+"\'/></div>"});
//  st = st.replace(/\(:graph((.|\n)*?):\)/g,function(s,t){return "<div><embed class=\"ASCIIsvg\" src=\""+dsvglocation+"d.svg\" wmode=\"transparent\" script=\'"+t.replace(/<\/?(br|p|pre)\s?\/?>/gi,"\n")+"\'/></div>"});
  return st
}


/* ASCIIsvg.js
==============
JavaScript routines to dynamically generate Scalable Vector Graphics
using a mathematical xy-coordinate system (y increases upwards) and
very intuitive JavaScript commands (no programming experience required).
ASCIIsvg.js is good for learning math and illustrating online math texts.
Works with Internet Explorer+Adobe SVGviewer and SVG enabled Mozilla/Firefox.

Ver 1.2.9 July 31, 2007 (c) Peter Jipsen http://www.chapman.edu/~jipsen
Latest version at http://math.chapman.edu/~jipsen/math/pub/ASCIIsvg.js
If you use it on a webpage, please send the URL to jipsen@chapman.edu

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation; either version 2.1 of the License, or (at
your option) any later version.

This program is distributed in the hope that it will be useful, 
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser
General Public License (at http://www.gnu.org/license/lgpl.html) 
for more details.*/

// you can change these
var checkIfSVGavailable = true;
var notifyIfNoSVG = true;
var alertIfNoSVG = false;

// global defaults used if not specified by graph (you can change these)
var defaultwidth = 300; defaultheight = 200;   // in pixels
var defaultxmin = -5.5; defaultxmax = 5.5;     // in usercoords
var defaultborder = 0; border = defaultborder; // in pixel
var defaultstrokewidth = "1"; // default line width in pixel
var defaultstroke = "blue";   // default line color
var defaultstrokeopacity = 1; // transparent = 0, solid =1
var defaultstrokedasharray = null; // "10,10" gives 10px long dashes
var defaultfill = "none";        // default fill color
var defaultfillopacity = 1;      // transparent = 0, solid =1
var defaultfontstyle = "normal"; // default text shape normal|italic|inherit
var defaultfontfamily = "times"; // default font times|ariel|helvetica|...
var defaultfontsize = "16";      // default size (scaled automatically)
var defaultfontweight = "normal";// normal|bold|bolder|lighter|100|...|900
var defaultfontstroke = "none";  // default font outline color
var defaultfontfill = "none";    // default font color
var defaultmarker = "none";      // "dot" | "arrow" | "+" | "-" | "|"
var defaultendpoints = "";       // "c-d" where c is <|o|* and d is >|o|*

// global values used for all pictures (you can change these)
var showcoordinates = true;
var markerstrokewidth = "1";
var markerstroke = "black";
var markerfill = "yellow";
var markersize = 4;
var arrowfill = stroke;
var dotradius = 4;
var ticklength = 4;
var axesstroke = "black";
var gridstroke = "grey";
var backgroundstyle = "fill-opacity:0; fill:white";
var singlelettersitalic = true;

// internal variables (probably no need to change these)
var picturepos = null; // position of picture relative to top of HTML page
var xunitlength;       // in pixels, used to convert to user coordinates
var yunitlength;       // in pixels
var origin = [0,0];    // in pixels (default is bottom left corner)
var above = "above";   // shorthands (to avoid typing quotes)
var below = "below";
var left = "left";
var right = "right";
var aboveleft = "aboveleft";
var aboveright = "aboveright";
var belowleft = "belowleft";
var belowright = "belowright";
var xmin, xmax, ymin, ymax, xscl, yscl, 
    xgrid, ygrid, xtick, ytick, initialized;
var strokewidth, strokedasharray, stroke, fill, strokeopacity, fillopacity;
var fontstyle, fontfamily, fontsize, fontweight, fontstroke, fontfill;
var marker, endpoints, dynamic = {};
var picture, svgpicture, doc, width, height, a, b, c, d, i, n, p, t, x, y;
var isIE = document.createElementNS==null;

var cpi = "\u03C0", ctheta = "\u03B8";      // character for pi, theta
var log = function(x) { return ln(x)/ln(10) };
var pi = Math.PI, e = Math.E, ln = Math.log, sqrt = Math.sqrt;
var floor = Math.floor, ceil = Math.ceil, abs = Math.abs;
var sin = Math.sin, cos = Math.cos, tan = Math.tan;
var arcsin = Math.asin, arccos = Math.acos, arctan = Math.atan;
var sec = function(x) { return 1/Math.cos(x) };
var csc = function(x) { return 1/Math.sin(x) };
var cot = function(x) { return 1/Math.tan(x) };
var arcsec = function(x) { return arccos(1/x) };
var arccsc = function(x) { return arcsin(1/x) };
var arccot = function(x) { return arctan(1/x) };
var sinh = function(x) { return (Math.exp(x)-Math.exp(-x))/2 };
var cosh = function(x) { return (Math.exp(x)+Math.exp(-x))/2 };
var tanh = 
  function(x) { return (Math.exp(x)-Math.exp(-x))/(Math.exp(x)+Math.exp(-x)) };
var sech = function(x) { return 1/cosh(x) };
var csch = function(x) { return 1/sinh(x) };
var coth = function(x) { return 1/tanh(x) };
var arcsinh = function(x) { return ln(x+Math.sqrt(x*x+1)) };
var arccosh = function(x) { return ln(x+Math.sqrt(x*x-1)) };
var arctanh = function(x) { return ln((1+x)/(1-x))/2 };
var sech = function(x) { return 1/cosh(x) };
var csch = function(x) { return 1/sinh(x) };
var coth = function(x) { return 1/tanh(x) };
var arcsech = function(x) { return arccosh(1/x) };
var arccsch = function(x) { return arcsinh(1/x) };
var arccoth = function(x) { return arctanh(1/x) };
var sign = function(x) { return (x==0?0:(x<0?-1:1)) };

function factorial(x,n) { // Factorial function
  if (n==null) n=1;
  if (Math.abs(x-Math.round(x*1000000)/1000000)<1e-15)
    x = Math.round(x*1000000)/1000000;
  if (x-Math.floor(x)!=0) return NaN;
  for (var i=x-n; i>0; i-=n) x*=i;
  return (x<0?NaN:(x==0?1:x));
}

function C(x,k) {  // Binomial coefficient function
  var res=1;
  for (var i=0; i<k; i++) res*=(x-i)/(k-i);
  return res;
}

function chop(x,n) { // Truncate decimal number to n places after decimal point
  if (n==null) n=0;
  return Math.floor(x*Math.pow(10,n))/Math.pow(10,n);
}

function ran(a,b,n) { // Generate random number in [a,b] with n digits after .
  if (n==null) n=0;
  return chop((b+Math.pow(10,-n)-a)*Math.random()+a,n);
}

function myCreateElementXHTML(t) {
  if (isIE) return document.createElement(t);
  else return document.createElementNS("http://www.w3.org/1999/xhtml",t);
}

function myCreateElementSVG(t) {
  if (isIE) return doc.createElement(t);
  else return doc.createElementNS("http://www.w3.org/2000/svg",t);
}

function getElementsByClass(container, tagName, clsName){
  var list = new Array(0);
  var collection = container.getElementsByTagName(tagName);
  for(var i = 0; i < collection.length; i++)
    if(collection[i].className.slice(0,clsName.length)==clsName)
      list[list.length] = collection[i];
  return list;
}

function findPos(obj) { // top-left corner of obj on HTML page in pixel
  var curleft = curtop = 0;
  if (obj.offsetParent) {
    curleft = obj.offsetLeft
    curtop = obj.offsetTop
    while (obj = obj.offsetParent) {
      curleft += obj.offsetLeft
      curtop += obj.offsetTop
    }
  }
  return [curleft,curtop];
}

function isSVGavailable() {
  var nd = myCreateElementXHTML("center");
  nd.appendChild(document.createTextNode("To view the "));
  var an = myCreateElementXHTML("a");
  an.appendChild(document.createTextNode("ASCIIsvg"));
  an.setAttribute("href","http://www.chapman.edu/~jipsen/asciisvg.html");
  nd.appendChild(an);
  nd.appendChild(document.createTextNode(" images use Internet Explorer 6+"));
  an = myCreateElementXHTML("a");
  an.appendChild(document.createTextNode("Adobe SVGviewer 3.02"));
  an.setAttribute("href","http://www.adobe.com/svg");
  nd.appendChild(an);
  nd.appendChild(document.createTextNode(" or "));
  an = myCreateElementXHTML("a");
  an.appendChild(document.createTextNode("SVG enabled Mozilla/Firefox"));
  an.setAttribute("href",
    "http://www.chapman.edu/~jipsen/svg/svgenabledmozillafirefox.html");
  nd.appendChild(an);
  if (navigator.appName.slice(0,8)=="Netscape") 
    if (window['SVGElement']) return null;
    else return nd;
  else if (navigator.appName.slice(0,9)=="Microsoft")
    try {
      var oSVG=eval("new ActiveXObject('Adobe.SVGCtl.3');");
        return null;
    } catch (e) {
        return nd;
    }
  else return nd;
}

function setText(st,id) { // add text to an existing node with given id
  var node = document.getElementById(id);
  if (node!=null)
    if (node.childNodes.length!=0) node.childNodes[0].nodeValue = st;
    else node.appendChild(document.createTextNode(st));
}

function getX(evt) { // return mouse x-coord in user coordinate system
  var svgroot = evt.target.parentNode;
  return (evt.clientX+(isIE?0:window.pageXOffset)-svgroot.getAttribute("left")-svgroot.getAttribute("ox"))/(svgroot.getAttribute("xunitlength")-0);
}

function getY(evt) { // return mouse y-coord in user coordinate system
  var svgroot = evt.target.parentNode;
  return (svgroot.getAttribute("height")-svgroot.getAttribute("oy")-(evt.clientY+(isIE?0:window.pageYOffset)-svgroot.getAttribute("top")))/(svgroot.getAttribute("yunitlength")-0);
}

function translateandeval(src) { //modify user input to JavaScript syntax
  var errstr;
  // replace plot(f(x),...) with plot("f(x)",...)  
  src = src.replace(/plot\(\x20*([^\"f\[][^\n\r;]+?)\,/g,"plot\(\"$1\",");
  src = src.replace(/plot\(\x20*([^\"f\[][^\n\r;]+)\)/g,"plot(\"$1\")");

  // replace (expr,expr) by [expr,expr] where expr has no (,) in it
  src = src.replace(/([=(,]\x20*)\(([-a-z0-9./+*]+?),([-a-z0-9./+*]+?)\)/g,"$1[$2,$3]");

  // insert * between digit and letter e.g. 2x --> 2*x
  src = src.replace(/([0-9])([a-zA-Z])/g,"$1*$2");
  src = src.replace(/\)([\(0-9a-zA-Z])/g,"\)*$1");

  try {
    with (Math) eval(src);          // here the svgpicture object is created
  } catch(err) {
    if (err!="wait") {
      if (typeof err=="object") 
        errstr = err.name+" "+err.message+" "+err.number+" "+err.description;
      else errstr = err;
      alert(errstr+"\n"+src)
    }
  }
}

function drawPictures() { // main routine; called after webpage has loaded
  var src, id, dsvg, nd, node, ht, index, cols, arr, i, node2;
  var pictures = document.getElementsByTagName("textarea");
  for (index = 0; index<pictures.length; index++)
    if (pictures[index].className=="ASCIIsvg"){
      pictures[index].style.display="none";  // hide the textarea
    }
  var ASbody = document.getElementsByTagName("body")[0];
  pictures = getElementsByClass(ASbody,"embed","ASCIIsvg");
  var len = pictures.length;
  if (checkIfSVGavailable) {
    nd = isSVGavailable();
    if (nd != null && notifyIfNoSVG && len>0)
      if (alertIfNoSVG)
        alert("To view the SVG pictures in Internet Explorer\n\
download the free Adobe SVGviewer from www.adobe.com/svg or\n\
use Firefox 2.0 or later");
      else {
        ASbody.insertBefore(nd,ASbody.childNodes[0]);
      }
  }
 if (nd == null) {
  for (index = 0; index < len; index++) {
   width = null; height = null; 
   xmin = null; xmax = null; ymin = null; ymax = null;
   xscl = null; xgrid = null; yscl = null; ygrid = null;
   initialized = false;
   picture = pictures[index];  // current picture object
   src = picture.getAttribute("script"); // get the ASCIIsvg code
   if (src==null) src = "";
   // insert "axes()" if not present  ******** experimental
   if (!/axes\b|initPicture/.test(src)) {
     var i = 0
     while (/((yscl|ymax|ymin|xscl|xmax|xmin|\bwidth|\bheight)\s*=\s*-?\d*(\d\.|\.\d|\d)\d*\s*;?)/.test(src.slice(i))) i++;
     src = (i==0?"axes(); "+src: src.slice(0,i)+src.slice(i).replace(/((scl|max|min|idth|eight)\s*=\s*-?\d*(\d\.|\.\d|\d)\d*\s*;?)/,"$1\naxes();"));
   }
   ht = picture.getAttribute("height");
   if (isIE) {
     picture.setAttribute("wmode","transparent");
//alert("*"+picture.getAttribute("src")+dsvglocation);
//adding d.svg dynamically greates problems in IE...
     if (picture.getAttribute("src")=="") picture.setAttribute("src",dsvglocation+"d.svg");
   }
   if (document.getElementById("picture"+(index+1)+"mml")==null) {
     picture.parentNode.style.position = "relative";
     node = myCreateElementXHTML("div");
     node.style.position = "absolute";
     node.style.top = "0px";
     node.style.left = "0px";
     node.setAttribute("id","picture"+(index+1)+"mml");
     picture.parentNode.insertBefore(node,picture.nextSibling);
   }
   if (ht==null) ht ="";
//   if (ht!="") defaultborder = 25;
   if (ht=="" || src=="") 
    if (document.getElementById("picture"+(index+1)+"input")==null) {
      node = myCreateElementXHTML("textarea");
      arr = src.split("\n");
      cols = 0;
      for (i=0;i<arr.length;i++) cols = Math.max(cols,arr[i].length);
      node.setAttribute("rows",Math.min(10,arr.length)+1);
      node.setAttribute("cols",Math.max(Math.min(60,cols),20)+5);
//      node.setAttribute("style","display:block");
      if (isIE) src = src.replace(/([^\r])\n/g,"$1\r");
      node.appendChild(document.createTextNode(src));
      if (src.indexOf("showcode()")==-1) node.style.display = "none";
      node.setAttribute("id","picture"+(index+1)+"input");
      picture.parentNode.insertBefore(node,picture.nextSibling);
      picture.parentNode.insertBefore(myCreateElementXHTML("br"),node);
      node2 = myCreateElementXHTML("button");
      node2.setAttribute("id","picture"+(index+1)+"button");
      if (isIE) node2.onclick = function() {updatePicture(this)};
      else node2.setAttribute("onclick","updatePicture(this)");
      node2.appendChild(document.createTextNode("Update"));
      if (src.indexOf("showcode()")==-1) node2.style.display = "none";
      picture.parentNode.insertBefore(node2,node);
      picture.parentNode.insertBefore(myCreateElementXHTML("br"),node);
    } else src = document.getElementById("picture"+(index+1)+"input").value;
    id = picture.getAttribute("id");
    dsvg = picture.getAttribute("src");
    if (id == null || id == "") {
      id = "picture"+(index+1);
      picture.setAttribute("id",id);
    }
    translateandeval(src)
  }
 }
}

function setdefaults() { //called before each graph is evaluated
  strokewidth = defaultstrokewidth;
  stroke = defaultstroke;
  strokeopacity = defaultstrokeopacity;
  strokedasharray = defaultstrokedasharray;
  fill = defaultfill;
  fillopacity = defaultfillopacity;
  fontstyle = defaultfontstyle;
  fontfamily = defaultfontfamily;
  fontsize = defaultfontsize;
  fontweight = defaultfontweight;
  fontstroke = defaultfontstroke;
  fontfill = defaultfontfill;
  marker = defaultmarker;
  endpoints = defaultendpoints;
}

function switchTo(id) { // used by dynamic code to select appropriate graph
  picture = document.getElementById(id);
  width = picture.getAttribute("width")-0;
  height = picture.getAttribute("height")-0;
  setdefaults();
  if ((picture.nodeName == "EMBED" || picture.nodeName == "embed") && isIE) {
    svgpicture = picture.getSVGDocument().getElementById("root");
    doc = picture.getSVGDocument();
  } else {
    svgpicture = picture;
    doc = document;
  }
  xunitlength = svgpicture.getAttribute("xunitlength")-0;
  yunitlength = svgpicture.getAttribute("yunitlength")-0;
  xmin = svgpicture.getAttribute("xmin")-0;
  xmax = svgpicture.getAttribute("xmax")-0;
  ymin = svgpicture.getAttribute("ymin")-0;
  ymax = svgpicture.getAttribute("ymax")-0;
  origin = [svgpicture.getAttribute("ox")-0,svgpicture.getAttribute("oy")-0];
}

function updatePicture(obj) {
  var node, src, id;
  if (typeof obj=="object") id = obj.id.slice(0,-6);
  else id = (typeof obj=="string"?obj:"picture"+(obj+1));
  src = document.getElementById(id+"input").value;
  xmin = null; xmax = null; ymin = null; ymax = null;
  xscl = null; xgrid = null; yscl = null; ygrid = null;
  initialized = false;
  picture = document.getElementById(id);
//  switchTo(id);
  translateandeval(src)
}

function changepicturesize(evt,factor) {
  var obj = evt.target;
  var name = obj.parentNode.getAttribute("name");
  var pic = document.getElementById(name);
  var src = document.getElementById(name+"input").value;
  src = src.replace(/width\s*=\s*\d+/,"width="+(factor*(pic.getAttribute("width")-0)));
  src = src.replace(/height\s*=\s*\d+/,"height="+(factor*(pic.getAttribute("height")-0)));
  document.getElementById(name+"input").value = src;
//alert(getKey(evt.keycode))
  updatePicture(name);
}

var sinceFirstClick = 0; // ondblclick simulation from 
var dblClkTimer;         // http://www.enja.org/david/?cat=13 Thanks!
function timer() {
  if(sinceFirstClick<60) {
    sinceFirstClick++;
    setTimeout("timer()",10);
  } else {
    clearTimeout(dblClkTimer);
    dblClkTimer = "";
  }
}
function mClick(evt) {
  if(sinceFirstClick!=0) {
    if(sinceFirstClick <= 40) {
      if (evt.shiftKey) changepicturesize(evt,2);
      else if (evt.altKey) changepicturesize(evt,.5);
      else showHideCode(evt);             // do this on dblclick
      clearTimeout(dblClkTimer);
      dblClkTimer = "";
    } else {
      clearTimeout(dblClkTimer);
      sinceFirstClick = 0;
      dblClkTimer = setTimeout("timer()",10);
    }        
  } else {
    sinceFirstClick = 0;
    dblClkTimer = setTimeout("timer()",10);
  }
}

function showHideCode(evt) { // called by onclick event
//  if (evt.getDetail()==2) {//getDetail unfortunately not in Firefox
  var obj=evt.target;
  var name = obj.parentNode.getAttribute("name");
  var node = document.getElementById(name+"input");
  node.style.display = (node.style.display == "none"?"":"none");
  var node = document.getElementById(name+"button");
  node.style.display = (node.style.display == "none"?"":"none");
//  }
}

function showcode() {} // do nothing

function setBorder(x) { border = x } //deprecate

function initPicture(x_min,x_max,y_min,y_max) { // set up the graph
// usually called by axes() or noaxes(), but can be used directly
 if (!initialized) {
  setdefaults();
  initialized = true;
  if (x_min!=null) xmin = x_min;
  if (x_max!=null) xmax = x_max;
  if (y_min!=null) ymin = y_min;
  if (y_max!=null) ymax = y_max;
  if (xmin==null) xmin = defaultxmin;
  if (xmax==null) xmax = defaultxmax;
 if (typeof xmin != "number" || typeof xmax != "number" || xmin >= xmax) 
   alert("Picture requires at least two numbers: xmin < xmax");
 else if (y_max != null && (typeof y_min != "number" || 
          typeof y_max != "number" || y_min >= y_max))
   alert("initPicture(xmin,xmax,ymin,ymax) requires numbers ymin < ymax");
 else {
  if (width==null) {
    width = picture.getAttribute("width");
    if (width==null || width=="") width=defaultwidth;
  }
  picture.setAttribute("width",width);
  if (height==null) { 
    height = picture.getAttribute("height");
    if (height==null || height=="") height=defaultheight;
  }
  picture.setAttribute("height",height);
  xunitlength = (width-2*border)/(xmax-xmin);
  yunitlength = xunitlength;
//alert(xmin+" "+xmax+" "+ymin+" "+ymax)
  if (ymin==null) {
    origin = [-xmin*xunitlength+border,height/2];
    ymin = -(height-2*border)/(2*yunitlength);
    ymax = -ymin;
  } else {
    if (ymax!=null) yunitlength = (height-2*border)/(ymax-ymin);
    else ymax = (height-2*border)/yunitlength + ymin;
    origin = [-xmin*xunitlength+border,-ymin*yunitlength+border];
  }
  if (isIE) {
    if (picture.FULLSCREEN==undefined) {
      setTimeout('drawPictures()',50);
      throw "wait";
    }
    svgpicture = picture.getSVGDocument().getElementById("root");
    if (svgpicture==null) {
      setTimeout('drawPictures()',50);
      throw "wait";
    }
    svgpicture = picture.getSVGDocument().getElementById("root");
    while (svgpicture.childNodes.length>0) 
      svgpicture.removeChild(svgpicture.lastChild); 
    svgpicture.setAttribute("width",width);
    svgpicture.setAttribute("height",height);
    svgpicture.setAttribute("name",picture.getAttribute("id"));
    doc = picture.getSVGDocument();
    var nd = document.getElementById(picture.getAttribute("id")+"mml");
    if (nd!=null) // clear out MathML layer
      while (nd.childNodes.length>0) nd.removeChild(nd.lastChild); 
  } else {
    var qnode = document.createElementNS("http://www.w3.org/2000/svg","svg");
    qnode.setAttribute("id",picture.getAttribute("id"));
    qnode.setAttribute("name",picture.getAttribute("id"));
    qnode.setAttribute("style","display:inline");
    qnode.setAttribute("width",picture.getAttribute("width"));
    qnode.setAttribute("height",picture.getAttribute("height"));
    picturepos = findPos(picture);
    qnode.setAttribute("left",picturepos[0]);
    qnode.setAttribute("top",picturepos[1]);
//      qnode.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink");
    if (picture.parentNode!=null) {
      picture.parentNode.replaceChild(qnode,picture);
    } else {
      svgpicture.parentNode.replaceChild(qnode,svgpicture);
    }
    svgpicture = qnode;
    doc = document;
  }
  svgpicture.setAttribute("xunitlength",xunitlength);
  svgpicture.setAttribute("yunitlength",yunitlength);
  svgpicture.setAttribute("xmin",xmin);
  svgpicture.setAttribute("xmax",xmax);
  svgpicture.setAttribute("ymin",ymin);
  svgpicture.setAttribute("ymax",ymax);
  svgpicture.setAttribute("ox",origin[0]);
  svgpicture.setAttribute("oy",origin[1]);
  var node = myCreateElementSVG("rect");
  node.setAttribute("x","0");
  node.setAttribute("y","0");
  node.setAttribute("width",width);
  node.setAttribute("height",height);
  node.setAttribute("style",backgroundstyle);
  svgpicture.appendChild(node);
  svgpicture.setAttribute("onmousemove","displayCoord(evt)");
  svgpicture.setAttribute("onmouseout","removeCoord(evt)");
  svgpicture.setAttribute("onclick","mClick(evt)");
  node = myCreateElementSVG("text");
  node.appendChild(doc.createTextNode(" "));
  svgpicture.appendChild(node);
  border = defaultborder;
 }
 }
}

//////////////////////////user graphics commands start/////////////////////////

function line(p,q,id,endpts) { // segment connecting points p,q (coordinates in units)
  var node;
  if (id!=null) node = doc.getElementById(id);
  if (node==null) {
    node = myCreateElementSVG("path");
    node.setAttribute("id", id);
    svgpicture.appendChild(node);
  }
  node.setAttribute("d","M"+(p[0]*xunitlength+origin[0])+","+
    (height-p[1]*yunitlength-origin[1])+" "+
    (q[0]*xunitlength+origin[0])+","+(height-q[1]*yunitlength-origin[1]));
  node.setAttribute("stroke-width", strokewidth);
  if (strokedasharray!=null) 
    node.setAttribute("stroke-dasharray", strokedasharray);
  node.setAttribute("stroke", stroke);
  node.setAttribute("fill", fill);
  node.setAttribute("stroke-opacity", strokeopacity);
  node.setAttribute("fill-opacity", fillopacity);
  if (marker=="dot" || marker=="arrowdot") {
    ASdot(p,markersize,markerstroke,markerfill);
    if (marker=="arrowdot") arrowhead(p,q);
    ASdot(q,markersize,markerstroke,markerfill);
  } else if (marker=="arrow") arrowhead(p,q);
  if (endpts==null && endpoints!="") endpts = endpoints;
  if (endpts!=null) {
    if (endpts.indexOf("<-") != -1) arrowhead(q,p);
    if (endpts.indexOf("o-") != -1) dot(p, "open");
    if (endpts.indexOf("*-") != -1) dot(p, "closed");
    if (endpts.indexOf("->") != -1) arrowhead(p,q);
    if (endpts.indexOf("-o") != -1) dot(q, "open");
    if (endpts.indexOf("-*") != -1) dot(q, "closed");
  }
}

function path(plist,id,c,endpts) {
  if (c==null) c="";
  var node, st, i;
  if (id!=null) node = doc.getElementById(id);
  if (node==null) {
    node = myCreateElementSVG("path");
    node.setAttribute("id", id);
    svgpicture.appendChild(node);
  }
  if (typeof plist == "string") st = plist;
  else {
    st = "M";
    st += (plist[0][0]*xunitlength+origin[0])+","+
          (height-plist[0][1]*yunitlength-origin[1])+" "+c;
    for (i=1; i<plist.length; i++)
      st += (plist[i][0]*xunitlength+origin[0])+","+
            (height-plist[i][1]*yunitlength-origin[1])+" ";
  }
  node.setAttribute("d", st);
  node.setAttribute("stroke-width", strokewidth);
  if (strokedasharray!=null) 
    node.setAttribute("stroke-dasharray", strokedasharray);
  node.setAttribute("stroke", stroke);
  node.setAttribute("fill", fill);
  node.setAttribute("stroke-opacity", strokeopacity);
  node.setAttribute("fill-opacity", fillopacity);
  if (marker=="dot" || marker=="arrowdot")
    for (i=0; i<plist.length; i++)
      if (c!="C" && c!="T" || i!=1 && i!=2)
        ASdot(plist[i],markersize,markerstroke,markerfill);
  if (endpts==null && endpoints!="") endpts = endpoints;
  if (endpts!=null) {
    if (endpts.indexOf("<-") != -1) arrowhead(plist[1],plist[0]);
    if (endpts.indexOf("o-") != -1) dot(plist[0], "open");
    if (endpts.indexOf("*-") != -1) dot(plist[0], "closed");
    if (endpts.indexOf("->") != -1) arrowhead(plist[plist.length-2],plist[plist.length-1]);
    if (endpts.indexOf("-o") != -1) dot(plist[plist.length-1], "open");
    if (endpts.indexOf("-*") != -1) dot(plist[plist.length-1], "closed");
  }
}

function curve(plist,id,endpts) {
  path(plist,id,"T",endpts);
}

function vector(p,q,id) {
  line(p,q,id,"","->");
}

function circle(center,radius,id) { // coordinates in units
  var node;
  if (id!=null) node = doc.getElementById(id);
  if (node==null) {
    node = myCreateElementSVG("circle");
    node.setAttribute("id", id);
    svgpicture.appendChild(node);
  }
  node.setAttribute("cx",center[0]*xunitlength+origin[0]);
  node.setAttribute("cy",height-center[1]*yunitlength-origin[1]);
  node.setAttribute("r",radius*xunitlength);
  node.setAttribute("stroke-width", strokewidth);
  node.setAttribute("stroke", stroke);
  node.setAttribute("fill", fill);
  node.setAttribute("stroke-opacity", strokeopacity);
  node.setAttribute("fill-opacity", fillopacity);
}

function loop(p,d,id) { 
// d is a direction vector e.g. [1,0] means loop starts in that direction
  if (d==null) d=[1,0];
  path([p,[p[0]+d[0],p[1]+d[1]],[p[0]-d[1],p[1]+d[0]],p],id,"C");
  if (marker=="arrow" || marker=="arrowdot") 
    arrowhead([p[0]+Math.cos(1.4)*d[0]-Math.sin(1.4)*d[1],
               p[1]+Math.sin(1.4)*d[0]+Math.cos(1.4)*d[1]],p);
}

function arc(start,end,radius,id) { // coordinates in units
  var node, v;
//alert([fill, stroke, origin, xunitlength, yunitlength, height])
  if (id!=null) node = doc.getElementById(id);
  if (radius==null) {
    v=[end[0]-start[0],end[1]-start[1]];
    radius = Math.sqrt(v[0]*v[0]+v[1]*v[1]);
  }
  if (node==null) {
    node = myCreateElementSVG("path");
    node.setAttribute("id", id);
    svgpicture.appendChild(node);
  }
  node.setAttribute("d","M"+(start[0]*xunitlength+origin[0])+","+
    (height-start[1]*yunitlength-origin[1])+" A"+radius*xunitlength+","+
     radius*yunitlength+" 0 0,0 "+(end[0]*xunitlength+origin[0])+","+
    (height-end[1]*yunitlength-origin[1]));
  node.setAttribute("stroke-width", strokewidth);
  node.setAttribute("stroke", stroke);
  node.setAttribute("fill", fill);
  node.setAttribute("stroke-opacity", strokeopacity);
  node.setAttribute("fill-opacity", fillopacity);
  if (marker=="arrow" || marker=="arrowdot") {
    u = [(end[1]-start[1])/4,(start[0]-end[0])/4];
    v = [(end[0]-start[0])/2,(end[1]-start[1])/2];
//alert([u,v])
    v = [start[0]+v[0]+u[0],start[1]+v[1]+u[1]];
  } else v=[start[0],start[1]];
  if (marker=="dot" || marker=="arrowdot") {
    ASdot(start,markersize,markerstroke,markerfill);
    if (marker=="arrowdot") arrowhead(v,end);
    ASdot(end,markersize,markerstroke,markerfill);
  } else if (marker=="arrow") arrowhead(v,end);
}

function sector(center,start,end,id) { // center,start,end should be isoceles
  var rx = start[0]-center[0], ry = start[1]-center[1];
  arc(start,end,Math.sqrt(rx*rx+ry*ry),id+"arc");
  path([end,center,start],id+"path");
}

function ellipse(center,rx,ry,id) { // coordinates in units
  var node;
  if (id!=null) node = doc.getElementById(id);
  if (node==null) {
    node = myCreateElementSVG("ellipse");
    node.setAttribute("id", id);
    svgpicture.appendChild(node);
  }
  node.setAttribute("cx",center[0]*xunitlength+origin[0]);
  node.setAttribute("cy",height-center[1]*yunitlength-origin[1]);
  node.setAttribute("rx",rx*xunitlength);
  node.setAttribute("ry",ry*yunitlength);
  node.setAttribute("stroke-width", strokewidth);
  node.setAttribute("stroke", stroke);
  node.setAttribute("fill", fill);
  node.setAttribute("stroke-opacity", strokeopacity);
  node.setAttribute("fill-opacity", fillopacity);
}

function triangle(p,q,r,id) {
  path([p,q,r,p],id)
}

function rect(p,q,id,rx,ry) { // opposite corners in units, rounded by radii
  var node;
  if (id!=null) node = doc.getElementById(id);
  if (node==null) {
    node = myCreateElementSVG("rect");
    node.setAttribute("id", id);
    svgpicture.appendChild(node);
  }
  node.setAttribute("x",p[0]*xunitlength+origin[0]);
  node.setAttribute("y",height-q[1]*yunitlength-origin[1]);
  node.setAttribute("width",(q[0]-p[0])*xunitlength);
  node.setAttribute("height",(q[1]-p[1])*yunitlength);
  if (rx!=null) node.setAttribute("rx",rx*xunitlength);
  if (ry!=null) node.setAttribute("ry",ry*yunitlength);
  node.setAttribute("stroke-width", strokewidth);
  node.setAttribute("stroke", stroke);
  node.setAttribute("fill", fill);
  node.setAttribute("stroke-opacity", strokeopacity);
  node.setAttribute("fill-opacity", fillopacity);
}

function text(p,st,pos,id,fontsty) {
  var dnode, node, dx = 0, dy = fontsize/3;
// no longer have ASCIIMath or LaTeX code, so next section deleted
//  if (/(`|\$)/.test(st)) {  // layer for ASCIIMathML and LaTeXMathML
//    dnode = document.getElementById(svgpicture.getAttribute("name")+"mml");
//    if (dnode!=null) {
//      if (id!=null) node = document.getElementById(id);
//      if (node==null) {
//alert(dnode.childNodes.length)
//        node = myCreateElementXHTML("div");
//        node.setAttribute("id", id);
//        node.style.position = "absolute";
//        dnode.appendChild(node);
//      }
//      while (node.childNodes.length>0) node.removeChild(node.lastChild); 
//      node.appendChild(document.createTextNode(st));
//      node.lastChild.nodeValue = st;
//      node.style.left = ""+(p[0]*xunitlength+origin[0])+"px";
//      node.style.top = ""+(height-p[1]*yunitlength-origin[1])+"px";
// no longer have methods in next line
//      if (/`/.test(st)) AMprocessNode(node); else LMprocessNode(node);
//      dx = -node.offsetWidth/2;
//      dy = -node.offsetHeight/2;
//      if (pos!=null) {
//        if (/above/.test(pos)) dy = -node.offsetHeight;
//        if (/below/.test(pos)) dy = 0;
//        if (/right/.test(pos)) dx = 0;
//        if ( /left/.test(pos)) dx = -node.offsetWidth;
//      }
//      node.style.left = ""+(p[0]*xunitlength+origin[0]+dx)+"px";
//      node.style.top = ""+(height-p[1]*yunitlength-origin[1]+dy)+"px";
//    }
//    return p;
//  }
// rest of this is normal text() method
  var textanchor = "middle";  // regular text goes into SVG
  if (pos!=null) {
    if (/above/.test(pos)) dy = -fontsize/2;
    if (/below/.test(pos)) dy = fontsize-0;
    if (/right/.test(pos)) {textanchor = "start"; dx = fontsize/4;}
    if ( /left/.test(pos)) {textanchor = "end";  dx = -fontsize/4;}
  }
  if (id!=null) node = doc.getElementById(id);
  if (node==null) {
    node = myCreateElementSVG("text");
    node.setAttribute("id", id);
    svgpicture.appendChild(node);
    node.appendChild(doc.createTextNode(st));
  }
  while (node.childNodes.length>1) node.removeChild(node.lastChild); 
//  node.appendChild(document.createTextNode("\xA0"+st+"\xA0"));
//alert("here");
  node.lastChild.nodeValue = "\xA0"+st+"\xA0";
  node.setAttribute("x",p[0]*xunitlength+origin[0]+dx);
  node.setAttribute("y",height-p[1]*yunitlength-origin[1]+dy);
  node.setAttribute("font-style",(fontsty!=null?fontsty:
    (st.search(/^[a-zA-Z]$/)!=-1?"italic":fontstyle)));
  node.setAttribute("font-family",fontfamily);
  node.setAttribute("font-size",fontsize);
  node.setAttribute("font-weight",fontweight);
  node.setAttribute("text-anchor",textanchor);
  if (fontstroke!="none") node.setAttribute("stroke",fontstroke);
  if (fontfill!="none") node.setAttribute("fill",fontfill);
  return p;
}

// following method -- TEL 2/6/2013
function foreign(p,st,id,fontsty) {
  var node;
  var frag = document.createElementNS("http://www.w3.org/1999/xhtml","div");
  frag.setAttribute("style","float:left");
  frag.innerHTML = st;
  var uid = "_asciisvg_f_foreign_object_content_"
  frag.id = uid; 
  if (id!=null) node = doc.getElementById(id);
  if (node==null) {
    node = myCreateElementSVG("foreignObject");
    node.setAttribute("id", id);
    svgpicture.appendChild(node);
    node.appendChild(frag);
  }
  if (typeof MathJax != "undefined") {
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,node]);//!!
    MathJax.Hub.Queue(function() {
      node.setAttribute("width",document.getElementById(uid).offsetWidth);
      node.setAttribute("height",document.getElementById(uid).offsetHeight); 
    });
  } else {
    node.setAttribute("width",document.getElementById(uid).offsetWidth);
    node.setAttribute("height",document.getElementById(uid).offsetHeight);
  }
  node.setAttribute("x",p[0]*xunitlength+origin[0]);
  node.setAttribute("y",height-p[1]*yunitlength-origin[1]);
  node.setAttribute("font-style",(fontsty!=null?fontsty:fontstyle));
  node.setAttribute("font-family",fontfamily);
  node.setAttribute("font-size",fontsize);
  node.setAttribute("font-weight",fontweight);
  if (fontstroke!="none") node.setAttribute("stroke",fontstroke);
  if (fontfill!="none") node.setAttribute("fill",fontfill);

  return p;
}

function mtext(p,st,pos,fontsty) { // method for updating text on an svg
// "this" is the text object or the svgpicture object
  var textanchor = "middle";
  var dx = 0; var dy = fontsize/3;
  if (pos!=null) {
    if (pos.slice(0,5)=="above") dy = -fontsize/2;
    if (pos.slice(0,5)=="below") dy = fontsize-0;
    if (pos.slice(0,5)=="right" || pos.slice(5,10)=="right") {
      textanchor = "start";
      dx = fontsize/2;
    }
    if (pos.slice(0,4)=="left" || pos.slice(5,9)=="left") {
      textanchor = "end";
      dx = -fontsize/2;
    }
  }
  var node = this;
  if (this.nodeName=="svg") {
    node = myCreateElementSVG("text");
    this.appendChild(node);
    node.appendChild(doc.createTextNode(st));
  }
  node.lastChild.nodeValue = st;
  node.setAttribute("x",p[0]+dx);
  node.setAttribute("y",p[1]+dy);
  node.setAttribute("font-style",(fontsty!=null?fontsty:fontstyle));
  node.setAttribute("font-family",fontfamily);
  node.setAttribute("font-size",fontsize);
  node.setAttribute("font-weight",fontweight);
  node.setAttribute("text-anchor",textanchor);
  if (fontstroke!="none") node.setAttribute("stroke",fontstroke);
  if (fontfill!="none") node.setAttribute("fill",fontfill);
}

function image(imgurl,p,w,h,id) { // not working yet
  var node;
  if (id!=null) node = doc.getElementById(id);
  if (node==null) {
    node = myCreateElementSVG("image");
    node.setAttribute("id", id);
    svgpicture.appendChild(node);
  }
  node.setAttribute("x",p[0]*xunitlength+origin[0]);
  node.setAttribute("y",height-p[1]*yunitlength-origin[1]);
  node.setAttribute("width",w);
  node.setAttribute("height",h);
  node.setAttribute("xlink:href", imgurl);
}

function ASdot(center,radius,s,f) { // coordinates in units, radius in pixel
  if (s==null) s = stroke; if (f==null) f = fill;
  var node = myCreateElementSVG("circle");
  node.setAttribute("cx",center[0]*xunitlength+origin[0]);
  node.setAttribute("cy",height-center[1]*yunitlength-origin[1]);
  node.setAttribute("r",radius);
  node.setAttribute("stroke-width", strokewidth);
  node.setAttribute("stroke", s);
  node.setAttribute("fill", f);
  svgpicture.appendChild(node);
}

function dot(center, typ, label, pos, id) {
  var node;
  var cx = center[0]*xunitlength+origin[0];
  var cy = height-center[1]*yunitlength-origin[1];
  if (id!=null) node = doc.getElementById(id);
  if (typ=="+" || typ=="-" || typ=="|") {
    if (node==null) {
      node = myCreateElementSVG("path");
      node.setAttribute("id", id);
      svgpicture.appendChild(node);
    }
    if (typ=="+") {
      node.setAttribute("d",
        " M "+(cx-ticklength)+" "+cy+" L "+(cx+ticklength)+" "+cy+
        " M "+cx+" "+(cy-ticklength)+" L "+cx+" "+(cy+ticklength));
      node.setAttribute("stroke-width", .5);
      node.setAttribute("stroke", axesstroke);
    } else {
      if (typ=="-") node.setAttribute("d",
        " M "+(cx-ticklength)+" "+cy+" L "+(cx+ticklength)+" "+cy);
      else node.setAttribute("d",
        " M "+cx+" "+(cy-ticklength)+" L "+cx+" "+(cy+ticklength));
      node.setAttribute("stroke-width", strokewidth);
      node.setAttribute("stroke", stroke);
    }
  } else {
    if (node==null) {
      node = myCreateElementSVG("circle");
      node.setAttribute("id", id);
      svgpicture.appendChild(node);
    }
    node.setAttribute("cx",cx);
    node.setAttribute("cy",cy);
    node.setAttribute("r",dotradius);
    node.setAttribute("stroke-width", strokewidth);
    node.setAttribute("stroke", stroke);
    node.setAttribute("fill", (typ=="open"?"white":
                              (typ=="closed"?stroke:markerfill)));
  }
  if (label!=null) 
    text(center,label,(pos==null?"below":pos),(id==null?id:id+"label"))
}

point = dot; //alternative name

function arrowhead(p,q) { // draw arrowhead at q (in units) add size param
  var up;
  var v = [p[0]*xunitlength+origin[0],height-p[1]*yunitlength-origin[1]];
  var w = [q[0]*xunitlength+origin[0],height-q[1]*yunitlength-origin[1]];
  var u = [w[0]-v[0],w[1]-v[1]];
  var d = Math.sqrt(u[0]*u[0]+u[1]*u[1]);
  if (d > 0.00000001) {
    u = [u[0]/d, u[1]/d];
    up = [-u[1],u[0]];
    var node = myCreateElementSVG("path");
    node.setAttribute("d","M "+(w[0]-15*u[0]-4*up[0])+" "+
      (w[1]-15*u[1]-4*up[1])+" L "+(w[0]-3*u[0])+" "+(w[1]-3*u[1])+" L "+
      (w[0]-15*u[0]+4*up[0])+" "+(w[1]-15*u[1]+4*up[1])+" z");
    node.setAttribute("stroke-width", markerstrokewidth);
    node.setAttribute("stroke", stroke); /*was markerstroke*/
    node.setAttribute("fill", stroke); /*was arrowfill*/
    node.setAttribute("stroke-opacity", strokeopacity);
    node.setAttribute("fill-opacity", fillopacity);
    svgpicture.appendChild(node);    
  }
}

function chopZ(st) {
  var k = st.indexOf(".");
  if (k==-1) return st;
  for (var i=st.length-1; i>k && st.charAt(i)=="0"; i--);
  if (i==k) i--;
  return st.slice(0,i+1);
}

function grid(dx,dy) { // for backward compatibility
  axes(dx,dy,null,dx,dy)
}

function noaxes() {
  if (!initialized) initPicture();
}

function axes(dx,dy,labels,gdx,gdy) {
//xscl=x is equivalent to xtick=x; xgrid=x; labels=true;
  var x, y, ldx, ldy, lx, ly, lxp, lyp, pnode, st;
  if (!initialized) initPicture();
  if (typeof dx=="string") { labels = dx; dx = null; }
  if (typeof dy=="string") { gdx = dy; dy = null; }
  if (xscl!=null) {dx = xscl; gdx = xscl; labels = dx}
  if (yscl!=null) {dy = yscl; gdy = yscl}
  if (xtick!=null) {dx = xtick}
  if (ytick!=null) {dy = ytick}
  dx = (dx==null?xunitlength:dx*xunitlength);
  dy = (dy==null?dx:dy*yunitlength);
  fontsize = Math.min(dx/2,dy/2,16); //alert(fontsize)
  ticklength = fontsize/4;
  if (xgrid!=null) gdx = xgrid;
  if (ygrid!=null) gdy = ygrid;
  if (gdx!=null) {
    gdx = (typeof gdx=="string"?dx:gdx*xunitlength);
    gdy = (gdy==null?dy:gdy*yunitlength);
    pnode = myCreateElementSVG("path");
    st="";
    for (x = origin[0]; x<width; x = x+gdx)
      st += " M"+x+",0"+" "+x+","+height;
    for (x = origin[0]-gdx; x>0; x = x-gdx)
      st += " M"+x+",0"+" "+x+","+height;
    for (y = height-origin[1]; y<height; y = y+gdy)
      st += " M0,"+y+" "+width+","+y;
    for (y = height-origin[1]-gdy; y>0; y = y-gdy)
      st += " M0,"+y+" "+width+","+y;
    pnode.setAttribute("d",st);
    pnode.setAttribute("stroke-width", .5);
    pnode.setAttribute("stroke", gridstroke);
    pnode.setAttribute("fill", fill);
    svgpicture.appendChild(pnode);
  }
  pnode = myCreateElementSVG("path");
  st="M0,"+(height-origin[1])+" "+width+","+
    (height-origin[1])+" M"+origin[0]+",0 "+origin[0]+","+height;
  for (x = origin[0]+dx; x<width; x = x+dx)
    st += " M"+x+","+(height-origin[1]+ticklength)+" "+x+","+
           (height-origin[1]-ticklength);
  for (x = origin[0]-dx; x>0; x = x-dx)
    st += " M"+x+","+(height-origin[1]+ticklength)+" "+x+","+
           (height-origin[1]-ticklength);
  for (y = height-origin[1]+dy; y<height; y = y+dy)
    st += " M"+(origin[0]+ticklength)+","+y+" "+(origin[0]-ticklength)+","+y;
  for (y = height-origin[1]-dy; y>0; y = y-dy)
    st += " M"+(origin[0]+ticklength)+","+y+" "+(origin[0]-ticklength)+","+y;
  if (labels!=null) with (Math) {
    ldx = dx/xunitlength;
    ldy = dy/yunitlength;
    lx = (xmin>0 || xmax<0?xmin:0);
    ly = (ymin>0 || ymax<0?ymin:0);
    lxp = (ly==0?"below":"above");
    lyp = (lx==0?"left":"right");
    var ddx = floor(1.1-log(ldx)/log(10))+1;
    var ddy = floor(1.1-log(ldy)/log(10))+1;
    for (x = ldx; x<=xmax; x = x+ldx)
      text([x,ly],chopZ(x.toFixed(ddx)),lxp);
    for (x = -ldx; xmin<=x; x = x-ldx)
      text([x,ly],chopZ(x.toFixed(ddx)),lxp);
    for (y = ldy; y<=ymax; y = y+ldy)
      text([lx,y],chopZ(y.toFixed(ddy)),lyp);
    for (y = -ldy; ymin<=y; y = y-ldy)
      text([lx,y],chopZ(y.toFixed(ddy)),lyp);
  }
  fontsize = defaultfontsize;
  pnode.setAttribute("d",st);
  pnode.setAttribute("stroke-width", .5);
  pnode.setAttribute("stroke", axesstroke);
  pnode.setAttribute("fill", fill);
  pnode.setAttribute("stroke-opacity", strokeopacity);
  pnode.setAttribute("fill-opacity", fillopacity);
  svgpicture.appendChild(pnode);
}

function mathjs(st) {
  //translate a math formula to js function notation
  // a^b --> pow(a,b)
  // na --> n*a
  // (...)d --> (...)*d
  // n! --> factorial(n)
  // sin^-1 --> arcsin etc.
  //while ^ in string, find term on left and right
  //slice and concat new formula string
  st = st.replace(/\s/g,"");
  if (st.indexOf("^-1")!=-1) {
    st = st.replace(/sin\^-1/g,"arcsin");
    st = st.replace(/cos\^-1/g,"arccos");
    st = st.replace(/tan\^-1/g,"arctan");
    st = st.replace(/sec\^-1/g,"arcsec");
    st = st.replace(/csc\^-1/g,"arccsc");
    st = st.replace(/cot\^-1/g,"arccot");
    st = st.replace(/sinh\^-1/g,"arcsinh");
    st = st.replace(/cosh\^-1/g,"arccosh");
    st = st.replace(/tanh\^-1/g,"arctanh");
    st = st.replace(/sech\^-1/g,"arcsech");
    st = st.replace(/csch\^-1/g,"arccsch");
    st = st.replace(/coth\^-1/g,"arccoth");
  }
  st = st.replace(/^e$/g,"(Math.E)");
  st = st.replace(/^e([^a-zA-Z])/g,"(Math.E)$1");
  st = st.replace(/([^a-zA-Z])e/g,"$1(Math.E)");
//  st = st.replace(/([^a-zA-Z])e([^a-zA-Z])/g,"$1(Math.E)$2");
  st = st.replace(/([0-9])([\(a-zA-Z])/g,"$1*$2");
  st = st.replace(/\)([\(0-9a-zA-Z])/g,"\)*$1");
  var i,j,k, ch, nested;
  while ((i=st.indexOf("^"))!=-1) {
    //find left argument
    if (i==0) return "Error: missing argument";
    j = i-1;
    ch = st.charAt(j);
    if (ch>="0" && ch<="9") {// look for (decimal) number
      j--;
      while (j>=0 && (ch=st.charAt(j))>="0" && ch<="9") j--;
      if (ch==".") {
        j--;
        while (j>=0 && (ch=st.charAt(j))>="0" && ch<="9") j--;
      }
    } else if (ch==")") {// look for matching opening bracket and function name
      nested = 1;
      j--;
      while (j>=0 && nested>0) {
        ch = st.charAt(j);
        if (ch=="(") nested--;
        else if (ch==")") nested++;
        j--;
      }
      while (j>=0 && (ch=st.charAt(j))>="a" && ch<="z" || ch>="A" && ch<="Z")
        j--;
    } else if (ch>="a" && ch<="z" || ch>="A" && ch<="Z") {// look for variable
      j--;
      while (j>=0 && (ch=st.charAt(j))>="a" && ch<="z" || ch>="A" && ch<="Z")
        j--;
    } else { 
      return "Error: incorrect syntax in "+st+" at position "+j;
    }
    //find right argument
    if (i==st.length-1) return "Error: missing argument";
    k = i+1;
    ch = st.charAt(k);
    if (ch>="0" && ch<="9" || ch=="-") {// look for signed (decimal) number
      k++;
      while (k<st.length && (ch=st.charAt(k))>="0" && ch<="9") k++;
      if (ch==".") {
        k++;
        while (k<st.length && (ch=st.charAt(k))>="0" && ch<="9") k++;
      }
    } else if (ch=="(") {// look for matching closing bracket and function name
      nested = 1;
      k++;
      while (k<st.length && nested>0) {
        ch = st.charAt(k);
        if (ch=="(") nested++;
        else if (ch==")") nested--;
        k++;
      }
    } else if (ch>="a" && ch<="z" || ch>="A" && ch<="Z") {// look for variable
      k++;
      while (k<st.length && (ch=st.charAt(k))>="a" && ch<="z" ||
               ch>="A" && ch<="Z") k++;
    } else { 
      return "Error: incorrect syntax in "+st+" at position "+k;
    }
    st = st.slice(0,j+1)+"Math.pow("+st.slice(j+1,i)+","+st.slice(i+1,k)+")"+
           st.slice(k);
  }
  while ((i=st.indexOf("!"))!=-1) {
    //find left argument
    if (i==0) return "Error: missing argument";
    j = i-1;
    ch = st.charAt(j);
    if (ch>="0" && ch<="9") {// look for (decimal) number
      j--;
      while (j>=0 && (ch=st.charAt(j))>="0" && ch<="9") j--;
      if (ch==".") {
        j--;
        while (j>=0 && (ch=st.charAt(j))>="0" && ch<="9") j--;
      }
    } else if (ch==")") {// look for matching opening bracket and function name
      nested = 1;
      j--;
      while (j>=0 && nested>0) {
        ch = st.charAt(j);
        if (ch=="(") nested--;
        else if (ch==")") nested++;
        j--;
      }
      while (j>=0 && (ch=st.charAt(j))>="a" && ch<="z" || ch>="A" && ch<="Z")
        j--;
    } else if (ch>="a" && ch<="z" || ch>="A" && ch<="Z") {// look for variable
      j--;
      while (j>=0 && (ch=st.charAt(j))>="a" && ch<="z" || ch>="A" && ch<="Z")
        j--;
    } else { 
      return "Error: incorrect syntax in "+st+" at position "+j;
    }
    st = st.slice(0,j+1)+"factorial("+st.slice(j+1,i)+")"+st.slice(i+1);
  }
  return st;
}

function plot(fun,x_min,x_max,points,id,endpts) {
  var pth = [];
  var f = function(x) { return x }, g = fun;
  var name = null;
  if (typeof fun=="string") 
    eval("g = function(x){ with(Math) return "+mathjs(fun)+" }");
  else if (typeof fun=="object") {
    eval("f = function(t){ with(Math) return "+mathjs(fun[0])+" }");
    eval("g = function(t){ with(Math) return "+mathjs(fun[1])+" }");
  }
  if (typeof x_min=="string") { name = x_min; x_min = xmin }
  else name = id;
  var min = (x_min==null?xmin:x_min);
  var max = (x_max==null?xmax:x_max);
  var inc = max-min-0.000001*(max-min);
  inc = (points==null?inc/200:inc/points);
  var gt;
//alert(typeof g(min))
  for (var t = min; t <= max; t += inc) {
    gt = g(t);
    if (!(isNaN(gt)||Math.abs(gt)=="Infinity")) pth[pth.length] = [f(t), gt];
  }
  path(pth,name,null,endpts);
  return p;
}

// make polar plot

// make Riemann sums

function slopefield(fun,dx,dy) {
  var g = fun;
  if (typeof fun=="string") 
    eval("g = function(x,y){ with(Math) return "+mathjs(fun)+" }");
  var gxy,x,y,u,v,dz;
  if (dx==null) dx=1;
  if (dy==null) dy=1;
  dz = Math.sqrt(dx*dx+dy*dy)/6;
  var x_min = Math.ceil(xmin/dx);
  var y_min = Math.ceil(ymin/dy);
  for (x = x_min; x <= xmax; x += dx)
    for (y = y_min; y <= ymax; y += dy) {
      gxy = g(x,y);
      if (!isNaN(gxy)) {
        if (Math.abs(gxy)=="Infinity") {u = 0; v = dz;}
        else {u = dz/Math.sqrt(1+gxy*gxy); v = gxy*u;}
        line([x-u,y-v],[x+u,y+v]);
      }
    }
}

///////////////////////user graphics commands end here/////////////////////////

function show_props(obj) {
  var result = "";
  for (var i=0; i< obj.childNodes.length; i++)
    result += obj.childNodes.item(i) + "\n";
  return result;
}

function displayCoord(evt) {
  if (showcoordinates) {
//alert(show_props(evt.target.parentNode))
    var svgroot = evt.target.parentNode;
    var nl = svgroot.childNodes;
    for (var i=0; i<nl.length && nl.item(i).nodeName!="text"; i++);
    var cnode = nl.item(i);
    cnode.mtext = mtext;
    cnode.mtext([svgroot.getAttribute("width")-0,svgroot.getAttribute("height")-0],"("+getX(evt).toFixed(2)+", "+getY(evt).toFixed(2)+")", "aboveleft", "");
  }
}

function removeCoord(evt) {
    var svgroot = evt.target.parentNode;
    var nl = svgroot.childNodes;
    for (var i=0; i<nl.length && nl.item(i).nodeName!="text"; i++);
    var cnode = nl.item(i);
    cnode.mtext = mtext;
    cnode.mtext([svgroot.getAttribute("width")-0,svgroot.getAttribute("height")-0],"", "aboveleft", "");
}

// this is a highly simplified version --
// just walks the DOM tree and preprocesses text nodes
function processNodes(n) {
  for (i=0;i<n.childNodes.length;i++) {
    if (n.childNodes[i].nodeType == Node.TEXT_NODE) {
      var nn = document.createElement("span");
      nn.innerHTML = simpleLaTeXformatting(n.childNodes[i].textContent);
      n.replaceChild(nn,n.childNodes[i]);
    }
    else if (n.childNodes[i].nodeType == Node.ELEMENT_NODE) { 
      processNodes(n.childNodes[i]);
    }
  }
}

// also deleted calculator code here

// GO1.1 Generic onload by Brothercake
// http://www.brothercake.com/
//onload function (replaces the onload="translate()" in the <body> tag)
function generic()
{
  if (translateOnLoad) {
// deleted some unnecessary stuff in this method
      if (translateASCIIsvg) {
        // added next two lines to catch delimiters
        if (typeof MathJax == "undefined") {
          processNodes(document.getElementsByTagName("body")[0]);//.innerHTML);
          drawPictures();
        }
        else MathJax.Hub.Queue(function(){
          processNodes(document.getElementsByTagName("body")[0]);//.innerHTML);
          drawPictures();
        });
      }
  }
};
//setup onload function
if(typeof window.addEventListener != 'undefined')
{
  //.. gecko, safari, konqueror and standard
  window.addEventListener('load', generic, false);
}
else if(typeof document.addEventListener != 'undefined')
{
  //.. opera 7
  document.addEventListener('load', generic, false);
}
else if(typeof window.attachEvent != 'undefined')
{
  //.. win/ie
  window.attachEvent('onload', generic);
}
//** remove this condition to degrade older browsers
else
{
  //.. mac/ie5 and anything else that gets this far
  //if there's an existing onload function
  if(typeof window.onload == 'function')
  {
    //store it
    var existing = onload;
    //add new onload handler
    window.onload = function()
    {
      //call existing onload function
      existing();
      //call generic onload function
      generic();
    };
  }
  else
  {
    //setup onload function
    window.onload = generic;
  }
}
