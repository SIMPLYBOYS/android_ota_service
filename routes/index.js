
/*
 * GET home page.
 */
 
var fs = require('fs')
  , tool = require('./tool')
  , user = require('./user')
  , url  = require('url')
  , util = require('util')
  , xml  = require('./xml')
  , crypto = require('crypto')
  , User = require('../models/user')
  , FbUser = require('../models/fbuser')
  , Post = require('../models/post')
  , Profile = require('../models/profile')
  , manifest = require('./manifest')  
  , nodeemailer = require('nodemailer')
  , mkdirp = require('mkdirp')
  , child_p = require('child_process')
  , spawn = require('child_process').spawn
 // , mongoose = require('mongoose')
  , that = exports
  , Download_URL = new Array() 
  , Time_Index = new Array()
  , Product_Index = new Array()
  , Size_Index = new Array()
  , List = {};

var users = {
  'aaron-chou': {
    name: 'Aaron Chou',
    website:  'http://10.0.0.144:4000'
  },
  'wilson-tien': {
    name: 'Wilson Tien',
    website:  'http://10.0.0.144:3000'
  }
};

var smtpTransport = nodeemailer.createTransport('SMTP',{
           service: 'Gmail',
           auth: {
             user: 'ferrari828@gmail.com',
             pass: 'gost lybo mwvx uvhw'
          }
});


/*var FacebookUserSchema = new mongoose.Schema({
  fbId: String,
  email: { type: String, lowercase: true},
  name: String
});

var FbUsers = mongoose.model('fbs', FacebookUserSchema);*/

function prepare_profile(object){
  var StringInfo
  StringInfo = util.inspect(object);
  List = StringInfo.split(',');
  //console.log('content of object:' + StringInfo + '\n');
  console.log('List:' + List);
  List[0] = List[0].replace('{'," ");
  List[0] = List[0].replace('md5sum'," md5sum of update.zip ");
  //console.log('List[length-2]',List[List.length-2]);
  List[List.length-1] = List[List.length-1].replace('}'," ");
  List[List.length-1] = List[List.length-1].replace('member',"upload by:");
  List[List.length-3] = List[List.length-3].replace('version_number',"latest version of Image");
  return List;
};

