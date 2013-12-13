var mongodb = require('./db')
,      util = require('util');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
};

module.exports = User;

User.prototype.save = function save(callback) {
  // save in Mongodb
  var user = {
    name: this.name,
    password: this.password,
    email: this.email,
  };
  
  mongodb.open(function(err, db){
    if(err) { 
      return callback(err);
    }
   
    db.createCollection("test", function(err, collection){
      collection.insert({"test":"value"});
      console.log("Collection name:" + collection.collectionName);	
    });
    
    //read user collection
    db.collection('users', function(err, collection){
      if (err){
        mongodb.close();
        return callback(err);
      }
      
        collection.ensureIndex('name', {unique: true});
        collection.insert(user, {safe: true}, function(err, user){
        mongodb.close();
        callback(err, user);
      });
    });
  });
};

User.get = function get(username, callback) {
  console.log('========================== ');
  console.log('========================== ');

  mongodb.open(function(err, db){
    if(err) {
      return callback(err);
    }
    
    //read user collection
    db.collection('users', function(err, collection){
      if(err) {
        mongodb.close();
        return callback(err);
      }
      // check name feature belong to username
      collection.findOne({name: username}, function(err, doc){
        mongodb.close();
        if(doc) {
          // psckage doc into User object
          console.log('==== profile:' + util.inspect(doc) + '====');
          var user = new User(doc);
          callback(err, user);
        } else {
          callback(err, null);
        }
      });
    });
  });
};

User.login = function login(myUser, callback) {
  mongodb.open(function(err, db){
    if(err) {
      return callback(err);
    }

    //read user collection
    db.collection('users', function(err, collection){
      if(err) {
        mongodb.close();
        return callback(err);
      }
      // check name feature belong to username
      collection.findOne({name: myUser.name}, function(err, doc){
        //mongodb.close();
        if(doc) {
          // psckage doc into User object
          console.log('==== profile:' + util.inspect(doc) + '====');
          var user = new User(doc);
          callback(err, user);
          mongodb.close();
        } else {
          console.log('--- case2  ---' + myUser.name);
	  collection.findOne({email: myUser.name}, function(err, doc){
	     mongodb.close();
             if(doc) {
                 console.log('--- find one ---');
		 var user = new User(doc);
                 callback(err, user);
	     } else {
                console.log('--- not find anyone ---');
		callback(err, null);
	     } 
          });
        }
      });
    });
  });
};

User.autoLogin = function autoLogin(username, callback) {
    console.log('=== autoLogin ===');
    mongodb.open(function(err, db){
      if(err)
	  return callback(err);
      db.collection('users', function(err, collection){
        if(err) {
          mongodb.close();
          return callback(err);
        } 	
        collection.findOne({name: username}, function(err, doc){
          mongodb.close();
          if(doc) { 
            callback(doc);
          } else {
            callback(null);
          }
        });
      });       
    });
};

User.clear = function clear(username, callback) {
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
        
    db.collection('users', function(err, collection){
      if(err) {
        mongodb.close();
        return callback(err);
      }
      
      console.log('erase user: ' + username); 
      console.log('collection name:' + collection.collectionName);
      //collection.remove({name: username}, function(err, doc){
      if(username != 'all'){
        collection.findOne({name: username}, function(err, doc){
          if(doc){
            collection.remove({name: username}, function(err, doc){
                mongodb.close();
                console.log('==== clear ===\n\n');
                callback(err, null);
             }); 
          } else { 
            console.log('\n\nuser ' + username  + ' not in DataBase now!\n\n');
            mongodb.close();
            err = 'user not in DataBase now';
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
