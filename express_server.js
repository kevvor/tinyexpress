var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  'adsf': 'www.google.ca'
};

app.get('/urls', function(req, res) {
  let templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
})

app.get('/urls/:id', function (req, res) {
  let templateVars = {shortURL: req.params.id, longURL: urlDatabase};
  res.render('urls_show', templateVars);
});

app.get('/', function(req, res) {
  res.end('Hello!');
});

app.get('/urls.json', function(req, res) {
  res.json(urlDatabase);
})

app.get('/hello', function (req, res) {
  res.end('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}`);
});