exports.index = function(req, res){
  //console.log('node has been running: ' + process.uptime());
  Post.get(null, function(err, posts){
    if (err) {
      posts = [];
    }
    console.log('--------  request.cookies: ' + req.cookies.user + '---------');
    console.log('--------  request.cookies: ' + req.cookies.pass + '---------\n\n');
    test_post = posts; 
    console.log('manifest.version_number:' + util.inspect(manifest.version_number));
    if(List[0] == null && manifest.version_number != ''){
      Profile.get(manifest.md5sum, function(err, profile){
        if(profile){
           //console.log('\n\n Latest Profile: ' + util.inspect(profile));a
           Product_Index = [];
           List = prepare_profile(profile); 
           // get avaliable package info
           Profile.shown(function(err, profile){
             profile.forEach(function(x){
               Product_Index.push(x.version_number); 
               console.log('---- profile:' + x.product_name + '---\n\n');
             });
             if (req.cookies.user == undefined){
             //console.log('\n\n\n\n\n\n\n\n\n\nreq.user' + JSON.stringify(req.user) + '\n\n\n\n\n\n\n\n\n\n');
             //console.log('\n\n\n\n\n\n\n\n\n\nreq.session.passport' + JSON.stringify(req.session.passport) + '\n\n\n\n\n\n\n\n\n\n');
               console.log('List: ' + List);
               console.log('\n\nprofile: ' + JSON.stringify(profile));
               console.log('\n\n\n\n\n\n\nProduct_Index:' + Product_Index);
               res.render('index', {
                 title: 'Shuttle OTA Service',
                 posts: posts,
                 products: Product_Index,
                 items: List
               });
              } else {
                console.log('-------- User.autoLogin   ----' );
                User.autoLogin(req.cookies.user, function(o){
                  if(o != null){
                    req.session.user = o;
                    console.log('+++ login true +++');
                    res.redirect('/uploads');
                  }else {
                    console.log('--- login false ---');
                    res.render('login', {
                      title: 'Login to ShuttlOta'
                    });
                  }
                });
             }
           });
           /*if (req.cookies.user == undefined){
             //console.log('\n\n\n\n\n\n\n\n\n\nreq.user' + JSON.stringify(req.user) + '\n\n\n\n\n\n\n\n\n\n');
             //console.log('\n\n\n\n\n\n\n\n\n\nreq.session.passport' + JSON.stringify(req.session.passport) + '\n\n\n\n\n\n\n\n\n\n');
             console.log('List: ' + List);
             console.log('\n\nprofile: ' + JSON.stringify(profile)); 
             console.log('\n\n\n\n\n\n\nProduct_Index:' + Product_Index);
             res.render('index', {
               title: 'Shuttle OTA Service',
               posts: posts,
               products: Product_Index,
               items: List
             });
           } else {
               console.log('-------- User.autoLogin   ----' );
               User.autoLogin(req.cookies.user, function(o){
                 if(o != null){
                   req.session.user = o;
                   console.log('+++ login true +++');
                   res.redirect('/uploads');
                 }else {
                   console.log('--- login false ---');
                   res.render('login', {
                   title: 'Login to ShuttlOta'
                   });
                 }
               });   
           } */                 
        } else {
            fs.exists(manifest.full_downloads_path, function(exists){
	      if(exists){
                console.log('--- no profile in DataBase ---');
                res.redirect('/syncDB?iManifestUpload=1');
              } else { 
                var length = manifest.downloads_url.length;
                res.redirect('/syncDB?iManifestUpload=2');
                //res.send('Please Upload your Images to ' + manifest.downloads_url.substring(0,length-10));  
              }
            }); 
        }
      });// end of Profile  
    } else if(manifest.version_number == ''){
          console.log('\n\nmanifest parsing fail, please check whether manifest.xml exisit!\n\n');
          res.render('test',{
		 title: 'Manifest.xml file have problem'
          });//TODO recover page
    } else {
       console.log('case3:');
       //console.log('\n\n\n\n\n\n\n\n\n\nreq.user' + req.user + '\n\n\n\n\n\n\n\n\n\n');
       //console.log('\n\n\n\n\n\n\n\n\n\nreq.sessioin' + JSON.stringify(req.session) + '\n\n\n\n\n\n\n\n\n\n');
       console.log('\n\nList: ' + List);
       res.render('index', {
               title: 'Shuttle OTA Service',
               posts: posts,
               products: Product_Index,
               items: List
       });
    };
  }); // end of Post
  //throw new Error('An error for test purpose.');
};

exports.search = function(req, res){
  //res.render('time', {title: 'Search Testing'});
  var keys = Object.keys(req.headers);
  console.log("length:" + keys.length);
  for(var i=0, l=keys.length;i<l; i++){
	var hname = keys[i];
	var hval = req.headers[hname];
	console.log("cookies:" + hval);
  }
  console.log('\n\n\n ----------------------------\n');
  console.log("req.query.search: " + util.inspect(req.query)); 
  console.log("request ip: " + req.ip);
  console.log("request headers:" + req.headers);
  res.redirect('http://www.google.com/search?as_q='+util.inspect(req.query.ota_search));
};

exports.manifest = function(req, res){
  //prepare_profile(); 
  res.render('manifest', { title: 'Manifest',
		           items: profile 
  });
};

exports.html5_api = function(req, res){
  res.render('html5_api', {title: 'HTML5 Experiment'});
};

exports.time = function(req, res){
        console.log('---- time page ----'); 
	var newUser = new User({
          name: req.body.username, 
        });
     
        User.get(newUser.name, function(err, user){
	  console.log('--check user object' + user + '---');
        });

	//res.send('The time is ' + new Date().toString());
        res.render('time', {title: 'Check Time'}); 
};

exports.aboutus = function(req, res){ 
  res.render('aboutus', {title: 'AboutUs'});      
};

