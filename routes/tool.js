var download_file
  , manifest = require('./manifest')
  , fs = require('fs');

exports.get_ota_length = function(path){
      console.log('--- start ---\n path:' + path);
      download_file = {}     
      if(path === undefined){
        console.log('--- wo path tool.get_ota_length ---\n');
        //download_file.file = './downloads/' + 'update.zip';a
        download_file.file = '.' + manifest.downloads_url;
        download_file.fileSize = fs.statSync(download_file.file).size;
      } else {
        console.log('--- w path tool.get_ota_length ---\n');
        download_file.file = path;
        download_file.fileSize = fs.statSync(download_file.file).size;
      }
        return download_file.fileSize;      
};

// this function would be used when user upload OTA package, before upload server will check whether the folder exist. 
exports.check_upload = function(){
  path = manifest.customer;
  maniFest = 'packages' + '/' + path;
  console.log('\n\npath:', path);
  console.log('\nmaniFest:' + maniFest);
  fs.exists(maniFest, function(exists) {
      if(!exists){
        fs.mkdir('packages',0755,function(e){
            if(!e) {
              fs.mkdir(maniFest,0755,function(e){
                if(!e)
                 console.log('\nmkdir folder of update.zip done!');
                });        
            }
        });
        return 'mkdir folder of update.zip done';
      } else {
          console.log('\npath of OTA package exists!!');              
          return 'path of OTA package exists';
      }
  });
};

/*exports.get_package_path = function(){
    return path_info[0];
}*/
