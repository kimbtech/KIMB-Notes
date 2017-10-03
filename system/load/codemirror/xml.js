// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

!function(t){"object"==typeof exports&&"object"==typeof module?t(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],t):t(CodeMirror)}(function(t){"use strict";var e={autoSelfClosers:{area:!0,base:!0,br:!0,col:!0,command:!0,embed:!0,frame:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0,menuitem:!0},implicitlyClosed:{dd:!0,li:!0,optgroup:!0,option:!0,p:!0,rp:!0,rt:!0,tbody:!0,td:!0,tfoot:!0,th:!0,tr:!0},contextGrabbers:{dd:{dd:!0,dt:!0},dt:{dd:!0,dt:!0},li:{li:!0},option:{option:!0,optgroup:!0},optgroup:{optgroup:!0},p:{address:!0,article:!0,aside:!0,blockquote:!0,dir:!0,div:!0,dl:!0,fieldset:!0,footer:!0,form:!0,h1:!0,h2:!0,h3:!0,h4:!0,h5:!0,h6:!0,header:!0,hgroup:!0,hr:!0,menu:!0,nav:!0,ol:!0,p:!0,pre:!0,section:!0,table:!0,ul:!0},rp:{rp:!0,rt:!0},rt:{rp:!0,rt:!0},tbody:{tbody:!0,tfoot:!0},td:{td:!0,th:!0},tfoot:{tbody:!0},th:{td:!0,th:!0},thead:{tbody:!0,tfoot:!0},tr:{tr:!0}},doNotIndent:{pre:!0},allowUnquoted:!0,allowMissing:!0,caseFold:!0},n={autoSelfClosers:{},implicitlyClosed:{},contextGrabbers:{},doNotIndent:{},allowUnquoted:!1,allowMissing:!1,caseFold:!1};t.defineMode("xml",function(r,o){function a(t,e){function n(n){return e.tokenize=n,n(t,e)}var r=t.next();if("<"==r)return t.eat("!")?t.eat("[")?t.match("CDATA[")?n(u("atom","]]>")):null:t.match("--")?n(u("comment","-->")):t.match("DOCTYPE",!0,!0)?(t.eatWhile(/[\w\._\-]/),n(d(1))):null:t.eat("?")?(t.eatWhile(/[\w\._\-]/),e.tokenize=u("meta","?>"),"meta"):(C=t.eat("/")?"closeTag":"openTag",e.tokenize=i,"tag bracket");if("&"==r){var o;return o=t.eat("#")?t.eat("x")?t.eatWhile(/[a-fA-F\d]/)&&t.eat(";"):t.eatWhile(/[\d]/)&&t.eat(";"):t.eatWhile(/[\w\.\-:]/)&&t.eat(";"),o?"atom":"error"}return t.eatWhile(/[^&<]/),null}function i(t,e){var n=t.next();if(">"==n||"/"==n&&t.eat(">"))return e.tokenize=a,C=">"==n?"endTag":"selfcloseTag","tag bracket";if("="==n)return C="equals",null;if("<"==n){e.tokenize=a,e.state=m,e.tagName=e.tagStart=null;var r=e.tokenize(t,e);return r?r+" tag error":"tag error"}return/[\'\"]/.test(n)?(e.tokenize=l(n),e.stringStartCol=t.column(),e.tokenize(t,e)):(t.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/),"word")}function l(t){var e=function(e,n){for(;!e.eol();)if(e.next()==t){n.tokenize=i;break}return"string"};return e.isInAttribute=!0,e}function u(t,e){return function(n,r){for(;!n.eol();){if(n.match(e)){r.tokenize=a;break}n.next()}return t}}function d(t){return function(e,n){for(var r;null!=(r=e.next());){if("<"==r)return n.tokenize=d(t+1),n.tokenize(e,n);if(">"==r){if(1==t){n.tokenize=a;break}return n.tokenize=d(t-1),n.tokenize(e,n)}}return"meta"}}function c(t,e,n){this.prev=t.context,this.tagName=e,this.indent=t.indented,this.startOfLine=n,(z.doNotIndent.hasOwnProperty(e)||t.context&&t.context.noIndent)&&(this.noIndent=!0)}function f(t){t.context&&(t.context=t.context.prev)}function s(t,e){for(var n;;){if(!t.context)return;if(n=t.context.tagName,!z.contextGrabbers.hasOwnProperty(n)||!z.contextGrabbers[n].hasOwnProperty(e))return;f(t)}}function m(t,e,n){return"openTag"==t?(n.tagStart=e.column(),g):"closeTag"==t?p:m}function g(t,e,n){return"word"==t?(n.tagName=e.current(),I="tag",x):(I="error",g)}function p(t,e,n){if("word"==t){var r=e.current();return n.context&&n.context.tagName!=r&&z.implicitlyClosed.hasOwnProperty(n.context.tagName)&&f(n),n.context&&n.context.tagName==r||z.matchClosing===!1?(I="tag",h):(I="tag error",b)}return I="error",b}function h(t,e,n){return"endTag"!=t?(I="error",h):(f(n),m)}function b(t,e,n){return I="error",h(t,e,n)}function x(t,e,n){if("word"==t)return I="attribute",k;if("endTag"==t||"selfcloseTag"==t){var r=n.tagName,o=n.tagStart;return n.tagName=n.tagStart=null,"selfcloseTag"==t||z.autoSelfClosers.hasOwnProperty(r)?s(n,r):(s(n,r),n.context=new c(n,r,o==n.indented)),m}return I="error",x}function k(t,e,n){return"equals"==t?v:(z.allowMissing||(I="error"),x(t,e,n))}function v(t,e,n){return"string"==t?w:"word"==t&&z.allowUnquoted?(I="string",x):(I="error",x(t,e,n))}function w(t,e,n){return"string"==t?w:x(t,e,n)}var y=r.indentUnit,z={},N=o.htmlMode?e:n;for(var T in N)z[T]=N[T];for(var T in o)z[T]=o[T];var C,I;return a.isInText=!0,{startState:function(t){var e={tokenize:a,state:m,indented:t||0,tagName:null,tagStart:null,context:null};return null!=t&&(e.baseIndent=t),e},token:function(t,e){if(!e.tagName&&t.sol()&&(e.indented=t.indentation()),t.eatSpace())return null;C=null;var n=e.tokenize(t,e);return(n||C)&&"comment"!=n&&(I=null,e.state=e.state(C||n,t,e),I&&(n="error"==I?n+" error":I)),n},indent:function(e,n,r){var o=e.context;if(e.tokenize.isInAttribute)return e.tagStart==e.indented?e.stringStartCol+1:e.indented+y;if(o&&o.noIndent)return t.Pass;if(e.tokenize!=i&&e.tokenize!=a)return r?r.match(/^(\s*)/)[0].length:0;if(e.tagName)return z.multilineTagIndentPastTag!==!1?e.tagStart+e.tagName.length+2:e.tagStart+y*(z.multilineTagIndentFactor||1);if(z.alignCDATA&&/<!\[CDATA\[/.test(n))return 0;var l=n&&/^<(\/)?([\w_:\.-]*)/.exec(n);if(l&&l[1])for(;o;){if(o.tagName==l[2]){o=o.prev;break}if(!z.implicitlyClosed.hasOwnProperty(o.tagName))break;o=o.prev}else if(l)for(;o;){var u=z.contextGrabbers[o.tagName];if(!u||!u.hasOwnProperty(l[2]))break;o=o.prev}for(;o&&o.prev&&!o.startOfLine;)o=o.prev;return o?o.indent+y:e.baseIndent||0},electricInput:/<\/[\s\w:]+>$/,blockCommentStart:"<!--",blockCommentEnd:"-->",configuration:z.htmlMode?"html":"xml",helperType:z.htmlMode?"html":"xml",skipAttribute:function(t){t.state==v&&(t.state=x)}}}),t.defineMIME("text/xml","xml"),t.defineMIME("application/xml","xml"),t.mimeModes.hasOwnProperty("text/html")||t.defineMIME("text/html",{name:"xml",htmlMode:!0})});