exports.update = function(req, res){
       var newProfile = new Profile({
           md5sum: manifest.md5sum,
           customer: manifest.customer,
           date: manifest.date,
           build_id: manifest.build_id,
           full_package_path: manifest.full_package_path,
           incremental_package_path: manifest.incremental_package_path,
           product_name: manifest.product_name,
           uploads_path: manifest.uploads_path,
           full_downloads_path: manifest.full_downloads_path,
           downloads_url: manifest.downloads_url,
           downloads_users: manifest.downloads_users,
           version_number: manifest.version_number,
           member: '',
           //member: req.session.user.name ? req.session.user.name: '' ,
           time: ''
       });
       if(req.session.user != undefined){ 
         console.log('=== upload Image by:' + req.session.user.name +"===\n\n");
         newProfile.member = req.session.user.name;
       }
   
       console.log('manifest: ' + util.inspect(newProfile));

       Profile.get(newProfile.version_number, function(err, profile){
        if (profile) {
          str = 'profile is the latest version !!!.';
          test_profile = JSON.stringify(profile);
          console.log('\n\n profile has been put to DataBase!!!!!!!\n\n');
          console.log('Latest profile in DataBase: ' + util.inspect(profile) + '\n');
          console.log('JSON.stringify: ' + test_profile); 
          req.flash('success', str);  
          process.nextTick(function(){
               res.redirect('/uploads');
          });
          return;
        }
        if (err != null) {
          req.flash('error', err);
          return res.redirect('/');
        }
        console.log('\n\n--------------- get Image size ------------------\n\n');
        console.log(newProfile.full_downloads_path);
        size = spawn('du', ['-sh', newProfile.full_downloads_path]);
        size.stdout.on('data', function(data){
          console.log('\n\n\n=========== Image size:' + data.toString().slice(0,4) + '==============\n\n\n');
          console.log('\n\n\n=========== Image size:' + data + '==============\n\n\n');
 
          newProfile.size = data.toString().slice(0,4);
          //console.log('\n\n\n=========== Image size:' + newProfile.size + '==========\n\n\n');
          newProfile.save( function(err){
            if (err) {
             console.log('\n\nsave error!!!!!!!\n\n');
             req.flash('error', err);
             return res.redirect('/');
            }
            console.log('\n\nsave success!!!!!!!\n\n');
            req.flash('success', 'successfully updating proile!');
            return res.redirect('/uploads');
            /*res.render('index', {
              title: 'Shuttle OTA Service',
              posts: profile,
              items: List
          }  );*/
            }); 
        });
       });
        
        /*newProfile.save( function(err){
          if (err) {
           console.log('\n\nsave error!!!!!!!\n\n');
           req.flash('error', err);
           return res.redirect('/');
          }
          console.log('\n\nsave success!!!!!!!\n\n');
          req.flash('success', 'successfully updating proile!');  
          return res.redirect('/uploads'); 
        });
      });*/
};

exports.clear = function(req, res){
  console.log('---  clear registration user: ' + req.params.username + '---\n');
  console.log('--- req:'+ util.inspect(req) + '---');
               
    /*var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');*/

    var d_User = new User({
      name: req.params.username,
      password: '1234'
    });
    
    console.log('---  clear registration user:' + d_User.name + '---\n'); 

    User.clear(d_User.name, function(err, user){
      if (err){
        console.log('err:' + err);
        if(!(err == 'user not in DataBase now')){
          req.flash('error', err);
          return res.redirect('/reg');
        } else { 
            res.send(JSON.stringify(req.params.username) + ' does\'nt exisit in DataBase!!');
            return;
        }
      }
       res.send(JSON.stringify(req.params.username)+' account has been cleared!!');
       return;
    });
};

exports.clear_profile = function(req, res){
   
     var d_Profile = new Profile({
        version_number: req.params.id
     });
     
     console.log('\n\n--- clear image profile:' + d_Profile.version_number  + '---\n');
     Profile.clear(d_Profile.version_number, function(err, id){ 
        //console.log('err: ' + err );
	if(err){
           if(!(err == 'profile not in DataBase')){
             req.flash('error', err);
	     return res.redirect('/time'); //TODO Redirect to Update profie page
           } else {
             res.send(JSON.stringify('profile ' + req.params.id + ' does\'nt exisit in DataBase!!'));
             return;
           }
        }
        console.log('clear profile:' + id); 
        List = new Array(13); //cleaning List due to profile has been clear  
        res.send(JSON.stringify(req.params.id) + ' profile has been cleared!!');
        return;
     });
};

exports.clear_post = function(req, res){

  console.log('clear post: ' + req.params.user);
  User.get(req.params.user, function(err, user){
       
    console.log('user: ' + util.inspect(user));
    if (!user){
          req.flash('error', 'user: ' + req.params.user  + ' does\'nt exists!');
          console.log('\n\n--- check1 ---');
          return res.redirect('/');
    }
    Post.clear(user.name, function(err, posts) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        console.log('\n\n--- check3 ---');
        //console.log('posts:' + posts.user);
        return res.redirect('/');
    });
  }); 
};

