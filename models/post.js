var mongodb = require('./db')
,      util = require('util');

function Post(username, post, time) {
  this.user = username;
  this.post = post;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
};

module.exports = Post;

Post.prototype.save = function save(callback) {
  var post = {
    user: this.user,
    post: this.post,
    time: this.time,
  };
  mongodb.open(function(err, db){
    if (err) {
      return callback(err);
    } 
    db.collection('posts', function(err, collection){
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.ensureIndex('user');
      collection.insert(post, {safe: true}, function(err, post){
        console.log('content of this post: ' + util.inspect(post));
        mongodb.close();
        callback(err, post); 
      });
    });
  });
};

Post.get = function get(username, callback) {
  mongodb.open(function(err, db){
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection){
      if (err) {
        mongodb.close();
	return callback(err); 
      }
      var query = {};
      if (username){
        query.user = username;
      }
      console.log('username: ' + username);
      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        mongodb.close();
        console.log('########## docs: ' + docs + '#########\n\n');
        if (err) {
          callback(err, null);
        } 
        var posts = [];
        docs.forEach(function(doc, index) {
          var post = new Post(doc.user, doc.post, doc.time);
          posts.push(post); 
        });
        callback(null, posts);
      });
    });
  });
};

Post.clear = function clear(username, callback) { 
  mongodb.open(function(err, db){
    if(err){
      mongodb.close();
      return callback(err);
    }
        
    console.log('user: ' + util.inspect(username));
    if(username == 'all' && username != null){
      db.dropCollection('posts', function(err, result) { 
       mongodb.close();
       callback(err, null);
       return;
     });
    }else if(username != null) {
     console.log('------ cleaning '+ username +'\'s posts -----\n');    
     db.collection('posts', function(err, collection){
       var query = {};
       query.user = username;
       collection.remove(query, ['user', username], {w:1}, function(err, docs){ 
          if (err) {
             mongodb.close();
             callback(err, null);
             return;
          }
          console.log('---'+ util.inspect(docs) +'---\n\n');
          if(!docs){
            mongodb.close();
            callback(err, null);
            return;
          }else{
             console.log('------ clean case 2 ---');
             mongodb.close();
             callback(err, null);
             return;
	  }
       }); 
     });
    }
    console.log('------ clean case 3 ---');
    mongodb.close();
    callback(err, null);
    return;   
  });
}  
