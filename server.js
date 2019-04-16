var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;


// Initialize Express
var app = express();
// Set Handlebars.
// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/nytimes";

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// Routes

app.get("/", function(req, res) {
  db.Article.find({}).limit(15)
  .then(function(dbArticle) {
    res.render("index", { Article: dbArticle });
    
  })
  .catch(function(err) {
    console.log(err);
  });
  
});


// A GET route for scraping the nytimes website
app.get("/scrape", function(req, res) {

  axios.get("https://www.nytimes.com").then(function(response) {
    var $ = cheerio.load(response.data);
  
    var results = [];
  
    $("article").each(function(i, element) {
  
      var title = $(element).children().text();
      var link = $(element).find("a").attr("href");
      var text = $(element).find("p").text();
  
      results.push({
        title: title,
        link: link,
        text: text
      });

      db.Article.create(results)
        .then(function(dbArticle) {
          res.redirect('/');

        })
        .catch(function(err) {
        });
    });

    // Send a message to the client
    console.log("Scrape Complete");
  });
});



// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});
//Route for Deleting notes
app.post("/noteDelete/:id", function (req, res) {
  db.Note.findOneAndDelete(req.params.id)
    .catch(function (err) {
      res.json(err);
    });
});
//Route for Deleting all data
app.post("/dataDelete", function (req, res) {
  db.Article.collection.drop().catch(function (err) {
      res.json(err);
    });
    db.Note.collection.drop().catch(function (err) {
      res.json(err);
    });
});

app.get("*", function(req, res) {
  res.render("404");

});
// Start the server
app.listen(PORT, function() {
  console.log(
    "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
    PORT,
    PORT
  );
});