module.exports = function(app, passport){

  app.get('/', that.index);
	
  app.get('/search',that.search);

  app.get('/time', that.time);

  app.get('/manifest', that.manifest);
 
  app.get('/clear/:username', that.clear);

  app.get('/clear_profile/:id', that.clear_profile);

  app.get('/clear_post/:user', that.clear_post);

  app.get('/update', that.update);
 
  app.get('/aboutus', that.aboutus);

  app.all('/downloads/:ver_num/:file_name', function(req, res, next){
        console.log('check step1\n\n');
        //req.requrl = url.parse(req.url, true);
        //console.log('requrl:' + util.inspect(req.requrl));
  	console.log('\n ------ start download update.zip -------\n');
   	next();
  });

  app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res){
      // The request will be redirected to Facebook for authentication, so this
      // function will not be called.
    });

  app.get("/auth/facebook/callback",
    passport.authenticate("facebook",{ 
      successRedirect: '/',
      failureRedirect: '/login'}) 
  );

  /*app.get("/auth/facebook/callback",
    passport.authenticate("facebook",{ failureRedirect: '/login'}),
    function(req,res){
       FbUsers.findOne({fbId: req.user.id}, function(err, oldUser){
         if(oldUser){
           console.log('you are an oldUser!!\n\n');
           done(null, oldUser);
         } else {
           console.log('you are a new User!!\n\n');
           var newUser = new FbUsers({
             fbId : req.user.id,
             //email: profile.emails[0].value,
             name: req.user.displayName
           }).save(function(err, newUser){
             if(err) throw err;
             done(null, newUser);
           });
           console.log('=== oauth by fb ====\n\n');
           //console.log('=== oauth by fb ====\n\n ' + JSON.stringify(req.user));
           console.log(req.user.displayName);
           console.log(req.user.id);
           res.redirect('/');
           //res.render("loggedin", {user : req.user});
         }
       }
    )}
  );*/
   
  app.get('/downloads/:ver_num/:file_name', function(req, res){
        console.log('check step2\n\n');
        req.requrl = url.parse(req.url, true);
        console.log('requrl:' + util.inspect(req.requrl));
        console.log('\n\nreq.requrl.pathname:' + req.requrl.pathname); 
        var path = __dirname.replace('routes',req.requrl.pathname);
        //var file = manifest.full_downloads_path;
        var file = path;    
        path = path.replace('routes', path);
        console.log('path:' + path + '\n');
        //console.log('__dirname:' + __dirname);
        //console.log('full_downloads_path:' + manifest.full_downloads_path + '\n'); 	
        res.setHeader("OtaPackageLength", tool.get_ota_length(path));
        //console.log("Check OTA Package download from tool" + tool.check_download());
        console.log("from tool Ota Package Length:" + tool.get_ota_length(path) + " bytes");
        res.download(file, function(err){
          if(err){
            console.log('error occur upon download update.zip');
            return;
          } else {
            manifest.downloads_users += 1;
            console.log('today\'s manifest.downloads_users: '+ manifest.downloads_users);
          }
        });	
  });
  
  app.get('/OtaUpdater/android', user.list);

  app.get('/syncDB', function(req, res){
        req.requrl = url.parse(req.url, true);
        console.log('--- iManifestUpload: ' + req.requrl.query.iManifestUpload + '---\n'); 
        iManifestUpload = req.requrl.query.iManifestUpload;
        var image = req.requrl.query.image;
        console.log('image_name:' + image);
        res.render('syncDB',{
                title: 'sync with DataBase',
                manifest: iManifestUpload,
        });
  });
 
  app.get('/modifyDB', function(req, res){
    console.log('--- modifyDB ---\n');
    console.log(req.query.profile);
    console.log(req.query.version_number); 
    Profile.update_profile(req.query.profile, req.query.version_number, function(err, number){
       console.log('numbers:' + number);
       console.log('---- modify finish ----\n\n');
    });
    res.redirect('/');
  });

  app.get('/list', function(req, res){
	req.requrl = url.parse(req.url, true);
	req.a = req.requrl.query.a;
        res.render('list',{
                title: 'List',
                items: [1992, 'byvoid', 'express', 'Node.js', req.a]
        });
	req.a = req.requrl.query.a;
  });

  function prepare_url(Url, Time, Product, Size){  
    //console.log('========== new path:' + object + '==============\n\n'); 
      console.log('before collect:' + Download_URL + Time_Index + Product_Index + Size_Index);
      Download_URL.push(Url); 
      Time_Index.push(Time);
      Product_Index.push(Product); 
      Size_Index.push(Size);
      return;
  };

  app.get('/downloadUrl', function(req, res){

        Profile.shown(function(err, profile){ 
          var time_str = {};
          /*Download_URL = Download_URL.splice();
          Time_Index = Time_Index.splice();
          Product_Index = Product_Index.splice();*/
          console.log('clearing cache in each item!!');
          Download_URL = [];
          Time_Index = [];
          Product_Index = [];
          console.log('\n\nAll Documents in database :' + util.inspect(profile));
          
          profile.forEach(function(x){
            //console.log('\n doc:' + util.inspect(x));
            console.log('---- count file size ----\n\n'); 
            time_str = x.time.toString();
            /*var size = spawn('du', ['-sh', x.full_downloads_path.toString()]);
            size.stdout.on('data', function(data){
              console.log('size of update.zip:' + data);
            });*/
            
            //console.log('time: ' + time_str.slice(0,25));
            prepare_url(x.downloads_url, time_str.slice(0,25), x.version_number, x.size);
          });
          //console.log('after collect:' + Download_URL + Time_Index + Product_Index);
          res.render('directurl', {
             title: 'Image Download List',
             urls: Download_URL, 
             times: Time_Index,
             products: Product_Index,
             size: Size_Index,
             items: List,
          });
        });  
  });

  app.all('/user/:username', function(req, res, next){
        console.log('all methods capture');
        if(users[req.params.username]) {
                next();
        } else{
                next(new Error(req.params.username + 'does\'nt exist'));

        }
  });

  app.get('/user/:username', function(req, res){
        //xml.get_msg();
        res.send(JSON.stringify(users[req.params.username]));
        return;
  }); 
  
  app.get('/u/:user', function(req, res) {
    User.get(req.params.user, function(err, user){
	if (!user){
          req.flash('error', 'user: ' + req.params.user  + ' does\'nt exists!');
          console.log('\n\n--- check1 ---');
          return res.redirect('/');
        }
        Post.get(user.name, function(err, posts) {
          if (err) {
            req.flash('error', err);
            return res.redirect('/');
          }
          console.log('\n\n--- check2---');
          console.log('\n\n\n------- posts' + posts + '----');
          res.render('user', {
            title: user.name,
            posts: posts,
            items: List
          });
        });
    });
  });
  
  app.get('/test', function(req, res){
    //res.render('post_upload', {title: 'aaron testing'
     req.requrl = url.parse(req.url, true);
     console.log('requrl:' + util.inspect(req.requrl));
     if(res.locals.user != null)
       console.log('user:', res.locals.user.name);
     console.log('----------- testing -----------');

     var n = child_p.fork(__dirname + '/sub.js');
     n.on('message', function(m){
       console.log('============PARENT got message:' + util.inspect(m) + '===================\n');
     });
     n.send({ hello: 'world' });

    
     /*Profile.get(manifest.version_number, function(err, profile){
          if(err){
             profile = [];
          }
          test_profile = profile;
          //console.log('==== profile:' + util.inspect(test_profile) + '====');
          console.log('--- check profile object' + profile + '---');
     });*/
       
     req.requrl = url.parse(req.url, true); 
     var qs =  req.requrl.query; 
     /*console.log('qs:' + qs.p + 'qs.format:' + qs.format);
     console.log('__dirname: ' + __dirname);*/
     if (typeof qs.format !== 'undefined' && qs.format === 'html'){
       var path = __dirname.replace('routes','/public/html/test.html')
       ,   html = fs.readFileSync(path)
       ,   type = 'text/html';
       res.writeHead(200, {'Content-Type': type});
       res.write(html);
       res.end();
     }
     /*Profile.test(function(err, profile){
        console.log( 'Profile.test: '  + util.inspect(profile));
     });*/
     Profile.shown(function(err, profile){
        //console.log('\n\nAll Documents in database :' + util.inspect(profile));
        profile.forEach(function(x){
           //console.log('\n doc' + i + ':' + util.inspect(x));
           console.log('download_url:' + x.full_downloads_path);
        });
     });
     res.render('test', {title: 'aaron testing'
 //   layout: 'admin'
     });
     console.log("test page"); 
  }); 

  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res){
    res.render('login', { title: 'Login to ShuttlOta'
    });
  }); 

  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res){

    var myUser = new User({
      name: req.body.username,
      password: password,
      email: req.body.username
    });
    
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');  
    console.log('------ password: ' + password + '--------\n'); 
    console.log('remember-me: ' + req.body.rememberme);
    console.log('is true: ' + (req.body.rememberme == 'on'));
    console.log('req.body.user: ' + req.body.username + ' req.body.password:' + req.body.password);

    User.login(myUser, function(err, user){
      if(!user) {
        req.flash('error', 'invalid user name' );
        return res.redirect('/login');
      }
      console.log('+++++ user password: ' + user.password + '++++++');
      if (user.password != password) {
        req.flash('error', 'error input password');
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', 'successfully login!');
      if(req.body.rememberme == 'on') {
	res.cookie('user', req.body.username, { maxAge: 900000 });
	console.log('------ It\'s true ------');
      } else {
	console.log('------ It\'s false ------');
      }
      res.redirect('/');
      //res.redirect('localhost:8888');  test for jquery file upload
    }); 
  });
  
  //app.get('/logout', checkLogin);
  app.get('/logout', function(req, res){
    console.log('-------------- logout -------------\n\n\n\n\n' + req.user);
    List = new Array(12);
    req.session.user = null;
    req.session.success = null;
    if(req.user)
      req.logout();
    req.flash('success', 'successfully logout!');
    res.clearCookie('user'); 
    res.redirect('/');
  });

  app.get('/forget', checkNotLogin);
  app.get('/forget', function(req, res){
    res.render('forget', { title: 'Login to ShuttlOta'
    });
  });

  app.post('/forget', checkNotLogin);
  app.post('/forget', function(req, res){
   	console.log('--- forget passwrod ---');
	req.flash('success', 'successfully send email!!');
	
	smtpTransport.sendMail({
          from: 'ferrari828@gmail.com',
          to: req.body.email,
          html: '<b>Hello</b><p>This is your newsletter from aaron-chou.myds.me, :D</p>',
          createTextFromHtml: true,
          subject: 'Hello',
          text: 'Hello World'
        }, function(err,res){
            if(err){
                  console.log(err);
            }else{
                  console.log('Message sent:' + res.message);
            }
        });
        res.redirect('/sendmail');
  });

  app.get('/sendmail', checkNotLogin);
  app.get('/sendmail', function(req, res){
    res.render('sendmail', { title: 'Send password e-mail'
    });
  });

  app.get('/reg', checkNotLogin); 
  app.get('/reg', function(req, res){
  	  res.render('reg', { title: 'User Registration'
        });
        //console.log('--- aaron get reg ---');
  });
  
  app.post('/reg', checkNotLogin);
  app.post('/reg', function(req, res){
    console.log('---  post reg ---');
    if(req.body['password-repeat'] != req.body['password']){
	req.flash('error', 'two times input not match!');
	return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    var newUser = new User({
      name: req.body.username,
      password: password,
      email: req.body.useremail
    }); 
    
    User.get(newUser.name, function(err, user){ 
      if (user)
	err = 'Username already exist.';
      if (err) {
	req.flash('error', err);
	return res.redirect('/reg');
      }	
      newUser.save( function(err){
	if (err){
	  req.flash('error', err);
	  return res.redirect('/reg');
	} 
        req.session.user = newUser;
        req.flash('success', 'successfully register!!');
        res.redirect('/'); // to do new direct page
      });		
    });
  }); 
  
  app.get('/uploads', function(req, res){
      if(List[0] == null){
        console.log('need query DataBase'); 
        console.log('List:' + null);   
        Profile.get(manifest.version_number, function(err, profile){
          if(profile){
              List = prepare_profile(profile); 
          }else {
            res.locals.uploaded = null;
            res.render('uploads', {
              title: 'User\'s Uploads',
              items: List,
              manifest: ''
            });
          }
          res.locals.uploaded = 1; 
          res.render('uploads', {
              title: 'User\'s Uploads',
              items: List,
              manifest: '' 
          });
        });
      }else {
        res.locals.uploaded = 1;
        res.render('uploads', { 
             title: 'User\'s Uploads',
             items: List,
             manifest: ''
        });
      }
     /*res.writeHead(200, {'Content-Type': 'text/html'});
     res.write('Hello');
     res.end();*/
  }); 

  app.put('/uploads', function(req, res){
    //console.log('app.post upload request!');
    var fileData = new Buffer(+req.headers['content-length']),
      bufferOffset = 0;
    req.on('data', function (chunk) {
      chunk.copy(fileData, bufferOffset);
      bufferOffset += chunk.length;
    }).on('end', function () {
      /*var rand = (Math.random() * Math.random())
                 .toString(16).replace('.', ''),
        to = 'uploads/' + rand + "-" +*/
        to = 'uploads/' + req.headers['x-uploadedfilename'];
        fs.writeFile(to, fileData, function (err) {
        if (err) { throw err; }
          console.log('Saved file to ' + to);

        //res.send('Upload Finish!!!');
        res.end();
      });
    });    
  });

  app.post('/uploads', checkLogin);
  app.post('/uploads', function(req, res){
    console.log(req.body);
    console.log(req.files); 
    //var upload_dir = new Post(); 
    //var tmp_path = req.files.thumbnail.path;
    var tmp_path = req.files.fileToUpload.path
    //var target_path = './public/images/' + req.files.fileToUpload.name;
    var target_path = './uploads/' + req.files.fileToUpload.name;
    console.log('req.files.fileToUpload.name:' + req.files.fileToUpload.name);
    
    //console.log('tmp_path:' + tmp_path + 'target_path:' + target_path);
    fs.rename(tmp_path, target_path, function(err){
	if (err) throw err;
	fs.unlink(tmp_path, function(){
	  if (err) throw err;
          //res.end();
           if(req.files.fileToUpload.name === 'manifest.xml'){
               //TODO reparsing for manifest 
               xml.get_parse_msg(function(){
                 console.log('-- upload manifest.xml and have finished parsing ---\n');
                 var image_path = 'downloads/' + manifest.version_number;
                 console.log('image_path:' + image_path);
                 console.log('\n\nmanifest.version_number: ' + manifest.version_number);
                 console.log('\n\n image_path: ' + image_path); 
                 mkdirp(image_path, function(err){
                   if(err){
                     console.log('err: ' + util.inspect(err));
                     return;
                   }
                   List = new Array(12); 
		   res.send('File uploaded to: ' + target_path + '-' + req.files.fileToUpload.size + ' bytes');
                 }); 
               }); 
            } else if(req.files.fileToUpload.name === 'update.zip' || req.files.fileToUpload.name === ('rk30sdk-ota-' + manifest.version_number + '.zip') || req.files.fileToUpload.name === ( manifest.version_number + '.zip')){
               console.log('upload update.zip(OTA Image file)!!\n');
               //console.log('targrt_path: ' + target_path);
               var new_path = './downloads/' + manifest.version_number + '/update.zip';
	       //console.log('new_path: ' + new_path);               
               fs.rename(target_path, new_path, function(){
                 console.log('\n\n---- remove update.zip to specific folder complete!! ----\n\n');
                 res.send('File uploaded to: ' + new_path + '-' + req.files.fileToUpload.size + ' bytes');  
               }); 
               //res.send('File uploaded to: ' + target_path + '-' + req.files.fileToUpload.size + ' bytes');      
            } else {
              console.log('--- upload normal file ---');
              res.send('File uploaded to: ' + target_path + '-' + req.files.fileToUpload.size + ' bytes'); 
            }
	});
    });	
  });

  app.post('/post', checkLogin);
  app.post('/post', function(req, res) {
    var currentUser = req.session.user;
    var post = new Post(currentUser.name, req.body.post);
    post.save(function(err){
      if (err) {
	req.flash('error', err);
        return res.redirect('/');
      } 
      req.flash('success', 'post successfully!');
      console.log('------- check post message ----');
      res.redirect('/u/' + currentUser.name);
    }); 
  }); 

};

function checkLogin(req, res, next){
  console.log('--- checkLogin ---\n');
  if (!req.session.user) {
    req.flash('error', 'error occur: user should not has logout!');
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next){
  console.log('--- checkNotLogin ---\n');
  if (req.session.user) {
    req.flash('error', 'error occur: user should not has login!');
    return res.redirect('/');
  }
  next();	
}
