
/*
 * GET download page.
 */


var fs = require('fs');
var options = {};
options.file = './downloads/update.zip';
options.kbps = 100;
options.fileSize  = fs.statSync(options.file).size;


function throttle(download, cb) {
  var chunkOutSize = download.kbps * 1024,
    timer = 0;

  (function loop(bytesSent) {
    var remainingOffset;
    if (!download.aborted) {
      setTimeout(function () {
        var bytesOut = bytesSent + chunkOutSize;

        if (download.bufferOffset > bytesOut) {
          timer = 1000;
          cb(download.chunks.slice(bytesSent, bytesOut));
          loop(bytesOut);
          return;
        }

        if (bytesOut >= download.chunks.length) {
          remainingOffset = download.chunks.length - bytesSent;
          cb(download.chunks.slice(remainingOffset, bytesSent));
          return;
        }

        loop(bytesSent);//continue to loop, wait for enough data
      }, timer);
    }
  }(0));

  return function () { //return a function to handle an abort scenario
    download.aborted = true;
  };

}


exports.data = function(request, response){

   
  	var download = Object.create(options);
  	download.chunks = new Buffer(download.fileSize);
  	download.bufferOffset = 0;

  	response.writeHeader(200, {'Content-Length': download.fileSize});

  	fs.createReadStream(download.file)
    		.on('data', function (chunk) {
      			chunk.copy(download.chunks, download.bufferOffset);
      	 		download.bufferOffset += chunk.length;
    		})
    		.once('open', function () {
      			var handleAbort = throttle(download, function (send) {
          		response.write(send);
        		});

      			request.on('close', function () {
        			handleAbort();
      			});
    		});



	console.log('aaron debug');	
}	







