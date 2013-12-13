
/**
 * Module dependencies.
 */

var express = require('express') 
  , routes = require('./routes')
  , downloads = require('./routes/downloads') 
  , http = require('http')
  , path = require('path')
  , util = require('util')
  , xml  = require('./routes/xml')
  , tool = require('./routes/tool')
  , manifest = require('./routes/manifest')
  , fs   = require('fs') 
  , accessLogfile = fs.createWriteStream('access.log', {flags: 'a'})
  , errorLogfile  = fs.createWriteStream('error.log', {flags: 'a'})
  , sniffer = require('./httpsniffer')
  , partials = require('express-partials') 
  , MongoStore = require('connect-mongo')(express)
  , settings = require('./settings')
  , flash = require('connect-flash')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , FacebookStrategy = require('passport-facebook').Strategy
  , FACEBOOK_APP_ID = '721860417842572'
  , FACEBOOK_APP_SECRET = 'f9cda8f3e7cd8c9a6eeac224398f36aa'
  , FbUser = require('./models/fbuser')
  , dw_path = new Array(6)
  , app = express(); 

/*var FacebookUserSchema = new mongoose.Schema({
  fbId: String,
  email: { type: String, lowercase: true},
  name: String
});

var FbUsers = mongoose.model('fbs', FacebookUserSchema);*/

/*passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://54.238.203.212/auth/facebook/callback" 
  }, 
  function(accessToken, refreshToken, profile, done){
    FbUsers.findOne({fbId: profile.id}, function(err, oldUser){
      if(oldUser){
        console.log('you are an oldUser!!\n\n');
        done(null, oldUser);
      } else {
        console.log('you are a new User!!\n\n');
        var newUser = new FbUsers({
          fbId : profile.id,
          //email: profile.emails[0].value,
          name: profile.displayName
        }).save(function(err, newUser){
           if(err) throw err;
           done(null, newUser);
        });
      }
    }); 
  } 
));*/

passport.serializeUser(function(user, done){
  //console.log('\n\n\n\n\n>>>>>>>>>> passport.serializeUser >>>>>>>>>>>>'+ user  +'\n\n\n\n\n');
  done(null, user);
});

passport.deserializeUser(function(id, done){
  
  console.log('\n\n\n\n\n<<<<<<<<< passport.deserializeUser <<<<<<<<<<' + id  +'\n\n\n\n\n');
  /*FbUser.get(id, function(err, user){
   if(user){
     //console.log('==== user get it! ====\n\n');
     //done(null, user);a
     done(null, id);
   } 
  });*/
  done(null, id);
});

/*passport.deserializeUser(function(id, done){
  FbUsers.findById(id, function(err, user){
    if(err) done(err);
    if(user){
      done(null, user);
    } else {
       console.log('====== debug ======\n\n');
       //done(null, user);
    }
  });
  done(null, id);
});*/

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://54.238.203.212/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('\n\n\n------- oauth by fb ---------\n\n\n' + profile.id + profile.displayName ); 
    FbUser.get(profile.displayName, function(err, user){
      console.log('---- shuttle fb testing function ----\n\n');
      console.log(JSON.stringify(user)+ '\n\n');
      if(!user){
        var newFbUser = new FbUser({
          name: profile.displayName,
          id: profile.id
        });
        newFbUser.save(function(err){
          if(err){
            console.log(err);
          } else {
            console.log('Saving user....');
          }
        });
      } else {
        console.log('###### user' + JSON.stringify(user) + '#####\n\n'); 
      }
    });
    var user = { name: profile.displayName, id: profile.id };
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.a
      return done(null, user);
    });
  }
));
                                                                                              
function logErrors(err, req, res, next) {
  //console.error(err.stack);
  res.send(500, { error: 'Something blew up!' });
  var meta = '[' + new Date() + ']' + req.url + '\n';
  errorLogfile.write(meta + err.stack + '\n');
  next(err);
};

app.configure(function(){
  app.use(express.logger({stream: accessLogfile}));
  app.set('port', process.env.PORT || 4711);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options', {
		layout: false
	});
  app.use(partials());

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: settings.cookieSecret,
    store: new MongoStore({
      db: settings.db
    })
  })); 
  app.use(logErrors);
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session()); 
  app.use(function (err, req, res, next){
    console.log('--- error occur ---');   
    next(); 
  });
  
  app.use(function(req, res, next) {
    res.locals.error = req.flash('error').toString();
    res.locals.success = req.flash('success').toString();
    res.locals.user = req.session ? req.session.user : null;
    res.locals.fbuser = req.session ? req.user : null;
    next();
  })
  app.use(app.router);  
  routes(app, passport);
  app.use(express.static(__dirname + '/public')); 
});

app.configure('development', function(){
  app.use(express.errorHandler({
	dumpExceptions: true,
	showStack: true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

/*app.dynamicHelpers({
	headers: function(req, res) {
		return req.headers;
	},
});*/ 
                            
var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log("Express shuttle ota server listening on port " + app.get('port')); 
  console.log('\n\n========== Prepare parsing manifest.xml ===========\n\n');  
  var manifest_path = __dirname + '/uploads/manifest.xml';
  fs.stat(manifest_path, function(err, stats){
    if(err){
      console.log('err:' + util.inspect(err)+ ',\n' + err.code);
      return;
    }
    xml.get_parse_msg(function(){
	//console.log('\n\n------ 0830 callback testing -----\n\n');
    });
    console.log('stat' + util.inspect(stats));
  }); 
 
  //console.log("\n---Info of OTA Package path:"+ xml.check_download());  
  //fs.exists(''); 
});

sniffer.sniffOn(server);



