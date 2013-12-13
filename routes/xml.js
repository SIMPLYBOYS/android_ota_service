var fs = require('fs')
  , xml2js = require('xml2js')
  , util  = require('util')
  , inspect = require('eyes').inspector({maxLength: false}) 
  , manifest = require('./manifest')
  , parser = new xml2js.Parser()
  , fingerprint = new Array(13)
  , build_id
  , path_id
  , build_info = new Array(7)
  , package_path = new Array(5)
  , path_info = new Array(6)
  , date = new Array(4)
  , manifest_path;

exports.get_parse_msg = function(callback){
  parser.addListener('end', function(result) {
     //console.dir(util.inspect(result, false, null));
        console.log('\n\nStart parsing \"manifest.xml\":\n\n');	 
        //console.log('__dirname:' + __dirname + '\n\n');
        inspect(result);
        fingerprint = JSON.stringify(result);
        console.log('\n\nJSON.stringify:\n'+fingerprint);
        fingerprint = fingerprint.split(':',13);
        //console.log('fingerprint:'+ fingerprint);
        build_id = fingerprint[4]+fingerprint[5]+fingerprint[6];
        //console.log('\n build_id:'+ build_id);
        build_info = build_id.split("/");
        //console.log('\n\nbuild_info:'+ build_info+'\n');
        console.log('\n\ncustemer:'+ build_info[0].slice(1)+'\n');
        console.log('product name:'+ build_info[1]+'\n');
        console.log('build id:'+ build_info[2]+'\n');
        console.log('build number:'+ build_info[3]+'\n');
        //console.log('build info:'+ build_info[4].split('_')+'\n');
        date = build_info[4].split('_');
        //console.log('date:' + date[5].slice(0,8));
        if(date[0] === 'YPY')
          manifest.date = date[5].slice(0,8); 
        else
          manifest.date = date[3].slice(0,8); 

        //package_path = fingerprint[11].split('\"');
        path_info =  fingerprint[9].split("}");
        //console.log('path_info[0]: ' + path_info);
        package_path = path_info[0].split('/');
        //console.log('package_path:'+ package_path);
        console.log('md5sum of update.zip: ' + fingerprint[12].substring(1,33));
        
        path_id = '/'+ package_path[0].slice(1) + '/'+ package_path[1] + '/'+ package_path[2] +'/'+ package_path[3] + '/'+ package_path[4].replace('/"'," ");
         
	manifest.version_number = package_path[3];
        manifest.full_downloads_path = __dirname.replace('routes', 'downloads/'); 
        manifest.full_downloads_path += manifest.version_number + '/update.zip';
        var dw_path = manifest.full_downloads_path.split("/");
        manifest.downloads_url = '/' + dw_path[4] + '/' + dw_path[5] + '/' + dw_path[6];
        //console.log('full_downloads_path:' + manifest.full_downloads_path);
        console.log('manifest.downloads_url:' + manifest.downloads_url);
      /*---------------- collect paring results -------------------*/
        manifest.customer = build_info[0].slice(1);
        manifest.product_name =  build_info[1];
        manifest.build_id = build_info[2];
        manifest.full_package_path = path_id.substring(0,path_id.length-1);
      //	manifest.incremental_package_path = ;
        manifest.md5sum = fingerprint[12].substring(1,33);
        manifest.downloads_users = 0;
       // global.downloads_path = '/downloads/update.zip';
        //global.uploads_path = '/uploads';

      /*---------------- collect paring results -------------------*/
        //console.log('package_path:' + manifest.package_path);     
        /*console.log('path_id:' + path_id);
        console.log('package path:' + global.package_path);
        console.log('length of package path:' + path_id.length); 
        console.log('package path: ' + path_id.substring(0,path_id.length-1));
        console.log('parsing date: '+ date[3].slice(0,8));
        console.log('Done.\n\n\n');
        return 'Done';*/  
        console.log('\n\n========== Finish parsing manifest.xml ===========\n\n');
        callback();
    });
 
    manifest_path = __dirname.replace('routes','uploads/manifest.xml');
    console.log('\n\nmanifest path:' + manifest_path);
    fs.readFile(manifest_path, function(err, data) {
	if(err){
          console.log("\n\n========= manifest.xml does'nt exisit, please check upload folder ======\n\n");
          return;
        }
        parser.parseString(data);
    });
};
