var mongodb = require('./db')
  , util = require('util');

function Profile(profile) {
  this.md5sum = profile.md5sum;
  this.customer = profile.customer;
  this.date= profile.date;
  this.build_id = profile.build_id;
  this.full_package_path = profile.full_package_path;
  this.incremental_package_path = profile.incremental_package_path;
  this.product_name = profile.product_name;
  this.uploads_path = profile.uploads_path;
  this.full_downloads_path = profile.full_downloads_path;
  this.downloads_url = profile.downloads_url;
  this.downloads_users = profile.downloads_users;
  this.version_number = profile.version_number;
  this.time = new Date();
  this.member = profile.member;
  this.size = profile.size;
};

module.exports = Profile;

Profile.prototype.save = function save(callback) {
  // save in Mongodb
  var profile = {
    md5sum: this.md5sum,
    customer: this.customer,
    date: this.date,
    build_id: this.build_id,
    full_package_path: this.full_package_path,
    incremental_package_path: this.incremental_package_path,
    product_name: this.product_name,
    uploads_path: this.uploads_path,
    full_downloads_path: this.full_downloads_path,
    downloads_url: this.downloads_url,
    downloads_users: this.downloads_users, 
    version_number: this.version_number,
    time: this.time,
    member: this.member,
    size: this.size,
  };

  console.log('profile:' + util.inspect(profile));

  mongodb.open(function(err, db){
    if(err) {
      return callback(err);
    }

    db.collection('profile_mp', function(err, collection){
      if (err){
        mongodb.close();
        return callback(err);
      }    
        collection.ensureIndex('md5sum', {unique: true});
        collection.insert(profile, {safe: true}, function(err, profile){
          if(err)
            console.log('--- error:' + util.inspect(err) + '---\n\n');
          mongodb.close();
          callback(err, profile);
        });
    });
  });
};

Profile.get = function get(id, callback) {
  mongodb.open(function(err, db){
    if(err) {
      return callback(err);
    }

    //read user collection
    db.collection('profile_mp', function(err, collection){
      if(err) {
        mongodb.close();
        return callback(err);
      }
      // check name feature belong to username
      collection.findOne({md5sum: id}, function(err, doc){
        mongodb.close();
        if(doc) {
          // psckage doc into User object 
          //console.log('\n\n==== profile:' + util.inspect(doc) + '====\n\n');
          var profile = new Profile(doc);
          callback(err, profile);
        } else {
          callback(err, null);
        }
      });
    }); 
  });
};

Profile.update_profile = function update_profile(profile_md5, item, callback){
   console.log('update profile!!\n');
   mongodb.open(function(err, db){
     if(err){
       mongodb.close();
       return callback(err);
     }
     db.collection('profile_mp', function(err, collection){
        if(err){
          mongodb.close();
          return callback(err);
        }
      
        collection.update({md5sum: profile_md5}, {$set:{version_number:item}}, function(err, numberUpdated){
               mongodb.close();
               console.log('number of item have been updated: ' +numberUpdated);
               callback(err, numberUpdated);
        });
     }); 
   });
};

Profile.shown = function shown(callback){
    console.log('shown');
    mongodb.open(function(err, db){
       if(err){
         return callback(err);
       }
       db.collection('profile_mp', function(err, collection){
         if(err) {
           mongodb.close();
           return callback(err);
         }
         //TODO
         collection.count(function(err, count){
           //mongodb.close();
           console.log('---- we have ' + count + ' documents in data base ----\n\n');
            
           //callback(err, null);
         });
         collection.find().toArray(function(err, items){
             mongodb.close();
             //console.log('items:' + util.inspect(items));
             //console.log('items:' + items[2].md5sum);
             callback(err,items);
         });      
       });
    });
}

Profile.clear = function clear(id, callback){
  mongodb.open(function(err, db){
      if(err){
        return callback(err);
      }

      db.collection('profile_mp', function(err, collection){
        if(err) {
          mongodb.close();
          return callback(err);
        }

        console.log('erase version: ' + id);
        console.log('collection name:' + collection.collectionName);
        //collection.remove({name: username}, function(err, doc){
        if(id != 'all'){
           collection.findOne({version_number: id}, function(err, doc){
             if(doc){
               collection.remove({version_number: id}, function(err, doc){
                 mongodb.close();
                 callback(err, null);
               });
             } else {
                mongodb.close();
		err = 'profile not in DataBase';
                console.log('=== profile not in DataBase ===');
	        callback(err, null);
	     }
           });
        } else {
         // remove all user in collection
          collection.remove({}, function(err, doc){
            mongodb.close(); 
            callback(err, null);
          });
        }
      });
    });
}

Profile.test = function get(callback) {
   mongodb.open(function(err, db){ 
    db.collectionNames(function(err, collections){
      console.log('\n\n----- test collectionNames ----\n\n');
      console.log(util.inspect(collections) + '\n\n');
      mongodb.close();
      callback(err, collections);
    });
   });
}
