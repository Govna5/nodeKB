const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-Parser');


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

//Get Single Routes
app.get('/article/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('article',{
      article:article
    });
  });
});

// Add Routes
app.get('/articles/add', function(req, res){
  res.render('add_article', {
    title:'Add Article'
  })
});

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
      res.redirect('/');
    }
  });
});


// Start Server
app.listen(3000, function () {
    console.log('Server started on on port 3000');
});
