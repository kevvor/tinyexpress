var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser())

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

function generateRandomString(length) {
  let randomString = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
}

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render('urls_index', templateVars);
})

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {username: req.cookies["username"], shortURL: req.params.id, longURL: urlDatabase};
  res.render('urls_show', templateVars);
});


app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString(6)] = req.body['longURL'];
  console.log(req.body);
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id] = req.body['reassignURL'];
  console.log(req.body['newURL'])
  res.redirect('/urls');
});

app.get('/', (req, res) => {
  res.redirect('/urls')
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.redirect('/urls')
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body['username']);
  console.log(req.body['username']);
  res.redirect('/urls')
});


app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}`);
});








