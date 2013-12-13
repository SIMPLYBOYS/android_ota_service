
var util = require('util');
var xml = require("node-xml");
var message = "hello world";

var parser = new xml.SaxParser(function(cb) {
  cb.onStartDocument(function() {

  });
  cb.onEndDocument(function() {

  });
  cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
      util.log("=> Started: " + elem + " uri="+uri +" (Attributes: " + JSON.stringify(attrs) + " )");
  });
  cb.onEndElementNS(function(elem, prefix, uri) {
      util.log("<= End: " + elem + " uri="+uri + "\n");
         message = elem;
         parser.pause();// pause the parser
         setTimeout(function (){parser.resume();}, 200); //resume the parser
  });
  cb.onCharacters(function(chars) {
      //util.log('<CHARS>'+chars+"</CHARS>");
  });
  cb.onCdata(function(cdata) {
      util.log('<CDATA>'+cdata+"</CDATA>");
  });
  cb.onComment(function(msg) {
      util.log('<COMMENT>'+msg+"</COMMENT>");
  });
  cb.onWarning(function(msg) {
      util.log('<WARNING>'+msg+"</WARNING>");
  });
  cb.onError(function(msg) {
      util.log('<ERROR>'+JSON.stringify(msg)+"</ERROR>");
  });
});

exports.parser = parser;

exports.get_msg = function(){
      return message;
};

