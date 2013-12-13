var mongodb = require('./db')
,      util = require('util');

function FbUser(user){
  this.name = user.name;
  this.id = user.id;
}

module.exports = FbUser;

FbUser.prototype.save = function save(callback){
  var fbuser = {
    name: this.name,
      id: this.id
  };

  mongodb.open(function(err, db){
    if(err) 
      return callback(err);

    db.collection("fb_users", function(err, collection){
      if (err){
        mongodb.close();
        return callback(err);
      }
      collection.ensureIndex('name', {unique: true});
      collection.insert(fbuser, {safe: true}, function(err, fbuser){
        if(err)
          console.log('=== new fb user error ===');
        mongodb.close();
        callback(err, fbuser);
      });
    });
  });  
};

FbUser.get = function get(id, callback){
  mongodb.open(function(err, db){
    if(err)
      return callback(err);
    db.collection('fb_users', function(err, collection){
      if (err){
        mongodb.close();
        return callback(err);
      }
      collection.findOne({id: id}, function(err, doc){
        mongodb.close();
        if(doc){
          var fbuser = new FbUser(doc);
          callback(err, fbuser);
        } else {
          callback(err, null);
        }
      });
    }); 
  });
};

