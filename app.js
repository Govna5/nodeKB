const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-Parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');


// connect to the database (mongodb)
mongoose.connect('mongodb://localhost/nodeKB', {useMongoClient: true});
mongoose.promise = global.Promise;
var db = mongoose.connection;



// Check for DB connection
db.once('open', function(){
  console.log('Connected to Mongo Db');
});


// Check for DB errors
db.on('error', function(err){
  console.log(err);
});


// Init App
const app = express();


// Bring in models
let Article = require('./models/article');


// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')


// Body-Parser Middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


// parse application/json
app.use(bodyParser.json());


// Set Public folder
app.use(express.static(path.join(__dirname, 'public')));


// Set up Express-session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter : function(param, msg, vlaue) {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return{
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));


///// Routes  //////

// Home Route
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      });
    }
  });
});

//Get Article Routes
app.get('/article/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('article',{
      article:article
    });
  });
});


// Add Article Routes
app.get('/articles/add', function(req, res){
  res.render('add_article', {
    title:'Add Article'
  })
});

// Add Contact Page Routes
app.get('/contact', function(req, res){
  res.render('contact',{
    title:'Contact Page'
  });
});


////  GET , POST, DElELTE Routes ////

//Add Submit POST Routes
app.post('/articles/add', function(req, res){
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save(function(err){
    if(err){
      console.log(err);
      return
    } else {
      req.flash('success', 'Artilce Added');
      res.redirect('/');
    }
  });
});

//Update Submit Routes
app.post('/articles/edit/:id', function(req, res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      console.log(req.body);
      //req.flash('Success, Artilce Added');
      res.redirect('/');
    }
  });
});




//Delete Article Routes
app.delete('/article/:id', function(req, res){
  let query = {_id:req.params.id}

  Article.remove(query, function(err){
    if(err){
      console.log(err);
    }
    req.flash('danger', 'Article Deleted');
    res.send('Success');
  });
});


// Load Edit form
app.get('/article/edit/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article',{
      title:'Edit Article',
      article:article
    });
  });
});

// Start Server
app.listen(3000, function () {
    console.log('Server started on on port 3000');
});
