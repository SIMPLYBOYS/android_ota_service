
/*
 * GET OTA querying page.
 */

var qs = require('querystring')
 ,  url = require('url')
 ,  util = require('util')
 ,  fs = require('fs')
 ,  xml2js = require('xml2js')
 ,  inspect = require('eyes').inspector({maxLength: false})
 ,  parser = new xml2js.Parser()
 //,  pulser = require('./pulser')
 ,  manifest = require('./manifest')
 ,  xml = require('./xml')
 ,  tool = require('./tool')
 ,  fingerprint = new Array(6)
 ,  build_version = new Array(3)
 ,  build_id = new Array(2)
 ,  download_file
 ,  query_date
 ,  parse_date 
 ,  context
 ,  profiles;

exports.list = function(req, res){
  //res.send("respond with a resource");
  urlData = url.parse(req.url, true);
  action = urlData.pathname;
  parse_date = manifest.date; 
  //res.send('number: ' + JSON.stringify(req.headers));
  //path = url.parse(req.url); 
  //if(action === "/users"){
  if(action === "/OtaUpdater/android"){

    console.log('\n\n---- true ----\n\n');
    user = urlData.query;
    //console.log('user.m: ' + user.m +'user.n: '+user.n);
    console.log('user.fingerprint: ' + user.fingerprint);
    res.send("<h1>" + "fingerprint: "+ user.fingerprint + "</h1>");
	
     //console.log( 'fingerprint:' + user.fingerprint.split("/"));

    fingerprint  = user.fingerprint.split("/");
    console.log('\n --- fingerprint[4]:' + fingerprint[4]+' ---');
    build_version = fingerprint[4].split("_");
    console.log('\n build_version:' + build_version);	
    build_id = build_version[3].split(":");
    //console.log('\n build_id:', build_id);
    
    query_date = parseInt(build_id[0], 10);	
    console.log('\nbuild date from device: ', query_date);
    console.log('\nbuild date from manifest: ', parse_date);
    console.log('\nmode: ', build_id[1]+'\n\n\n');	
   //console.log('\n\n\n build_version:' + build_version);
	
    if(parse_date > query_date){
      console.log('\n\n---- inner true case we can download new Image ----\n\n');
      console.log("\n size of update.zip: " + tool.get_ota_length() +"\n\n");
      
	
    /*fs.readFile('./manifest.xml', function(err, data){
     if(err) throw err;
       //console.log('strings.xml:');
       console.log('content of manifest.xml: ');
       //context = data.toString("utf8");
         context = data.toString("utf8");
			     //console.log('\n\n context:'+ context);
	 	    }); */
        
        /*parser.addListener('end', function(result) {
            inspect(result);
            console.log(JSON.stringify(result));
            console.log('Done.');
        });
	      
        fs.readFile(__dirname + '/manifest.xml', function(err, data) {
            parser.parseString(data);
        }); */
         //xml.get_msg();
         //console.log('package path:' + xml.get_package_path());
        //xml.parser.parseFile("./manifest.xml");
        //console.log("\n\n---- msg from parser:"+ xml.get_msg());
        //xml.parser.reset();
      //xml.parser.parseFile(context);
      //xml.parser.parseString('<?xml version="1.0" encoding="UTF-8"?>');
      //xml.parser.parseString('<fingerprint name="positivo/YPY_ABXD/YPY_ABXD:4.1.1/JRO03H/JB_ v00.01.28_ YPY_ABXD_20130305:eng/test-keys" full_package_path="null" rkimage_path="null">');

      console.log('downloads_url:' + manifest.downloads_url);
    
      res.setHeader("OtaPackageLength",tool.get_ota_length());
      res.setHeader("OtaPackageName","update.zip");
      res.setHeader("OtaPackageVersion","0.0.1");
      //res.setHeader("OtaPackageUri","downloads/update.zip");
      res.setHeader("OtaPackageUri",manifest.downloads_url);
      res.send("<h2>" + "fingerprint: "+ user.fingerprint + "</h2>");
      res.end();

     } else {
       console.log('\n\n---- inner false case Image version in server is older than user\'s devices now ----\n\n');
       res.send("<h2>" + 'no appropriate update image on OTA server right now!!' + "</h2>");   	      res.end();
     }	
  } else 
    console.log('---- false ----' );	
};
